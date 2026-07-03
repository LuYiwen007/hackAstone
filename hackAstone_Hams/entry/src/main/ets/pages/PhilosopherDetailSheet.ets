import { ArenaTheme } from '../common/ArenaTheme';
import { Philosopher } from '../common/ArenaModels';
import { philosopherDisplayName } from '../l10n/ArenaL10n';
import { arenaL10n } from '../route/GlobalStores';
import { PhilosopherAvatar } from '../components/PhilosopherAvatar';

@CustomDialog
export struct PhilosopherDetailSheet {
  controller?: CustomDialogController;
  philosopher: Philosopher = {} as Philosopher;
  allPhilosophers: Philosopher[] = [];
  onClose: () => void = () => {};
  onStartDebate: () => void = () => {};

  private get displayName(): string {
    return philosopherDisplayName(this.philosopher, arenaL10n().prefersEnglish);
  }

  @Builder
  influenceSection(title: string, ids?: string[]) {
    if (ids && ids.length > 0) {
      Column({ space: 6 }) {
        Text(title)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        Text(this.resolveInfluenceNames(ids))
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')
    }
  }

  private resolveInfluenceNames(ids: string[]): string {
    const names: string[] = [];
    ids.forEach((id: string) => {
      const p = this.allPhilosophers.find((x: Philosopher) => x.id === id);
      if (p) {
        names.push(philosopherDisplayName(p, arenaL10n().prefersEnglish));
      }
    });
    return names.join('、');
  }

  build() {
    Scroll() {
      Column({ space: 20 }) {
        Row() {
          Blank()
          Button(arenaL10n().close)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor(ArenaTheme.textMuted)
            .backgroundColor(Color.Transparent)
            .onClick(() => {
              this.onClose();
              this.controller?.close();
            })
        }
        .width('100%')

        Row({ space: 14 }) {
          PhilosopherAvatar({ philosopher: this.philosopher, avatarSize: 64 })
          Column({ space: 6 }) {
            Text(this.displayName)
              .fontSize(22)
              .fontWeight(FontWeight.Bold)
              .fontColor(ArenaTheme.textPrimary)
            Text(this.philosopher.name)
              .fontSize(14)
              .fontColor(ArenaTheme.textMuted)
            Row({ space: 10 }) {
              if (this.philosopher.lifespan) {
                Text(`📅 ${this.philosopher.lifespan}`)
                  .fontSize(12)
                  .fontColor(ArenaTheme.textMuted)
              }
              if (this.philosopher.birthPlace) {
                Text(`📍 ${this.philosopher.birthPlace}`)
                  .fontSize(12)
                  .fontColor(ArenaTheme.textMuted)
              }
            }
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
        }
        .alignItems(VerticalAlign.Top)
        .width('100%')

        Text(this.philosopher.school)
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.purpleAccent)
          .padding({ left: 14, right: 14, top: 8, bottom: 8 })
          .backgroundColor('#A855F726')
          .borderRadius(20)

        if (this.philosopher.summary) {
          Column({ space: 8 }) {
            Text(arenaL10n().coreThought)
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor(ArenaTheme.textPrimary)
            Text(this.philosopher.summary)
              .fontSize(14)
              .fontColor('#D1D5DB')
          }
          .alignItems(HorizontalAlign.Start)
          .width('100%')
        }

        Column({ space: 8 }) {
          Text(arenaL10n().keyConcepts)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(ArenaTheme.textPrimary)
          Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Start }) {
            ForEach(this.philosopher.keyIdeas, (idea: string) => {
              Text(idea)
                .fontSize(12)
                .padding({ left: 10, right: 10, top: 8, bottom: 8 })
                .margin({ right: 8, bottom: 8 })
                .fontColor(ArenaTheme.textPrimary)
                .backgroundColor(ArenaTheme.background)
                .border({ width: 1, color: ArenaTheme.border, radius: 8 })
            }, (idea: string) => idea)
          }
          .width('100%')
        }
        .alignItems(HorizontalAlign.Start)
        .width('100%')

        if (this.philosopher.majorWorks && this.philosopher.majorWorks.length > 0) {
          Column({ space: 8 }) {
            Text(arenaL10n().majorWorks)
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor(ArenaTheme.textPrimary)
            ForEach(this.philosopher.majorWorks, (w: string) => {
              Text(`• ${w}`)
                .fontSize(14)
                .fontColor(ArenaTheme.textMuted)
            }, (w: string) => w)
          }
          .alignItems(HorizontalAlign.Start)
          .width('100%')
        }

        this.influenceSection(arenaL10n().influencedBy, this.philosopher.influences?.influencedBy)
        this.influenceSection(arenaL10n().influenced, this.philosopher.influences?.influenced)

        Button(arenaL10n().startPhilosophyBattle)
          .width('100%')
          .height(48)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.purpleAccent)
          .borderRadius(12)
          .onClick(() => {
            this.onStartDebate();
            this.controller?.close();
          })
      }
      .padding(20)
      .width('100%')
    }
    .width('100%')
    .height('85%')
    .backgroundColor(ArenaTheme.background)
  }
}
