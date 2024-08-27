Options.Triggers.push({
  id: 'HeritageFound',
  zoneId: ZoneId.HeritageFound,
  triggers: [
    // ****** A-RANK: Heshuala ****** //
    {
      id: 'Hunt Heshuala Electrical Overload',
      type: 'StartsUsing',
      netRegex: { id: '98C1', source: 'Heshuala', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Heshuala Stored Shock Early',
      type: 'GainsEffect',
      // F89: Shocking Cross (+ cleave, intercards safe)
      // F8A: X Marks the Shock (x cleave, cardinals safe)
      netRegex: { effectId: ['F89', 'F8A'], target: 'Heshuala' },
      infoText: (data, matches, output) => {
        const safe = matches.effectId === 'F89' ? 'intercards' : 'cardinals';
        data.storedShockSafe = safe;
        return output[safe]();
      },
      outputStrings: {
        cardinals: {
          en: '(cardinals later)',
          cn: '(稍后去正点)',
        },
        intercards: {
          en: '(intercards later)',
          cn: '(稍后去斜角)',
        },
      },
    },
    {
      id: 'Hunt Heshuala Stored Shock Now',
      type: 'LosesEffect',
      // F8B: Electrical Charge (LosesEffect happens right before the Stored Shock resolves)
      netRegex: { effectId: 'F8B', target: 'Heshuala', capture: false },
      alertText: (data, _matches, output) => {
        const safe = data.storedShockSafe;
        if (safe !== undefined)
          return output[safe]();
      },
      run: (data) => delete data.storedShockSafe,
      outputStrings: {
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
      },
    },
    // ****** A-RANK: Urna Variabilis ****** //
    {
      id: 'Hunt Urna Proximity Plasma',
      type: 'StartsUsing',
      netRegex: { id: '98C2', source: 'Urna Variabilis', capture: false },
      response: Responses.getOut('info'),
    },
    {
      id: 'Hunt Urna Ring Lightning',
      type: 'StartsUsing',
      netRegex: { id: '98C3', source: 'Urna Variabilis', capture: false },
      response: Responses.getIn('info'),
    },
    {
      id: 'Hunt Urna Magnetron',
      type: 'StartsUsing',
      netRegex: { id: '98C4', source: 'Urna Variabilis', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Urna Thunderous Shower',
      type: 'StartsUsing',
      netRegex: { id: '98CB', source: 'Urna Variabilis' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Hunt Urna Electrowave',
      type: 'StartsUsing',
      netRegex: { id: '98CC', source: 'Urna Variabilis', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Urna Magnetron Debuff',
      type: 'GainsEffect',
      // FE7: Positive Charge, FE8: Negative Charge
      netRegex: { effectId: ['FE7', 'FE8'], source: 'Urna Variabilis' },
      condition: Conditions.targetIsYou(),
      run: (data, matches) =>
        data.magnetronDebuff = matches.effectId === 'FE7' ? 'positive' : 'negative',
    },
    {
      id: 'Hunt Urna Magnetoplasma',
      type: 'StartsUsing',
      // 98C5: Boss Positive, 98C7: Boss Negative
      netRegex: { id: ['98C5', '98C7'], source: 'Urna Variabilis' },
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const bossMagnet = matches.id === '98C5' ? 'positive' : 'negative';
        const myMagnet = data.magnetronDebuff;
        if (myMagnet === undefined)
          return output.out();
        if (bossMagnet === myMagnet)
          return output.combo({ magnet: output.repel(), dir: output.out() });
        return output.combo({ magnet: output.attract(), dir: output.out() });
      },
      run: (data) => delete data.magnetronDebuff,
      outputStrings: {
        out: Outputs.out,
        repel: {
          en: 'Forced knockback',
          cn: '强制击退',
        },
        attract: {
          en: 'Forced draw-in',
          cn: '强制吸引',
        },
        combo: {
          en: '${magnet} => ${dir}',
          cn: '${magnet} => ${dir}',
        },
      },
    },
    {
      id: 'Hunt Urna Magnetoring',
      type: 'StartsUsing',
      // 98C6: Boss Positive, 98C8: Boss Negative
      netRegex: { id: ['98C6', '98C8'], source: 'Urna Variabilis' },
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const bossMagnet = matches.id === '98C6' ? 'positive' : 'negative';
        const myMagnet = data.magnetronDebuff;
        if (myMagnet === undefined)
          return output.in();
        if (bossMagnet === myMagnet)
          return output.combo({ magnet: output.repel(), dir: output.in() });
        return output.combo({ magnet: output.attract(), dir: output.in() });
      },
      run: (data) => delete data.magnetronDebuff,
      outputStrings: {
        in: Outputs.in,
        repel: {
          en: 'Forced knockback',
          cn: '强制击退',
        },
        attract: {
          en: 'Forced draw-in',
          cn: '强制吸引',
        },
        combo: {
          en: '${magnet} => ${dir}',
          cn: '${magnet} => ${dir}',
        },
      },
    },
    // ****** S-RANK: Atticus the Primogenitor ****** //
  ],
  timelineReplace: [],
});
