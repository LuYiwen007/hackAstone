import { ArenaTheme } from '../common/ArenaTheme';
import { getArenaPreferences } from '../common/ArenaPreferences';
import { arenaL10n } from '../route/GlobalStores';

/** 辩论作答倒计时条（对齐 Web PhilosophyBattleLive 120s timer）。 */
@Component
export struct ThinkingTimerBar {
  @Prop active: boolean = false;
  @Prop paused: boolean = false;
  @Prop @Watch('onResetNonce') resetNonce: number = 0;

  @State thinkSeconds: number = 120;
  private timerId: number = -1;

  aboutToAppear(): void {
    this.startTimer();
  }

  aboutToDisappear(): void {
    this.clearTimer();
  }

  private onResetNonce(): void {
    this.thinkSeconds = 120;
  }

  private clearTimer(): void {
    if (this.timerId >= 0) {
      clearInterval(this.timerId);
      this.timerId = -1;
    }
  }

  private startTimer(): void {
    this.clearTimer();
    if (!getArenaPreferences().timer) {
      return;
    }
    this.timerId = setInterval(() => {
      if (!this.active || this.paused) {
        return;
      }
      if (this.thinkSeconds > 0) {
        this.thinkSeconds--;
      }
    }, 1000);
  }

  build() {
    if (!getArenaPreferences().timer || !this.active) {
      Column();
    } else {
      Row() {
        Text(arenaL10n().thinkingTimerLabel(this.thinkSeconds))
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .fontColor(this.thinkSeconds <= 30 ? ArenaTheme.orangeAccent : ArenaTheme.cyanAccent)
      }
      .width('100%')
      .padding({ left: 12, right: 12, top: 8, bottom: 8 })
      .backgroundColor('#22D3EE14')
      .borderRadius(10)
      .border({ width: 1, color: this.thinkSeconds <= 30 ? '#F9731640' : '#22D3EE40' })
    }
  }
}
