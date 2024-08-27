const executionIdToSafeMap = {
  '9636': 'out',
  '9637': 'in',
  '9638': 'cardinals',
};
const executionOutputStrings = {
  out: Outputs.out,
  in: Outputs.in,
  cardinals: Outputs.cardinals,
  next: Outputs.next,
};
Options.Triggers.push({
  id: 'LivingMemory',
  zoneId: ZoneId.LivingMemory,
  initData: () => ({
    executionSafe: [],
  }),
  triggers: [
    // ****** A-RANK: Cat's Eye ****** //
    {
      id: 'Hunt Cat\'s Eye Gravitational Wave',
      type: 'StartsUsing',
      netRegex: { id: '9BCF', source: 'Cat\'s Eye', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Cat\'s Eye Jump + Look Away',
      type: 'StartsUsing',
      netRegex: { id: '966E', source: 'Cat\'s Eye', capture: false },
      durationSeconds: 7.5,
      alertText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Face away from landing marker',
          cn: '背对落地点',
        },
      },
    },
    {
      id: 'Hunt Cat\'s Eye Jump + Look Toward',
      type: 'StartsUsing',
      // Only used when Wandering Eyes buff is active.
      netRegex: { id: '966F', source: 'Cat\'s Eye', capture: false },
      durationSeconds: 7.5,
      alertText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Face toward landing marker',
          cn: '面向落地点',
        },
      },
    },
    {
      id: 'Hunt Cat\'s Eye Bloodshot Gaze',
      type: 'StartsUsing',
      netRegex: { id: '9673', source: 'Cat\'s Eye', capture: false },
      alertText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Stack (face away from target)',
          cn: '分摊 (背对目标)',
        },
      },
    },
    // ****** A-RANK: Sally the Sweeper ****** //
    {
      id: 'Hunt Sally Execution Model Collect',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(executionIdToSafeMap), source: 'Sally the Sweeper' },
      run: (data, matches) => {
        const safe = executionIdToSafeMap[matches.id];
        if (safe === undefined)
          throw new UnreachableCode();
        data.executionSafe.push(safe);
      },
    },
    {
      id: 'Hunt Sally Code Execution',
      type: 'StartsUsing',
      // Not clear why there are two ids, but both get used.
      netRegex: { id: ['9639', '963A'], source: 'Sally the Sweeper', capture: false },
      durationSeconds: 12,
      infoText: (data, _matches, output) => {
        const safe = data.executionSafe;
        if (safe.length !== 3)
          return;
        return safe.map((spot) => output[spot]()).join(output.next());
      },
      run: (data) => data.executionSafe = [],
      outputStrings: executionOutputStrings,
    },
    {
      id: 'Hunt Sally Reverse Code',
      type: 'StartsUsing',
      // Not clear why there are two ids, but both get used.
      netRegex: { id: ['963B', '963C'], source: 'Sally the Sweeper', capture: false },
      durationSeconds: 12,
      infoText: (data, _matches, output) => {
        const safe = data.executionSafe.reverse();
        if (safe.length !== 3)
          return;
        return safe.map((spot) => output[spot]()).join(output.next());
      },
      run: (data) => data.executionSafe = [],
      outputStrings: executionOutputStrings,
    },
    // ****** S-RANK: The Forecaster ****** //
  ],
  timelineReplace: [],
});
