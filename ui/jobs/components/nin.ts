import EffectId from '../../../resources/effect_id';
import TimerBar from '../../../resources/timerbar';
import TimerBox from '../../../resources/timerbox';
import { JobDetail } from '../../../types/event';
import { ResourceBox } from '../bars';
import { ComboTracker } from '../combo_tracker';
import { kAbility } from '../constants';
import { computeBackgroundColorFrom, showDuration } from '../utils';

import { BaseComponent, ComponentInterface } from './base';

export class NINComponent extends BaseComponent {
  ninki: ResourceBox;
  kazematoi: ResourceBox;
  trickAttack: TimerBox;
  bunshin: TimerBox;
  ninjutsu: TimerBox;
  comboTimer: TimerBar;
  tid1 = 0;
  mudraTriggerCd = true;

  constructor(o: ComponentInterface) {
    super(o);

    this.ninki = this.bars.addResourceBox({
      classList: ['nin-color-ninki'],
    });
    this.kazematoi = this.bars.addResourceBox({
      classList: ['nin-color-kazematoi'],
    });
    this.trickAttack = this.bars.addProcBox({
      id: 'nin-procs-trickattack',
      fgColor: 'nin-color-trickattack',
    });
    this.bunshin = this.bars.addProcBox({
      id: 'nin-procs-bunshin',
      fgColor: 'nin-color-bunshin',
    });
    this.ninjutsu = this.bars.addProcBox({
      id: 'nin-procs-ninjutsu',
      fgColor: 'nin-color-ninjutsu',
    });

    this.comboTimer = this.bars.addTimerBar({
      id: 'nin-timers-combo',
      fgColor: 'combo-color',
    });

    this.reset();
  }

  override onYouGainEffect(id: string): void {
    switch (id) {
      // Ninjutsu's cooldown begins to countdown at the first mudra.
      case EffectId.Mudra: {
        if (!this.mudraTriggerCd)
          return;
        if (this.ninjutsu.duration === null)
          this.ninjutsu.duration = 0;
        const old = this.ninjutsu.duration - this.ninjutsu.elapsed;
        if (old > 0)
          this.ninjutsu.duration = old + 20;
        else
          this.ninjutsu.duration = 20 - 0.5;

        this.mudraTriggerCd = false;
        break;
      }
      case EffectId.Kassatsu:
        this.mudraTriggerCd = false;
        break;
    }
  }
  // On each mudra, Mudra effect will be gain once,
  // use mudraTriggerCd to tell that whether bars mudra trigger cooldown.
  override onYouLoseEffect(id: string): void {
    if (id === EffectId.Mudra)
      this.mudraTriggerCd = true;
    if (id === EffectId.Kassatsu)
      this.mudraTriggerCd = true;
  }

  override onUseAbility(id: string): void {
    switch (id) {
      case kAbility.Bunshin:
        this.bunshin.duration = 90;
        break;
      case kAbility.Hide:
        this.ninjutsu.duration = 0;
        break;
      case kAbility.TrickAttack:
      case kAbility.KunaisBane:
        this.tid1 = showDuration({
          tid: this.tid1,
          timerbox: this.trickAttack,
          // TA & KB has an animation lock, KB's is longer.
          duration: 15 + (id === kAbility.KunaisBane ? 1 : 0.5),
          cooldown: 60,
          threshold: this.player.gcdSkill * 4 + 1,
          activecolor: 'nin-color-trickattack.active',
          deactivecolor: 'nin-color-trickattack',
        });
        break;
    }
  }

  override onStatChange({ gcdSkill }: { gcdSkill: number }): void {
    this.bunshin.threshold = gcdSkill * 8;
    this.ninjutsu.threshold = gcdSkill * 2;
  }

  override onJobDetailUpdate(jobDetail: JobDetail['NIN']): void {
    this.ninki.innerText = jobDetail.ninkiAmount.toString();
    this.ninki.parentNode.classList.remove('high', 'low');
    if (jobDetail.ninkiAmount < 50)
      this.ninki.parentNode.classList.add('low');
    else if (jobDetail.ninkiAmount >= 90)
      this.ninki.parentNode.classList.add('high');

    this.kazematoi.innerText = jobDetail.kazematoi?.toString() ?? '0';
    if (jobDetail.kazematoi >= 4)
      // Pulse the kazematoi count to indicate that you shouldn't use Armor Crash again.
      this.kazematoi.parentElement?.classList.add('nin-kazematoi', 'pulse');
    else
      this.kazematoi.parentElement?.classList.remove('nin-kazematoi', 'pulse');
  }
  override onCombo(skill: string, combo: ComboTracker): void {
    this.comboTimer.duration = 0;
    if (combo.isFinalSkill)
      return;
    if (skill)
      this.comboTimer.duration = this.comboDuration;
  }

  override reset(): void {
    this.bunshin.duration = 0;
    this.kazematoi.innerText = '0';
    this.kazematoi.parentElement?.classList.remove('nin-kazematoi', 'pulse');
    this.mudraTriggerCd = true;
    this.ninjutsu.duration = 0;
    this.trickAttack.duration = 0;
    this.trickAttack.threshold = this.player.gcdSkill * 4 + 1;
    this.trickAttack.fg = computeBackgroundColorFrom(
      this.trickAttack,
      'nin-color-trickattack',
    );
    this.comboTimer.duration = 0;
    window.clearTimeout(this.tid1);
  }
}
