import { ArenaTheme } from '../common/ArenaTheme';

/** 完整视角总结生成动画（橙色圆环 + 轨迹）。 */
@Component
export struct PerspectiveSummaryLoader {
  @State ringRotation: number = 0;
  @State trailShift: number = 0;
  private animStarted: boolean = false;

  private startAnimation(): void {
    if (this.animStarted) {
      return;
    }
    this.animStarted = true;
    this.ringRotation = 0;
    this.trailShift = 0;
    animateTo({
      duration: 3000,
      curve: Curve.Linear,
      iterations: -1,
      playMode: PlayMode.Normal
    }, () => {
      this.ringRotation = 360;
    });
    animateTo({
      duration: 2400,
      curve: Curve.Linear,
      iterations: -1,
      playMode: PlayMode.Normal
    }, () => {
      this.trailShift = 48;
    });
  }

  aboutToAppear(): void {
    this.startAnimation();
  }

  aboutToDisappear(): void {
    this.animStarted = false;
    this.ringRotation = 0;
    this.trailShift = 0;
  }

  @Builder
  ghostRing(size: number, color: string, offsetX: number) {
    Column()
      .width(size)
      .height(size)
      .borderRadius(size / 2)
      .border({ width: 3, color: color })
      .offset({ x: offsetX, y: 0 })
  }

  build() {
    Stack({ alignContent: Alignment.Center }) {
      this.ghostRing(72, '#F973161A', -this.trailShift - 28)
      this.ghostRing(84, '#F973162E', -this.trailShift - 14)
      this.ghostRing(96, '#F9731642', -this.trailShift)

      Column()
        .width(112)
        .height(112)
        .borderRadius(56)
        .border({ width: 7, color: ArenaTheme.orangeAccent })
        .shadow({ radius: 24, color: '#F9731680', offsetX: 0, offsetY: 0 })
        .rotate({ angle: this.ringRotation })

      Column()
        .width(10)
        .height(10)
        .borderRadius(5)
        .backgroundColor(Color.White)
        .border({ width: 2, color: '#FFFFFF99' })
    }
    .width('100%')
    .height(168)
    .onAppear(() => { this.startAnimation(); })
  }
}
