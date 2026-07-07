import { ArenaTheme } from '../common/ArenaTheme';
import {
  MindProfilePayload,
  MindProfileStat,
  MindProfileBias,
  MindProfileRecentBattle
} from '../common/ArenaModels';
import { ArenaConfiguration } from '../common/ArenaConfiguration';
import { ArenaAPI } from '../api/ArenaAPI';
import { AppRoutes } from '../route/AppRoutes';
import { authStore, localeStore, arenaL10n, arenaNavPush, arenaNavClear } from '../route/GlobalStores';
import { authSessionDisplayName } from '../store/AuthStore';
import { AUTH_VERSION_KEY } from '../common/AuthEvents';

@Component
export struct MindProfilePage {
  @StorageLink(AUTH_VERSION_KEY) @Watch('onAuthVersionChange') authVersion: number = 0;
  @State data: MindProfilePayload = MindProfilePage.FALLBACK;
  @State loadError: string = '';
  @State loading: boolean = true;
  @State serverAvatarURL: string = '';

  private profileDisplayNameValue(): string {
    const session = authStore.session;
    if (session === null) {
      return arenaL10n().mindProfileTitle;
    }
    const name = authSessionDisplayName(session).trim();
    return name.length > 0 ? name : arenaL10n().mindProfileTitle;
  }

  private avatarInitial(): string {
    const name = this.profileDisplayNameValue();
    if (name.length === 0) {
      return '?';
    }
    return name.substring(0, 1).toUpperCase();
  }

  private onAuthVersionChange(): void {
    this.refreshForAuth();
  }

  aboutToAppear(): void {
    this.refreshForAuth();
  }

  private refreshForAuth(): void {
    if (authStore.isLoggedIn) {
      this.load();
    } else {
      this.loading = false;
      this.serverAvatarURL = '';
      this.data = MindProfilePage.FALLBACK;
      this.loadError = '';
    }
  }

  private async load(): Promise<void> {
    await this.loadUserAvatar();
    this.loading = true;
    try {
      const profile = await ArenaAPI.fetchMindProfile(localeStore.catalogLocale);
      this.data = profile;
      this.loadError = '';
    } catch (e) {
      this.loadError = (e as Error).message ?? String(e);
      this.data = MindProfilePage.EMPTY;
    }
    this.loading = false;
  }

  private async loadUserAvatar(): Promise<void> {
    if (!authStore.isLoggedIn) {
      return;
    }
    try {
      const user = await ArenaAPI.fetchCurrentUser();
      if (user.avatarUrl) {
        this.serverAvatarURL = MindProfilePage.resolveAvatarURL(user.avatarUrl);
      }
    } catch (_e) {
      // ignore
    }
  }

  private static resolveAvatarURL(path: string): string {
    const t = path.trim();
    if (!t) {
      return '';
    }
    if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) {
      return t;
    }
    const base = ArenaConfiguration.apiBaseURLString;
    return t.startsWith('/') ? base + t : `${base}/${t}`;
  }

  build() {
    Column() {
      if (!authStore.isLoggedIn) {
        this.guestView();
      } else {
        this.loggedInView();
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
  }

  @Builder
  guestView() {
    Column({ space: 24 }) {
      Button({ type: ButtonType.Normal }) {
        Row({ space: 4 }) {
          Text('‹').fontColor(ArenaTheme.textMuted)
          Text(arenaL10n().backHome).fontColor(ArenaTheme.textMuted)
        }
      }
      .backgroundColor(Color.Transparent)
      .alignSelf(ItemAlign.Start)
      .margin({ left: 16, top: 16 })
      .onClick(() => arenaNavClear())

      Blank()
      this.profileAvatar(80)
      Text(arenaL10n().profileGuestTitle)
        .fontSize(28)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.textPrimary)
      Text(arenaL10n().profileGuestHint)
        .fontSize(16)
        .fontColor(ArenaTheme.textMuted)
        .textAlign(TextAlign.Center)
        .padding({ left: 32, right: 32 })
      Button(arenaL10n().profileLoginRegister)
        .width('80%')
        .height(48)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.White)
        .backgroundColor(ArenaTheme.orangeAccent)
        .borderRadius(12)
        .onClick(() => {
          arenaNavPush({ name: AppRoutes.login() });
        })
      Blank()
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  loggedInView() {
    Scroll() {
      Column({ space: 24 }) {
        Column({ space: 12 }) {
          Button({ type: ButtonType.Normal }) {
            Row({ space: 4 }) {
              Text('‹').fontColor(ArenaTheme.textMuted)
              Text(arenaL10n().backHome).fontColor(ArenaTheme.textMuted)
            }
          }
          .backgroundColor(Color.Transparent)
          .alignSelf(ItemAlign.Start)
          .onClick(() => arenaNavClear())

          this.profileAvatar(72)
          Text(arenaL10n().mindProfileTitle)
            .fontSize(32)
            .fontWeight(FontWeight.Bold)
            .fontColor(ArenaTheme.textPrimary)
          Text(arenaL10n().mindProfileSubtitle)
            .fontColor(ArenaTheme.textMuted)
          if (authStore.session !== null) {
            Text(authSessionDisplayName(authStore.session))
              .fontSize(14)
              .fontColor(ArenaTheme.orangeAccent)
          }
          if (this.loadError) {
            Text(this.loadError)
              .fontSize(12)
              .fontColor(ArenaTheme.orangeAccent)
          }
        }
        .width('100%')
        .alignItems(HorizontalAlign.Center)

        if (this.loading) {
          LoadingProgress()
            .color(ArenaTheme.orangeAccent)
            .width(40)
            .height(40)
            .margin({ top: 40, bottom: 40 })
        } else {
          this.statsGrid()
          this.biasesSection()
          this.insightsSection()
          this.recentSection()
          this.cta()
        }
      }
      .padding({ left: 16, right: 16, bottom: 32 })
      .width('100%')
    }
    .layoutWeight(1)
  }

  @Builder
  profileAvatar(size: number) {
    Stack() {
      Column()
        .width(size)
        .height(size)
        .borderRadius(size / 2)
        .linearGradient({
          angle: 135,
          colors: [[ArenaTheme.orangeAccent, 0], ['#DC2626D9', 1]]
        })
      if (this.serverAvatarURL) {
        Image(this.serverAvatarURL)
          .width(size)
          .height(size)
          .borderRadius(size / 2)
          .objectFit(ImageFit.Cover)
      } else if (authStore.localAvatarUri.length > 0) {
        Image(authStore.localAvatarUri)
          .width(size)
          .height(size)
          .borderRadius(size / 2)
          .objectFit(ImageFit.Cover)
      } else {
        Text(this.avatarInitial())
          .fontSize(size * 0.38)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
      }
    }
    .width(size)
    .height(size)
  }

  @Builder
  statsGrid() {
    Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Start }) {
      ForEach(this.data.stats, (s: MindProfileStat, idx: number) => {
        Column({ space: 10 }) {
          Text('👥')
            .fontSize(22)
            .fontColor(ArenaTheme.orangeAccent)
          Text(s.value)
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor(ArenaTheme.textPrimary)
          Text(arenaL10n().localizeMindStatLabel(s.label))
            .fontSize(12)
            .fontColor(ArenaTheme.textMuted)
        }
        .padding(18)
        .width('46%')
        .margin({ right: 8, bottom: 12 })
        .backgroundColor(ArenaTheme.surface)
        .border({ width: 1, color: ArenaTheme.border, radius: 14 })
      }, (s: MindProfileStat, idx: number) => `${idx}-${s.label}`)
    }
    .width('100%')
  }

  @Builder
  biasesSection() {
    Column({ space: 12 }) {
      Text(arenaL10n().biasMapTitle)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.textPrimary)
      Text(arenaL10n().biasMapFootnote)
        .fontSize(12)
        .fontColor(ArenaTheme.textMuted)
      if (this.data.biases.length === 0) {
        Text(arenaL10n().prefersEnglish
          ? 'Complete debates while logged in to build your bias map.'
          : '登录后完成辩论，即可生成你的偏差地图。')
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
      } else {
        ForEach(this.data.biases, (bias: MindProfileBias, idx: number) => {
          Column({ space: 6 }) {
            Row() {
              Text(bias.name).fontSize(16).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
              Blank()
              Text(`${bias.percentage}%`)
                .fontSize(16)
                .fontWeight(FontWeight.Bold)
                .fontColor(ArenaTheme.orangeAccent)
            }
            .width('100%')
            Text(bias.description).fontSize(12).fontColor(ArenaTheme.textMuted)
            Text(arenaL10n().occurrences(bias.instances)).fontSize(11).fontColor(ArenaTheme.textMuted)
          }
          .padding(14)
          .width('100%')
          .backgroundColor(ArenaTheme.surface)
          .border({ width: 1, color: ArenaTheme.border, radius: 12 })
        }, (bias: MindProfileBias, idx: number) => `${idx}-${bias.name}`)
      }
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  insightsSection() {
    Column({ space: 12 }) {
      Text(arenaL10n().keyInsights)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.textPrimary)
      Column({ space: 8 }) {
        Text(arenaL10n().insightWatchOutTitle)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#EF4444E6')
        Text(arenaL10n().insightWatchOutBody).fontSize(12).fontColor(ArenaTheme.textMuted)
      }
      .padding(14)
      .width('100%')
      .backgroundColor(ArenaTheme.surface)
      .border({ width: 1, color: ArenaTheme.border, radius: 12 })

      Column({ space: 8 }) {
        Text(arenaL10n().insightStrengthTitle)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.cyanAccent)
        Text(arenaL10n().insightStrengthBody).fontSize(12).fontColor(ArenaTheme.textMuted)
      }
      .padding(14)
      .width('100%')
      .backgroundColor(ArenaTheme.surface)
      .border({ width: 1, color: ArenaTheme.border, radius: 12 })
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  recentSection() {
    Column({ space: 12 }) {
      Text(arenaL10n().recentThoughts)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.textPrimary)
      if (this.data.recentBattles.length === 0) {
        Text(arenaL10n().prefersEnglish ? 'No recent matches yet.' : '暂无近期对局记录。')
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
      } else {
        ForEach(this.data.recentBattles, (b: MindProfileRecentBattle, idx: number) => {
          Column({ space: 8 }) {
            Text(b.question).fontSize(16).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
            if (b.changed) {
              Text(arenaL10n().stanceChanged).fontSize(11).fontColor(ArenaTheme.orangeAccent)
            }
            Row() {
              Column({ space: 4 }) {
                Text(arenaL10n().yourPick).fontSize(11).fontColor(ArenaTheme.textMuted)
                Text(arenaL10n().localizeRecentChoice(b.choice)).fontSize(12)
              }
              .alignItems(HorizontalAlign.Start)
              .layoutWeight(1)
              Column({ space: 4 }) {
                Text(arenaL10n().judgeFollowUpShort).fontSize(11).fontColor(ArenaTheme.textMuted)
                Text(b.judgeComment).fontSize(12)
              }
              .alignItems(HorizontalAlign.Start)
              .layoutWeight(1)
            }
            .width('100%')
            .alignItems(VerticalAlign.Top)
          }
          .padding(14)
          .width('100%')
          .backgroundColor(ArenaTheme.surface)
          .border({ width: 1, color: ArenaTheme.border, radius: 12 })
        }, (b: MindProfileRecentBattle, idx: number) => `${idx}-${b.question}`)
      }
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  cta() {
    Column({ space: 12 }) {
      Text(arenaL10n().growthQuote)
        .fontSize(12)
        .fontStyle(FontStyle.Italic)
        .fontColor(ArenaTheme.textMuted)
        .textAlign(TextAlign.Center)
      Row({ space: 12 }) {
        Button(arenaL10n().philosophyDebate)
          .layoutWeight(1)
          .height(48)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.purpleAccent)
          .borderRadius(12)
          .onClick(() => arenaNavClear())
        Button(arenaL10n().disciplinesDebate)
          .layoutWeight(1)
          .height(48)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.orangeAccent)
          .borderRadius(12)
          .onClick(() => {
            arenaNavClear();
            arenaNavPush({ name: AppRoutes.disciplines() });
          })
      }
      .width('100%')
    }
    .padding({ top: 8 })
    .width('100%')
  }

  private static readonly EMPTY: MindProfilePayload = {
    biases: [],
    stats: [
      { label: '已完成对局', value: '0' },
      { label: '改变立场次数', value: '0' },
      { label: '思维盲区', value: '0' },
      { label: '准确判断率', value: '--' },
    ],
    recentBattles: []
  };

  private static readonly FALLBACK: MindProfilePayload = {
    biases: [
      {
        name: '确认偏差',
        description: '倾向于寻找支持已有观点的证据',
        percentage: 72,
        color: 'bg-red-500',
        instances: 13
      }
    ],
    stats: [
      { label: '已完成对局', value: '18' },
      { label: '改变立场次数', value: '7' },
      { label: '思维盲区', value: '5' },
      { label: '准确判断率', value: '61%' },
    ],
    recentBattles: []
  };
}
