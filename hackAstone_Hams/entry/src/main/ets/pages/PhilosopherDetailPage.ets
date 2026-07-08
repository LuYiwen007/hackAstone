import { ArenaTheme } from '../common/ArenaTheme';
import { Philosopher } from '../common/ArenaModels';
import { philosopherDisplayName } from '../l10n/ArenaL10n';
import { arenaL10n, arenaNavPop, arenaNavPush, catalogStore } from '../route/GlobalStores';
import { AppRoutes } from '../route/AppRoutes';
import { PhilosopherAvatar } from '../components/PhilosopherAvatar';

/** 哲学家介绍全屏页，对齐 iOS `PhilosopherDetailSheet` + `fullScreenCover`。 */
@Component
export struct PhilosopherDetailPage {
  @Prop philosopherId: string = '';
  scroller: Scroller = new Scroller();

  private readonly pagePadH: number = 16;
  private readonly pagePadTop: number = 12;
  private readonly pagePadBottom: number = 24;
  private readonly sectionGap: number = 16;

  private resolvePhilosopher(): Philosopher | undefined {
    return catalogStore.philosophers.find((p: Philosopher) => p.id === this.philosopherId);
  }

  private displayName(philosopher: Philosopher): string {
    return philosopherDisplayName(philosopher, arenaL10n().prefersEnglish);
  }

  @Builder
  influenceSection(title: string, ids: string[] | undefined, all: Philosopher[]) {
    if (ids && ids.length > 0) {
      Column({ space: 6 }) {
        Text(title)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        Text(this.resolveInfluenceNames(ids, all))
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')
    }
  }

  private resolveInfluenceNames(ids: string[], all: Philosopher[]): string {
    const names: string[] = [];
    ids.forEach((id: string) => {
      const p = all.find((x: Philosopher) => x.id === id);
      if (p) {
        names.push(philosopherDisplayName(p, arenaL10n().prefersEnglish));
      }
    });
    return names.join('、');
  }

  @Builder
  closeHeader() {
    Row() {
      Blank()
      Button(arenaL10n().close)
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(ArenaTheme.textMuted)
        .backgroundColor(Color.Transparent)
        .onClick(() => { arenaNavPop(); })
    }
    .width('100%')
  }

  build() {
    Column() {
      if (this.resolvePhilosopher() !== undefined) {
        Column({ space: this.sectionGap }) {
          this.closeHeader()
          Scroll(this.scroller) {
            Column({ space: 20 }) {
              this.detailContent(this.resolvePhilosopher()!)
            }
            .width('100%')
            .alignItems(HorizontalAlign.Start)
            .padding({ bottom: 8 })
          }
          .layoutWeight(1)
          .width('100%')
          .align(Alignment.Top)
          .scrollBar(BarState.Off)
        }
        .width('100%')
        .height('100%')
        .padding({
          left: this.pagePadH,
          right: this.pagePadH,
          top: this.pagePadTop,
          bottom: this.pagePadBottom
        })
      } else {
        Column({ space: 16 }) {
          Text(arenaL10n().philosopherMissing)
            .fontSize(18)
            .fontColor(ArenaTheme.textPrimary)
          Button(arenaL10n().close)
            .onClick(() => { arenaNavPop(); })
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
        .padding({
          left: this.pagePadH,
          right: this.pagePadH,
          top: this.pagePadTop,
          bottom: this.pagePadBottom
        })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
  }

  @Builder
  detailContent(philosopher: Philosopher) {
    Row({ space: 14 }) {
      PhilosopherAvatar({ philosopher: philosopher, avatarSize: 64 })
      Column({ space: 6 }) {
        Text(this.displayName(philosopher))
          .fontSize(22)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        Text(philosopher.name)
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
        Row({ space: 10 }) {
          if (philosopher.lifespan) {
            Text(`📅 ${philosopher.lifespan}`)
              .fontSize(12)
              .fontColor(ArenaTheme.textMuted)
          }
          if (philosopher.birthPlace) {
            Text(`📍 ${philosopher.birthPlace}`)
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

    Text(philosopher.school)
      .fontSize(13)
      .fontWeight(FontWeight.Medium)
      .fontColor(ArenaTheme.textMuted)
      .padding({ left: 14, right: 14, top: 8, bottom: 8 })
      .backgroundColor(ArenaTheme.surface)
      .border({ width: 1, color: ArenaTheme.border, radius: 20 })
      .borderRadius(20)

    if (philosopher.summary) {
      Column({ space: 8 }) {
        Text(arenaL10n().coreThought)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        Text(philosopher.summary)
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
        ForEach(philosopher.keyIdeas, (idea: string) => {
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

    if (philosopher.majorWorks && philosopher.majorWorks.length > 0) {
      Column({ space: 8 }) {
        Text(arenaL10n().majorWorks)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        ForEach(philosopher.majorWorks, (w: string) => {
          Text(`• ${w}`)
            .fontSize(14)
            .fontColor(ArenaTheme.textMuted)
        }, (w: string) => w)
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')
    }

    this.influenceSection(arenaL10n().influencedBy, philosopher.influences?.influencedBy,
      catalogStore.philosophers)
    this.influenceSection(arenaL10n().influenced, philosopher.influences?.influenced,
      catalogStore.philosophers)

    Button(arenaL10n().startPhilosophyBattle)
      .width('100%')
      .height(48)
      .fontSize(16)
      .fontWeight(FontWeight.Bold)
      .fontColor(Color.White)
      .backgroundColor(ArenaTheme.purpleAccent)
      .borderRadius(12)
      .onClick(() => {
        arenaNavPop();
        arenaNavPush({ name: AppRoutes.philosophyBattle(philosopher.id) });
      })
  }
}
