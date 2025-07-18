// This is meant to be used in a trigger as such:
// {
//   id: 'Some tankbuster',
//   regex: Regexes.startsUsing({source: 'Ye Olde Bosse', id: '666'}),
//   condition: Conditions.caresAboutMagical(data),
//   response: Responses.tankbuster(),
// },
//
// Note: Breaking out the condition like this lets people override it if they
// always (or never) want to know about it, rather than hiding the logic inside
// the tankbuster callback with a "is healer" check.
//
// If data.role is used, it should be only to differentiate between alert levels,
// and not whether a message is sent at all.
//
// Although this is not true of `response: ` fields on triggers in general,
// all responses in this file should either return an object or a single
// function that sets outputStrings and returns an object without doing
// anything with data or matches.  See `responses_test.js`.

import { RaidbossData as Data } from '../types/data';
import { Matches } from '../types/net_matches';
import {
  LocaleText,
  LooseTrigger,
  Output,
  ResponseFunc,
  ResponseOutput,
  TargetedMatches,
  TriggerFunc,
  TriggerOutput,
} from '../types/trigger';

import Outputs from './outputs';

type TargetedResponseOutput = ResponseOutput<Data, TargetedMatches>;
type TargetedResponseFunc = ResponseFunc<Data, TargetedMatches>;
type TargetedFunc = TriggerFunc<Data, TargetedMatches, TriggerOutput<Data, TargetedMatches>>;
type StaticResponseFunc = ResponseFunc<Data, Matches>;

export const severityList = ['info', 'alert', 'alarm'] as const;
export type Severity = typeof severityList[number];
export type SevText = 'infoText' | 'alertText' | 'alarmText';

export const builtInResponseStr = 'cactbot-builtin-response';

// All valid trigger fields.
export const triggerFunctions: (keyof LooseTrigger)[] = [
  'alarmText',
  'alertText',
  'condition',
  'delaySeconds',
  'disabled',
  'durationSeconds',
  'id',
  'type',
  'infoText',
  'preRun',
  'promise',
  'response',
  'run',
  'sound',
  'soundVolume',
  'suppressSeconds',
  'tts',
  'outputStrings',
];

// Trigger fields that can produce text output.
export const triggerTextOutputFunctions: (keyof LooseTrigger)[] = [
  'alarmText',
  'alertText',
  'infoText',
  'response',
  'tts',
];

// If a trigger has any of these, then it has a visible/audio effect.
export const triggerOutputFunctions: (keyof LooseTrigger)[] = [
  ...triggerTextOutputFunctions,
  'sound',
];

export const severityMap: { [sev in Severity]: SevText } = {
  'info': 'infoText',
  'alert': 'alertText',
  'alarm': 'alarmText',
};

const getText = (sev: Severity): SevText => {
  if (!(sev in severityMap))
    throw new Error(`Invalid severity: ${sev}.`);
  return severityMap[sev];
};

const defaultInfoText = (sev?: Severity): SevText => {
  if (!sev)
    return 'infoText';
  return getText(sev);
};

const defaultAlertText = (sev?: Severity): SevText => {
  if (!sev)
    return 'alertText';
  return getText(sev);
};

const defaultAlarmText = (sev?: Severity): SevText => {
  if (!sev)
    return 'alarmText';
  return getText(sev);
};

const getTarget = (matches: TargetedMatches) => {
  // Often tankbusters can be casted by the boss on the boss.
  // Consider this as "not having a target".
  if (matches.target === matches.source)
    return;
  // In hunts, sometimes there are too many people for the target
  // to have a name.  Treat this as "no target".
  if (matches.target === '')
    return;
  return matches.target;
};

const getSource = (matches: TargetedMatches) => {
  return matches?.source;
};

// FIXME: make this work for any number of pairs of params
const combineFuncs = function(
  text1: SevText,
  func1: TargetedFunc,
  text2: SevText,
  func2: TargetedFunc,
) {
  const obj: TargetedResponseOutput = {};

  if (text1 !== text2) {
    obj[text1] = func1;
    obj[text2] = func2;
  } else {
    obj[text1] = (data: Data, matches: TargetedMatches, output: Output) => {
      return func1(data, matches, output) ?? func2(data, matches, output);
    };
  }
  return obj;
};

const isPlayerId = (id?: string) => {
  return id !== undefined && !id.startsWith('4');
};

// For responses that unconditionally return static text.
const staticResponse = (field: SevText, text: LocaleText): StaticResponseFunc => {
  return (_data: unknown, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      text: text,
    };
    return {
      [field]: (_data: unknown, _matches: unknown, output: Output) => output.text?.(),
    };
  };
};

type SingleSevToResponseFunc = (sev?: Severity) => TargetedResponseFunc | StaticResponseFunc;
type DoubleSevToResponseFunc = (targetSev?: Severity, otherSev?: Severity) => TargetedResponseFunc;
type ResponsesMap = {
  [response: string]: SingleSevToResponseFunc | DoubleSevToResponseFunc;
};

export const Responses = {
  tankBuster: (targetSev?: Severity, otherSev?: Severity) => {
    const outputStrings = {
      noTarget: Outputs.tankBuster,
      busterOnYou: Outputs.tankBusterOnYou,
      busterOnTarget: Outputs.tankBusterOnPlayer,
    };

    const targetFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);
      if (target === undefined) {
        if (data.role !== 'tank' && data.role !== 'healer')
          return;
        return output.noTarget?.();
      }

      if (target === data.me)
        return output.busterOnYou?.();
    };

    const otherFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);
      if (target === undefined) {
        if (data.role === 'tank' || data.role === 'healer')
          return;
        return output.noTarget?.();
      }
      if (target === data.me)
        return;

      return output.busterOnTarget?.({ player: data.party.member(target) });
    };

    const combined = combineFuncs(
      defaultAlertText(targetSev),
      targetFunc,
      defaultInfoText(otherSev),
      otherFunc,
    );
    return (_data: unknown, _matches: unknown, output: Output): TargetedResponseOutput => {
      // cactbot-builtin-response
      output.responseOutputStrings = outputStrings;
      return combined;
    };
  },
  tankBusterSwap: (busterSev?: Severity, swapSev?: Severity) => {
    const outputStrings = {
      noTarget: Outputs.tankBuster,
      tankSwap: Outputs.tankSwap,
      busterOnYou: Outputs.tankBusterOnYou,
      busterOnTarget: Outputs.tankBusterOnPlayer,
    };

    // Note: busterSev and swapSev can be the same priority.
    const tankSwapFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);
      if (data.role === 'tank' && target !== data.me)
        return output.tankSwap?.();
    };
    const busterFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);

      if (data.role === 'tank' && target !== data.me)
        return;

      if (target === data.me)
        return output.busterOnYou?.();
      if (target === undefined)
        return output.noTarget?.();
      return output.busterOnTarget?.({ player: data.party.member(target) });
    };

    const combined = combineFuncs(
      defaultAlarmText(swapSev),
      tankSwapFunc,
      defaultAlertText(busterSev),
      busterFunc,
    );
    return (_data: Data, _matches: unknown, output: Output) => {
      // cactbot-builtin-response
      output.responseOutputStrings = outputStrings;
      return combined;
    };
  },
  tankCleave: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      cleaveOnYou: Outputs.tankCleaveOnYou,
      cleaveNoTarget: Outputs.tankCleave,
      avoidCleave: Outputs.avoidTankCleave,
    };
    return {
      [defaultInfoText(sev)]: (data: Data, matches: TargetedMatches, output: Output) => {
        const target = getTarget(matches);
        if (target === data.me)
          return output.cleaveOnYou?.();
        if (data.role === 'tank' || data.job === 'BLU') {
          // targetless tank cleave
          // BLU players should always get this generic cleave message.
          // We have no robust way to determine whether they have tank Mimicry on,
          // and it's really annoying for a BLU tank to be told to avoid cleaves when they can't.
          return output.cleaveNoTarget?.();
        }
        return output.avoidCleave?.();
      },
    };
  },
  sharedTankBuster: (targetSev?: Severity, otherSev?: Severity) => {
    const outputStrings = {
      sharedTankbusterOnYou: Outputs.sharedTankbusterOnYou,
      sharedTankbusterOnTarget: Outputs.sharedTankbusterOnPlayer,
      sharedTankbuster: Outputs.sharedTankbuster,
      avoidCleave: Outputs.avoidTankCleave,
    };
    const targetFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);
      if (target === undefined) {
        if (data.role !== 'tank' && data.role !== 'healer')
          return;
        return output.sharedTankbuster?.();
      }

      if (target === data.me)
        return output.sharedTankbusterOnYou?.();
      if (data.role === 'tank' || data.role === 'healer')
        return output.sharedTankbusterOnTarget?.({ player: data.party.member(target) });
    };

    const otherFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);
      if (target === undefined) {
        if (data.role === 'tank' || data.role === 'healer')
          return;
        return output.avoidCleave?.();
      }
      if (target === data.me || data.role === 'tank' || data.role === 'healer')
        return;

      return output.avoidCleave?.();
    };

    const combined = combineFuncs(
      defaultAlertText(targetSev),
      targetFunc,
      defaultInfoText(otherSev),
      otherFunc,
    );
    return (_data: unknown, _matches: unknown, output: Output): TargetedResponseOutput => {
      // cactbot-builtin-response
      output.responseOutputStrings = outputStrings;
      return combined;
    };
  },
  miniBuster: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.miniBuster),
  aoe: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.aoe),
  bigAoe: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.bigAoe),
  bleedAoe: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.bleedAoe),
  spread: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.spread),
  protean: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.protean),
  // for stack marker situations.
  stackMarker: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.stackMarker),
  // for getting together without stack marker
  getTogether: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.getTogether),
  stackMarkerOn: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      stackOnYou: Outputs.stackOnYou,
      stackOnTarget: Outputs.stackOnPlayer,
      stackMarker: Outputs.stackMarker,
    };
    return {
      [defaultAlertText(sev)]: (data: Data, matches: TargetedMatches, output: Output) => {
        const target = getTarget(matches);
        if (target === data.me)
          return output.stackOnYou?.();
        if (target === undefined)
          return output.stackMarker?.();
        return output.stackOnTarget?.({ player: data.party.member(target) });
      },
    };
  },
  stackMiddle: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.stackMiddle),
  doritoStack: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.doritoStack),
  spreadThenStack: (sev?: Severity) => {
    return staticResponse(defaultAlertText(sev), Outputs.spreadThenStack);
  },
  stackThenSpread: (sev?: Severity) => {
    return staticResponse(defaultAlertText(sev), Outputs.stackThenSpread);
  },
  knockback: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.knockback),
  knockbackOn: (targetSev?: Severity, otherSev?: Severity) => {
    const outputStrings = {
      knockback: Outputs.knockback,
      knockbackOnYou: Outputs.knockbackOnYou,
      knockbackOnTarget: Outputs.knockbackOnPlayer,
    };

    const targetFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);
      if (target === data.me)
        return output.knockbackOnYou?.();
    };

    const otherFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);
      if (target === undefined)
        return output.knockback?.();
      if (target !== data.me)
        return output.knockbackOnTarget?.({ player: data.party.member(target) });
    };
    const combined = combineFuncs(
      defaultInfoText(targetSev),
      targetFunc,
      defaultInfoText(otherSev),
      otherFunc,
    );
    return (_data: Data, _matches: unknown, output: Output) => {
      // cactbot-builtin-response
      output.responseOutputStrings = outputStrings;
      return combined;
    };
  },
  drawIn: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.drawIn),
  lookTowards: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.lookTowardsBoss),
  lookAway: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.lookAway),
  lookAwayFromTarget: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      lookAway: Outputs.lookAway,
      lookAwayFrom: Outputs.lookAwayFromTarget,
    };
    return {
      [defaultAlertText(sev)]: (data: Data, matches: TargetedMatches, output: Output) => {
        const target = getTarget(matches);
        if (target === data.me)
          return;
        if (target === undefined)
          return output.lookAway?.();
        const name = isPlayerId(matches?.targetId) ? data.party.member(target) : target;
        return output.lookAwayFrom?.({ name: name });
      },
    };
  },
  lookAwayFromSource: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      lookAwayFrom: Outputs.lookAwayFromTarget,
    };
    return {
      [defaultAlertText(sev)]: (data: Data, matches: TargetedMatches, output: Output) => {
        const source = getSource(matches);
        if (source === data.me)
          return;
        const name = isPlayerId(matches?.sourceId) ? data.party.member(source) : source;
        return output.lookAwayFrom?.({ name: name });
      },
    };
  },
  getBehind: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.getBehind),
  goFrontOrSides: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.goFrontOrSides),
  // .getUnder() is used when you have to get into the bosses hitbox
  getUnder: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.getUnder),
  // .getIn() is more like "get close but maybe even melee range is fine"
  getIn: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.in),
  // .getOut() means get far away
  getOut: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.out),
  outOfMelee: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.outOfMelee),
  getInThenOut: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.inThenOut),
  getIntercards: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.intercards),
  getOutThenIn: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.outThenIn),
  getBackThenFront: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.backThenFront),
  getFrontThenBack: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.frontThenBack),
  getSidesThenFrontBack: (sev?: Severity) =>
    staticResponse(defaultInfoText(sev), Outputs.sidesThenFrontBack),
  getFrontBackThenSides: (sev?: Severity) =>
    staticResponse(defaultInfoText(sev), Outputs.frontBackThenSides),
  goFront: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.goFront),
  goMiddle: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.goIntoMiddle),
  goRight: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.right),
  goLeft: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.left),
  goWest: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.getLeftAndWest),
  goEast: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.getRightAndEast),
  goLeftThenRight: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.leftThenRight),
  goRightThenLeft: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.rightThenLeft),
  goFrontBack: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.goFrontBack),
  goSides: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.sides),
  // .killAdds() is used for adds that will always be available
  killAdds: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.killAdds),
  // .killExtraAdd() is used for adds that appear if a mechanic was not played correctly
  killExtraAdd: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.killExtraAdd),
  awayFromFront: (sev?: Severity) => staticResponse(defaultAlertText(sev), Outputs.awayFromFront),
  sleep: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      sleep: Outputs.sleepTarget,
    };
    return {
      [defaultAlertText(sev)]: (_data: Data, matches: TargetedMatches, output: Output) => {
        const source = getSource(matches);
        return output.sleep?.({ name: source });
      },
    };
  },
  stunOrInterruptIfPossible: (sev?: Severity) => {
    return (_data: Data, _matches: TargetedMatches, output: Output) => {
      // cactbot-builtin-response
      output.responseOutputStrings = {
        stun: Outputs.stunTarget,
        interrupt: Outputs.interruptTarget,
      };

      return {
        [defaultAlertText(sev)]: (data: Data, matches: TargetedMatches, output: Output) => {
          const source = getSource(matches);
          if (data.CanSilence())
            return output.interrupt?.({ name: source });
          else if (data.CanStun())
            return output.stun?.({ name: source });
        },
      };
    };
  },
  stun: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      stun: Outputs.stunTarget,
    };
    return {
      [defaultAlertText(sev)]: (_data: Data, matches: TargetedMatches, output: Output) => {
        const source = getSource(matches);
        return output.stun?.({ name: source });
      },
    };
  },
  stunIfPossible: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      stun: Outputs.stunTarget,
    };
    return {
      [defaultAlertText(sev)]: (data: Data, matches: TargetedMatches, output: Output) => {
        const source = getSource(matches);
        if (data.CanStun())
          return output.stun?.({ name: source });
      },
    };
  },
  interrupt: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      interrupt: Outputs.interruptTarget,
    };
    return {
      [defaultAlertText(sev)]: (_data: Data, matches: TargetedMatches, output: Output) => {
        const source = getSource(matches);
        return output.interrupt?.({ name: source });
      },
    };
  },
  interruptIfPossible: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      interrupt: Outputs.interruptTarget,
    };
    return {
      [defaultAlertText(sev)]: (data: Data, matches: TargetedMatches, output: Output) => {
        const source = getSource(matches);
        if (data.CanSilence())
          return output.interrupt?.({ name: source });
      },
    };
  },
  preyOn: (targetSev?: Severity, otherSev?: Severity) => {
    const outputStrings = {
      preyOnYou: Outputs.preyOnYou,
      preyOnTarget: Outputs.preyOnPlayer,
    };

    const targetFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);
      if (data.me === target)
        return output.preyOnYou?.();
    };

    const otherFunc = (data: Data, matches: TargetedMatches, output: Output) => {
      const target = getTarget(matches);
      const player = target === undefined ? output.unknown?.() : data.party.member(target);
      if (target !== data.me)
        return output.preyOnTarget?.({ player: player });
    };

    const combined = combineFuncs(
      defaultAlertText(targetSev),
      targetFunc,
      defaultInfoText(otherSev),
      otherFunc,
    );
    return (_data: Data, _matches: unknown, output: Output) => {
      // cactbot-builtin-response
      output.responseOutputStrings = outputStrings;
      return combined;
    };
  },
  awayFrom: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      awayFromGroup: Outputs.awayFromGroup,
      awayFromTarget: Outputs.awayFromPlayer,
      unknown: Outputs.unknown,
    };
    return {
      [defaultAlertText(sev)]: (data: Data, matches: TargetedMatches, output: Output) => {
        const target = getTarget(matches);
        if (data.me === target)
          return output.awayFromGroup?.();
        const player = target === undefined ? output.unknown?.() : data.party.member(target);
        return output.awayFromTarget?.({ player: player });
      },
    };
  },
  meteorOnYou: (sev?: Severity) => staticResponse(defaultAlarmText(sev), Outputs.meteorOnYou),
  stopMoving: (sev?: Severity) => staticResponse(defaultAlarmText(sev), Outputs.stopMoving),
  stopEverything: (sev?: Severity) => staticResponse(defaultAlarmText(sev), Outputs.stopEverything),
  // move away to dodge aoes
  moveAway: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.moveAway),
  // move around (e.g. jumping) to avoid being frozen
  moveAround: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.moveAround),
  breakChains: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.breakChains),
  moveChainsTogether: (sev?: Severity) =>
    staticResponse(defaultInfoText(sev), Outputs.moveChainsTogether),
  earthshaker: (sev?: Severity) => (_data: Data, _matches: unknown, output: Output) => {
    // cactbot-builtin-response
    output.responseOutputStrings = {
      earthshaker: Outputs.earthshakerOnYou,
    };
    return {
      [defaultAlertText(sev)]: (data: Data, matches: TargetedMatches, output: Output) => {
        const target = getTarget(matches);
        if (target !== data.me)
          return;
        return output.earthshaker?.();
      },
    };
  },
  wakeUp: (sev?: Severity) => staticResponse(defaultAlarmText(sev), Outputs.wakeUp),
  getTowers: (sev?: Severity) => staticResponse(defaultInfoText(sev), Outputs.getTowers),
} as const;

// Don't give `Responses` a type in its declaration so that it can be treated as more strict
// than `ResponsesMap`, but do assert that its type is correct.  This allows callers to know
// which properties are defined in Responses without having to conditionally check for undefined.
const responseMapTypeAssertion: ResponsesMap = Responses;
// Suppress unused variable warning.
console.assert(responseMapTypeAssertion);
