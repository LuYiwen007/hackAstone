import { ArenaTheme } from '../common/ArenaTheme';

/** 导航栈内推入页面：应用内「‹ 返回」按钮，对齐 iOS `arenaPushedScreenChrome`。 */
@Component
export struct BackButton {
  @Prop label: string = '';
  onBack?: () => void;
  @Prop pageStack: NavPathStack = new NavPathStack();

  build() {
    Row({ space: 4 }) {
      Text('‹')
        .fontSize(20)
        .fontWeight(FontWeight.Medium)
        .fontColor(ArenaTheme.textMuted)
      if (this.label.length > 0) {
        Text(this.label)
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
      }
    }
    .padding({ left: 4, right: 8, top: 6, bottom: 6 })
    .onClick(() => {
      if (this.onBack) {
        this.onBack();
      } else if (this.pageStack.size() > 0) {
        this.pageStack.pop();
      }
    })
  }
}
