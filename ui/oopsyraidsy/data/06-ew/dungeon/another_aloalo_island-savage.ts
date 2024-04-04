// This file was autogenerated from running npm run sync-files.
// DO NOT EDIT THIS FILE DIRECTLY.
// Edit the source file below and then run `npm run sync-files`
// Source: ui/oopsyraidsy/data/06-ew/dungeon/another_aloalo_island.ts

import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyMistakeType, OopsyTrigger, OopsyTriggerSet } from '../../../../../types/oopsy';
import { LocaleText } from '../../../../../types/trigger';
import { playerDamageFields, playerTargetFields } from '../../../oopsy_common';

// TODO: people who missed their 8AE2 Burst tower
// TODO: failing 8BEB Radiance orb damage during Analysis
// TODO: failing 8CE1 Targeted Light during Analysis
// TODO: people who failed Subtractive Suppressor Alpha + Beta
// TODO: walking over 8BF2 Arcane Combustion when you don't have Suppressor
// TODO: taking extra 8BEA Inferno Divide squares during Spatial Tactics
// TODO: 01F7(success) and 01F8(fail) check and x markers?
// TODO: players not in Trapshooting stack 8977
// TODO: players not in Present Box / Pinwheeling Dartboard two person stack

const renameMistake = (
  triggerId: string,
  abilityId: string | string[],
  type: OopsyMistakeType,
  text: LocaleText,
): OopsyTrigger<OopsyData> => {
  return {
    id: triggerId,
    type: 'Ability',
    netRegex: NetRegexes.ability({ id: abilityId, ...playerTargetFields }),
    mistake: (_data, matches) => {
      return {
        type: type,
        blame: matches.target,
        reportId: matches.targetId,
        text: text,
      };
    },
  };
};

export type Data = OopsyData;

// TODO: we could probably move these helpers to some oopsy util.
const pushedIntoWall = (
  triggerId: string,
  abilityId: string | string[],
): OopsyTrigger<OopsyData> => {
  return {
    id: triggerId,
    type: 'Ability',
    netRegex: NetRegexes.ability({ id: abilityId, ...playerDamageFields }),
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    deathReason: (_data, matches) => {
      return {
        id: matches.targetId,
        name: matches.target,
        text: {
          en: 'Pushed into wall',
          de: 'Rückstoß in die Wand',
          fr: 'Poussé(e) dans le mur',
          ja: '壁へノックバック',
          cn: '击退至墙',
          ko: '넉백',
        },
      };
    },
  };
};

const nonzeroDamageMistake = (
  triggerId: string,
  abilityId: string | string[],
  type: OopsyMistakeType,
): OopsyTrigger<OopsyData> => {
  return {
    id: triggerId,
    type: 'Ability',
    netRegex: NetRegexes.ability({ id: abilityId, ...playerDamageFields }),
    condition: (data, matches) => data.DamageFromMatches(matches) > 0,
    mistake: (_data, matches) => {
      return {
        type: type,
        blame: matches.target,
        reportId: matches.targetId,
        text: matches.ability,
      };
    },
  };
};

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.AnotherAloaloIslandSavage,
  damageWarn: {
    // Trash 1
    'AAIS Twister': '8BCF', // Twister tornados
    'AAIS Kiwakin Tail Screw': '8BC9', // baited circle
    'AAIS Snipper Bubble Shower': '8BCA', // front conal
    'AAIS Snipper Crab Dribble': '8BCB', // fast back conal after Bubble Shower
    'AAIS Ray Hydrocannon': '8C4B', // line aoe
    'AAIS Ray Expulsion': '8BCE', // "get out"
    'AAIS Ray Electric Whorl': '8BCD', // "get in"

    // Ketuduke
    'AAIS Spring Crystal Saturate 1': '8ADB', // orb circle
    'AAIS Spring Crystal Saturate 2': '8ADC', // rupee line laser
    'AAIS Sphere Shatter': '8AE0', // moving arches
    'AAIS Receding Twintides': '8AE7', // initial out during out->in
    'AAIS Near Tide': '8AE8', // second out during in->out with 8AE9 Encroaching Twintides
    'AAIS Encroaching Twintides': '8AE9', // initial in during in->out
    'AAIS Far Tide': '8AEA', // second in during out->in with 8AE7 Receding Twintides
    'AAIS Hydrobomb': '8AEB', // 3x puddles duruing 8ABD Blowing Bubbles

    // Trash 2
    'AAIS Wood Golem Ovation': '8BD4', // front line aoe
    'AAIS Islekeeper Isle Drop': '8C3C', // front circle

    // Lala
    'AAIS Arcane Blight': '8BE6', // 270 degree rotating cleave
    'AAIS Bright Pulse 1': '8BE8', // initial blue square
    'AAIS Bright Pulse 2': '8BE9', // moving blue square
    'AAIS Arcane Mine': '8BF1', // initial Arcane Mine squares
    'AAIS Golem Aero II': '8BFB', // line damage from Aloalo Golem during Symmetric Surge
    'AAIS Telluric Theorem': '8C00', // puddles from Explosive Theorem spreads

    // Statice
    'AAIS Trigger Happy': '8969', // limit cut dart board
    'AAIS Bomb Burst': '897A', // bomb explosion
    'AAIS Uncommon Ground': '8CC3', // people who are on the same dartboard color with Bull's-eye
    'AAIS Faerie Ring': '8973', // donut rings during Present Box
    'AAIS Fire Spread 1': '896F', // initial rotating fire (from Ball of Fire)
    'AAIS Fire Spread 2': '89FB', // ongoing rotating fire damage (from Statice)
  },
  damageFail: {
    'AAIS Big Burst': '8AE3', // tower failure damage
    'AAIS Massive Explosion 1': '8BF3', // failing to resolve Subractive Suppressor Alpha
    'AAIS Massive Explosion 2': '8BF4', // failing to resolve Subractive Suppressor Beta
    'AAIS Burning Chains': '8CC1', // damage from not breaking chains
    'AAIS Surprising Missile Burst': '8974', // running into Surprising Missile tethered add
    'AAIS Surprising Claw Death by Claw': '8975', // running into Surprising Claw tethered add
  },
  gainsEffectFail: {
    // C03 = 9999 duration, ??? = 15s duration
    'AAIS Dropsy': 'C03', // standing outside Ketuduke
    // C05 = 9999 duration, C06 = 15s duration
    'AAIS Bleeding': 'C05', // standing in blue square during Lala
    // BF9 = 9999 duration, BFA??? = 15s duration
    'AAIS Burns': 'BF9', // standing outside Lala
  },
  shareWarn: {
    'AAIS Hydrobullet': '8ADF', // spread debuffs
    'AAIS Wood Golem Tornado': '8BD3', // headmarker -> bind and heavy aoe
    'AAIS Powerful Light': '8BFD', // spread marker during Symmetric Surge that turns squares blue
    'AAIS Explosive Theorem': '8BFF', // large spreads with Telluric Theorem puddles
    'AAIS Trapshooting Spread': '8978', // spread damage from Trick Reload
    'AAIS Firewords Spread': '897D', // spread damage during Present Box / Pinwheeling Dartboard
  },
  soloWarn: {
    'AAIS Snipper Water III': '8BCC', // Snipper stack marker
    'AAIS Islekeeper Gravity Force': '8C3A', // stack
    'AAIS Trapshooting Stack': '8977', // stack damage from Trick Reload
  },
  soloFail: {
    'AAIS Hydrofall': '8ADE', // partner stack debuffs
    'AAIS Symmetric Surge': '8BF5', // two person stack that gives magic vuln up
    'AAIS Fireworks Stack': '897C', // two person stack damage during Present Box / Pinwheeling Dartboard
  },
  triggers: [
    renameMistake('AAIS Tornado', '8BCF', 'fail', {
      // running into a tornado in the initial trash section
      en: 'Tornado',
      de: 'Tornado',
      fr: 'Tornade',
      ja: 'トルネド',
      cn: '龙卷风',
      ko: '토네이도',
    }),
    pushedIntoWall('AAIS Angry Seas', '8AE1'),
    pushedIntoWall('AAIS Pop', '896B'),
    nonzeroDamageMistake('AAIS Hundred Lashings', ['8AE5', '8AE6'], 'warn'),
  ],
};

export default triggerSet;
