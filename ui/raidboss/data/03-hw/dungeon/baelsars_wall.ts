import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'BaelsarsWall',
  zoneId: ZoneId.BaelsarsWall,
  comments: {
    en: 'pre-6.3 rework',
    cn: '6.3改版前',
  },
  timelineFile: 'baelsars_wall.txt',
  timelineTriggers: [
    {
      id: 'Baelsar Magitek Cannon',
      regex: /Magitek Cannon/,
      beforeSeconds: 4,
      response: Responses.tankBuster(),
    },
    {
      id: 'Baelsar Dull Blade',
      regex: /Dull Blade/,
      beforeSeconds: 4,
      response: Responses.miniBuster(),
    },
  ],
  triggers: [
    {
      id: 'Baelsar Magitek Claw',
      type: 'StartsUsing',
      netRegex: { id: '1CB2', source: 'Magitek Predator' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Baelsar Magitek Ray',
      type: 'StartsUsing',
      netRegex: { id: '1CB3', source: 'Magitek Predator', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Baelsar Needle Burst',
      type: 'StartsUsing',
      netRegex: { id: '1DC8', source: 'Magitek Vanguard D-1' },
      condition: (data) => data.CanStun(),
      response: Responses.stun(),
    },
    {
      id: 'Baelsar Launcher',
      type: 'StartsUsing',
      netRegex: { id: '1CBC', source: 'Magitek Predator', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Baelsar Dynamic Sensory Jammer',
      type: 'GainsEffect',
      netRegex: { effectId: '46C' },
      condition: Conditions.targetIsYou(),
      response: Responses.stopEverything(),
    },
    {
      id: 'Baelsar Griffin Beak',
      type: 'StartsUsing',
      netRegex: { id: '1CC3', source: 'The Griffin', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Baelsar Flash Powder',
      type: 'StartsUsing',
      netRegex: { id: '1CC4', source: 'The Griffin' },
      response: Responses.lookAwayFromSource(),
    },
    {
      id: 'Baelsar Griffin Claw',
      type: 'StartsUsing',
      netRegex: { id: '1CC2', source: 'The Griffin' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Baelsar Big Boot',
      type: 'HeadMarker',
      netRegex: { id: '1CC4' },
      condition: Conditions.targetIsYou(),
      response: Responses.knockbackOn(),
    },
    {
      id: 'Baelsar Restraint Collar',
      type: 'StartsUsing',
      netRegex: { id: '1CC8', source: 'The Griffin' },
      condition: Conditions.targetIsNotYou(),
      alertText: (data, matches, output) =>
        output.text!({ player: data.party.member(matches.target) }),
      outputStrings: {
        text: {
          en: 'Break chain on ${player}',
          de: 'Kette von ${player} brechen',
          fr: 'Cassez la chaînes sur ${player}',
          ja: '${player}の線を破れ',
          cn: '击破 ${player} 的锁链',
          ko: '${player}의 사슬 부수기',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Armored Weapon': 'Panzerwaffe',
        'Blade Of The Griffin': 'Greifenklinge',
        'Magitek Bit': 'Éjection de drones',
        'Magitek Predator': 'Magitek-Prädator',
        'Magitek Vanguard D-1': 'Magitek-Frontbrecher D-1',
        'The Airship Landing': 'Luftschiff-Landeplatz',
        '(?<! )The Griffin': 'Ilberd',
        'The Magitek Installation': 'Magitek-Lager',
        'Via Praetoria': 'Via Praetoria',
      },
      'replaceText': {
        '--teleport(?!ation)': '--Teleport',
        'Assault Cannon': 'Canon d\'assaut',
        'Beak Of The Griffin': 'Greifenschnabel',
        'Big Boot': 'Beherzter Tritt',
        'Claw Of The Griffin': 'Greifenklaue',
        'Corrosion': 'Korrosion',
        'Diffractive Laser': 'Laser diffractif',
        'Distress Beacon': 'Appel de renforts',
        'Dull Blade': 'Stumpfklinge',
        'Dynamic Sensory Jammer': 'Brouilleur sensoriel',
        'Flash Powder': 'Blendpulver',
        'Gull Dive': 'Tauchflug',
        'Launcher': 'Raketenwerfer',
        'Lionshead': 'Löwenkopf',
        'Magitek Bit': 'Éjection de drones',
        'Magitek Cannon': 'Canon magitek',
        'Magitek Claw': 'Griffes magitek',
        'Magitek Missile': 'Missiles magitek',
        'Magitek Ray': 'Rayon magitek',
        'Restraint Collar': 'Chaîne de fer',
        'Sanguine Blade': 'Sanguis-Klinge',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Armored Weapon': 'Arme blindée',
        'Blade Of The Griffin': 'Lame du Griffon',
        'Magitek Bit': 'Drone magitek',
        'Magitek Predator': 'Prédateur magitek',
        'Magitek Vanguard D-1': 'Avant-garde magitek de défense',
        'The Airship Landing': 'terrain d\'atterrissage',
        '(?<! )The Griffin': 'Ilberd le Griffon',
        'The Magitek Installation': 'hangar magitek',
        'Via Praetoria': 'Via Praetoria',
      },
      'replaceText': {
        '\\?': ' ?',
        '--teleport': '--téléportation',
        'Assault Cannon': 'Cannon d\'assaut',
        'Beak Of The Griffin': 'Bec du Griffon',
        'Big Boot': 'Chassé destructeur',
        'Claw Of The Griffin': 'Serre du Griffon',
        'Corrosion': 'Désagrégation',
        'Diffractive Laser': 'Laser diffractif',
        'Distress Beacon': 'Appel de renforts',
        'Dull Blade': 'Lame émoussée',
        'Dynamic Sensory Jammer': 'Brouilleur sensoriel',
        'Flash Powder': 'Poudre aveuglante',
        'Gull Dive': 'Piqué de l\'aigle',
        'Launcher': 'Lance-roquettes',
        'Lionshead': 'Tête de lion',
        'Magitek Bit': 'Éjection de drones',
        'Magitek Cannon': 'Canon magitek',
        'Magitek Claw': 'Griffes magitek',
        'Magitek Missile': 'Missiles magitek',
        'Magitek Ray': 'Rayon magitek',
        'Restraint Collar': 'Chaîne de fer',
        'Sanguine Blade': 'Lame sanguine',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Armored Weapon': 'アームドウェポン',
        'Blade Of The Griffin': 'グリフィンブレード',
        'Magitek Bit': '魔導ビット',
        'Magitek Predator': '魔導プレデター',
        'Magitek Vanguard D-1': '魔導ヴァンガード防衛型',
        'The Airship Landing': '飛空戦艦発着場',
        '(?<! )The Griffin': '鉄面のイルベルド',
        'The Magitek Installation': '魔導兵器格納庫',
        'Via Praetoria': 'ヴィア・プラエトリア',
      },
      'replaceText': {
        'Assault Cannon': 'アサルトカノン',
        'Beak Of The Griffin': 'ビーク・オブ・グリフィン',
        'Big Boot': 'ビックブート',
        'Claw Of The Griffin': 'クロウ・オブ・グリフィン',
        'Corrosion': '溶解',
        'Diffractive Laser': '拡散レーザー',
        'Distress Beacon': '援軍要請',
        'Dull Blade': 'ダルブレード',
        'Dynamic Sensory Jammer': '動体感知ジャマー',
        'Flash Powder': 'フラッシュパウダー',
        'Gull Dive': 'ガルダイブ',
        'Launcher': 'ランチャー',
        'Lionshead': 'ライオンヘッド',
        'Magitek Bit': 'ビット射出',
        'Magitek Cannon': '魔導カノン',
        'Magitek Claw': '魔導クロー',
        'Magitek Missile': '魔導ミサイル',
        'Magitek Ray': '魔導レーザー',
        'Restraint Collar': '鉄鎖',
        'Sanguine Blade': 'サングインブレード',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Armored Weapon': '武装重甲',
        'Blade Of The Griffin': '狮鹫之刃',
        'Magitek Bit': '魔导浮游炮',
        'Magitek Predator': '魔导猎手',
        'Magitek Vanguard D-1': '魔导先锋防卫型',
        'The Airship Landing': '飞空战舰着陆场',
        '(?<! )The Griffin': '铁面公卿 伊尔伯德',
        'The Magitek Installation': '魔导兵器仓库',
        'Via Praetoria': '天营路',
      },
      'replaceText': {
        '--teleport': '--传送',
        'Assault Cannon': '突击加农炮',
        'Beak Of The Griffin': '狮鹫之喙',
        'Big Boot': '大靴重踹',
        'Claw Of The Griffin': '狮鹫之爪',
        'Corrosion': '溶解',
        'Diffractive Laser': '扩散射线',
        'Distress Beacon': '请求支援',
        'Dull Blade': '钝剑',
        'Dynamic Sensory Jammer': '运动体探知干扰器',
        'Flash Powder': '闪光粉',
        'Gull Dive': '海鸟冲',
        'Launcher': '火箭炮',
        'Lionshead': '狮子首',
        'Magitek Bit': '浮游炮射出',
        'Magitek Cannon': '魔导加农炮',
        'Magitek Claw': '魔导爪',
        'Magitek Missile': '魔导飞弹',
        'Magitek Ray': '魔导激光',
        'Restraint Collar': '锁链',
        'Sanguine Blade': '嗜血刃',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Armored Weapon': '무장 병기',
        'Blade Of The Griffin': '그리핀의 검',
        'Magitek Bit': '비트 사출',
        'Magitek Predator': '마도 프레데터',
        'Magitek Vanguard D-1': '마도 뱅가드 방어형',
        'The Airship Landing': '골드 소서 비공정 승강장',
        '(?<! )The Griffin': '철가면 일베르드',
        'The Magitek Installation': '마도 병기 격납고',
        'Via Praetoria': '근위대의 길',
      },
      'replaceText': {
        '--teleport': '--순간 이동',
        'Assault Cannon': '맹공포',
        'Beak Of The Griffin': '그리핀의 부리',
        'Big Boot': '걷어차기',
        'Claw Of The Griffin': '그리핀의 발톱',
        'Corrosion': '용해',
        'Diffractive Laser': '확산 레이저',
        'Distress Beacon': '지원 요청',
        'Dull Blade': '무딘 칼날',
        'Dynamic Sensory Jammer': '동작 감지 교란',
        'Flash Powder': '플래시 파우더',
        'Gull Dive': '갈매기 강하',
        'Launcher': '척탄',
        'Lionshead': '사자 머리',
        'Magitek Bit': '비트 사출',
        'Magitek Cannon': '마도포',
        'Magitek Claw': '마도 서슬발톱',
        'Magitek Missile': '마도 미사일',
        'Magitek Ray': '마도 레이저',
        'Restraint Collar': '쇠사슬',
        'Sanguine Blade': '핏빛 칼날',
      },
    },
  ],
};

export default triggerSet;
