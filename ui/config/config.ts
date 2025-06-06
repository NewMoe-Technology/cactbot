import contentList from '../../resources/content_list';
import { Lang } from '../../resources/languages';
import { UnreachableCode } from '../../resources/not_reached';
import { callOverlayHandler } from '../../resources/overlay_plugin_api';
import Regexes from '../../resources/regexes';
import UserConfig, {
  ConfigEntry,
  ConfigEntryToDivMap,
  ConfigIdToValueMap,
  ConfigValue,
  OptionsTemplate,
} from '../../resources/user_config';
import ZoneInfo from '../../resources/zone_info';
import { BaseOptions } from '../../types/data';
import { SavedConfig, SavedConfigEntry } from '../../types/event';
import { LooseOopsyTrigger, LooseOopsyTriggerSet } from '../../types/oopsy';
import {
  LocaleObject,
  LocaleText,
  LooseTimelineTrigger,
  LooseTrigger,
  LooseTriggerSet,
} from '../../types/trigger';

import defaultOptions, { ConfigOptions } from './config_options';

// Load other config files
import './general_config';
import '../eureka/eureka_config';
import '../jobs/jobs_config';
import '../oopsyraidsy/oopsyraidsy_config';
import '../radar/radar_config';
import '../raidboss/raidboss_config';

import '../../resources/defaults.css';
import './config.css';

// Text in the butter bar, to prompt the user to reload after a config change.
const kReloadText = {
  en: 'To apply configuration changes, reload cactbot overlays.',
  de: 'Um die Änderungen zu aktivieren, aktualisiere bitte die Cactbot Overlays.',
  fr: 'Afin d\'appliquer les modifications, il faut recharger l\'overlay Cactbot.',
  ja: '設定を有効にする為、Cactbotオーバーレイを再読み込みしてください',
  cn: '要应用配置更改，请重新加载cactbot悬浮窗。',
  ko: '변경사항을 적용하려면, 오버레이를 새로고침 하십시오.',
};

// Text in the butter bar reload button.
const kReloadButtonText = {
  en: 'Reload',
  de: 'Aktualisieren',
  fr: 'Recharger',
  ja: '再読み込み',
  cn: '重新加载',
  ko: '새로고침',
};

// Text on the directory choosing button.
const kDirectoryChooseButtonText = {
  en: 'Choose Directory',
  de: 'Wähle ein Verzeichnis',
  fr: 'Choix du répertoire',
  ja: 'ディレクトリを選択',
  cn: '选择目录',
  ko: '디렉토리 선택',
};

// What to show when a directory hasn't been chosen.
const kDirectoryDefaultText = {
  en: '(Default)',
  de: '(Standard)',
  fr: '(Défaut)',
  ja: '(初期設定)',
  cn: '(默认)',
  ko: '(기본)',
};

// Translating data folders to a category name.
export const kPrefixToCategory = {
  '00-misc': {
    en: 'General Triggers',
    de: 'General Trigger',
    fr: 'Général Triggers',
    ja: '汎用',
    cn: '通用触发器',
    ko: '공용 트리거',
  },
  '02-arr': {
    en: 'A Realm Reborn (ARR 2.x)',
    de: 'A Realm Reborn (ARR 2.x)',
    fr: 'A Realm Reborn (ARR 2.x)',
    ja: '新生エオルゼア (2.x)',
    cn: '重生之境 (2.x)',
    ko: '신생 에오르제아 (2.x)',
  },
  '03-hw': {
    en: 'Heavensward (HW 3.x)',
    de: 'Heavensward (HW 3.x)',
    fr: 'Heavensward (HW 3.x)',
    ja: '蒼天のイシュガルド (3.x)',
    cn: '苍穹之禁城 (3.x)',
    ko: '창천의 이슈가르드 (3.x)',
  },
  '04-sb': {
    en: 'Stormblood (SB 4.x)',
    de: 'Stormblood (SB 4.x)',
    fr: 'Stormblood (SB 4.x)',
    ja: '紅蓮のリベレーター (4.x)',
    cn: '红莲之狂潮 (4.x)',
    ko: '홍련의 해방자 (4.x)',
  },
  '05-shb': {
    en: 'Shadowbringers (ShB 5.x)',
    de: 'Shadowbringers (ShB 5.x)',
    fr: 'Shadowbringers (ShB 5.x)',
    ja: '漆黒のヴィランズ (5.x)',
    cn: '暗影之逆焰 (5.x)',
    ko: '칠흑의 반역자 (5.x)',
  },
  '06-ew': {
    en: 'Endwalker (EW 6.x)',
    de: 'Endwalker (EW 6.x)',
    fr: 'Endwalker (EW 6.x)',
    ja: '暁月のフィナーレ (6.x)',
    cn: '晓月之终途 (6.x)',
    ko: '효월의 종언 (6.x)',
  },
  '07-dt': {
    en: 'Dawntrail (DT 7.x)',
    de: 'Dawntrail (DT 7.x)',
    fr: 'Dawntrail (DT 7.x)',
    ja: '黄金のレガシー (7.x)',
    cn: '金曦之遗辉 (7.x)',
    ko: '황금의 유산 (7.x)',
  },
  'user': {
    en: 'User Triggers',
    de: 'Benutzer Trigger',
    fr: 'Triggers personnalisés',
    ja: 'ユーザートリガー',
    cn: '自定义触发器',
    ko: '커스텀 트리거',
  },
};

// Translating data subfolders to encounter type.
export const kDirectoryToCategory = {
  alliance: {
    en: 'Alliance Raid',
    de: 'Allianz-Raid',
    fr: 'Raid en Alliance',
    ja: 'アライアンスレイド',
    cn: '团队任务',
    ko: '연합 레이드',
  },
  dungeon: {
    en: 'Dungeon',
    de: 'Dungeon',
    fr: 'Donjon',
    ja: 'ダンジョン',
    cn: '迷宫挑战',
    ko: '던전',
  },
  eureka: {
    en: 'Adventuring Forays',
    de: 'Feldexkursion',
    fr: 'Missions d\'exploration',
    ja: '特殊フィールド探索',
    cn: '特殊场景探索',
    ko: '특수 필드 임무',
  },
  raid: {
    en: 'Raid',
    de: 'Raid',
    fr: 'Raid',
    ja: 'レイド',
    cn: '大型任务',
    ko: '레이드',
  },
  pvp: {
    en: 'PVP',
    de: 'PvP',
    fr: 'JcJ',
    ja: 'PvP',
    cn: 'PvP',
    ko: 'PvP',
  },
  trial: {
    en: 'Trial',
    de: 'Prüfung',
    fr: 'Défi',
    ja: '討伐・討滅戦',
    cn: '讨伐歼灭战',
    ko: '토벌전',
  },
  ultimate: {
    en: 'Ultimate',
    de: 'Fatale Raids',
    fr: 'Raid fatal',
    ja: '絶シリーズ',
    cn: '绝境战',
    ko: '절 난이도',
  },
  hunts: {
    en: 'Hunts & FATEs',
    de: 'Hohe Jagd & FATEs',
    fr: 'Chasse & Aléas',
    ja: 'モブハント & フェイト',
    cn: '怪物狩猎 & 危命任务',
    ko: '마물 & 돌발',
  },
  map: {
    en: 'Treasure Map',
    de: 'Schatzkarten',
    fr: 'Cartes au trésor',
    ja: '宝箱地図',
    cn: '宝物地图',
    ko: '보물 지도',
  },
  deepdungeon: {
    en: 'Deep Dungeon',
    de: 'Tiefes Gewölbe',
    fr: 'Donjon sans fond',
    ja: 'ディープダンジョン',
    cn: '深层迷宫',
    ko: '딥 던전',
  },
};

// TODO: maybe we should also sort all the filenames properly too?
// TODO: use ZoneId to get this
const fileNameToTitle = (filename: string) => {
  // Strip directory and extension.
  const file = filename.replace(/^.*\//, '').replace(/\.[jt]s/g, '');
  // Remove non-name characters (probably).
  const name = file.replace(/[_-]/g, ' ');
  // Capitalize the first letter of every word.
  let capitalized = name.replace(/(?:^| )\w/g, (c) => c.toUpperCase());

  // Fully capitalize acronyms like e4n.
  if (/^\w[0-9]+\w$/.test(capitalized))
    capitalized = capitalized.toUpperCase();

  return capitalized;
};

const getOptDefault = (opt: ConfigEntry, options: BaseOptions): ConfigValue => {
  if (typeof opt.default === 'function')
    return opt.default(options);
  return opt.default;
};

const getOptDisabled = (opt: ConfigEntry, values: ConfigIdToValueMap): boolean => {
  if (typeof opt.disabled === 'function')
    return opt.disabled(values);
  return opt.disabled ?? false;
};

const getOptHidden = (opt: ConfigEntry, values: ConfigIdToValueMap): boolean => {
  if (typeof opt.hidden === 'function')
    return opt.hidden(values);
  return opt.hidden ?? false;
};

// Returned by the various methods that create each config option.
// `elements` are the [leftDiv, inputDiv] that correspond to that config option.
type ConfigState = {
  elements: [HTMLElement, HTMLElement];
  value: ConfigValue;
};

// Annotations by userFileHandler (processRaidbossFiles) on triggers.
// raidboss_config also combines normal and timeline triggers when building the config ui.
export type ConfigLooseTrigger = LooseTrigger & LooseTimelineTrigger & {
  isMissingId?: boolean;
  overriddenByFile?: string;
  isTimelineTrigger?: boolean;
  timelineRegex?: RegExp;
  triggerRegex?: RegExp;
  triggerNetRegex?: RegExp;
  configOutput?: { [field: string]: string };
};

export type ConfigLooseTriggerSet = LooseTriggerSet;

export type ConfigLooseOopsyTrigger = LooseOopsyTrigger;

export type ConfigLooseOopsyTriggerSet = LooseOopsyTriggerSet & {
  filename?: string;
  isUserTriggerSet?: boolean;
};

export type ConfigContents = { [group: string]: OptionsTemplate[] };

export type ConfigProcessedFile<T extends ConfigLooseOopsyTriggerSet | ConfigLooseTriggerSet> = {
  filename: string;
  fileKey: string;
  prefixKey: string;
  prefix: string;
  section: string;
  type?: string;
  title: string;
  triggerSet: T;
  zoneId?: number;
  triggers?: {
    [id: string]: T extends ConfigLooseOopsyTriggerSet ? ConfigLooseOopsyTrigger
      : ConfigLooseTrigger;
  };
};

export type ConfigProcessedFileMap<T extends ConfigLooseOopsyTriggerSet | ConfigLooseTriggerSet> = {
  [filename: string]: ConfigProcessedFile<T>;
};

export class CactbotConfigurator {
  public lang: Lang;
  private savedConfig: SavedConfig;
  private contents: ConfigContents;
  public developerOptions: boolean;

  constructor(public configOptions: ConfigOptions, savedConfig: SavedConfig) {
    // Predefined, only for ordering purposes.
    this.contents = {
      // top level
      'general': [],

      // things most people care about
      'raidboss': [],
      'jobs': [],
    };
    // If the user has set a display language, use that.
    // Otherwise, use the operating system language as a default for the config tool.
    this.lang = this.configOptions.DisplayLanguage ?? this.configOptions.ShortLocale;
    this.savedConfig = savedConfig ?? {};
    this.developerOptions = this.getBooleanOption('general', 'ShowDeveloperOptions', false);

    const templates = UserConfig.optionTemplates;
    for (const [group, template] of Object.entries(templates))
      (this.contents[group] ??= []).push(template);

    this.buildButterBar();

    const container = document.getElementById('container');
    if (!container)
      throw new UnreachableCode();
    this.buildUI(container, this.contents);
  }

  async saveConfigData(): Promise<void> {
    // TODO: rate limit this?
    await callOverlayHandler({
      call: 'cactbotSaveData',
      overlay: 'options',
      data: this.savedConfig,
    });

    document.getElementById('butter-margin')?.classList.remove('hidden');
  }

  // Helper translate function.  Takes in an object with language keys
  // and returns a single entry based on available translations.
  translate<T>(textObj: LocaleObject<T>): T {
    if (textObj === null || typeof textObj !== 'object')
      throw new Error(`Invalid config: ${JSON.stringify(textObj)}`);
    const t = textObj[this.lang];
    return t ?? textObj['en'];
  }

  getBooleanOption(group: string, path: string | string[], defaultValue: boolean): boolean {
    const value = this.getOption(group, path, defaultValue);
    if (typeof value === 'boolean') {
      return value;
    } else if (typeof value === 'string') {
      if (value === 'true' || value === 'false')
        return value === 'true';
    }

    const args = Array.isArray(path) ? path : [path];
    const info = JSON.stringify([group, ...args].join(', '));
    console.error(`Invalid boolean string: ${info}, ${value}`);
    return defaultValue;
  }

  getStringOption(group: string, path: string | string[], defaultValue: string): string {
    const value = this.getOption(group, path, defaultValue);
    if (value === '')
      return defaultValue;
    return value.toString();
  }

  getNumberOption(group: string, path: string | string[], defaultValue: number): number {
    const value = this.getOption(group, path, defaultValue);
    if (value === '') {
      return defaultValue;
    } else if (typeof value === 'number') {
      return value;
    } else if (typeof value === 'string') {
      const num = parseFloat(value);
      if (!isNaN(+value) && !isNaN(num))
        return num;
    }

    const args = Array.isArray(path) ? path : [path];
    const info = JSON.stringify([group, ...args].join(', '));
    console.error(`Invalid number string: ${info}, ${value.toString()}`);
    return defaultValue;
  }

  // Gets the leaf node for a given option group/path.
  // Returns undefined on failure.
  _getOptionLeafHelper(
    group: string,
    path: string | string[],
  ): SavedConfigEntry | undefined {
    let objOrValue = this.savedConfig[group];
    if (objOrValue === undefined)
      return;

    const args = Array.isArray(path) ? path : [path];
    if (args.length === 0) {
      console.error(`path must have at least one element`);
      return;
    }

    for (const arg of args) {
      if (typeof objOrValue !== 'object' || Array.isArray(objOrValue)) {
        // SavedConfigEntry is arbitrary JSON, but these options should be nothing but objects
        // until leaf node ConfigValue.
        const info = JSON.stringify([group, ...args].join(', '));
        console.error(`Unexpected entry: ${info}}`);
        return;
      }
      const item: SavedConfigEntry | undefined = objOrValue[arg];
      // If not found, then use default value.
      if (typeof item === 'undefined')
        return;
      objOrValue = item;
    }

    return objOrValue;
  }

  // Takes a variable length `path` and returns the defaultValue if any key is missing.
  // e.g. (foo, [bar, baz], 5) with {foo: { bar: { baz: 3 } } } will return
  // the value 3.
  getOption(group: string, path: string | string[], defaultValue: ConfigValue): ConfigValue {
    const objOrValue = this._getOptionLeafHelper(group, path);
    if (objOrValue === undefined)
      return defaultValue;

    // At the leaf node.
    // Some number options pass in empty string as a default.
    const emptyDefaultNumber = defaultValue === '' && typeof objOrValue === 'number';
    // Also due to inconsistencies in option code, some numbers are stored as unparsed strings.
    const isStringNumber = typeof defaultValue === 'number' && typeof objOrValue === 'string';
    if (
      !emptyDefaultNumber && !isStringNumber && typeof defaultValue !== typeof objOrValue ||
      typeof objOrValue === 'object'
    ) {
      const args = Array.isArray(path) ? path : [path];
      const info = JSON.stringify([group, ...args].join(', '));
      console.error(
        // FIXME:
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        `Unexpected type: ${info}, ${objOrValue.toString()}, ${typeof objOrValue}, ${typeof defaultValue}`,
      );
      return defaultValue;
    }
    return objOrValue;
  }

  // Similar to getOption, but gets an arbitrary SavedConfigEntry json subset instead of
  // guaranteeing a leaf node ConfigValue.
  getJsonOption(
    group: string,
    path: string | string[],
    defaultValue: SavedConfigEntry,
  ): SavedConfigEntry {
    const objOrValue = this._getOptionLeafHelper(group, path);
    return objOrValue ?? defaultValue;
  }

  // Sets an option in the config at a variable level of nesting.
  // e.g. (foo, [bar, baz], 3) will set {foo: { bar: { baz: 3 } } }.
  // e.g. (foo, bar, 4) will set { foo: { bar: 4 } }.
  setOption(group: string, path: string | string[], value: ConfigValue): void {
    // Make callers explicitly use setJsonOption if they want a SavedConfigEntry,
    // as the vast majority of callers only want a ConfigValue value.
    this.setJsonOption(group, path, value);
  }

  // Same as setOption but with a more permissive value.
  setJsonOption(group: string, path: string | string[], value: SavedConfigEntry): void {
    // Set keys and create default {} if it doesn't exist.
    let obj = this.savedConfig[group] ??= {};

    const args = Array.isArray(path) ? path : [path];
    if (args.length === 0) {
      console.error(`path must have at least one element`);
      return;
    }
    const finalArg = args.slice(-1)[0];
    if (finalArg === undefined)
      throw new UnreachableCode();

    const allButFinalArg = args.slice(0, -1);
    for (const arg of allButFinalArg) {
      if (typeof obj !== 'object' || Array.isArray(obj)) {
        // SavedConfigEntry is arbitrary JSON, but these options should be nothing but objects
        // until leaf node ConfigValue.
        console.error(`Unexpected entry: ${JSON.stringify([group, ...args].join(', '))}`);
        return;
      }

      obj = obj[arg] ??= {};
    }

    if (typeof obj !== 'object' || Array.isArray(obj)) {
      // SavedConfigEntry is arbitrary JSON, but these options should be nothing but objects
      // until leaf node ConfigValue.
      console.error(`Unexpected entry: ${JSON.stringify([group, ...args].join(', '))}`);
      return;
    }
    // Any type of SavedConfigEntry is fine here and we'll validate on loading.
    obj[finalArg] = value;
    void this.saveConfigData();
  }

  buildButterBar(): void {
    const container = document.getElementById('butter-bar');
    if (!container)
      throw new UnreachableCode();

    const textDiv = document.createElement('div');
    textDiv.classList.add('reload-text');
    textDiv.innerText = this.translate(kReloadText);
    container.appendChild(textDiv);

    const buttonInput = document.createElement('input');
    buttonInput.classList.add('reload-button');
    buttonInput.type = 'button';
    buttonInput.onclick = () => {
      void callOverlayHandler({ call: 'cactbotReloadOverlays' });
    };
    buttonInput.value = this.translate(kReloadButtonText);
    container.appendChild(buttonInput);
  }

  buildConfigEntry(
    derivedOptions: BaseOptions,
    groupDiv: HTMLElement,
    opt: ConfigEntry,
    group: string,
    path?: string[],
    elements?: ConfigEntryToDivMap,
    values?: ConfigIdToValueMap,
  ): ConfigState | null {
    // Note: `derivedOptions` here is the `RaidbossOptions` or `JobsOptions`
    // and may be different than `this.configOptions`.
    let ret: ConfigState | null = null;
    switch (opt.type) {
      case 'checkbox':
        ret = this.buildCheckbox(derivedOptions, groupDiv, opt, group, path, elements, values);
        break;
      case 'html':
        // no need to pass `elements` or `values`, since there are no onchange() handlers
        ret = this.buildHtml(derivedOptions, groupDiv, opt, group, path);
        break;
      case 'select':
        ret = this.buildSelect(derivedOptions, groupDiv, opt, group, path, elements, values);
        break;
      case 'float':
        ret = this.buildFloat(derivedOptions, groupDiv, opt, group, path, elements, values);
        break;
      case 'integer':
        ret = this.buildInteger(derivedOptions, groupDiv, opt, group, path, elements, values);
        break;
      case 'string':
        ret = this.buildString(derivedOptions, groupDiv, opt, group, path, elements, values);
        break;
      case 'directory':
        ret = this.buildDirectory(derivedOptions, groupDiv, opt, group, path, elements, values);
        break;
      default:
        console.error(`unknown type: ${JSON.stringify(opt)}`);
        break;
    }
    return ret;
  }

  // Top level UI builder, builds everything.
  buildUI(container: HTMLElement, contents: ConfigContents): void {
    for (const group in contents) {
      const content = contents[group];
      if (!content || content.length === 0)
        continue;

      // For each overlay options template, build a section for it.
      // Then iterate through all of its options and build ui for those options.
      // Give each options template a chance to build special ui.
      const groupDiv = this.buildOverlayGroup(container, group);

      // Track the values of and html elements associated with each config entry,
      // to be used for updating visibility/enablement of config entries.
      // These are reset for each config group.
      const values: ConfigIdToValueMap = {};
      const elements: ConfigEntryToDivMap = new Map();

      for (const template of content) {
        const options = template.options ?? [];
        for (const opt of options) {
          if (!this.developerOptions && opt.debugOnly)
            continue;

          const ret = this.buildConfigEntry(
            this.configOptions,
            groupDiv,
            opt,
            group,
            undefined,
            elements,
            values,
          );

          if (!ret)
            continue;
          elements.set(opt, ret.elements);
          values[opt.id] = ret.value;
        }

        const builder = template.buildExtraUI;
        if (builder)
          builder(this, groupDiv);
      }
      // Once the group is fully created, process visibility settings immediately.
      this.updateVisibility(elements, values);
    }
  }

  // Overlay builder for each overlay type (e.g. raidboss, jobs).
  buildOverlayGroup(container: HTMLElement, group: string): HTMLElement {
    const collapser = document.createElement('div');
    collapser.classList.add('overlay-container');
    container.appendChild(collapser);

    const a = document.createElement('a');
    // TODO: fix me
    /* eslint-disable-next-line deprecation/deprecation */
    a.name = group;
    collapser.appendChild(a);

    const header = document.createElement('div');
    header.classList.add('overlay-header');
    switch (group) {
      case 'general':
        header.innerText = '通用设置';
        break;

      case 'raidboss':
        header.innerText = 'raidboss / 时间轴与触发器提示';
        break;

      case 'jobs':
        header.innerText = 'jobs / 职业、buff、倒计时监控';
        break;

      case 'eureka':
        header.innerText = 'eureka / 优雷卡工具';
        break;

      case 'oopsyraidsy':
        header.innerText = 'oopsyraidsy / 失误死亡报告';
        break;

      case 'radar':
        header.innerText = 'radar / 狩猎目标监控雷达';
        break;

      default:
        header.innerText = group;
        break;
    }
    a.appendChild(header);

    const groupDiv = document.createElement('div');
    groupDiv.classList.add('overlay-options');
    collapser.appendChild(groupDiv);

    a.onclick = () => {
      const parent = a.parentNode;
      if (parent instanceof HTMLElement)
        parent.classList.toggle('collapsed');
    };

    return groupDiv;
  }

  buildLeftDiv(opt: ConfigEntry): HTMLElement {
    const div = document.createElement('div');

    // Build Name
    const nameDiv = document.createElement('div');
    nameDiv.innerHTML = this.translate(opt.name);
    nameDiv.classList.add('option-name');
    div.appendChild(nameDiv);

    // Build the trigger comment
    if (opt.comment) {
      const commentDiv = document.createElement('div');
      commentDiv.innerHTML = opt.comment[this.lang] ?? opt.comment?.en ?? '';
      commentDiv.classList.add('comment');
      div.appendChild(commentDiv);
    }
    return div;
  }

  buildCheckbox(
    options: BaseOptions,
    parent: HTMLElement,
    opt: ConfigEntry,
    group: string,
    path?: string[],
    elements?: ConfigEntryToDivMap,
    values?: ConfigIdToValueMap,
  ): ConfigState {
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('option-input-container');

    const input = document.createElement('input');
    inputDiv.appendChild(input);
    input.type = 'checkbox';

    const optDefault = getOptDefault(opt, options);
    const defaultValue = typeof optDefault === 'boolean' ? optDefault : false;
    const optIdPath = [...path ?? [], opt.id];
    if (typeof optDefault !== 'boolean')
      console.error(`Invalid non-boolean default: ${group} ${optIdPath.join(' ')}`);

    input.checked = this.getBooleanOption(group, optIdPath, defaultValue);
    input.onchange = () => {
      this.setOption(group, optIdPath, input.checked);
      (values ??= {})[opt.id] = input.checked;
      if (elements !== undefined)
        this.updateVisibility(elements, values);
    };

    const leftDiv = this.buildLeftDiv(opt);
    parent.appendChild(leftDiv);
    parent.appendChild(inputDiv);
    return { elements: [leftDiv, inputDiv], value: input.checked };
  }

  buildHtml(
    _options: BaseOptions,
    parent: HTMLElement,
    opt: ConfigEntry,
    _group: string,
    _path?: string[],
    _elements?: ConfigEntryToDivMap,
    _values?: ConfigIdToValueMap,
  ): ConfigState {
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('option-input-container');
    if (opt.html)
      inputDiv.innerHTML = this.translate(opt.html);

    const leftDiv = this.buildLeftDiv(opt);
    parent.appendChild(leftDiv);
    parent.appendChild(inputDiv);
    // Return the elements so they can be tracked for visibility updates,
    // but the value can just be 'html' since it's not an input field that
    // can change or affect other configs.
    return { elements: [leftDiv, inputDiv], value: 'html' };
  }

  buildDirectory(
    options: BaseOptions,
    parent: HTMLElement,
    opt: ConfigEntry,
    group: string,
    path?: string[],
    elements?: ConfigEntryToDivMap,
    values?: ConfigIdToValueMap,
  ): ConfigState {
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('option-input-container');
    inputDiv.classList.add('input-dir-container');

    const input = document.createElement('input');
    input.type = 'submit';
    input.value = this.translate(kDirectoryChooseButtonText);
    input.classList.add('input-dir-submit');
    inputDiv.appendChild(input);

    const label = document.createElement('div');
    label.classList.add('input-dir-label');
    inputDiv.appendChild(label);

    const setLabel = (str: string) => {
      if (str)
        label.innerText = str;
      else
        label.innerText = this.translate(kDirectoryDefaultText);
    };
    const optIdPath = [...path ?? [], opt.id];
    const optDefault = getOptDefault(opt, options);
    setLabel(this.getStringOption(group, optIdPath, optDefault.toString()));

    const leftDiv = this.buildLeftDiv(opt);
    parent.appendChild(leftDiv);
    parent.appendChild(inputDiv);

    let dir = '';
    input.onclick = async () => {
      // Prevent repeated clicks on the folder chooser.
      // callOverlayHandler is not synchronous.
      // FIXME: do we need some clearer UI here (like pretending to be modal?)
      input.disabled = true;

      const prevValue = label.innerText;
      label.innerText = '';

      const result = await callOverlayHandler({
        call: 'cactbotChooseDirectory',
      });

      input.disabled = false;
      if (result !== undefined) {
        dir = result.data ?? '';
        if (dir !== prevValue) {
          this.setOption(group, optIdPath, dir);
          (values ??= {})[opt.id] = dir;
          if (elements !== undefined)
            this.updateVisibility(elements, values);
        }
        setLabel(dir);
      } else {
        console.error('cactbotChooseDirectory returned undefined');
      }
    };
    return { elements: [leftDiv, inputDiv], value: dir };
  }

  buildSelect(
    options: BaseOptions,
    parent: HTMLElement,
    opt: ConfigEntry,
    group: string,
    path?: string[],
    elements?: ConfigEntryToDivMap,
    values?: ConfigIdToValueMap,
  ): ConfigState {
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('option-input-container');

    const input = document.createElement('select');
    inputDiv.appendChild(input);

    const optIdPath = [...path ?? [], opt.id];
    const optDefault = getOptDefault(opt, options);
    const defaultValue = this.getOption(group, optIdPath, optDefault);
    input.onchange = () => {
      this.setOption(group, optIdPath, input.value);
      (values ??= {})[opt.id] = input.value;
      if (elements !== undefined)
        this.updateVisibility(elements, values);
    };

    if (opt.options) {
      const innerOptions = this.translate(opt.options);
      for (const [key, value] of Object.entries(innerOptions)) {
        const elem = document.createElement('option');
        elem.value = value;
        elem.innerHTML = key;
        if (innerOptions[key] === defaultValue)
          elem.selected = true;
        input.appendChild(elem);
      }
    }
    const leftDiv = this.buildLeftDiv(opt);
    parent.appendChild(leftDiv);
    parent.appendChild(inputDiv);
    return { elements: [leftDiv, inputDiv], value: input.value };
  }

  // FIXME: this could use some data validation if a user inputs non-floats.
  buildFloat(
    options: BaseOptions,
    parent: HTMLElement,
    opt: ConfigEntry,
    group: string,
    path?: string[],
    elements?: ConfigEntryToDivMap,
    values?: ConfigIdToValueMap,
  ): ConfigState {
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('option-input-container');

    const input = document.createElement('input');
    inputDiv.appendChild(input);
    input.type = 'text';
    input.step = 'any';
    const optDefault = getOptDefault(opt, options);
    input.placeholder = optDefault.toString();
    const optIdPath = [...path ?? [], opt.id];
    input.value = this.getNumberOption(
      group,
      optIdPath,
      parseFloat(optDefault.toString()),
    ).toString();
    const setAndUpdateFunc = () => {
      this.setOption(group, optIdPath, input.value);
      (values ??= {})[opt.id] = input.value;
      if (elements !== undefined)
        this.updateVisibility(elements, values);
    };
    input.onchange = setAndUpdateFunc;
    input.oninput = setAndUpdateFunc;

    const leftDiv = this.buildLeftDiv(opt);
    parent.appendChild(leftDiv);
    parent.appendChild(inputDiv);
    return { elements: [leftDiv, inputDiv], value: input.value };
  }

  // FIXME: this could use some data validation if a user inputs non-integers.
  buildInteger(
    options: BaseOptions,
    parent: HTMLElement,
    opt: ConfigEntry,
    group: string,
    path?: string[],
    elements?: ConfigEntryToDivMap,
    values?: ConfigIdToValueMap,
  ): ConfigState {
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('option-input-container');

    const input = document.createElement('input');
    inputDiv.appendChild(input);
    input.type = 'text';
    input.step = '1';
    const optDefault = getOptDefault(opt, options);
    input.placeholder = optDefault.toString();
    const optIdPath = [...path ?? [], opt.id];
    input.value = this.getNumberOption(group, optIdPath, parseInt(optDefault.toString()))
      .toString();
    const setAndUpdateFunc = () => {
      this.setOption(group, optIdPath, input.value);
      (values ??= {})[opt.id] = input.value;
      if (elements !== undefined)
        this.updateVisibility(elements, values);
    };
    input.onchange = setAndUpdateFunc;
    input.oninput = setAndUpdateFunc;

    const leftDiv = this.buildLeftDiv(opt);
    parent.appendChild(leftDiv);
    parent.appendChild(inputDiv);
    return { elements: [leftDiv, inputDiv], value: input.value };
  }

  buildString(
    options: BaseOptions,
    parent: HTMLElement,
    opt: ConfigEntry,
    group: string,
    path?: string[],
    elements?: ConfigEntryToDivMap,
    values?: ConfigIdToValueMap,
  ): ConfigState {
    const inputDiv = document.createElement('div');
    inputDiv.classList.add('option-input-container');

    const input = document.createElement('input');
    input.classList.add('input-string-field');
    inputDiv.appendChild(input);

    const optIdPath = [...path ?? [], opt.id];
    input.type = 'text';
    const optDefault = getOptDefault(opt, options);
    input.placeholder = optDefault.toString();
    input.value = this.getStringOption(
      group,
      optIdPath,
      optDefault.toString(),
    ).toString();
    const setAndUpdateFunc = () => {
      this.setOption(group, optIdPath, input.value);
      (values ??= {})[opt.id] = input.value;
      if (elements !== undefined)
        this.updateVisibility(elements, values);
    };
    input.onchange = setAndUpdateFunc;
    input.oninput = setAndUpdateFunc;

    const leftDiv = this.buildLeftDiv(opt);
    parent.appendChild(leftDiv);
    parent.appendChild(inputDiv);
    return { elements: [leftDiv, inputDiv], value: input.value };
  }

  // Called once after each option-group's entries are created, and whenever any is changed.
  // It will reprocess visibility settings for all options in that group.
  updateVisibility(elements: ConfigEntryToDivMap, values: ConfigIdToValueMap): void {
    for (const [entry, [leftDiv, inputDiv]] of elements.entries()) {
      const isDisabled = getOptDisabled(entry, values);
      const isHidden = getOptHidden(entry, values);

      const inputs = inputDiv.querySelectorAll('input');
      inputs.forEach((input) => input.disabled = isDisabled);
      const selects = inputDiv.querySelectorAll('select');
      selects.forEach((select) => select.disabled = isDisabled);

      if (isHidden) {
        leftDiv.style.display = 'none';
        inputDiv.style.display = 'none';
      } else {
        leftDiv.style.display = 'grid';
        inputDiv.style.display = 'grid';
      }
    }
  }

  processFiles<T extends ConfigLooseTriggerSet | ConfigLooseOopsyTriggerSet>(
    files: { [filename: string]: T },
    userTriggerSets?: T[],
  ): ConfigProcessedFileMap<T> {
    const map: ConfigProcessedFileMap<T> = {};
    for (const [filename, triggerSet] of Object.entries(files)) {
      if (!filename.endsWith('.js') && !filename.endsWith('.ts'))
        continue;

      triggerSet.filename = filename;

      let prefixKey = '00-misc';
      let prefix: LocaleText = kPrefixToCategory['00-misc'];
      for (const [key, value] of Object.entries(kPrefixToCategory)) {
        if (!filename.startsWith(key))
          continue;
        prefixKey = key;
        prefix = value;
        break;
      }

      let category = undefined;
      for (const [key, value] of Object.entries(kDirectoryToCategory)) {
        if (!filename.includes(`/${key}/`))
          continue;
        category = value;
        break;
      }

      let title = fileNameToTitle(filename);
      let zoneId: number | undefined = undefined;

      // Make assumptions about trigger structure here to try to get the zoneId out.
      if (typeof triggerSet.zoneId === 'number') {
        zoneId = triggerSet.zoneId;
        // Use the translatable zone info name, if possible.
        const zoneInfo = ZoneInfo[zoneId];
        if (zoneInfo)
          title = this.translate(zoneInfo.name);
      }

      let zoneLabel: LocaleText | undefined = undefined;

      // if a zoneLabel is set, use for the title
      if (triggerSet.zoneLabel) {
        zoneLabel = triggerSet.zoneLabel;
        title = this.translate(zoneLabel);
      }

      const fileKey = filename.replace(/\//g, '-').replace(/.[jt]s$/, '');
      map[fileKey] = {
        filename: filename,
        fileKey: fileKey,
        prefixKey: prefixKey,
        prefix: this.translate(prefix),
        section: this.translate(prefix),
        type: category ? this.translate(category) : undefined,
        title: title,
        triggerSet: triggerSet,
        zoneId: zoneId,
      };
    }

    const userMap: ConfigProcessedFileMap<T> = {};
    let userFileIdx = 0;
    for (const triggerSet of userTriggerSets || []) {
      // TODO: pass in userTriggerSets as a filename -> triggerSet map as well
      // so we don't need to read this added value.
      if (triggerSet.filename === undefined)
        throw new Error('UserHandler must add filename');
      const fileKey = `user/${triggerSet.filename}/${userFileIdx++}`;

      // cactbot triggers all use zoneId, but user triggers in the wild
      // may also use zoneRegex or also have errors and not have either.
      let title = '???';
      let zoneId: number | undefined = undefined;
      let zoneLabel: LocaleText | undefined = undefined;

      /* eslint-disable-next-line deprecation/deprecation */
      const origZoneRegex = triggerSet.zoneRegex;

      // if a zoneLabel is set, use for the title
      if (triggerSet.zoneLabel) {
        zoneLabel = triggerSet.zoneLabel;
        title = this.translate(zoneLabel);
      } else if (typeof triggerSet.zoneId === 'number') {
        zoneId = triggerSet.zoneId;
        // Use the translatable zone info name, if possible.
        const zoneInfo = ZoneInfo[zoneId];
        if (zoneInfo)
          title = this.translate(zoneInfo.name);
      } else if (triggerSet.zoneId === null) {
        title = this.translate(kPrefixToCategory['00-misc']);
      } else if (origZoneRegex) {
        // zoneRegex can be a localized object.
        let zoneRegex = origZoneRegex instanceof RegExp
          ? origZoneRegex
          : origZoneRegex[this.lang];
        if (typeof zoneRegex === 'string')
          zoneRegex = Regexes.parse(zoneRegex);
        if (zoneRegex instanceof RegExp)
          title = `/${zoneRegex.source}/`;
      }

      userMap[fileKey] = {
        filename: triggerSet.filename,
        fileKey: fileKey,
        prefixKey: 'user',
        prefix: this.translate(kPrefixToCategory['user']),
        section: triggerSet.filename,
        title: title,
        type: undefined,
        triggerSet: triggerSet,
        zoneId: zoneId,
      };
    }

    const sortedEntries = Object.keys(map).sort((keyA, keyB) => {
      // Sort first by expansion.
      const entryA = map[keyA];
      const entryB = map[keyB];
      // All keys here are valid entries in map.
      if (entryA === undefined || entryB === undefined)
        throw new UnreachableCode();
      const prefixCompare = entryA.prefixKey.localeCompare(entryB.prefixKey);
      if (prefixCompare !== 0)
        return prefixCompare;

      // Then sort by contentList.
      const indexA = entryA.zoneId !== undefined ? contentList.indexOf(entryA.zoneId) : -1;
      const indexB = entryB.zoneId !== undefined ? contentList.indexOf(entryB.zoneId) : -1;

      if (indexA === -1 && indexB === -1) {
        // If we don't know, sort by strings.
        return keyA.localeCompare(keyB);
      } else if (indexA === -1) {
        // Sort B first.
        return 1;
      } else if (indexB === -1) {
        // Sort A first.
        return -1;
      }
      // Default: sort by index in contentList.
      return indexA - indexB;
    });

    // Rebuild map with keys in the right order.
    const sortedMap: ConfigProcessedFileMap<T> = {};
    for (const key of sortedEntries) {
      const value = map[key];
      if (value === undefined)
        throw new UnreachableCode();
      sortedMap[key] = value;
    }

    // Tack on user triggers at the end in the order they were eval'd.
    for (const [key, triggerSet] of Object.entries(userMap))
      sortedMap[key] = triggerSet;

    return sortedMap;
  }
}

UserConfig.getUserConfigLocation('config', defaultOptions, () => {
  const options = { ...defaultOptions };
  new CactbotConfigurator(
    options,
    UserConfig.savedConfig,
  );
});
