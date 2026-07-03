import { CatalogTimePeriodMeta, Philosopher, PhilosophyChoice } from '../common/ArenaModels';
import { PresetTopicResult } from '../common/ArkTypes';
import { CatalogMeta } from '../data/CatalogMeta';

export { PhilosophyChoice, philosopherDisplayName } from '../common/ArenaModels';

/** 中英界面文案（由 `AppLocaleStore.languageCode` 驱动）。 */
export class ArenaL10n {
  languageCode: string;

  constructor(languageCode: string) {
    this.languageCode = languageCode;
  }

  get prefersEnglish(): boolean {
    return this.languageCode.startsWith('en');
  }

  private get en(): boolean {
    return this.prefersEnglish;
  }

  // MARK: - Common

  get done(): string { return this.en ? 'Done' : '完成'; }
  get close(): string { return this.en ? 'Close' : '关闭'; }
  get back(): string { return this.en ? 'Back' : '返回'; }
  get send(): string { return this.en ? 'Send' : '发送'; }
  get you(): string { return this.en ? 'You' : '你'; }
  get judge(): string { return this.en ? 'Judge' : '裁判'; }
  get user(): string { return this.en ? 'User' : '用户'; }

  // MARK: - Home

  get homeSubtitle(): string { return this.en ? 'Cross-era dialogue of ideas' : '跨时空思想对话场'; }
  get roundtableDebate(): string { return this.en ? 'Roundtable' : '圆桌辩论'; }
  get moralDilemma(): string { return this.en ? 'Dilemmas' : '道德困境'; }
  get mindProfile(): string { return this.en ? 'Mind profile' : '思维画像'; }
  get philosophyDebate(): string { return this.en ? 'Philosophy' : '哲学辩论'; }
  get disciplinesDebate(): string { return this.en ? 'Disciplines' : '学科辩论'; }
  get heroMapTitle(): string {
    return this.en ? 'Pick an era and ideas on the world map' : '在世界地图上挑选时代与思想';
  }
  get heroMapSubtitle(): string {
    return this.en
      ? 'Choose a time period, tap a region, and see philosophers active in that phase.'
      : '先选时间，再点大洲区域，就能看到这个阶段活跃的哲学家。';
  }
  get timelineTitle(): string { return this.en ? 'Timeline' : '时间轴'; }
  get footerTagline(): string {
    return this.en
      ? 'Cognitive Arena · map, time, and ideas together'
      : 'Cognitive Arena · 让世界地图、时间与思想连起来';
  }
  get noPhilosophersInRegion(): string {
    return this.en ? 'No philosophers to show for' : '目前没有可展示的哲学家。';
  }

  noPhilosophersSentence(periodLabel: string, regionName: string): string {
    if (this.en) {
      return `No philosophers to show for ${regionName} in ${periodLabel}.`;
    }
    return `${periodLabel} 的 ${regionName} 目前没有可展示的哲学家。`;
  }

  get backToMap(): string { return this.en ? 'Back to map' : '返回地图'; }

  regionName(id: string): string {
    if (!this.en) {
      const found = CatalogMeta.regions.find((r) => r.id === id);
      return found !== undefined ? found.name : id;
    }
    switch (id) {
      case 'Americas': return 'Americas';
      case 'Europe': return 'Europe';
      case 'Middle East': return 'Middle East';
      case 'South Asia': return 'South Asia';
      case 'East Asia': return 'East Asia';
      default: return id;
    }
  }

  periodLabel(p: CatalogTimePeriodMeta): string {
    if (!this.en) {
      return p.label;
    }
    switch (p.id) {
      case 'all': return 'All';
      case 'bce-6': return '6th century BCE';
      case 'bce-5': return '5th century BCE';
      case 'bce-4': return '4th century BCE';
      case 'bce-3': return '3rd century BCE';
      case '2nd': return '2nd century CE';
      case '5th': return '5th century CE';
      case '11th': return '11th century CE';
      case '12th': return '12th century CE';
      case '13th': return '13th century CE';
      case '17th': return '17th century CE';
      case '18th': return '18th century CE';
      case '19th': return '19th century CE';
      case '20th': return '20th century CE';
      default: return p.label;
    }
  }

  periodEra(p: CatalogTimePeriodMeta): string {
    if (!this.en) {
      return p.era;
    }
    switch (p.era) {
      case '跨时代': return 'All eras';
      case '古代': return 'Ancient';
      case '古典晚期': return 'Late antiquity';
      case '中古': return 'Medieval';
      case '近代': return 'Early modern';
      case '现代': return 'Modern';
      default: return p.era;
    }
  }

  describePeriod(p: CatalogTimePeriodMeta): string {
    if (p.showAll === true) {
      return this.en ? 'Showing philosophers from all time periods' : '显示全部时代的哲学家';
    }
    const s = p.startYear ?? 0;
    const e = p.endYear ?? 0;
    return this.en ? `${s} – ${e}` : `${s} 至 ${e}`;
  }

  get timelineEraTags(): string[] {
    return this.en
      ? ['Ancient', 'Late antiquity', 'Medieval', 'Early modern', 'Modern', 'Cross-region', 'All']
      : ['古代', '古典晚期', '中古', '近代', '现代', '跨地域', '全部'];
  }

  // MARK: - World map section

  get worldMapTitle(): string { return this.en ? 'World map' : '世界地图'; }
  get noFiguresShort(): string { return this.en ? 'None' : '暂无人物'; }

  philosopherCount(n: number): string {
    return this.en ? `${n} philosophers` : `${n} 位哲学家`;
  }

  // MARK: - Account

  get accountNavTitle(): string { return this.en ? 'Account & settings' : '账号与设置'; }
  get avatar(): string { return this.en ? 'Avatar' : '头像'; }
  get removeAvatar(): string { return this.en ? 'Remove avatar' : '移除头像'; }
  get accountInfo(): string { return this.en ? 'Account' : '账号信息'; }
  get nickname(): string { return this.en ? 'Display name' : '昵称'; }
  get nicknamePrompt(): string { return this.en ? 'Name shown in the app' : '用于展示的名称'; }
  get email(): string { return this.en ? 'Email' : '邮箱'; }
  get password(): string { return this.en ? 'Password' : '密码'; }
  get language(): string { return this.en ? 'Language' : '语言'; }
  get languagePickerTitle(): string { return this.en ? 'App language' : '界面语言'; }
  get simplifiedChinese(): string { return '简体中文'; }
  get english(): string { return 'English'; }
  get languageFootnote(): string {
    return this.en
      ? 'Some system UI follows the device language; in-app labels use your choice here.'
      : '部分系统组件仍随系统语言；此处选择决定应用内可见文案语言。';
  }

  // MARK: - Login / register

  get loginTitle(): string { return this.en ? 'Login' : '登录'; }
  get registerTitle(): string { return this.en ? 'Register' : '注册账号'; }
  get loginSubtitle(): string { return this.en ? 'Enter your cognitive arena' : '进入你的认知竞技场'; }
  get registerSubtitle(): string { return this.en ? 'Create your mind profile account' : '创建你的思维画像账号'; }
  get loginAccountLabel(): string { return this.en ? 'Nickname or email' : '昵称或邮箱'; }
  get loginAccountPlaceholder(): string { return this.en ? 'Enter nickname or email' : '输入昵称或邮箱'; }
  get emailPlaceholder(): string { return this.en ? 'Enter email' : '输入邮箱'; }
  get passwordPlaceholder(): string { return this.en ? 'Enter password' : '输入密码'; }
  get loginSubmit(): string { return this.en ? 'Login' : '登录'; }
  get registerSubmit(): string { return this.en ? 'Register & login' : '注册并登录'; }
  get loginProcessing(): string { return this.en ? 'Processing…' : '处理中...'; }
  get hasAccount(): string { return this.en ? 'Already have an account?' : '已有账号？'; }
  get noAccount(): string { return this.en ? "Don't have an account?" : '还没有账号？'; }
  get loginNow(): string { return this.en ? 'Login now' : '直接登录'; }
  get registerNow(): string { return this.en ? 'Register now' : '立即注册'; }
  get errorGeneric(): string {
    return this.en ? 'Something went wrong. Please try again.' : '操作失败，请稍后重试';
  }
  get errorUserNotExist(): string {
    return this.en ? 'Account not found. Check your nickname or email.' : '用户不存在，请检查昵称或邮箱';
  }
  get errorPassword(): string { return this.en ? 'Incorrect password.' : '密码错误'; }
  get errorUserExist(): string { return this.en ? 'This account already exists.' : '用户已存在'; }
  get errorEmailTaken(): string { return this.en ? 'This email is already registered.' : '该邮箱已被注册'; }
  get errorNicknameTaken(): string { return this.en ? 'This nickname is already taken.' : '该昵称已被使用'; }
  get errorParam(): string {
    return this.en ? 'Invalid input. Please check and try again.' : '输入有误，请检查后重试';
  }

  apiErrorMessage(code: number, serverMessage: string): string {
    switch (code) {
      case 400: return this.errorParam;
      case 1001: return this.errorUserExist;
      case 1002: return this.errorUserNotExist;
      case 1003: return this.errorPassword;
      default:
        break;
    }
    switch (serverMessage) {
      case '用户不存在': return this.errorUserNotExist;
      case '密码错误': return this.errorPassword;
      case '用户已存在': return this.errorUserExist;
      case '该邮箱已被注册': return this.errorEmailTaken;
      case '该昵称已被使用': return this.errorNicknameTaken;
      default:
        return serverMessage.length === 0 ? this.errorGeneric : serverMessage;
    }
  }

  get profileGuestTitle(): string { return this.en ? 'Your mind profile' : '你的思维画像'; }
  get profileGuestHint(): string {
    return this.en
      ? 'Login to view your personalized mind analysis.'
      : '登录后即可查看属于你的个性化思维分析。';
  }
  get profileLoginRegister(): string { return this.en ? 'Login / Register' : '登录 / 注册'; }
  get saveNote(): string { return this.en ? 'Save note' : '保存笔记'; }
  get savingNote(): string { return this.en ? 'Saving…' : '保存中…'; }
  get loginToSaveNote(): string { return this.en ? 'Login to save' : '登录后保存'; }
  get noteSaved(): string { return this.en ? 'Note saved' : '笔记已保存'; }
  get personalNotes(): string { return this.en ? 'Personal notes' : '个人笔记'; }
  get notesPlaceholder(): string {
    return this.en ? 'Record your thoughts from this debate…' : '记录你对这次辩论的思考…';
  }
  get aiGenerateBattle(): string { return this.en ? 'AI generate topic' : 'AI 智能出题'; }
  get aiGenerating(): string { return this.en ? 'Generating…' : '生成中…'; }
  get logout(): string { return this.en ? 'Log out' : '退出登录'; }
  get profileSaved(): string { return this.en ? 'Profile saved' : '资料已保存'; }
  get emailReadOnlyHint(): string {
    return this.en ? 'Email is used for login and cannot be changed here.' : '邮箱用于登录，此处不可修改。';
  }
  get loginToManageAccount(): string {
    return this.en ? 'Please log in to manage your account.' : '请先登录后再管理账号信息。';
  }
  get accountSettingsMacOnly(): string {
    return this.en
      ? 'Account settings are available on iPhone and iPad.'
      : '账号设置请在 iPhone / iPad 应用中使用。';
  }

  get settingsSearchPlaceholder(): string { return this.en ? 'Search settings…' : '搜索设置…'; }
  get settingsNavGeneral(): string { return this.en ? 'General' : '通用'; }
  get settingsNavSubscription(): string { return this.en ? 'Plan & Billing' : '订阅方案'; }
  get settingsNavLanguage(): string { return this.en ? 'Language' : '语言'; }
  get settingsNavAppearance(): string { return this.en ? 'Appearance' : '外观'; }
  get settingsNavNotifications(): string { return this.en ? 'Notifications' : '通知'; }
  get settingsPlanFree(): string { return this.en ? 'Free' : '免费版'; }
  get settingsDefaultUser(): string { return this.en ? 'Arena Player' : '认知竞技者'; }
  get settingsSectionAccount(): string { return this.en ? 'Account' : '账户'; }
  get settingsAccountType(): string { return this.en ? 'Account Type' : '账户类型'; }
  get settingsAccountTypeDesc(): string { return this.en ? 'Currently on Free plan' : '当前使用免费版'; }
  get settingsUpgrade(): string { return this.en ? 'Upgrade' : '升级'; }
  get settingsDataPrivacy(): string { return this.en ? 'Data & Privacy' : '数据与隐私'; }
  get settingsDataPrivacyDesc(): string { return this.en ? 'Manage your learning data' : '管理你的学习数据'; }
  get settingsManage(): string { return this.en ? 'Manage' : '管理'; }
  get settingsSectionPreferences(): string { return this.en ? 'Preferences' : '偏好设置'; }
  get settingsAutoSave(): string { return this.en ? 'Auto-save debate history' : '自动保存辩论记录'; }
  get settingsAutoSaveDesc(): string {
    return this.en ? 'Save results to mind profile automatically' : '辩论结束后自动保存到思维画像';
  }
  get settingsSound(): string { return this.en ? 'Sound Effects' : '声音效果'; }
  get settingsSoundDesc(): string { return this.en ? 'Auditory feedback for interactions' : '交互音效反馈'; }
  get settingsTimer(): string { return this.en ? 'Show Thinking Timer' : '显示思考时间'; }
  get settingsTimerDesc(): string {
    return this.en ? 'Display countdown during debates' : '在辩论时显示作答倒计时';
  }
  get settingsSubscriptionLead(): string {
    return this.en
      ? 'Unlock the full cognitive training experience and level up your thinking.'
      : '解锁完整认知训练体验，加速思维升级';
  }
  get settingsPlanPeriod(): string { return this.en ? '/mo' : '/月'; }
  get settingsPlanPro(): string { return this.en ? 'Pro' : '专业版'; }
  get settingsPlanElite(): string { return this.en ? 'Elite' : '精英版'; }
  get settingsPlanFreeDesc(): string {
    return this.en ? 'Start exploring cognitive sparring' : '探索认知对抗的起点';
  }
  get settingsPlanProDesc(): string { return this.en ? 'Deep cognitive training' : '深度认知训练体验'; }
  get settingsPlanEliteDesc(): string {
    return this.en ? 'Top-tier cognitive arena experience' : '顶级认知竞技体验';
  }
  get settingsPlanFreePrice(): string { return '¥0'; }
  get settingsPlanProPrice(): string { return '¥29'; }
  get settingsPlanElitePrice(): string { return '¥89'; }

  settingsPlanDesc(id: string): string {
    switch (id) {
      case 'free': return this.settingsPlanFreeDesc;
      case 'pro': return this.settingsPlanProDesc;
      default: return this.settingsPlanEliteDesc;
    }
  }

  settingsPlanPrice(id: string): string {
    switch (id) {
      case 'free': return this.settingsPlanFreePrice;
      case 'pro': return this.settingsPlanProPrice;
      default: return this.settingsPlanElitePrice;
    }
  }

  settingsPlanName(id: string): string {
    switch (id) {
      case 'free': return this.settingsPlanFree;
      case 'pro': return this.settingsPlanPro;
      default: return this.settingsPlanElite;
    }
  }

  settingsPlanFeatures(id: string): string[] {
    if (this.en) {
      switch (id) {
        case 'free':
          return ['5 debates per day', 'Basic mind profile', '3 philosophers'];
        case 'pro':
          return [
            'Unlimited debates',
            'Full mind profile analysis',
            'All philosophers unlocked',
            'Roundtable debate mode',
            'Flashcards & quizzes',
          ];
        default:
          return [
            'Everything in Pro',
            'AI deep feedback reports',
            'Weekly bias digest',
            'Early access to new features',
            'Exclusive community',
          ];
      }
    }
    switch (id) {
      case 'free':
        return ['每日 5 场辩论', '基础思维画像', '3 位思想家'];
      case 'pro':
        return [
          '无限场次辩论',
          '完整思维画像分析',
          '全部思想家解锁',
          '圆桌辩论模式',
          '闪卡与测验生成',
        ];
      default:
        return [
          '专业版全部功能',
          'AI 深度反馈报告',
          '认知偏差周报',
          '优先体验新功能',
          '专属社群',
        ];
    }
  }

  settingsUpgradeTo(planName: string): string {
    return this.en ? `Upgrade to ${planName}` : `升级到${planName}`;
  }

  get settingsCurrentPlan(): string { return this.en ? 'Current' : '当前方案'; }
  get settingsInterfaceLanguage(): string { return this.en ? 'Interface Language' : '界面语言'; }
  get settingsSystemLanguageNote(): string {
    return this.en ? 'The app follows your device language.' : '应用跟随系统语言，可在系统设置中切换。';
  }
  get settingsColorTheme(): string { return this.en ? 'Color Theme' : '颜色主题'; }
  get settingsThemeDark(): string { return this.en ? 'Dark' : '深色'; }
  get settingsThemeDarker(): string { return this.en ? 'Darker' : '更深'; }
  get settingsThemeMidnight(): string { return this.en ? 'Midnight' : '午夜'; }
  get settingsLayoutDensity(): string { return this.en ? 'Layout Density' : '布局密度'; }
  get settingsCompact(): string { return this.en ? 'Compact Mode' : '紧凑模式'; }
  get settingsCompactDesc(): string {
    return this.en ? 'Reduce spacing to show more content' : '减少间距，显示更多内容';
  }
  get settingsAnimations(): string { return this.en ? 'Animations' : '动画效果'; }
  get settingsAnimationsDesc(): string { return this.en ? 'UI transition animations' : '界面过渡动画'; }
  get settingsNotificationSection(): string { return this.en ? 'Notification Settings' : '通知设置'; }
  get settingsNotifyDaily(): string { return this.en ? 'Daily Mind Challenge' : '每日思维挑战'; }
  get settingsNotifyDailyDesc(): string {
    return this.en ? 'Receive a new debate topic each day' : '每天推送一个新的辩论题目';
  }
  get settingsNotifyWeekly(): string { return this.en ? 'Weekly Mind Report' : '周度思维报告'; }
  get settingsNotifyWeeklyDesc(): string {
    return this.en ? 'Get cognitive bias analysis every Monday' : '每周一收到认知偏差分析报告';
  }
  get settingsNotifyUpdates(): string { return this.en ? 'Feature Updates' : '新功能更新'; }
  get settingsNotifyUpdatesDesc(): string {
    return this.en ? 'Get notified when new features launch' : '当有新的思想家或模式上线时通知';
  }

  // MARK: - Disciplines

  get disciplinesHeroTitle(): string { return this.en ? 'Are you sure you thought it through?' : '你真的想对了吗？'; }
  get disciplinesHeroSubtitle(): string {
    return this.en
      ? 'Explore cognitive clashes in business, psychology, learning, and more.'
      : '探索商业、心理学、学习方法等领域的认知对抗';
  }
  get todayFeatured(): string { return this.en ? "Today's match" : '今日推荐对局'; }
  get enterBattle(): string { return this.en ? 'Enter match →' : '进入对局 →'; }
  get allBattles(): string { return this.en ? 'All matches' : '所有对局'; }
  get cognitiveArena(): string { return this.en ? 'Cognitive Arena' : '认知竞技场'; }
  get backToPhilosophy(): string { return this.en ? 'Philosophy' : '哲学辩论'; }
  get categoriesAll(): string { return this.en ? 'All' : '全部'; }
  get categoriesBusiness(): string { return this.en ? 'Business' : '商业'; }
  get categoriesPsychology(): string { return this.en ? 'Psychology' : '心理学'; }
  get categoriesLearning(): string { return this.en ? 'Learning' : '学习方法'; }
  get categoriesHot(): string { return this.en ? 'Hot topics' : '热点问题'; }

  get disciplineCategories(): string[] {
    return [
      this.categoriesAll,
      this.categoriesBusiness,
      this.categoriesPsychology,
      this.categoriesLearning,
      this.categoriesHot,
    ];
  }

  // MARK: - Battle

  get battleNavTitle(): string { return this.en ? 'Match' : '对局'; }
  get reasonTooShortTitle(): string { return this.en ? 'Reason too short' : '理由太短'; }
  get reasonTooShortOK(): string { return this.en ? 'OK' : '好的'; }
  get apiRequestFailedTitle(): string { return this.en ? 'Request failed' : '请求失败'; }
  get alertConfirm(): string { return this.en ? 'OK' : '确定'; }
  get reasonTooShortMessage(): string {
    return this.en ? 'Write a bit more (at least 10 characters).' : '请写下更详细的理由（至少10个字）';
  }
  get battleMissing(): string { return this.en ? 'Match not found' : '对局不存在'; }
  get backToDisciplines(): string { return this.en ? 'Back to disciplines' : '返回学科辩论'; }
  get battleInProgress(): string { return this.en ? 'Match in progress' : '对局进行中'; }
  get builderSubtitle(): string { return this.en ? 'Builder' : '建构者'; }
  get breakerSubtitle(): string { return this.en ? 'Breaker' : '破坏者'; }
  get yourStance(): string { return this.en ? 'Your stance' : '你的立场'; }

  supportBuilderTitle(builder: string): string {
    return this.en ? `I support ${builder}` : '我支持 Builder';
  }

  supportBuilderSubtitle(builder: string): string {
    return this.en ? `${builder}'s view is more convincing` : '建构者的观点更有说服力';
  }

  supportBreakerTitle(breaker: string): string {
    return this.en ? `I support ${breaker}` : '我支持 Breaker';
  }

  supportBreakerSubtitle(breaker: string): string {
    return this.en ? `${breaker}'s view is more convincing` : '破坏者的观点更有说服力';
  }

  get uncertainChoiceTitle(): string { return this.en ? "I'm not sure" : '我不确定'; }
  get uncertainChoiceSubtitle(): string {
    return this.en ? 'AI plays both Builder and Breaker in dialogue' : '由 AI 扮演正反双方与你对话';
  }
  get startDialogue(): string { return this.en ? 'Start dialogue' : '开始对话'; }
  get dialogueHint(): string {
    return this.en
      ? 'State your view in chat; AI plays the other side—or both if undecided.'
      : '在对话中阐述观点；AI 将扮演对方或正反双方。';
  }
  get dialogueEmpty(): string { return this.en ? 'Send your first message to begin.' : '发送第一条消息，开始辩论。'; }
  get dialoguePlaceholder(): string {
    return this.en ? 'Your argument or question…' : '输入你的观点、反驳或疑问…';
  }
  get endDebate(): string { return this.en ? 'End debate & summary' : '结束辩论并查看总结'; }
  get endDebateHint(): string {
    return this.en ? 'Complete at least one round before ending.' : '至少完成一轮对话后可结束。';
  }
  get summaryGenerating(): string { return this.en ? 'Generating summary…' : '正在生成总结…'; }
  get disciplineTurnFailed(): string { return this.en ? 'This turn failed.' : '本轮对话失败，请重试。'; }
  get disciplineSummaryFailed(): string { return this.en ? 'Summary failed.' : '总结生成失败，请重试。'; }
  get explainReasonTitle(): string { return this.en ? 'Explain your reasoning' : '说明你的理由'; }
  get explainReasonSubtitle(): string {
    return this.en
      ? 'Not picking an answer—explain why you lean this way. That\'s the core of thinking.'
      : '不是选答案，是解释你为什么这么选。这是思考的关键环节。';
  }

  characterCount(n: number): string {
    return this.en ? `${n} characters` : `${n} 字`;
  }

  get submitReason(): string { return this.en ? 'Submit' : '提交理由'; }
  get calmJudge(): string { return this.en ? 'Calm examiner' : '冷静的考官'; }

  judgeFollowUp(index: number, total: number): string {
    return this.en ? `Judge follow-up ${index + 1} / ${total}` : `Judge 追问 ${index + 1} / ${total}`;
  }

  get continueThinking(): string { return this.en ? 'Continue' : '继续思考'; }
  get viewFullAnalysis(): string { return this.en ? 'View full analysis' : '查看完整分析'; }
  get fullPerspective(): string { return this.en ? 'Full perspective' : '完整视角'; }
  get fullPerspectiveSubtitle(): string {
    return this.en ? 'After reflection, here is a fuller analysis.' : '经过思考后，这是一个更完整的分析';
  }
  get backHome(): string { return this.en ? 'Home' : '返回首页'; }
  get viewMindProfile(): string { return this.en ? 'Mind profile' : '查看思维画像'; }

  // MARK: - Philosophy battle

  get philosophyNavTitle(): string { return this.philosophyDebate; }
  get philosopherMissing(): string { return this.en ? 'Philosopher not found' : '思想家不存在'; }
  get backToPhilosophyHome(): string { return this.en ? 'Back' : '返回哲学辩论'; }
  get agentDisclaimer(): string {
    return this.en ? 'Topic and views are generated by the backend model.' : '辩题与观点由后端大模型生成';
  }
  get topicGenerating(): string { return this.en ? 'Loading topic from server…' : '正在从服务器生成辩题…'; }
  get tablePreparing(): string { return this.en ? 'The debate table is being prepared…' : '辩论桌正在准备中'; }

  philosopherThinking(name: string): string {
    return this.en ? `${name} is thinking…` : `「${name}」正在思考中`;
  }

  get judgeThinking(): string { return this.en ? 'Judge is thinking…' : 'Judge 正在思考中'; }
  get philosophyPhilosopherToUserTask(): string {
    return this.en
      ? 'The user just spoke. Reply as the philosopher in first person only. Do not output Judge content.'
      : '用户本轮已发言。仅以该哲学家第一人称回应用户，不要生成 Judge 内容。';
  }
  get philosophyJudgeStepTask(): string {
    return this.en
      ? 'Read the history including the latest user and philosopher messages. As Judge, decide whether to intervene. Do not speak as the philosopher.'
      : '阅读对话历史（含用户与哲学家刚才的发言）。你作为 Judge 决定是否介入引导双方。不替哲学家发言。';
  }
  get philosophyPhilosopherToJudgeTask(): string {
    return this.en
      ? 'The Judge has questioned the philosopher (see last Judge line). Reply as the philosopher in first person to the Judge only.'
      : 'Judge 已向哲学家追问（见历史最后一条 Judge）。请以该哲学家第一人称回应 Judge，不要回应用户，不要生成 Judge 内容。';
  }
  get topicRetry(): string { return this.en ? 'Retry' : '重试'; }
  get summaryMissing(): string {
    return this.en
      ? 'The model did not return a summary. Check the backend and try again.'
      : '模型未能生成总结，请检查后端服务后重试。';
  }
  get topicBadJson(): string {
    return this.en ? 'The model returned invalid JSON.' : '模型返回的 JSON 无效或不完整。';
  }

  philosopherStanceTitle(name: string): string {
    return this.en ? `${name}'s stance` : `${name} 立场`;
  }

  get oppositeStance(): string { return this.en ? 'Counter stance' : '反方立场'; }
  get startDebate(): string { return this.en ? 'Start debate' : '开始辩论'; }
  get yourStanceQuestion(): string { return this.en ? 'Your stance?' : '你的立场？'; }
  get debateFlowHint(): string {
    return this.en ? 'You\'ll debate in multiple rounds; keep adding your thoughts.' : '接下来会进入多轮辩论，可连续输入观点';
  }
  get agree(): string { return this.en ? 'Agree' : '同意'; }
  get disagree(): string { return this.en ? 'Disagree' : '不同意'; }
  get uncertain(): string { return this.en ? 'Uncertain' : '不确定'; }
  get debateRoundHint(): string {
    return this.en
      ? 'You debate directly with the philosopher; the judge may step in to guide both sides.'
      : '你与哲学家直接对辩；裁判在旁观察，必要时介入引导双方';
  }
  get philosophyTurnTask(): string {
    return this.en
      ? 'User spoke. philosopherReplyToUser required every round (direct debate). Judge may intervene (judgeSpeaks); addressTo marks who you mainly question—never silence the philosopher. addressTo=philosopher → also philosopherReplyToJudge. Set continueDebate.'
      : '用户已发言。philosopherReplyToUser 每轮必填（你与哲学家直接辩论）。Judge 可介入引导双方；addressTo 表示追问重点，不得让哲学家沉默。addressTo=philosopher 时另填 philosopherReplyToJudge。设置 continueDebate。';
  }
  get philosophyTurnCriteria(): string {
    return this.en
      ? 'Return philosopherReplyToUser, judgeSpeaks, judgeMessage, addressTo, philosopherReplyToJudge, continueDebate'
      : '返回 philosopherReplyToUser、judgeSpeaks、judgeMessage、addressTo、philosopherReplyToJudge、continueDebate';
  }
  get philosophyTurnConstraints(): string {
    return this.en ? 'Chinese; JSON only; continueDebate is boolean' : '中文；仅返回 JSON；continueDebate 为布尔值';
  }
  get currentDebateTopic(): string { return this.en ? 'Current topic' : '当前议题'; }
  get agentThinking(): string { return this.en ? 'Agent thinking…' : 'Agent 思考中...'; }
  get continueYourThought(): string { return this.en ? 'Add your next thought…' : '继续输入你的观点...'; }
  get goToSummary(): string { return this.en ? 'Summary' : '进入总结'; }
  get fullAnalysis(): string { return this.en ? 'Full analysis' : '完整分析'; }
  get agentGeneratingSummary(): string { return this.en ? 'Generating summary…' : 'Agent 正在生成总结...'; }

  choiceDisplay(c: PhilosophyChoice): string {
    switch (c) {
      case PhilosophyChoice.AGREE: return this.agree;
      case PhilosophyChoice.DISAGREE: return this.disagree;
      case PhilosophyChoice.UNCERTAIN: return this.uncertain;
      default: return this.uncertain;
    }
  }

  judgeOpeningAfterChoice(choiceText: string): string {
    if (this.en) {
      return `You chose "${choiceText}". State your first round of reasoning.`;
    }
    return `你选择了「${choiceText}」。请先陈述你的第一轮理由。`;
  }

  // MARK: - Debate summary

  get debateSummaryTitle(): string { return this.en ? 'Debate recap' : '辩论小结'; }
  get corePoints(): string { return this.en ? 'Key takeaways' : '核心观点提炼'; }
  get stanceCompare(): string { return this.en ? 'Stance comparison' : '立场对比'; }

  philosopherStanceLabel(name: string): string {
    return this.en ? `${name}'s stance` : `${name}的立场`;
  }

  get yourStanceLabel(): string { return this.en ? 'Your stance' : '你的立场'; }

  alignmentLabel(text: string): string {
    return this.en ? `Alignment: ${text}` : `一致性评估：${text}`;
  }

  get deepQuestions(): string { return this.en ? 'Questions to go deeper' : '深度思考问题'; }

  agreeWith(name: string): string {
    return this.en ? `Agree with ${name}` : `同意${name}`;
  }

  get opposeStance(): string { return this.en ? 'Opposing stance' : '持反对立场'; }
  get expressedUncertainty(): string { return this.en ? 'Expressed uncertainty' : '表示不确定'; }
  get defaultCoreIdea(): string { return this.en ? 'Core idea' : '核心思想'; }

  corePointPhilosopher(name: string, idea: string): string {
    return this.en ? `${name}'s core idea: ${idea}` : `${name}的核心观点：${idea}`;
  }

  get corePointOpposite(): string {
    return this.en
      ? 'The counter stance stresses pragmatism and real-world constraints.'
      : '反方立场强调实用性和现实考量';
  }

  corePointYourChoice(choice: string): string {
    return this.en ? `You chose ${choice}, showing your leaning.` : `你选择了${choice}，展示了你的思考倾向`;
  }

  defaultPhilosopherStance(name: string): string {
    return this.en ? `${name}'s philosophical stance` : `${name}的哲学立场`;
  }

  get alignmentHigh(): string { return this.en ? 'Strongly aligned' : '高度一致'; }
  get alignmentOppose(): string { return this.en ? 'Opposed' : '对立'; }
  get alignmentExploring(): string { return this.en ? 'Still exploring' : '尚在探索'; }

  deepQModern(name: string): string {
    return this.en
      ? `If ${name} lived today, how might they see this issue?`
      : `如果${name}生活在现代，他会如何看待这个问题？`;
  }

  get deepQChangeMind(): string {
    return this.en ? 'Under what conditions might your stance change?' : '你的立场在什么情况下可能会改变？';
  }

  get deepQDailyLife(): string {
    return this.en ? 'What practical impact does this have on daily life?' : '这个问题对你的日常生活有什么实际影响？';
  }

  // MARK: - Philosopher sheet

  get coreThought(): string { return this.en ? 'Core ideas' : '核心思想'; }
  get keyConcepts(): string { return this.en ? 'Key concepts' : '关键概念'; }
  get majorWorks(): string { return this.en ? 'Major works' : '代表著作'; }
  get influencedBy(): string { return this.en ? 'Influenced by' : '受其影响'; }
  get influenced(): string { return this.en ? 'Influenced' : '影响了'; }
  get startPhilosophyBattle(): string { return this.en ? 'Start philosophy debate' : '开始哲学辩论'; }
  get philosopherNavTitle(): string { return this.en ? 'Philosopher' : '思想家'; }

  // MARK: - Mind profile

  get mindProfileNavTitle(): string { return this.mindProfile; }
  get mindProfileTitle(): string { return this.en ? 'Your mind profile' : '你的思维画像'; }
  get mindProfileSubtitle(): string { return this.en ? 'Understand how you think' : '认识自己的思考方式'; }
  get biasMapTitle(): string { return this.en ? 'Your bias map' : '你的思维偏差地图'; }
  get biasMapFootnote(): string {
    return this.en
      ? 'Based on your match choices and reasons. Noticing bias is the first step to better thinking.'
      : '这些数据基于你在对局中的选择和理由。认识到自己的偏差，是改进思维的第一步。';
  }

  occurrences(n: number): string {
    return this.en ? `${n} times` : `${n} 次出现`;
  }

  get keyInsights(): string { return this.en ? 'Key insights' : '关键洞察'; }
  get insightWatchOutTitle(): string { return this.en ? 'Watch out' : '需要注意'; }
  get insightWatchOutBody(): string {
    return this.en
      ? 'In many cases you tend to skip counter-evidence. Try actively seeking views that challenge yours.'
      : '在 72% 的情况下，你倾向于忽略反例和相反证据。尝试主动寻找挑战你观点的信息。';
  }
  get insightStrengthTitle(): string { return this.en ? 'Strength' : '优势'; }
  get insightStrengthBody(): string {
    return this.en
      ? 'You\'ve changed stance several times—sign of openness, a key trait of sound reasoning.'
      : '你愿意改变立场（7次改变），说明你具有开放的心态。这是理性思考的重要品质。';
  }
  get recentThoughts(): string { return this.en ? 'Recent reflections' : '最近的思考记录'; }
  get stanceChanged(): string { return this.en ? 'Stance changed' : '已改变立场'; }
  get yourPick(): string { return this.en ? 'Your choice' : '你的选择'; }
  get judgeFollowUpShort(): string { return this.en ? 'Judge\'s follow-up' : 'Judge 的追问'; }
  get growthQuote(): string {
    return this.en
      ? '"I see how naive I used to be"—that feeling is growth.'
      : '"我以前想得有多不成熟" — 这是成长感的来源';
  }

  localizeMindStatLabel(label: string): string {
    if (!this.en) {
      return label;
    }
    switch (label) {
      case '已完成对局': return 'Matches completed';
      case '改变立场次数': return 'Stance changes';
      case '思维盲区': return 'Blind spots';
      case '准确判断率': return 'Accuracy';
      default: return label;
    }
  }

  localizeBiasName(name: string): string {
    if (!this.en) {
      return name;
    }
    switch (name) {
      case '确认偏差': return 'Confirmation bias';
      case '权威依赖': return 'Authority bias';
      case '过度自信': return 'Overconfidence';
      case '忽略反例': return 'Ignoring counterexamples';
      case '二元思维': return 'Binary thinking';
      default: return name;
    }
  }

  localizeBiasDescription(text: string): string {
    if (!this.en) {
      return text;
    }
    switch (text) {
      case '倾向于寻找支持已有观点的证据':
        return 'Tendency to seek evidence that supports prior beliefs';
      case '容易被权威或逻辑清晰的论述说服':
        return 'Easily persuaded by authority or crisp logic';
      case '在不确定的情况下表现出过高的确定性':
        return 'Shows high certainty when evidence is thin';
      case '倾向于忽视与观点相悖的案例':
        return 'Tends to overlook cases against one\'s view';
      case '倾向于用非黑即白的方式看待问题':
        return 'Tends to see issues in black-and-white terms';
      default: return text;
    }
  }

  localizeRecentChoice(choice: string): string {
    if (!this.en) {
      return choice;
    }
    switch (choice) {
      case '我不确定': return 'Uncertain';
      case '支持 Breaker': return 'Support Breaker';
      case '支持 Builder': return 'Support Builder';
      default: return choice;
    }
  }

  localizeRecentQuestion(q: string): string {
    if (!this.en) {
      return q;
    }
    switch (q) {
      case '努力 vs 选择，哪个更重要？': return 'Effort vs choice—which matters more?';
      case '多任务处理真的有效吗？': return 'Is multitasking really effective?';
      case 'AI 会让人变笨吗？': return 'Does AI make people think less?';
      default: return q;
    }
  }

  localizeRecentJudge(c: string): string {
    if (!this.en) {
      return c;
    }
    switch (c) {
      case '你忽略了时间维度': return 'You skipped the time dimension.';
      case '你的假设是所有任务都需要高认知': return 'You assumed all tasks need high cognition.';
      case '你混淆了工具和依赖性': return 'You conflated tools with dependence.';
      default: return c;
    }
  }

  // MARK: - Roundtable

  get roundtableNavTitle(): string { return this.roundtableDebate; }
  get backToHome(): string { return this.en ? 'Home' : '返回主页'; }
  get roundtableHeadline(): string { return this.en ? 'Multi-philosopher roundtable' : '多哲学家圆桌辩论'; }
  get pickThinkers(): string { return this.en ? 'Pick philosophers' : '选择哲学家'; }
  get viewAllPhilosophers(): string { return this.en ? 'All' : '全部'; }
  get roundtablePickerTitle(): string { return this.en ? 'Choose philosophers' : '选择哲学家'; }
  get roundtablePickerHint(): string {
    return this.en ? 'Full catalog from Philosophy Debate — pick 2–4' : '与哲学辩论相同的全量目录，可选 2–4 位';
  }

  roundtablePickerCount(total: number, count: number): string {
    return this.en ? `${total} total · ${count} / 4 selected` : `共 ${total} 位 · 已选 ${count} / 4`;
  }

  get roundtablePickerConfirm(): string { return this.en ? 'Confirm selection' : '确认选择'; }
  get roundtableSearchPlaceholder(): string {
    return this.en ? 'Search by name or school…' : '搜索哲学家姓名或学派…';
  }
  get pickThinkersHint(): string { return this.en ? '(2–4, any era)' : '（2-4位，可跨时空）'; }

  selectedCount(n: number): string {
    return this.en ? `Selected ${n} / 4` : `已选择 ${n} / 4`;
  }

  get picked(): string { return this.en ? '✓ Selected' : '✓ 已选择'; }
  get pickTopic(): string { return this.en ? 'Pick or enter a topic' : '选择或输入辩题'; }
  get customTopicLabel(): string { return this.en ? 'Or type your own topic:' : '或者，输入你自己的辩题：'; }
  get customTopicPlaceholder(): string {
    return this.en
      ? 'e.g. Does the metaverse make people escape reality?'
      : '例如：元宇宙是否会导致人类逃避现实？';
  }
  get startRoundtable(): string { return this.en ? 'Start roundtable' : '开始圆桌辩论'; }
  get roundtableSetupError(): string {
    return this.en ? 'Pick at least 2 philosophers and a topic.' : '请至少选择2位哲学家并设定辩题';
  }
  get participants(): string { return this.en ? 'Participants:' : '参与者：'; }
  get thinkersThinking(): string { return this.en ? 'Philosophers are reflecting…' : '哲学家们正在思考...'; }

  roundtablePhilosopherThinking(name: string): string {
    return this.en ? `${name} is thinking…` : `「${name}」正在思考中`;
  }

  get roundtableInputPlaceholder(): string {
    return this.en ? 'Interject or add a new angle…' : '插话或提出新的观点...';
  }
  get roundtableOpeningFailed(): string {
    return this.en ? 'Could not generate opening statements from the server.' : '无法从服务器生成开场发言。';
  }
  get roundtableReplyFailed(): string {
    return this.en ? 'Could not generate replies; your message was restored.' : '无法生成回应，已恢复你输入的内容。';
  }

  presetTopic(id: string): PresetTopicResult {
    switch (id) {
      case 'ai-free-will':
        return this.en
          ? new PresetTopicResult('Will AI replace human free will?', 'AI, consciousness, and freedom of choice.')
          : new PresetTopicResult('AI是否会取代人类自由意志？', '探讨人工智能、意识与自由选择的关系');
      case 'utopia':
        return this.en
          ? new PresetTopicResult('Absolute equality or liberty in an ideal society?', 'Justice, fairness, and individual rights.')
          : new PresetTopicResult('理想社会应该追求绝对平等还是自由？', '关于正义、公平与个人权利的永恒辩论');
      case 'truth':
        return this.en
          ? new PresetTopicResult('Does objective truth exist?', 'Core epistemology: the nature of truth.')
          : new PresetTopicResult('客观真理是否存在？', '认识论的核心问题：真理的本质');
      case 'education':
        return this.en
          ? new PresetTopicResult('Education: train tools or whole persons?', 'Skills vs character in modern education.')
          : new PresetTopicResult('教育的目的是培养工具还是完整的人？', '人才培养vs人格教育的现代困境');
      default:
        return new PresetTopicResult('', '');
    }
  }

  // MARK: - Moral dilemma

  get dilemmaNavTitle(): string { return this.moralDilemma; }
  get dilemmaHeroKicker(): string { return this.en ? 'Moral dilemmas' : 'Moral Dilemmas'; }
  get dilemmaHeroSubtitle(): string {
    return this.en ? 'Discuss moral dilemmas with a philosopher.' : '和哲学家讨论道德困境';
  }
  get dilemmaCoreQuestionLabel(): string { return this.en ? 'Key question' : '核心提问'; }
  get dilemmaYourStanceSection(): string { return this.en ? 'Your current stance' : '你当前的立场'; }
  get dilemmaChoosePhilosopherTitle(): string {
    return this.en ? 'Pick a philosopher to discuss with' : '选择一位哲学家和你讨论';
  }
  get dilemmaChoosePhilosopherHint(): string {
    return this.en
      ? 'After you tap a card, you\'ll enter a focused chat about this dilemma.'
      : '点击哲学家卡片后，会直接进入和他围绕当前困境的讨论窗口。';
  }
  get dilemmaRecommended(): string { return this.en ? 'Recommended' : '推荐哲学家'; }
  get dilemmaAllPhilosophers(): string { return this.en ? 'All philosophers' : '全部哲学家'; }
  get dilemmaExpandPhilosophers(): string { return this.en ? 'Show more' : '展开更多'; }
  get dilemmaCollapsePhilosophers(): string { return this.en ? 'Collapse' : '收起'; }
  get dilemmaFeaturedBadge(): string { return this.en ? 'Featured' : '推荐'; }
  get dilemmaRechoosePhilosopher(): string { return this.en ? 'Pick another philosopher' : '重新选择哲学家'; }
  get dilemmaCurrentDilemmaLabel(): string { return this.en ? 'Current dilemma' : '当前困境'; }
  get dilemmaDiscussionNote(): string {
    return this.en
      ? 'Discussion proceeds as philosopher reply + Judge follow-up, like the debate flow.'
      : '讨论会按“哲学家回应 + Judge 追问”的方式推进，和辩论窗口保持一致。';
  }
  get dilemmaThinking(): string {
    return this.en ? 'Philosopher and Judge are thinking…' : '哲学家与 Judge 正在思考...';
  }

  dilemmaInputPlaceholder(name: string): string {
    return this.en
      ? `Press ${name} further, or add your reasoning…`
      : `继续追问 ${name}，或者补充你的理由...`;
  }

  dilemmaRevealLine(option: string, philosopher: string): string {
    return this.en
      ? `You chose: ${option}. Discussing with ${philosopher}.`
      : `你选择的是「${option}」，讨论对象是 ${philosopher}。`;
  }

  dilemmaJudgeOpening(optionLabel: string): string {
    return this.en
      ? `You chose "${optionLabel}". Explain your reasoning and respond to the sharpest objection to your view.`
      : `你当前选择了"${optionLabel}"。请先说明你的理由，并尝试回应这个困境最尖锐的反对意见。`;
  }

  get dilemmaContinueWithPhilosopher(): string {
    return this.en ? 'Discuss with another philosopher' : '继续换哲学家讨论';
  }
}
