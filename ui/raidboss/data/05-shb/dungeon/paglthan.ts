import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  lunarFlares?: number;
}

const triggerSet: TriggerSet<Data> = {
  id: 'Paglthan',
  zoneId: ZoneId.Paglthan,
  timelineFile: 'paglthan.txt',
  timelineTriggers: [
    {
      // This is a rear cone attack that always follows Wide Blaster.
      // It has a cast time of under a GCD, so we pre-warn during Wide Blaster.
      // Only the sides are safe to call at this moment.
      id: 'Paglthan Spike Flail',
      regex: /Spike Flail/,
      beforeSeconds: 4,
      response: Responses.goSides(),
    },
  ],
  triggers: [
    {
      id: 'Paglthan Critical Rip',
      type: 'StartsUsing',
      netRegex: { id: '5C4E', source: 'Amhuluk' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Paglthan Electric Burst',
      type: 'StartsUsing',
      netRegex: { id: '5C4D', source: 'Amhuluk', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Paglthan Lightning Rod Gain',
      type: 'GainsEffect',
      netRegex: { effectId: 'A0E' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go to a lightning rod',
          de: 'Geh zu einem Blitzableiter',
          fr: 'Allez sur un paratonnerre',
          ja: '避雷針に円範囲を転嫁',
          cn: '把雷传给避雷针',
          ko: '장판 기둥에 넘기기',
        },
      },
    },
    {
      id: 'Paglthan Lightning Rod Lose',
      type: 'LosesEffect',
      netRegex: { effectId: 'A0E' },
      condition: Conditions.targetIsYou(),
      response: Responses.goMiddle(),
    },
    {
      id: 'Paglthan Ballistic',
      type: 'StartsUsing',
      netRegex: { id: '5C97', source: 'Magitek Fortress', capture: false },
      response: Responses.knockback(),
    },
    {
      id: 'Paglthan Defensive Reaction',
      type: 'StartsUsing',
      netRegex: { id: '5C9E', source: 'Magitek Core', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Paglthan Twisted Scream',
      type: 'StartsUsing',
      netRegex: { id: '5B47', source: 'Lunar Bahamut', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Paglthan Akh Morn',
      type: 'HeadMarker',
      netRegex: { id: '005D' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Paglthan Mega Flare Spread',
      type: 'HeadMarker',
      netRegex: { id: '0017' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Paglthan Mega Flare Move',
      type: 'Ability',
      netRegex: { id: '5B4D', source: 'Lunar Bahamut' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from circles',
          de: 'Weg von den Kreisen',
          fr: 'Éloignez-vous des cercles',
          ja: '円を避ける',
          cn: '远离圈圈',
          ko: '장판 피하기',
        },
      },
    },
    {
      id: 'Paglthan Kan Rhai Marker',
      type: 'HeadMarker',
      netRegex: { id: '0104' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Kan Rhai on YOU',
          de: 'Kan Rhai auf DIR',
          fr: 'Kan Rhai sur VOUS',
          ja: '自分にカン・ラーイ',
          cn: '十字多段AoE点名',
          ko: '십자 장판 대상자',
        },
      },
    },
    {
      id: 'Paglthan Kan Rhai Move',
      type: 'Ability',
      netRegex: { id: '5B4F', source: 'Lunar Bahamut', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from crosses',
          de: 'Weg von dem Kreuz',
          fr: 'Éloignez-vous des croix',
          ja: '十字から離れる',
          cn: '远离十字',
          ko: '십자 피하기',
        },
      },
    },
    {
      id: 'Paglthan Lunar Flare Reset',
      type: 'Ability',
      netRegex: { id: '5B49', source: 'Lunar Bahamut', capture: false },
      run: (data) => data.lunarFlares = 0,
    },
    {
      id: 'Paglthan Lunar Flare Collect',
      type: 'StartsUsing',
      netRegex: { id: '5B4[AB]', source: 'Lunar Bahamut', capture: false },
      run: (data) => data.lunarFlares = (data.lunarFlares ?? 0) + 1,
    },
    {
      // Get middle is 4x5B4A and 4x5B4B, get outside is 5x5B4A
      id: 'Paglthan Lunar Flare',
      type: 'StartsUsing',
      netRegex: { id: '5B4[AB]', source: 'Lunar Bahamut', capture: false },
      delaySeconds: 0.5,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.lunarFlares === 5)
          return output.getOutsideBetweenCircles!();
        if (data.lunarFlares === 8)
          return output.getMiddle!();
      },
      outputStrings: {
        getMiddle: {
          en: 'Get Middle',
          de: 'In die Mitte gehen',
          fr: 'Allez au milieu',
          ja: '中心へ',
          cn: '中间',
          ko: '중앙으로',
        },
        getOutsideBetweenCircles: {
          en: 'Get Outside Between Circles',
          de: 'Geh zum Rand zwichen den Kreisen',
          fr: 'Allez à l\'extérieur entre les cercles',
          ja: '外周の円の隙間へ',
          cn: '去外圈交接处',
          ko: '바깥 장판 사이로',
        },
      },
    },
    {
      id: 'Paglthan Flatten',
      type: 'StartsUsing',
      netRegex: { id: '5B58', source: 'Lunar Bahamut' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Paglthan Giga Flare',
      type: 'StartsUsing',
      netRegex: { id: '5B57', source: 'Lunar Bahamut', capture: false },
      response: Responses.aoe(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Amhuluk': 'Amhuluk',
        'Lunar Bahamut': 'Luna-Bahamut',
        'Magitek Fortress': 'Magitek-Festung',
        'Magitek Core': 'Magitek-Reaktor',
        'Sunseat': 'Dämmergarten',
        'The Gathering Ring': 'Festplatz von Zolm\'ak',
      },
      'replaceText': {
        '\\(circles\\)': '(Kreise)',
        '\\(explosions\\)': '(Explosionen)',
        '--Levin orbs--': '--Elektrosphären--',
        'Akh Morn': 'Akh Morn',
        'Big Burst': 'Detonation',
        'Critical Rip': 'Kritischer Riss',
        'Electric Burst': 'Stromstoß',
        'Flatten': 'Einebnen',
        'Gigaflare': 'Gigaflare',
        'Kan Rhai': 'Kan Rhai',
        'Lightning Bolt': 'Blitzschlag',
        'Lunar Flare': 'Lunaflare',
        'Megaflare(?! Dive)': 'Megaflare',
        'Megaflare Dive': 'Megaflare-Sturz',
        'Perigean Breath': 'Perigäum-Atem',
        'Spike Flail': 'Dornendresche',
        'Thundercall': 'Donnerruf',
        'Twisted Scream': 'Verzerrtes Brüllen',
        'Upburst': 'Quantengravitation',
        'Wide Blaster': 'Weitwinkel-Blaster',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Amhuluk': 'Amhuluk',
        'Lunar Bahamut': 'Luna-Bahamut',
        'Magitek Fortress': 'forteresse magitek',
        'Magitek Core': 'réacteur magitek',
        'Sunseat': 'Clos du Crépuscule',
        'The Gathering Ring': 'Autel de Zolm\'ak',
      },
      'replaceText': {
        '\\(circles\\)': '(cercles)',
        '\\(explosions\\)': '(explosions)',
        '--Levin orbs--': '--Orbes de foudre--',
        'Akh Morn': 'Akh Morn',
        'Big Burst': 'Grosse explosion',
        'Critical Rip': 'Griffure critique',
        'Electric Burst': 'Salve électrique',
        'Flatten': 'Compression',
        'Gigaflare': 'GigaBrasier',
        'Kan Rhai': 'Kan Rhai',
        'Lightning Bolt': 'Éclair de foudre',
        'Lunar Flare': 'LunaBrasier',
        'Megaflare(?! Dive)': 'MégaBrasier',
        'Megaflare Dive': 'Plongeon MégaBrasier',
        'Perigean Breath': 'Souffle de périgée',
        'Spike Flail': 'Fléau à pointes',
        'Thundercall': 'Drain fulminant',
        'Twisted Scream': 'Hurlement de l\'Anomalie',
        'Upburst': 'Saillie',
        'Wide Blaster': 'Fulguration large',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Amhuluk': 'アムルック',
        'Lunar Bahamut': 'ルナバハムート',
        'Magitek Fortress': '魔導フォートレス',
        'Magitek Core': '魔導コア',
        'Sunseat': '黄昏の庭',
        'The Gathering Ring': 'ゾレマク祭場',
      },
      'replaceText': {
        'Akh Morn': 'アク・モーン',
        'Big Burst': '大爆発',
        'Critical Rip': 'クリティカルリップ',
        'Electric Burst': 'エレクトリックバースト',
        'Flatten': 'フラッテン',
        'Gigaflare': 'ギガフレア',
        'Kan Rhai': 'カン・ラーイ',
        'Lightning Bolt': '落雷',
        'Lunar Flare': 'ルナフレア',
        'Megaflare(?! Dive)': 'メガフレア',
        'Megaflare Dive': 'メガフレアダイブ',
        'Perigean Breath': 'ペリジアンブレス',
        'Spike Flail': 'スパイクフレイル',
        'Thundercall': '招雷',
        'Twisted Scream': '異形の咆哮',
        'Upburst': '突出',
        'Wide Blaster': 'ワイドブラスター',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Amhuluk': '阿姆鲁克',
        'Lunar Bahamut': '真月巴哈姆特',
        'Magitek Fortress': '魔导要塞',
        'Magitek Core': '魔导核心',
        'Sunseat': '黄昏庭园',
        'The Gathering Ring': '佐尔玛刻祭场',
      },
      'replaceText': {
        '\\(circles\\)': '(预兆)',
        '\\(explosions\\)': '(爆炸)',
        '--Levin orbs--': '--电球--',
        'Akh Morn': '死亡轮回',
        'Big Burst': '大爆炸',
        'Critical Rip': '暴击撕裂',
        'Electric Burst': '电光爆发',
        'Flatten': '夷为平地',
        'Gigaflare': '十亿核爆',
        'Kan Rhai': '天光交错',
        'Lightning Bolt': '落雷',
        'Lunar Flare': '真月核爆',
        'Megaflare(?! Dive)': '百万核爆',
        'Megaflare Dive': '百万核爆冲',
        'Perigean Breath': '近地吐息',
        'Spike Flail': '刃尾横扫',
        'Thundercall': '招雷',
        'Twisted Scream': '异形咆哮',
        'Upburst': '顶起',
        'Wide Blaster': '广域冲击波',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Amhuluk': '아물룩',
        'Lunar Bahamut': '루나 바하무트',
        'Magitek Fortress': '마도 요새',
        'Magitek Core': '마도핵',
        'Sunseat': '황혼의 뜰',
        'The Gathering Ring': '졸마크 제단',
      },
      'replaceText': {
        '\\(circles\\)': '원',
        '\\(explosions\\)': '(폭발)',
        '--Levin orbs--': '--번개 구슬--',
        'Akh Morn': '아크 몬',
        'Big Burst': '대폭발',
        'Critical Rip': '찢어가르기',
        'Electric Burst': '전하 폭발',
        'Flatten': '압사',
        'Gigaflare': '기가플레어',
        'Kan Rhai': '칸 라이',
        'Lightning Bolt': '번개 발생',
        'Lunar Flare': '루나 플레어',
        'Megaflare(?! Dive)': '메가플레어',
        'Megaflare Dive': '메가플레어 다이브',
        'Perigean Breath': '근지점 입김',
        'Spike Flail': '가시 매타작',
        'Thundercall': '초뢰',
        'Twisted Scream': '기괴한 포효',
        'Upburst': '돌출',
        'Wide Blaster': '광범위 블래스터',
      },
    },
  ],
};

export default triggerSet;
