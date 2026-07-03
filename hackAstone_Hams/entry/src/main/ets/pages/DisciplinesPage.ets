import { ArenaTheme } from '../common/ArenaTheme';
import { Battle } from '../common/ArenaModels';
import { arenaL10n } from '../route/GlobalStores';
import { DisciplinesContent } from './DisciplinesContent';

@Component
export struct DisciplinesPage {
  @Prop pageStack: NavPathStack = new NavPathStack();

  build() {
    Scroll() {
      Column({ space: 20 }) {
        Row() {
          Button({ type: ButtonType.Normal }) {
            Row({ space: 4 }) {
              Text('‹')
                .fontSize(18)
                .fontColor(ArenaTheme.textMuted)
              Text(arenaL10n().backToPhilosophy)
                .fontSize(14)
                .fontColor(ArenaTheme.textMuted)
            }
          }
          .backgroundColor(Color.Transparent)
          .onClick(() => {
            this.pageStack.clear();
          })
          Blank()
        }
        .width('100%')
        .padding({ top: 4, bottom: 4 })

        DisciplinesContent({ pageStack: this.pageStack })
      }
      .padding({ left: 16, right: 16, bottom: 28 })
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
  }
}
