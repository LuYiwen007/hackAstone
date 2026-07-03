import { ArenaTheme } from '../common/ArenaTheme';
import { ArenaConfiguration } from '../common/ArenaConfiguration';
import { ArenaAPI } from '../api/ArenaAPI';
import { JsonBody } from '../common/JsonPayload';
import { authStore, localeStore, arenaL10n } from '../route/GlobalStores';

type SettingsSection = 'general' | 'subscription' | 'language' | 'appearance' | 'notifications';

class PreferencePrefs {
  autoSave: boolean = true;
  sound: boolean = false;
  timer: boolean = true;
  compact: boolean = false;
  animations: boolean = true;

  copyWithAutoSave(v: boolean): PreferencePrefs {
    const next = new PreferencePrefs();
    next.autoSave = v;
    next.sound = this.sound;
    next.timer = this.timer;
    next.compact = this.compact;
    next.animations = this.animations;
    return next;
  }

  copyWithSound(v: boolean): PreferencePrefs {
    const next = new PreferencePrefs();
    next.autoSave = this.autoSave;
    next.sound = v;
    next.timer = this.timer;
    next.compact = this.compact;
    next.animations = this.animations;
    return next;
  }

  copyWithTimer(v: boolean): PreferencePrefs {
    const next = new PreferencePrefs();
    next.autoSave = this.autoSave;
    next.sound = this.sound;
    next.timer = v;
    next.compact = this.compact;
    next.animations = this.animations;
    return next;
  }

  copyWithCompact(v: boolean): PreferencePrefs {
    const next = new PreferencePrefs();
    next.autoSave = this.autoSave;
    next.sound = this.sound;
    next.timer = this.timer;
    next.compact = v;
    next.animations = this.animations;
    return next;
  }

  copyWithAnimations(v: boolean): PreferencePrefs {
    const next = new PreferencePrefs();
    next.autoSave = this.autoSave;
    next.sound = this.sound;
    next.timer = this.timer;
    next.compact = this.compact;
    next.animations = v;
    return next;
  }
}

class NotificationPrefs {
  daily: boolean = true;
  weekly: boolean = false;
  updates: boolean = true;

  copyWithDaily(v: boolean): NotificationPrefs {
    const next = new NotificationPrefs();
    next.daily = v;
    next.weekly = this.weekly;
    next.updates = this.updates;
    return next;
  }

  copyWithWeekly(v: boolean): NotificationPrefs {
    const next = new NotificationPrefs();
    next.daily = this.daily;
    next.weekly = v;
    next.updates = this.updates;
    return next;
  }

  copyWithUpdates(v: boolean): NotificationPrefs {
    const next = new NotificationPrefs();
    next.daily = this.daily;
    next.weekly = this.weekly;
    next.updates = v;
    return next;
  }
}

type AppearanceTheme = 'dark' | 'darker' | 'midnight';

class SubscriptionPlanDef {
  id: string = '';
  icon: string = '';
  isCurrent: boolean = false;
  accent: ResourceColor = ArenaTheme.textMuted;
  border: ResourceColor = ArenaTheme.border;
  cardBackground: ResourceColor = Color.Transparent;
  buttonFill: ResourceColor = ArenaTheme.orangeAccent;

  constructor(
    id: string,
    icon: string,
    isCurrent: boolean,
    accent: ResourceColor,
    border: ResourceColor,
    cardBackground: ResourceColor,
    buttonFill: ResourceColor
  ) {
    this.id = id;
    this.icon = icon;
    this.isCurrent = isCurrent;
    this.accent = accent;
    this.border = border;
    this.cardBackground = cardBackground;
    this.buttonFill = buttonFill;
  }
}

@Component
export struct AccountSettingsPage {
  onDismiss: () => void = () => {};

  @State section: SettingsSection = 'general';
  @State nickname: string = '';
  @State email: string = '';
  @State serverAvatarURL: string = '';
  @State profileMessage: string = '';
  @State loadingProfile: boolean = false;
  @State saving: boolean = false;
  @State notifications: NotificationPrefs = new NotificationPrefs();
  @State prefs: PreferencePrefs = new PreferencePrefs();
  @State theme: AppearanceTheme = 'dark';

  private get sidebarWidth(): number {
    return arenaL10n().prefersEnglish ? 162 : 148;
  }

  private get displayName(): string {
    const n = this.nickname.trim();
    return n.length > 0 ? n : arenaL10n().settingsDefaultUser;
  }

  aboutToAppear(): void {
    if (authStore.isLoggedIn) {
      this.loadProfileFromServer();
    }
  }

  build() {
    Column() {
      if (authStore.isLoggedIn) {
        Row() {
          this.sidebar();
          this.contentPanel();
        }
        .width('100%')
        .height('100%')
      } else {
        this.guestOnlyContent();
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
  }

  @Builder
  guestOnlyContent() {
    Column() {
      Row() {
        Text(arenaL10n().settingsNavGeneral).fontSize(16).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
        Blank()
        Button(arenaL10n().done).fontWeight(FontWeight.Medium).onClick(() => this.onDismiss())
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 14, bottom: 14 })
      .border({ width: { bottom: 1 }, color: ArenaTheme.border })

      Column({ space: 16 }) {
        Blank()
        Text(arenaL10n().loginToManageAccount)
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
          .textAlign(TextAlign.Center)
          .padding({ left: 32, right: 32 })
        Button(arenaL10n().profileLoginRegister)
          .width('80%')
          .height(44)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.orangeAccent)
          .borderRadius(10)
          .onClick(() => {
            // Login navigation handled by parent via onDismiss + route
            this.onDismiss();
          })
        Blank()
      }
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  sidebar() {
    Column() {
      Row({ space: 10 }) {
        this.avatarThumb(32)
        Column({ space: 2 }) {
          Text(this.displayName).fontSize(12).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary).maxLines(1)
          Text(arenaL10n().settingsPlanFree).fontSize(11).fontColor(ArenaTheme.textMuted)
        }
        .alignItems(HorizontalAlign.Start)
      }
      .padding({ left: 12, right: 12, top: 14, bottom: 14 })
      .width('100%')
      .border({ width: { bottom: 1 }, color: ArenaTheme.border })

      Scroll() {
        Column({ space: 2 }) {
          this.settingsNavButton('general')
          this.settingsNavButton('subscription')
          this.settingsNavButton('language')
          this.settingsNavButton('appearance')
          this.settingsNavButton('notifications')
        }
        .padding({ left: 6, right: 6, top: 8, bottom: 8 })
      }
      .layoutWeight(1)
    }
    .width(this.sidebarWidth)
    .height('100%')
    .backgroundColor('#050508')
    .border({ width: { right: 1 }, color: ArenaTheme.border })
  }

  @Builder
  settingsNavButton(item: SettingsSection) {
    Row({ space: 8 }) {
      Text(this.navIcon(item))
        .fontSize(13)
        .width(16)
        .fontColor(this.section === item ? ArenaTheme.textPrimary : ArenaTheme.textMuted)
      Text(this.navLabel(item))
        .fontSize(12)
        .fontWeight(FontWeight.Medium)
        .maxLines(1)
        .fontColor(this.section === item ? ArenaTheme.textPrimary : ArenaTheme.textMuted)
      if (this.section === item) {
        Text('›').fontSize(10).fontColor(ArenaTheme.textMuted)
      }
    }
    .padding({ left: 8, right: 8, top: 9, bottom: 9 })
    .width('100%')
    .backgroundColor(this.section === item ? ArenaTheme.surface : Color.Transparent)
    .borderRadius(8)
    .onClick(() => { this.section = item; })
  }

  @Builder
  contentPanel() {
    Column() {
      Row() {
        Text(this.navLabel(this.section)).fontSize(16).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
        Blank()
        Button(arenaL10n().done)
          .fontWeight(FontWeight.Medium)
          .enabled(!this.saving)
          .onClick(() => { this.saveAndDismiss(); })
      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 14, bottom: 14 })
      .border({ width: { bottom: 1 }, color: ArenaTheme.border })

      Scroll() {
        Column() {
          if (this.section === 'general') {
            this.generalSection();
          } else if (this.section === 'subscription') {
            this.subscriptionSection();
          } else if (this.section === 'language') {
            this.languageSection();
          } else if (this.section === 'appearance') {
            this.appearanceSection();
          } else {
            this.notificationsSection();
          }
        }
        .padding({ left: 20, right: 20, top: 12, bottom: 32 })
        .width('100%')
      }
      .layoutWeight(1)
    }
    .layoutWeight(1)
    .height('100%')
  }

  @Builder
  generalSection() {
    Column({ space: 20 }) {
      if (authStore.isLoggedIn) {
        Column({ space: 12 }) {
          this.avatarThumb(88)
          Button(arenaL10n().removeAvatar)
            .fontSize(12)
            .fontColor(ArenaTheme.textMuted)
            .backgroundColor(Color.Transparent)
        }
        .width('100%')
        .alignItems(HorizontalAlign.Center)
        .padding({ top: 8, bottom: 8 })
      }

      this.sectionHeader(arenaL10n().settingsSectionAccount)
      this.accountTypeCard()

      if (authStore.isLoggedIn) {
        this.sectionHeader(arenaL10n().accountInfo)
        this.accountInfoCard()

        Button(arenaL10n().logout)
          .width('100%')
          .height(44)
          .fontColor(Color.Red)
          .border({ width: 1, color: ArenaTheme.border, radius: 8 })
          .onClick(() => {
            authStore.clear();
            this.onDismiss();
          })
      }

      this.sectionHeader(arenaL10n().settingsSectionPreferences)
      this.preferencesCard()
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  accountTypeCard() {
    Column() {
      Row() {
        Column({ space: 2 }) {
          Text(arenaL10n().settingsAccountType).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
          Text(arenaL10n().settingsAccountTypeDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
        Button(arenaL10n().settingsUpgrade)
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.orangeAccent)
          .borderRadius(8)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .onClick(() => { this.section = 'subscription'; })
      }
      .padding({ top: 12, bottom: 12 })
      .width('100%')
      .border({ width: { bottom: 1 }, color: '#29292B99' })

      Row() {
        Column({ space: 2 }) {
          Text(arenaL10n().settingsDataPrivacy).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
          Text(arenaL10n().settingsDataPrivacyDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
        Text(arenaL10n().settingsManage)
          .fontSize(12)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .fontColor(ArenaTheme.textMuted)
          .border({ width: 1, color: ArenaTheme.border, radius: 8 })
      }
      .padding({ top: 12, bottom: 12 })
      .width('100%')
    }
    .padding({ left: 14, right: 14 })
    .width('100%')
    .backgroundColor('#1C1C1E8C')
    .borderRadius(12)
  }

  @Builder
  accountInfoCard() {
    Column() {
      if (this.loadingProfile) {
        LoadingProgress().width(32).height(32)
      }
      this.labeledField(arenaL10n().nickname, this.nickname, arenaL10n().nicknamePrompt, (v: string) => { this.nickname = v; })
      Column({ space: 6 }) {
        Text(arenaL10n().email).fontSize(12).fontColor(ArenaTheme.textMuted)
        Text(this.email.length === 0 ? '—' : this.email)
          .width('100%')
          .padding(12)
          .fontColor(ArenaTheme.textMuted)
          .backgroundColor('#0A0A0B99')
          .border({ width: 1, color: ArenaTheme.border, radius: 10 })
        Text(arenaL10n().emailReadOnlyHint).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .width('100%')
      .padding({ top: 8, bottom: 8 })
      if (this.profileMessage.length > 0) {
        Text(this.profileMessage)
          .fontSize(12)
          .fontColor(this.profileMessage === arenaL10n().profileSaved ? Color.Green : ArenaTheme.orangeAccent)
      }
    }
    .padding({ left: 14, right: 14 })
    .width('100%')
    .backgroundColor('#1C1C1E8C')
    .borderRadius(12)
  }

  @Builder
  preferencesCard() {
    Column() {
      this.autoSaveToggleRow()
      this.soundToggleRow()
      this.timerToggleRow()
    }
    .padding({ left: 14, right: 14 })
    .width('100%')
    .backgroundColor('#1C1C1E8C')
    .borderRadius(12)
  }

  @Builder
  autoSaveToggleRow() {
    Row() {
      Column({ space: 2 }) {
        Text(arenaL10n().settingsAutoSave).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().settingsAutoSaveDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      this.settingsToggle(this.prefs.autoSave, (v: boolean) => {
        this.prefs = this.prefs.copyWithAutoSave(v);
        this.persistPreferences();
      })
    }
    .padding({ top: 12, bottom: 12 })
    .width('100%')
    .border({ width: { bottom: 1 }, color: '#29292B99' })
  }

  @Builder
  soundToggleRow() {
    Row() {
      Column({ space: 2 }) {
        Text(arenaL10n().settingsSound).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().settingsSoundDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      this.settingsToggle(this.prefs.sound, (v: boolean) => {
        this.prefs = this.prefs.copyWithSound(v);
        this.persistPreferences();
      })
    }
    .padding({ top: 12, bottom: 12 })
    .width('100%')
    .border({ width: { bottom: 1 }, color: '#29292B99' })
  }

  @Builder
  timerToggleRow() {
    Row() {
      Column({ space: 2 }) {
        Text(arenaL10n().settingsTimer).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().settingsTimerDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      this.settingsToggle(this.prefs.timer, (v: boolean) => {
        this.prefs = this.prefs.copyWithTimer(v);
        this.persistPreferences();
      })
    }
    .padding({ top: 12, bottom: 12 })
    .width('100%')
  }

  @Builder
  subscriptionSection() {
    Column({ space: 12 }) {
      Text(arenaL10n().settingsSubscriptionLead).fontSize(12).fontColor(ArenaTheme.textMuted)
      ForEach(AccountSettingsPage.PLANS, (plan: SubscriptionPlanDef) => {
        this.subscriptionPlanCard(plan);
      }, (plan: SubscriptionPlanDef) => plan.id)
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  languageSection() {
    Column({ space: 12 }) {
      this.sectionHeader(arenaL10n().settingsInterfaceLanguage)
      this.languageCard()
      Text(arenaL10n().settingsSystemLanguageNote).fontSize(11).fontColor(ArenaTheme.textMuted)
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  languageCard() {
    Column() {
      Row() {
        Column({ space: 4 }) {
          Text(localeStore.prefersEnglish ? arenaL10n().english : arenaL10n().simplifiedChinese)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor(ArenaTheme.textPrimary)
          Text(localeStore.prefersEnglish ? arenaL10n().simplifiedChinese : arenaL10n().english)
            .fontSize(12)
            .fontColor(ArenaTheme.textMuted)
        }
        .alignItems(HorizontalAlign.Start)
        Blank()
        Text('✓').fontColor(ArenaTheme.orangeAccent)
      }
      .padding({ top: 8, bottom: 8 })
      .width('100%')
    }
    .padding({ left: 14, right: 14 })
    .width('100%')
    .backgroundColor('#1C1C1E8C')
    .borderRadius(12)
  }

  @Builder
  appearanceSection() {
    Column({ space: 16 }) {
      this.sectionHeader(arenaL10n().settingsColorTheme)
      Row({ space: 10 }) {
        this.themeChip('dark')
        this.themeChip('darker')
        this.themeChip('midnight')
      }
      this.sectionHeader(arenaL10n().settingsLayoutDensity)
      Column() {
        this.compactToggleRow()
        this.animationsToggleRow()
      }
      .padding({ left: 14, right: 14 })
      .width('100%')
      .backgroundColor('#1C1C1E8C')
      .borderRadius(12)
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  compactToggleRow() {
    Row() {
      Column({ space: 2 }) {
        Text(arenaL10n().settingsCompact).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().settingsCompactDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      this.settingsToggle(this.prefs.compact, (v: boolean) => {
        this.prefs = this.prefs.copyWithCompact(v);
        this.persistPreferences();
      })
    }
    .padding({ top: 12, bottom: 12 })
    .width('100%')
    .border({ width: { bottom: 1 }, color: '#29292B99' })
  }

  @Builder
  animationsToggleRow() {
    Row() {
      Column({ space: 2 }) {
        Text(arenaL10n().settingsAnimations).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().settingsAnimationsDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      this.settingsToggle(this.prefs.animations, (v: boolean) => {
        this.prefs = this.prefs.copyWithAnimations(v);
        this.persistPreferences();
      })
    }
    .padding({ top: 12, bottom: 12 })
    .width('100%')
  }

  @Builder
  notificationsSection() {
    Column({ space: 12 }) {
      this.sectionHeader(arenaL10n().settingsNotificationSection)
      Column() {
        this.dailyNotifyToggleRow()
        this.weeklyNotifyToggleRow()
        this.updatesNotifyToggleRow()
      }
      .padding({ left: 14, right: 14 })
      .width('100%')
      .backgroundColor('#1C1C1E8C')
      .borderRadius(12)
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  dailyNotifyToggleRow() {
    Row() {
      Column({ space: 2 }) {
        Text(arenaL10n().settingsNotifyDaily).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().settingsNotifyDailyDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      this.settingsToggle(this.notifications.daily, (v: boolean) => {
        this.notifications = this.notifications.copyWithDaily(v);
        this.persistNotifications();
      })
    }
    .padding({ top: 12, bottom: 12 })
    .width('100%')
    .border({ width: { bottom: 1 }, color: '#29292B99' })
  }

  @Builder
  weeklyNotifyToggleRow() {
    Row() {
      Column({ space: 2 }) {
        Text(arenaL10n().settingsNotifyWeekly).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().settingsNotifyWeeklyDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      this.settingsToggle(this.notifications.weekly, (v: boolean) => {
        this.notifications = this.notifications.copyWithWeekly(v);
        this.persistNotifications();
      })
    }
    .padding({ top: 12, bottom: 12 })
    .width('100%')
    .border({ width: { bottom: 1 }, color: '#29292B99' })
  }

  @Builder
  updatesNotifyToggleRow() {
    Row() {
      Column({ space: 2 }) {
        Text(arenaL10n().settingsNotifyUpdates).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().settingsNotifyUpdatesDesc).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      this.settingsToggle(this.notifications.updates, (v: boolean) => {
        this.notifications = this.notifications.copyWithUpdates(v);
        this.persistNotifications();
      })
    }
    .padding({ top: 12, bottom: 12 })
    .width('100%')
  }

  @Builder
  avatarThumb(size: number) {
    Stack() {
      Column()
        .width(size)
        .height(size)
        .borderRadius(size / 2)
        .linearGradient({ angle: 135, colors: [[ArenaTheme.orangeAccent, 0], ['#DC2626D9', 1]] })
      if (this.serverAvatarURL) {
        Image(this.serverAvatarURL)
          .width(size)
          .height(size)
          .borderRadius(size / 2)
          .objectFit(ImageFit.Cover)
      } else {
        Text(this.displayName.substring(0, 1).toUpperCase())
          .fontSize(size * 0.38)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
      }
    }
    .width(size)
    .height(size)
  }

  @Builder
  sectionHeader(title: string) {
    Text(title.toUpperCase())
      .fontSize(11)
      .fontWeight(FontWeight.Medium)
      .fontColor(ArenaTheme.textMuted)
      .letterSpacing(1)
  }

  @Builder
  settingsToggle(isOn: boolean, onChange: (v: boolean) => void) {
    Stack({ alignContent: isOn ? Alignment.End : Alignment.Start }) {
      Column()
        .width(44)
        .height(26)
        .borderRadius(13)
        .backgroundColor(isOn ? ArenaTheme.orangeAccent : '#404047')
      Column()
        .width(22)
        .height(22)
        .borderRadius(11)
        .backgroundColor(Color.White)
        .margin(2)
    }
    .width(44)
    .height(26)
    .onClick(() => onChange(!isOn))
  }

  @Builder
  labeledField(title: string, value: string, prompt: string, onChange: (v: string) => void) {
    Column({ space: 6 }) {
      Text(title).fontSize(12).fontColor(ArenaTheme.textMuted)
      TextInput({ placeholder: prompt, text: value })
        .fontColor(ArenaTheme.textPrimary)
        .padding(12)
        .backgroundColor(ArenaTheme.background)
        .border({ width: 1, color: ArenaTheme.border, radius: 10 })
        .onChange(onChange)
    }
    .padding({ top: 8, bottom: 8 })
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  themeChip(item: AppearanceTheme) {
    Column() {
      Stack({ alignContent: Alignment.Bottom }) {
        Column()
          .width('100%')
          .height(52)
          .backgroundColor(this.themeBackground(item))
        Column()
          .width('90%')
          .height(6)
          .borderRadius(3)
          .backgroundColor(`${this.themeAccent(item)}BF`)
          .margin({ bottom: 8 })
      }
      Text(this.themeLabel(item))
        .fontSize(11)
        .fontColor(ArenaTheme.textMuted)
        .width('100%')
        .textAlign(TextAlign.Center)
        .padding({ top: 6, bottom: 6 })
        .backgroundColor(ArenaTheme.surface)
    }
    .width('31%')
    .borderRadius(10)
    .clip(true)
    .border({
      width: this.theme === item ? 2 : 1,
      color: this.theme === item ? ArenaTheme.orangeAccent : ArenaTheme.border
    })
    .onClick(() => {
      this.theme = item;
      const appearance = new JsonBody().put('theme', item).build();
      const body = new JsonBody().put('appearance', appearance).build();
      ArenaAPI.updateSettings(body).catch(() => {});
    })
  }

  @Builder
  subscriptionPlanCard(plan: SubscriptionPlanDef) {
    Column({ space: 10 }) {
      Row() {
        Text(plan.icon).fontColor(plan.accent)
        Column({ space: 2 }) {
          Text(arenaL10n().settingsPlanName(plan.id)).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
          Text(arenaL10n().settingsPlanDesc(plan.id)).fontSize(11).fontColor(ArenaTheme.textMuted)
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
        .margin({ left: 8 })
        Column() {
          if (plan.isCurrent) {
            Text(arenaL10n().settingsCurrentPlan)
              .fontSize(11)
              .padding({ left: 8, right: 8, top: 3, bottom: 3 })
              .backgroundColor(ArenaTheme.surface)
              .borderRadius(12)
              .fontColor(ArenaTheme.textMuted)
          }
          Row() {
            Text(arenaL10n().settingsPlanPrice(plan.id)).fontSize(20).fontWeight(FontWeight.Bold).fontColor(plan.accent)
            Text(arenaL10n().settingsPlanPeriod).fontSize(11).fontColor(ArenaTheme.textMuted).margin({ left: 2 })
          }
          .alignItems(VerticalAlign.Bottom)
        }
        .alignItems(HorizontalAlign.End)
      }
      .alignItems(VerticalAlign.Top)
      .width('100%')

      ForEach(arenaL10n().settingsPlanFeatures(plan.id), (line: string) => {
        Row({ space: 6 }) {
          Text('✓').fontSize(11).fontColor(ArenaTheme.textMuted)
          Text(line).fontSize(11).fontColor(ArenaTheme.textMuted)
        }
      }, (line: string) => line)

      if (!plan.isCurrent) {
        Text(arenaL10n().settingsUpgradeTo(arenaL10n().settingsPlanName(plan.id)))
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .fontColor(Color.White)
          .width('100%')
          .textAlign(TextAlign.Center)
          .padding({ top: 10, bottom: 10 })
          .backgroundColor(plan.buttonFill)
          .borderRadius(10)
      }
    }
    .padding(14)
    .width('100%')
    .backgroundColor(plan.cardBackground)
    .border({ width: 1, color: plan.border, radius: 14 })
  }

  private navLabel(item: SettingsSection): string {
    switch (item) {
      case 'general': return arenaL10n().settingsNavGeneral;
      case 'subscription': return arenaL10n().settingsNavSubscription;
      case 'language': return arenaL10n().settingsNavLanguage;
      case 'appearance': return arenaL10n().settingsNavAppearance;
      default: return arenaL10n().settingsNavNotifications;
    }
  }

  private navIcon(item: SettingsSection): string {
    switch (item) {
      case 'general': return '👤';
      case 'subscription': return '💳';
      case 'language': return '🌐';
      case 'appearance': return '🎨';
      default: return '🔔';
    }
  }

  private themeBackground(item: AppearanceTheme): ResourceColor {
    switch (item) {
      case 'darker': return '#09090A';
      case 'midnight': return '#0F0F19';
      default: return '#17171C';
    }
  }

  private themeAccent(item: AppearanceTheme): ResourceColor {
    switch (item) {
      case 'darker': return Color.Red;
      case 'midnight': return ArenaTheme.purpleAccent;
      default: return ArenaTheme.orangeAccent;
    }
  }

  private themeLabel(item: AppearanceTheme): string {
    switch (item) {
      case 'darker': return arenaL10n().settingsThemeDarker;
      case 'midnight': return arenaL10n().settingsThemeMidnight;
      default: return arenaL10n().settingsThemeDark;
    }
  }

  private static readonly PLANS: SubscriptionPlanDef[] = [
    new SubscriptionPlanDef(
      'free', '🛡', true,
      ArenaTheme.textMuted, ArenaTheme.border,
      '#1C1C1E66', ArenaTheme.orangeAccent
    ),
    new SubscriptionPlanDef(
      'pro', '⚡', false,
      ArenaTheme.orangeAccent, '#F9731680',
      '#F9731614', ArenaTheme.orangeAccent
    ),
    new SubscriptionPlanDef(
      'elite', '👑', false,
      ArenaTheme.purpleAccent, '#A855F780',
      '#A855F714', ArenaTheme.purpleAccent
    ),
  ];

  private applySettingsFromServer(s: Record<string, Object> | null | undefined): void {
    if (s === null || s === undefined) {
      return;
    }
    const prefsRaw = s['preferences'];
    if (prefsRaw !== undefined && prefsRaw !== null && typeof prefsRaw === 'object' && !Array.isArray(prefsRaw)) {
      const prefs = prefsRaw as Record<string, Object>;
      if (prefs['autoSave'] !== undefined) {
        this.prefs.autoSave = prefs['autoSave'] as boolean;
      }
      if (prefs['sound'] !== undefined) {
        this.prefs.sound = prefs['sound'] as boolean;
      }
      if (prefs['timer'] !== undefined) {
        this.prefs.timer = prefs['timer'] as boolean;
      }
      if (prefs['compact'] !== undefined) {
        this.prefs.compact = prefs['compact'] as boolean;
      }
      if (prefs['animations'] !== undefined) {
        this.prefs.animations = prefs['animations'] as boolean;
      }
    }
    const notesRaw = s['notifications'];
    if (notesRaw !== undefined && notesRaw !== null && typeof notesRaw === 'object' && !Array.isArray(notesRaw)) {
      const n = notesRaw as Record<string, Object>;
      if (n['daily'] !== undefined) {
        this.notifications.daily = n['daily'] as boolean;
      }
      if (n['weekly'] !== undefined) {
        this.notifications.weekly = n['weekly'] as boolean;
      }
      if (n['updates'] !== undefined) {
        this.notifications.updates = n['updates'] as boolean;
      }
    }
    const appearanceRaw = s['appearance'];
    if (appearanceRaw !== undefined && appearanceRaw !== null &&
      typeof appearanceRaw === 'object' && !Array.isArray(appearanceRaw)) {
      const appearance = appearanceRaw as Record<string, Object>;
      const themeVal = appearance['theme'];
      if (themeVal !== undefined) {
        this.theme = String(themeVal) as AppearanceTheme;
      }
    }
  }

  private persistPreferences(): void {
    const prefs = new JsonBody()
      .put('autoSave', this.prefs.autoSave)
      .put('sound', this.prefs.sound)
      .put('timer', this.prefs.timer)
      .put('compact', this.prefs.compact)
      .put('animations', this.prefs.animations)
      .build();
    const body = new JsonBody().put('preferences', prefs).build();
    ArenaAPI.updateSettings(body).catch(() => {});
  }

  private persistNotifications(): void {
    const notes = new JsonBody()
      .put('daily', this.notifications.daily)
      .put('weekly', this.notifications.weekly)
      .put('updates', this.notifications.updates)
      .build();
    const body = new JsonBody().put('notifications', notes).build();
    ArenaAPI.updateSettings(body).catch(() => {});
  }

  private async loadProfileFromServer(): Promise<void> {
    if (!authStore.isLoggedIn) {
      return;
    }
    this.loadingProfile = true;
    try {
      const profile = await ArenaAPI.fetchCurrentUser();
      this.nickname = profile.nickname;
      this.email = profile.email ?? '';
      if (profile.avatarUrl) {
        this.serverAvatarURL = AccountSettingsPage.resolveAvatarURL(profile.avatarUrl);
      }
      this.applySettingsFromServer(profile.settings as Record<string, Object>);
      authStore.refreshProfile(profile.userId, profile.nickname, profile.email ?? null);
    } catch (e) {
      this.profileMessage = (e as Error).message ?? String(e);
    }
    this.loadingProfile = false;
  }

  private async saveAndDismiss(): Promise<void> {
    if (!authStore.isLoggedIn) {
      this.onDismiss();
      return;
    }
    this.saving = true;
    try {
      const profile = await ArenaAPI.updateProfile(this.nickname.trim());
      authStore.refreshProfile(profile.userId, profile.nickname, profile.email ?? null);
      this.profileMessage = arenaL10n().profileSaved;
      setTimeout(() => this.onDismiss(), 400);
    } catch (e) {
      this.profileMessage = (e as Error).message ?? String(e);
    }
    this.saving = false;
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
}
