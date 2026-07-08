import { hilog } from '@kit.PerformanceAnalysisKit';
import { ArenaTheme } from '../common/ArenaTheme';
import { authStore, catalogStore, arenaL10n, arenaNavPush } from '../route/GlobalStores';
import { AUTH_VERSION_KEY } from '../common/AuthEvents';
import { CATALOG_VERSION_KEY } from '../common/CatalogEvents';
import { authSessionDisplayName } from '../store/AuthStore';
import { AppRoutes } from '../route/AppRoutes';
import { Philosopher, CatalogTimePeriodMeta, philosopherDisplayName } from '../common/ArenaModels';
import { CatalogMeta } from '../data/CatalogMeta';
import { PhilosopherAvatar } from '../components/PhilosopherAvatar';
import { WorldMapSection } from '../components/WorldMapSection';
import { DisciplinesContent } from './DisciplinesContent';

const LOG_DOMAIN = 0x0000;

enum HomeMainTab {
  PHILOSOPHY = 0,
  DISCIPLINES = 1
}

/** 首页：哲学地图 + 学科辩论 Tab，对齐 iOS `HomeView`。 */
@Component
export struct HomePage {
  @StorageLink(AUTH_VERSION_KEY) authVersion: number = 0;
  @StorageLink(CATALOG_VERSION_KEY) catalogVersion: number = 0;
  @State homeMainTab: HomeMainTab = HomeMainTab.PHILOSOPHY;
  @State selectedPeriodId: string = CatalogMeta.timePeriods[0].id;
  @State selectedRegion: string | null = null;
  @State timelineSliderValue: number = 0;

  private currentPeriod(): CatalogTimePeriodMeta {
    const found = CatalogMeta.timePeriods.find((p: CatalogTimePeriodMeta) => p.id === this.selectedPeriodId);
    return found ?? CatalogMeta.timePeriods[0];
  }

  private regionPhilosophers(): Philosopher[] {
    if (!this.selectedRegion) {
      return [];
    }
    return CatalogMeta.getPhilosophersByPeriodAndRegion(
      this.currentPeriod(), this.selectedRegion, catalogStore.philosophers
    );
  }

  aboutToAppear(): void {
    hilog.info(LOG_DOMAIN, 'hackAstone', 'HomePage aboutToAppear v1.1.3');
    const idx = CatalogMeta.timePeriods.findIndex((p: CatalogTimePeriodMeta) => p.id === this.selectedPeriodId);
    this.timelineSliderValue = idx >= 0 ? idx : 0;
  }

  @Builder
  philosophyTabContent() {
    this.heroSection();
    this.timelineSection();
    WorldMapSection({
      selectedRegion: $selectedRegion,
      selectedPeriodId: this.selectedPeriodId,
      philosophers: catalogStore.philosophers
    });
    this.regionPhilosophersSection();
    this.footerSection();
  }

  private openPhilosopherSheet(p: Philosopher): void {
    arenaNavPush({ name: AppRoutes.philosopherDetail(p.id) });
  }

  @Builder
  headerAccountChip() {
    if (authStore.isLoggedIn) {
      Row({ space: 8 }) {
        Stack() {
          Column()
            .width(28)
            .height(28)
            .borderRadius(14)
            .linearGradient({
              angle: 135,
              colors: [[ArenaTheme.orangeAccent, 0], ['#DC2626D9', 1]]
            })
          if (authStore.localAvatarUri.length > 0) {
            Image(authStore.localAvatarUri)
              .width(28)
              .height(28)
              .borderRadius(14)
              .objectFit(ImageFit.Cover)
          } else if (authStore.session !== null) {
            Text(this.headerAvatarInitial())
              .fontSize(12)
              .fontWeight(FontWeight.Bold)
              .fontColor(Color.White)
          }
        }
        Text(this.headerDisplayName())
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .fontColor(ArenaTheme.textPrimary)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .constraintSize({ maxWidth: 120 })
      }
      .padding({ left: 8, right: 10, top: 4, bottom: 4 })
      .backgroundColor(ArenaTheme.surface)
      .borderRadius(20)
      .border({ width: 1, color: ArenaTheme.border })
      .onClick(() => {
        arenaNavPush({ name: AppRoutes.settings() });
      })
    } else {
      Row({ space: 4 }) {
        Text('👤')
          .fontSize(14)
        Text(arenaL10n().loginTitle)
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .fontColor(ArenaTheme.orangeAccent)
      }
      .onClick(() => {
        arenaNavPush({ name: AppRoutes.login() });
      })
    }
  }

  private headerDisplayName(): string {
    const session = authStore.session;
    if (session === null) {
      return arenaL10n().loginTitle;
    }
    return authSessionDisplayName(session);
  }

  private headerAvatarInitial(): string {
    const name = this.headerDisplayName().trim();
    if (name.length === 0) {
      return '?';
    }
    return name.substring(0, 1).toUpperCase();
  }

  @Builder
  headerSection() {
    Column({ space: 10 }) {
      Row() {
        Blank()
        this.headerAccountChip()
      }
      .width('100%')

      Row({ space: 8 }) {
        Row({ space: 4 }) {
          Text('👥').fontSize(12)
          Text(arenaL10n().roundtableDebate)
            .fontSize(12)
            .fontWeight(FontWeight.Medium)
            .fontColor(Color.White)
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .padding({ left: 6, right: 6, top: 10, bottom: 10 })
        .linearGradient({ angle: 90, colors: [['#FF8C00', 0], ['#EF4444D9', 1]] })
        .borderRadius(10)
        .onClick(() => { arenaNavPush({ name: AppRoutes.roundtable() }); })

        Row({ space: 4 }) {
          Text('⚠').fontSize(12)
          Text(arenaL10n().moralDilemma)
            .fontSize(12)
            .fontWeight(FontWeight.Medium)
            .fontColor(Color.White)
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .padding({ left: 6, right: 6, top: 10, bottom: 10 })
        .linearGradient({ angle: 90, colors: [['#22D3EEE6', 0], ['#3B82F6BF', 1]] })
        .borderRadius(10)
        .onClick(() => { arenaNavPush({ name: AppRoutes.dilemma() }); })

        Row({ space: 4 }) {
          Text('👤').fontSize(12)
          Text(arenaL10n().mindProfile)
            .fontSize(12)
            .fontWeight(FontWeight.Medium)
            .fontColor(ArenaTheme.textPrimary)
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .padding({ left: 6, right: 6, top: 10, bottom: 10 })
        .backgroundColor(ArenaTheme.surface)
        .borderRadius(10)
        .border({ width: 1, color: ArenaTheme.border })
        .onClick(() => { arenaNavPush({ name: AppRoutes.profile() }); })
      }
      .width('100%')

      Row({ space: 8 }) {
        Text(arenaL10n().philosophyDebate)
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor(this.homeMainTab === HomeMainTab.PHILOSOPHY ? Color.White : ArenaTheme.textMuted)
          .padding({ left: 14, right: 14, top: 8, bottom: 8 })
          .backgroundColor(this.homeMainTab === HomeMainTab.PHILOSOPHY ? '#22D3EED9' : ArenaTheme.surface)
          .borderRadius(10)
          .border({
            width: 1,
            color: this.homeMainTab === HomeMainTab.PHILOSOPHY ? Color.Transparent : ArenaTheme.border
          })
          .onClick(() => { this.homeMainTab = HomeMainTab.PHILOSOPHY; })

        Text(arenaL10n().disciplinesDebate)
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor(this.homeMainTab === HomeMainTab.DISCIPLINES ? Color.White : ArenaTheme.textMuted)
          .padding({ left: 14, right: 14, top: 8, bottom: 8 })
          .backgroundColor(this.homeMainTab === HomeMainTab.DISCIPLINES ? '#EA580CE6' : ArenaTheme.surface)
          .borderRadius(10)
          .border({
            width: 1,
            color: this.homeMainTab === HomeMainTab.DISCIPLINES ? Color.Transparent : ArenaTheme.border
          })
          .onClick(() => { this.homeMainTab = HomeMainTab.DISCIPLINES; })

        Blank()
      }
      .width('100%')
    }
    .width('100%')
    .padding({ top: 4, bottom: 8 })
  }

  @Builder
  heroSection() {
    Column({ space: 8 }) {
      Text(arenaL10n().heroMapTitle)
        .fontSize(26)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.cyanMuted)
        .textAlign(TextAlign.Center)
        .width('100%')
      Text(arenaL10n().heroMapSubtitle)
        .fontSize(14)
        .fontColor(ArenaTheme.textMuted)
        .textAlign(TextAlign.Center)
        .width('100%')
    }
    .width('100%')
  }

  private timelineMaxIndex(): number {
    return Math.max(CatalogMeta.timePeriods.length - 1, 0);
  }

  private timelineFirstPeriod(): CatalogTimePeriodMeta {
    return CatalogMeta.timePeriods[0];
  }

  private timelineLastPeriod(): CatalogTimePeriodMeta {
    return CatalogMeta.timePeriods[CatalogMeta.timePeriods.length - 1];
  }

  @Builder
  timelineSection() {
    Column({ space: 14 }) {
      Row({ space: 10 }) {
        Text('🕐').fontSize(18)
        Text(arenaL10n().timelineTitle)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
      }

      Column({ space: 8 }) {
        Text(arenaL10n().periodLabel(this.currentPeriod()))
          .fontSize(22)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.cyanMuted)
        Text(arenaL10n().periodEra(this.currentPeriod()))
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
        Text(arenaL10n().describePeriod(this.currentPeriod()))
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
      }
      .width('100%')
      .padding({ top: 12, bottom: 12 })
      .backgroundColor('#22D3EE14')
      .borderRadius(12)
      .border({ width: 1, color: '#22D3EE40' })

      Row() {
        Text(arenaL10n().periodLabel(this.timelineFirstPeriod()))
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
        Blank()
        Text(arenaL10n().periodLabel(this.timelineLastPeriod()))
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
      }
      .width('100%')

      Slider({
        value: this.timelineSliderValue,
        min: 0,
        max: this.timelineMaxIndex(),
        step: 1,
        style: SliderStyle.OutSet
      })
        .blockColor(ArenaTheme.cyanAccent)
        .trackColor(ArenaTheme.border)
        .selectedColor(ArenaTheme.cyanAccent)
        .onChange((value: number, mode: SliderChangeMode) => {
          const i = Math.round(value);
          if (i >= 0 && i < CatalogMeta.timePeriods.length) {
            this.timelineSliderValue = i;
            this.selectedPeriodId = CatalogMeta.timePeriods[i].id;
            if (mode === SliderChangeMode.End || mode === SliderChangeMode.Click) {
              this.selectedRegion = null;
            }
          }
        })

      Flex({ wrap: FlexWrap.Wrap }) {
        ForEach(arenaL10n().timelineEraTags, (tag: string) => {
          Text(tag)
            .fontSize(10)
            .fontColor('#8C9094BF')
            .width('14%')
            .textAlign(TextAlign.Center)
            .margin({ bottom: 6 })
        }, (tag: string) => tag)
      }
      .width('100%')
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
    .padding(16)
    .backgroundColor(ArenaTheme.surface)
    .borderRadius(14)
    .border({ width: 1, color: ArenaTheme.border })
  }

  @Builder
  regionPhilosophersSection() {
    if (this.selectedRegion) {
      if (this.regionPhilosophers().length === 0) {
        Column({ space: 12 }) {
          Text(arenaL10n().noPhilosophersSentence(
            arenaL10n().periodLabel(this.currentPeriod()),
            arenaL10n().regionName(this.selectedRegion!)
          ))
            .fontSize(14)
            .fontColor(ArenaTheme.textMuted)
            .textAlign(TextAlign.Center)
          Button(arenaL10n().backToMap)
            .fontSize(14)
            .fontColor(ArenaTheme.textPrimary)
            .backgroundColor(ArenaTheme.surface)
            .borderRadius(10)
            .onClick(() => { this.selectedRegion = null; })
        }
        .width('100%')
        .padding(24)
        .backgroundColor(ArenaTheme.surface)
        .borderRadius(14)
        .border({ width: 1, color: ArenaTheme.border })
      } else {
        Column({ space: 14 }) {
          Text(`${arenaL10n().regionName(this.selectedRegion!)} · ${arenaL10n().periodLabel(this.currentPeriod())}`)
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor(ArenaTheme.textPrimary)

          ForEach(this.regionPhilosophers(), (p: Philosopher) => {
            Row({ space: 12 }) {
              PhilosopherAvatar({ philosopher: p, avatarSize: 48 })
              Column({ space: 4 }) {
                Text(philosopherDisplayName(p, arenaL10n().prefersEnglish))
                  .fontSize(16)
                  .fontWeight(FontWeight.Medium)
                  .fontColor(ArenaTheme.textPrimary)
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                Text(p.name)
                  .fontSize(12)
                  .fontColor(ArenaTheme.textMuted)
                  .maxLines(1)
                Text(`${p.school} · ${p.period}`)
                  .fontSize(10)
                  .fontColor('#8C9094CC')
                ForEach(p.keyIdeas.slice(0, 2), (idea: string) => {
                  Text(`• ${idea}`)
                    .fontSize(10)
                    .fontColor(ArenaTheme.textMuted)
                    .maxLines(1)
                }, (idea: string) => `${p.id}-${idea}`)
              }
              .alignItems(HorizontalAlign.Start)
              .layoutWeight(1)
            }
            .width('100%')
            .padding(14)
            .alignItems(VerticalAlign.Top)
            .backgroundColor(ArenaTheme.background)
            .borderRadius(10)
            .border({ width: 1, color: ArenaTheme.border })
            .margin({ bottom: 12 })
            .onClick(() => { this.openPhilosopherSheet(p); })
          }, (p: Philosopher) => p.id)

          Button(arenaL10n().backToMap)
            .width('100%')
            .height(44)
            .fontColor(ArenaTheme.textPrimary)
            .backgroundColor(Color.Transparent)
            .borderRadius(10)
            .border({ width: 1, color: ArenaTheme.border })
            .onClick(() => { this.selectedRegion = null; })
        }
        .alignItems(HorizontalAlign.Start)
        .width('100%')
        .padding(16)
        .backgroundColor(ArenaTheme.surface)
        .borderRadius(14)
        .border({ width: 1, color: '#22D3EE59' })
      }
    }
  }

  @Builder
  footerSection() {
    Text(arenaL10n().footerTagline)
      .fontSize(12)
      .fontColor('#8C9094BF')
      .textAlign(TextAlign.Center)
      .width('100%')
      .padding({ top: 24 })
  }

  build() {
    Column() {
      Scroll() {
        Column({ space: 20 }) {
          this.headerSection();

          if (this.homeMainTab === HomeMainTab.PHILOSOPHY) {
            this.philosophyTabContent();
          } else {
            DisciplinesContent();
          }
        }
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 28 })
      }
      .layoutWeight(1)
      .width('100%')
      .scrollBar(BarState.Off)
    }
    .width('100%')
    .height('100%')
    .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
    .backgroundColor(ArenaTheme.background)
  }
}
