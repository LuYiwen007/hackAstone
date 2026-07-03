import { ArenaTheme } from '../common/ArenaTheme';
import { catalogStore, arenaL10n } from '../route/GlobalStores';
import { AppRoutes } from '../route/AppRoutes';
import { Battle } from '../common/ArenaModels';
import { ArenaAPI } from '../api/ArenaAPI';

enum DisciplineCategory {
  ALL = 0,
  BUSINESS = 1,
  PSYCHOLOGY = 2,
  LEARNING = 3,
  HOT = 4
}

function categoryMatches(cat: DisciplineCategory, battleCategory: string): boolean {
  const c = battleCategory.trim().toLowerCase();
  switch (cat) {
    case DisciplineCategory.ALL:
      return true;
    case DisciplineCategory.BUSINESS:
      return c === 'business' || c === '商业';
    case DisciplineCategory.PSYCHOLOGY:
      return c === 'psychology' || c === '心理学';
    case DisciplineCategory.LEARNING:
      return c === 'learning' || c === '学习方法';
    case DisciplineCategory.HOT:
      return c === 'hot topics' || c === '热点问题';
    default:
      return true;
  }
}

function categoryApiEn(cat: DisciplineCategory): string {
  switch (cat) {
    case DisciplineCategory.ALL: return 'General';
    case DisciplineCategory.BUSINESS: return 'Business';
    case DisciplineCategory.PSYCHOLOGY: return 'Psychology';
    case DisciplineCategory.LEARNING: return 'Learning';
    case DisciplineCategory.HOT: return 'Hot topics';
    default: return 'General';
  }
}

function categoryApiZh(cat: DisciplineCategory): string {
  switch (cat) {
    case DisciplineCategory.ALL: return '全部';
    case DisciplineCategory.BUSINESS: return '商业';
    case DisciplineCategory.PSYCHOLOGY: return '心理学';
    case DisciplineCategory.LEARNING: return '学习方法';
    case DisciplineCategory.HOT: return '热点问题';
    default: return '全部';
  }
}

const ALL_CATEGORIES: DisciplineCategory[] = [
  DisciplineCategory.ALL,
  DisciplineCategory.BUSINESS,
  DisciplineCategory.PSYCHOLOGY,
  DisciplineCategory.LEARNING,
  DisciplineCategory.HOT
];

/** 学科辩论主体（列表与推荐），对齐 iOS `DisciplinesContentView`。 */
@Component
export struct DisciplinesContent {
  @Prop pageStack: NavPathStack = new NavPathStack();

  @State selectedCategory: DisciplineCategory = DisciplineCategory.ALL;
  @State aiLoading: boolean = false;
  @State aiError: string = '';

  private filteredBattles(): Battle[] {
    return catalogStore.allBattles(arenaL10n().prefersEnglish)
      .filter((b: Battle) => categoryMatches(this.selectedCategory, b.category));
  }

  private async handleAiGenerate(): Promise<void> {
    this.aiLoading = true;
    this.aiError = '';
    try {
      const resp = await ArenaAPI.generateDisciplineBattle(
        categoryApiEn(this.selectedCategory),
        categoryApiZh(this.selectedCategory)
      );
      if (!resp.disciplineBattle) {
        throw new Error(arenaL10n().topicBadJson);
      }
      const id = catalogStore.addGeneratedBattle(resp.disciplineBattle);
      this.pageStack.pushPath({ name: AppRoutes.battle(id) });
    } catch (e) {
      this.aiError = e instanceof Error ? e.message : String(e);
    } finally {
      this.aiLoading = false;
    }
  }

  @Builder
  heroSection() {
    Column({ space: 8 }) {
      Text(arenaL10n().disciplinesHeroTitle)
        .fontSize(28)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.orangeAccent)
        .textAlign(TextAlign.Center)
        .width('100%')
      Text(arenaL10n().disciplinesHeroSubtitle)
        .fontSize(14)
        .fontColor(ArenaTheme.textMuted)
        .textAlign(TextAlign.Center)
        .width('100%')
    }
    .width('100%')
  }

  private featuredBattle(): Battle | null {
    const battles = this.filteredBattles();
    return battles.length > 0 ? battles[0] : null;
  }

  private categoryLabel(cat: DisciplineCategory, idx: number): string {
    return arenaL10n().disciplineCategories[idx] ?? categoryApiZh(cat);
  }

  private isCategoryActive(cat: DisciplineCategory): boolean {
    return this.selectedCategory === cat;
  }

  @Builder
  categoryRow() {
    Scroll() {
      Row({ space: 10 }) {
        ForEach(ALL_CATEGORIES, (cat: DisciplineCategory, idx: number) => {
          Text(this.categoryLabel(cat, idx))
            .fontSize(12)
            .fontWeight(FontWeight.Medium)
            .fontColor(this.isCategoryActive(cat) ? ArenaTheme.orangeAccent : ArenaTheme.textPrimary)
            .padding({ left: 14, right: 14, top: 8, bottom: 8 })
            .backgroundColor(this.isCategoryActive(cat) ? '#EA580C40' : ArenaTheme.surface)
            .borderRadius(10)
            .border({
              width: 1,
              color: this.isCategoryActive(cat) ? '#EA580C99' : ArenaTheme.border
            })
            .onClick(() => {
              this.selectedCategory = cat;
            })
        }, (cat: DisciplineCategory) => `cat-${cat}`)
      }
    }
    .scrollable(ScrollDirection.Horizontal)
    .scrollBar(BarState.Off)
    .width('100%')
  }

  @Builder
  featuredCard(battle: Battle) {
    Column({ space: 10 }) {
      Row({ space: 8 }) {
        Text('🧠')
          .fontSize(18)
        Text(arenaL10n().todayFeatured)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
      }

      Column({ space: 12 }) {
        Row() {
          Column({ space: 6 }) {
            Text(battle.category)
              .fontSize(12)
              .fontColor('#EA580CD9')
            Text(battle.question)
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor(ArenaTheme.textPrimary)
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)

          Stack({ alignContent: Alignment.Center }) {
            Text('⚔')
              .fontSize(22)
              .fontColor(ArenaTheme.orangeAccent)
          }
          .width(48)
          .height(48)
          .backgroundColor('#EA580C26')
          .borderRadius(24)
        }
        .width('100%')
        .alignItems(VerticalAlign.Top)

        Row() {
          Text('Builder vs Breaker')
            .fontSize(12)
            .fontColor(ArenaTheme.textMuted)
          Blank()
          Text(arenaL10n().enterBattle)
            .fontSize(12)
            .fontWeight(FontWeight.Medium)
            .fontColor(ArenaTheme.orangeAccent)
        }
        .width('100%')
      }
      .width('100%')
      .padding(18)
      .linearGradient({
        angle: 135,
        colors: [['#EF44441F', 0], ['#EA580C14', 1]]
      })
      .borderRadius(14)
      .border({ width: 2, color: '#EA580C59' })
      .onClick(() => {
        this.pageStack.pushPath({ name: AppRoutes.battle(battle.id) });
      })
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  battleGridItem(b: Battle) {
    Column({ space: 8 }) {
      Text(b.category.toUpperCase())
        .fontSize(10)
        .fontColor(ArenaTheme.textMuted)
      Text(b.question)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(ArenaTheme.textPrimary)
      Text(arenaL10n().enterBattle)
        .fontSize(12)
        .fontColor(ArenaTheme.orangeAccent)
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
    .padding(16)
    .backgroundColor(ArenaTheme.surface)
    .borderRadius(12)
    .border({ width: 1, color: ArenaTheme.border })
    .onClick(() => {
      this.pageStack.pushPath({ name: AppRoutes.battle(b.id) });
    })
  }

  @Builder
  featuredSection() {
    if (this.featuredBattle() !== null) {
      this.featuredCard(this.featuredBattle()!);
    }
  }

  build() {
    Column({ space: 20 }) {
      this.heroSection();
      this.categoryRow();

      Button({ type: ButtonType.Normal }) {
        Row({ space: 8 }) {
          if (this.aiLoading) {
            LoadingProgress()
              .width(20)
              .height(20)
              .color(Color.White)
          }
          Text(this.aiLoading ? arenaL10n().aiGenerating : arenaL10n().aiGenerateBattle)
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor(Color.White)
        }
        .justifyContent(FlexAlign.Center)
        .width('100%')
      }
      .width('100%')
      .height(48)
      .backgroundColor(ArenaTheme.orangeAccent)
      .borderRadius(10)
      .enabled(!this.aiLoading)
      .onClick(() => { this.handleAiGenerate(); })

      if (this.aiError.length > 0) {
        Text(this.aiError)
          .fontSize(12)
          .fontColor('#E57373')
      }

      this.featuredSection();

      Column({ space: 12 }) {
        Text(arenaL10n().allBattles)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)

        ForEach(this.filteredBattles(), (b: Battle) => {
          this.battleGridItem(b);
        }, (b: Battle) => b.id)
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }
}
