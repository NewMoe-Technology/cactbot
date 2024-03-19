import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  limitCutMap?: { [limitCutNumber: number]: string };
  limitCutNumber?: number;
  limitCutDelay?: number;
}

const triggerSet: TriggerSet<Data> = {
  id: 'AlexanderTheHeartOfTheCreatorSavage',
  zoneId: ZoneId.AlexanderTheHeartOfTheCreatorSavage,
  timelineFile: 'a11s.txt',
  timelineTriggers: [
    {
      id: 'A11S Blastoff',
      regex: /Blastoff/,
      beforeSeconds: 5,
      response: Responses.knockback(),
    },
  ],
  triggers: [
    {
      id: 'A11S Left Laser Sword',
      type: 'StartsUsing',
      netRegex: { source: 'Cruise Chaser', id: '1A7A', capture: false },
      // Sorry tanks.
      // We could figure out who is tanking and then do the opposite,
      // but probably that could get confusing too?
      // It seems better to just be consistent here and have tanks be smarter.
      response: Responses.goRight(),
    },
    {
      id: 'A11S Right Laser Sword',
      type: 'StartsUsing',
      netRegex: { source: 'Cruise Chaser', id: '1A79', capture: false },
      response: Responses.goLeft(),
    },
    {
      id: 'A11S Optical Sight Clock',
      type: 'StartsUsing',
      netRegex: { source: 'Cruise Chaser', id: '1A6C', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Clock',
          de: 'Uhr',
          fr: 'Sens horaire',
          ja: '照準 (時針回り)',
          cn: '九连环',
          ko: '시계방향',
        },
      },
    },
    {
      id: 'A11S Optical Sight Out',
      type: 'StartsUsing',
      netRegex: { source: 'Cruise Chaser', id: '1A6D', capture: false },
      response: Responses.getOut('info'),
    },
    {
      id: 'A11S Optical Sight Bait',
      type: 'StartsUsing',
      netRegex: { source: 'Cruise Chaser', id: '1A6E', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait Optical Sight',
          de: 'Köder Visier',
          fr: 'Attirez la Visée optique',
          ja: '照準AoEを誘導',
          cn: '诱导AOE',
          ko: '유도 장판',
        },
      },
    },
    {
      id: 'A11S Super Hawk Blaster',
      type: 'HeadMarker',
      netRegex: { id: '005A' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'A11S Whirlwind',
      type: 'StartsUsing',
      netRegex: { source: 'Cruise Chaser', id: '1A84', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'A11S Spin Crusher',
      type: 'StartsUsing',
      netRegex: { source: 'Cruise Chaser', id: '1A85', capture: false },
      response: Responses.awayFromFront('info'),
    },
    {
      id: 'A11S EDD Add',
      type: 'AddedCombatant',
      netRegex: { name: 'E\\.D\\.D\\.', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Kill Add',
          de: 'Add besiegen',
          fr: 'Tuez l\'Add',
          ja: 'イーディーディーを倒す',
          cn: '击杀小怪',
          ko: '쫄 없애기',
        },
      },
    },
    {
      id: 'A11S Armored Pauldron Add',
      type: 'AddedCombatant',
      netRegex: { name: 'Armored Pauldron', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Break Pauldron',
          de: 'Schulterplatte zerstören',
          fr: 'Brisez la Protection',
          ja: 'アーマーを破壊する',
          cn: '击破护盾',
          ko: '견갑부 부수기',
        },
      },
    },
    {
      id: 'A11S GA-100',
      type: 'StartsUsing',
      // Note: 0057 headmarker, but starts using occurs 3 seconds earlier.
      netRegex: { source: 'Cruise Chaser', id: '1A77' },
      // TODO: maybe we need a Responses.abilityOn()
      alarmText: (data, matches, output) => {
        if (data.me !== matches.target)
          return;
        return output.gaOnYou!();
      },
      infoText: (data, matches, output) => {
        if (data.me === matches.target)
          return;
        return output.gaOn!({ player: data.party.member(matches.target) });
      },
      outputStrings: {
        gaOn: {
          en: 'GA-100 on ${player}',
          de: 'GA-100 on ${player}',
          fr: 'GA-100 sur ${player}',
          ja: '${player}にGA-100',
          cn: 'GA-100点${player}',
          ko: '"${player}" GA-100',
        },
        gaOnYou: {
          en: 'GA-100 on YOU',
          de: 'GA-100 auf DIR',
          fr: 'GA-100 sur VOUS',
          ja: '自分にGA-100',
          cn: 'GA-100点名',
          ko: 'GA-100 대상자',
        },
      },
    },
    {
      id: 'A11S Limit Cut Collect',
      type: 'HeadMarker',
      netRegex: { id: '00(?:4F|5[0-6])' },
      run: (data, matches) => {
        const limitCutNumberMap: { [id: string]: number } = {
          '004F': 1,
          '0050': 2,
          '0051': 3,
          '0052': 4,
          '0053': 5,
          '0054': 6,
          '0055': 7,
          '0056': 8,
        };
        const limitCutNumber = limitCutNumberMap[matches.id];
        if (!limitCutNumber)
          return;
        data.limitCutMap ??= {};
        data.limitCutMap[limitCutNumber] = matches.target;

        if (matches.target === data.me) {
          data.limitCutNumber = limitCutNumber;

          // Time between headmarker and mechanic.
          const limitCutDelayMap: { [id: string]: number } = {
            '004F': 8.8,
            '0050': 9.3,
            '0051': 11.0,
            '0052': 11.5,
            '0053': 13.2,
            '0054': 13.7,
            '0055': 15.5,
            '0056': 16.0,
          };
          data.limitCutDelay = limitCutDelayMap[matches.id];
        }
      },
    },
    {
      id: 'A11S Limit Cut Number',
      type: 'HeadMarker',
      netRegex: { id: '00(?:4F|5[0-6])' },
      condition: Conditions.targetIsYou(),
      durationSeconds: (data) => data.limitCutDelay ?? 0,
      infoText: (data, _matches, output) => output.text!({ num: data.limitCutNumber }),
      outputStrings: {
        text: {
          en: '${num}',
          de: '${num}',
          fr: '${num}',
          ja: '${num}',
          cn: '${num}',
          ko: '${num}',
        },
      },
    },
    {
      id: 'A11S Limit Cut Mechanic',
      type: 'HeadMarker',
      netRegex: { id: '00(?:4F|5[0-6])' },
      condition: Conditions.targetIsYou(),
      delaySeconds: (data) => (data.limitCutDelay ?? 0) - 5,
      alertText: (data, _matches, output) => {
        if (!data.limitCutNumber || !data.limitCutMap)
          return;
        if (data.limitCutNumber % 2 === 1) {
          // Odds
          return output.knockbackCleave!();
        }

        // Evens
        const partner = data.limitCutMap[data.limitCutNumber - 1];
        if (partner === undefined) {
          // In case something goes awry?
          return output.knockbackCharge!();
        }

        return output.facePlayer!({ player: data.party.member(partner) });
      },
      outputStrings: {
        knockbackCleave: {
          en: 'Knockback Cleave; Face Outside',
          de: 'Rückstoß Cleave; nach Außen schauen',
          fr: 'Poussée Cleave; Regardez vers l\'extérieur',
          ja: 'ノックバック ソード; 外を向く',
          cn: '击退顺劈; 面向外侧',
          ko: '넉백 소드; 바깥쪽 바라보기',
        },
        knockbackCharge: {
          en: 'Knockback Charge',
          de: 'Rückstoß Charge',
          fr: 'Poussée Charge',
          ja: 'ノックバック チャージ',
          cn: '击退冲锋',
          ko: '넉백 차지',
        },
        facePlayer: {
          en: 'Face ${player}',
          de: 'Schaue zu ${player}',
          fr: 'Regardez ${player}',
          ja: '${player} に向かう',
          cn: '面向${player}',
          ko: '"${player}" 바라보기',
        },
      },
    },
    {
      id: 'A11S Limit Cut Cleanup',
      type: 'Ability',
      netRegex: { source: 'Cruise Chaser', id: '1A80', capture: false },
      delaySeconds: 30,
      run: (data) => {
        delete data.limitCutDelay;
        delete data.limitCutNumber;
        delete data.limitCutMap;
      },
    },
    {
      id: 'A11S Laser X Sword',
      type: 'StartsUsing',
      netRegex: { source: 'Cruise Chaser', id: '1A7F' },
      alertText: (data, matches, output) => {
        if (data.me === matches.target)
          return output.sharedTankbusterOnYou!();

        if (data.role === 'tank' || data.role === 'healer' || data.job === 'BLU')
          return output.sharedTankbusterOn!({ player: data.party.member(matches.target) });
      },
      outputStrings: {
        sharedTankbusterOnYou: {
          en: 'Shared Tankbuster on YOU',
          de: 'Geteilter Tankbuster auf DIR',
          fr: 'Tank buster à partager sur VOUS',
          ja: '自分に頭割りタンクバスター',
          cn: '分摊死刑点名',
          ko: '쉐어 탱버 대상자',
        },
        sharedTankbusterOn: {
          en: 'Shared Tankbuster on ${player}',
          de: 'Geteilter Tankbuster auf ${player}',
          fr: 'Tank buster à partager sur ${player}',
          ja: '${player}に頭割りタンクバスター',
          cn: '分摊死刑点${player}',
          ko: '"${player}" 쉐어 탱버',
        },
      },
    },
    {
      id: 'A11S Propeller Wind',
      type: 'StartsUsing',
      netRegex: { source: 'Cruise Chaser', id: '1A7F', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Hide Behind Tower',
          de: 'Hinter dem Tower verstecken',
          fr: 'Cachez-vous derrière la tour',
          ja: '塔の後ろに',
          cn: '躲在塔后',
          ko: '기둥 뒤에 숨기',
        },
      },
    },
    {
      id: 'A11S Plasma Shield',
      type: 'AddedCombatant',
      netRegex: { name: 'Plasma Shield', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Break Shield From Front',
          de: 'Schild von vorne zerstören',
          fr: 'Brisez le Bouclier par l\'avant',
          ja: 'シールドを正面から破壊する',
          cn: '正面击破护盾',
          ko: '정면에서 방어막 부수기',
        },
      },
    },
    // There is a GameLog message (en: The plasma shield is shattered!), but no corresponding
    // SystemLogMessage. The 0x19 (NetworkDeath) line shows up >2 seconds later (too late).
    {
      id: 'A11S Plasma Shield Shattered',
      type: 'NetworkEffectResult',
      netRegex: { name: 'Plasma Shield', currentHp: '0', capture: false },
      response: Responses.spread(),
    },
    {
      id: 'A11S Blassty Charge',
      type: 'StartsUsing',
      // The single post-shield charge.  Not "super" blassty charge during limit cut.
      netRegex: { source: 'Cruise Chaser', id: '1A83' },
      alarmText: (data, matches, output) => {
        if (data.me !== matches.target)
          return;
        return output.chargeOnYou!();
      },
      alertText: (data, matches, output) => {
        if (data.me === matches.target)
          return;
        return output.chargeOn!({ player: data.party.member(matches.target) });
      },
      outputStrings: {
        chargeOn: {
          en: 'Charge on ${player}',
          de: 'Ansturm auf ${player}',
          fr: 'Charge sur ${player}',
          ja: '${player}にチャージ',
          cn: '冲锋点${player}',
          ko: '"${player}" 돌진',
        },
        chargeOnYou: {
          en: 'Charge on YOU',
          de: 'Ansturm auf DIR',
          fr: 'Charge sur VOUS',
          ja: '自分にチャージ',
          cn: '冲锋点名',
          ko: '돌진 대상자',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Armored Pauldron': 'Schulterplatte',
        'Claster': 'Claster-Mecha',
        'Cruise Chaser': 'Chaser-Mecha',
        'E\\\\.D\\\\.D\\\\.': 'E\\.D\\.D\\.-Mecha',
        'Multifield': 'Schichtfeld',
        'Plasma Shield': 'Plasmaschild',
        'The Main Generators': 'Hauptantriebsraum',
        'The plasma shield is shattered': 'Die Schulterplatte ist zerstört',
      },
      'replaceText': {
        '(?<! )Sword': 'Schwert',
        '(?<!Super )Hawk Blaster': 'Jagdfalke',
        '--invincible--': '--unverwundbar--',
        '\\(bait\\)': '(ködern)',
        '\\(clock/out\\)': '(im Uhrzeigersinn/Raus)',
        '\\(everyone\\)': '(jeder)',
        '\\(numbers\\)': '(Nummern)',
        '\\(orbs\\)': '(Orbs)',
        '\\(out/clock\\)': '(Raus/im Uhrzeigersinn)',
        '\\(shield\\)': '(Schild)',
        '\\?': ' ?',
        'Assault Cannon': 'Sturmkanone',
        'Blassty Blaster': 'Blassty-Blaster',
        'Blassty Charge': 'Blassty-Ladung',
        'Blastoff': 'Absprengen',
        '(?<!Blassty )Charge': 'Sturm',
        'E\\.D\\.D\\. Add': 'E.D.D.-Mecha Add',
        'E\\.D\\.D\\. Armored Pauldron': 'E.D.D.-Mecha Schulterplatte',
        'Eternal Darkness': 'Ewiges Dunkel',
        'GA-100': 'GA-100',
        'Lapis Lazuli': 'Lapislazuli',
        'Laser X Sword': 'Laserschwert X',
        'Left/Right Laser Sword': 'Linkes/Rechtes Laserschwert',
        'Limit Cut': 'Grenzwertüberschreitung',
        'Markers': 'Markierungen',
        'Multifield': 'Schichtfeld',
        'Optical Sight': 'Visier',
        'Perfect Landing': 'Perfekte Landung',
        'Photon': 'Photon',
        'Plasma Shield': 'Plasmaschild',
        'Plasmasphere': 'Plasmasphäre',
        'Propeller Wind': 'Luftschraube',
        'Spin Crusher': 'Rotorbrecher',
        'Super Hawk Blaster': 'Super-Jagdfalke',
        'Transform': 'Diamorphose',
        'Whirlwind': 'Wirbelwind',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Armored Pauldron': 'Protection d\'épaule',
        'Claster': 'Éclateur',
        'Cruise Chaser': 'Croiseur-chasseur',
        'E\\\\.D\\\\.D\\\\.': 'E\\.D\\.D\\.',
        'Multifield': 'Champ multistrate',
        'Plasma Shield': 'Bouclier plasma',
        'The Main Generators': 'la chambre du générateur principal',
        'The plasma shield is shattered.*?': 'Le bouclier plasma se brise.*?',
      },
      'replaceText': {
        '(?<! )Sword': 'Épée',
        '(?<!Super )Hawk Blaster': 'Canon faucon',
        '--invincible--': '--invulnérable--',
        '\\(bait\\)': '(attirez)',
        '\\(clock/out\\)': '(sens horaire/extérieur)',
        '\\(everyone\\)': '(tout les joueurs)',
        '\\(numbers\\)': '(nombres)',
        '\\(orbs\\)': '(orbes)',
        '\\(out/clock\\)': '(extérieur/sens horaire)',
        '\\(shield\\)': '(bouclier)',
        '\\?': ' ?',
        'Assault Cannon': 'Canon d\'assaut',
        'Blassty Blaster': 'Canon Blassty',
        'Blassty Charge': 'Charge Blassty',
        'Blastoff': 'Lancement',
        '(?<!Blassty )Charge': 'Charge',
        'E\\.D\\.D\\. Add': 'Add E.D.D.',
        'E\\.D\\.D\\. Armored Pauldron': 'E.D.D. Protection d\'épaule',
        'Eternal Darkness': 'Ténèbres éternelles',
        'GA-100': 'GA-100',
        'Lapis Lazuli': 'Lapis-lazuli',
        'Laser X Sword': 'Épée laser X',
        'Left/Right Laser Sword': 'Épée laser gauche/droite',
        'Limit Cut': 'Dépassement de limites',
        'Markers': 'Marqueurs',
        'Multifield': 'Champ multistrate',
        'Optical Sight': 'Visée optique',
        'Perfect Landing': 'Atterissage parfait',
        'Photon': 'Photon',
        'Plasma Shield': 'Bouclier plasma',
        'Plasmasphere': 'Sphère de plasma',
        'Propeller Wind': 'Vent turbine',
        'Spin Crusher': 'Écrasement tournoyant',
        'Super Hawk Blaster': 'Super canon faucon',
        'Transform': 'Transformation',
        'Whirlwind': 'Tornade',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Armored Pauldron': 'ショルダーアーマー',
        'Claster': 'クラスター',
        'Cruise Chaser': 'クルーズチェイサー',
        'E\\\\.D\\\\.D\\\\.': 'イーディーディー',
        'Multifield': '積層科学フィールド',
        'Plasma Shield': 'プラズマシールド',
        'The Main Generators': '中枢大動力室',
        'The plasma shield is shattered': 'プラズマシールドが壊れた！',
      },
      'replaceText': {
        '(?<! )Sword': 'ソード',
        '(?<!Super )Hawk Blaster': 'ホークブラスター',
        '--invincible--': '--インビンシブル--',
        '\\(bait\\)': '(誘導)',
        '\\(clock/out\\)': '(時針回り/外へ)',
        '\\(everyone\\)': '(全員)',
        '\\(numbers\\)': '(数字)',
        '\\(offtank\\)': '(ST)',
        '\\(orbs\\)': '(玉)',
        '\\(out/clock\\)': '(外へ/時針回り)',
        '\\(shield\\)': '(シールド)',
        '\\?': ' ?',
        'Assault Cannon': 'アサルトカノン',
        'Blassty Blaster': 'ブラスティ・ブラスター',
        'Blassty Charge': 'ブラスティ・チャージ',
        'Blastoff': 'ブラストオフ',
        '(?<!Blassty )Charge': 'チャージ',
        'E\\.D\\.D\\. Add': '雑魚: イーディーディー',
        'E\\.D\\.D\\. Armored Pauldron': 'イーディーディー ショルダーアーマー',
        'Eternal Darkness': '暗黒の運命',
        'GA-100': 'GA-100',
        'Lapis Lazuli': 'ラピスラズリ',
        'Laser X Sword': 'レーザーエックススウォード',
        'Left/Right Laser Sword': '左/右 ソード',
        'Limit Cut': 'リミッターカット',
        'Markers': 'マーク',
        'Multifield': '積層科学フィールド',
        'Optical Sight': '照準',
        'Perfect Landing': '着陸',
        'Photon': 'フォトン',
        'Plasma Shield': 'プラズマシールド',
        'Plasmasphere': 'プラズマスフィア',
        'Propeller Wind': 'プロペラウィンド',
        'Spin Crusher': 'スピンクラッシャー',
        'Super Hawk Blaster': 'スーパーホークブラスター',
        'Transform': 'トランスフォーム・シューター',
        'Whirlwind': '竜巻',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Armored Pauldron': '肩部装甲',
        'Claster': '舰载浮游炮',
        'Cruise Chaser': '巡航驱逐者',
        'E\\\\.D\\\\.D\\\\.': '护航机甲',
        'Multifield': '层积科学结界',
        'Plasma Shield': '等离子护盾',
        'The Main Generators': '中枢大动力室',
      },
      'replaceText': {
        '(?<! )Sword': '剑 ',
        '(?<!Super )Hawk Blaster': '鹰式破坏炮',
        '--invincible--': '--无敌--',
        '\\(bait\\)': '(诱导)',
        '\\(clock/out\\)': '(顺时针/外)',
        '\\(everyone\\)': '(全员)',
        '\\(numbers\\)': '(麻将)',
        '\\(orbs\\)': '(球)',
        '\\(out/clock\\)': '(外/顺时针)',
        '\\(shield\\)': '(护盾)',
        '\\?': ' ?',
        'Assault Cannon': '突击加农炮',
        'Blassty Blaster': '摧毁者破坏炮',
        'Blassty Charge': '摧毁者冲击',
        'Blastoff': '准备升空',
        '(?<!Blassty )Charge': '刺冲',
        'E\\.D\\.D\\. Add': '护航机甲出现',
        'E\\.D\\.D\\. Armored Pauldron': '护航机甲肩部装甲',
        'Eternal Darkness': '黑暗命运',
        'GA-100': '百式聚能炮',
        'Lapis Lazuli': '天青石',
        'Laser X Sword': '交叉光剑',
        'Left/Right Laser Sword': '左/右光剑',
        'Limit Cut': '限制器减档',
        'Markers': '标记',
        'Multifield': '层积科学结界',
        'Optical Sight': '制导',
        'Perfect Landing': '着陆',
        'Photon': '光子炮',
        'Plasma Shield': '等离子护盾',
        'Plasmasphere': '等离子球',
        'Propeller Wind': '螺旋桨强风',
        'Spin Crusher': '回旋碎踢',
        'Super Hawk Blaster': '超级鹰式破坏炮',
        'Transform': '变形',
        'Whirlwind': '龙卷风',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Armored Pauldron': '견갑부',
        'Claster': '클래스터',
        'Cruise Chaser': '순항추격기',
        'E\\\\.D\\\\.D\\\\.': 'E\\.D\\.D\\.',
        'Multifield': '적층과학 필드',
        'Plasma Shield': '플라스마 방어막',
        'The Main Generators': '중추 대동력실',
      },
      'replaceText': {
        '(?<! )Sword': '알파검',
        '(?<!Super )Hawk Blaster': '호크 블래스터',
        '--invincible--': '--무적--',
        '\\(bait\\)': '(유도)',
        '\\(clock/out\\)': '(시계방향/밖)',
        '\\(everyone\\)': '(모두)',
        '\\(numbers\\)': '(주사위)',
        '\\(orbs\\)': '(구슬)',
        '\\(out/clock\\)': '(밖/시계방향)',
        '\\(shield\\)': '(방어막)',
        'Assault Cannon': '맹공포',
        'Blassty Blaster': '블래스티 블래스터',
        'Blassty Charge': '블래스티 돌진',
        'Blastoff': '발진',
        '(?<!Blassty )Charge': '돌격',
        'E\\.D\\.D\\. Add': 'E.D.D. 등장',
        'E\\.D\\.D\\. Armored Pauldron': 'E.D.D. 견갑부',
        'Eternal Darkness': '암흑의 운명',
        'GA-100': 'GA-100',
        'Lapis Lazuli': '청금석',
        'Laser X Sword': '레이저 교차베기',
        'Left/Right Laser Sword': '왼쪽/오른쪽 레이저 베기',
        'Limit Cut': '리미터 해제',
        'Markers': '징',
        'Multifield': '적층과학 필드',
        'Optical Sight': '조준',
        'Perfect Landing': '착륙',
        'Photon': '광자',
        'Plasma Shield': '플라스마 방어막',
        'Plasmasphere': '플라스마 구체',
        'Propeller Wind': '추진 돌풍',
        'Spin Crusher': '회전 분쇄',
        'Super Hawk Blaster': '슈퍼 호크 블래스터',
        'Transform': '비행형 변신',
        'Whirlwind': '회오리바람',
      },
    },
  ],
};

export default triggerSet;
