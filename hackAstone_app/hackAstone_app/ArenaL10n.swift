import Foundation

/// 中英界面文案（由 `AppLocaleStore.languageCode` 驱动）。
struct ArenaL10n {
    var languageCode: String
    var prefersEnglish: Bool { languageCode.hasPrefix("en") }

    private var en: Bool { prefersEnglish }

    // MARK: - Common

    var done: String { en ? "Done" : "完成" }
    var close: String { en ? "Close" : "关闭" }
    var back: String { en ? "Back" : "返回" }
    var send: String { en ? "Send" : "发送" }
    var you: String { en ? "You" : "你" }
    var judge: String { en ? "Judge" : "裁判" }
    var user: String { en ? "User" : "用户" }

    // MARK: - Home

    var homeSubtitle: String { en ? "Cross-era dialogue of ideas" : "跨时空思想对话场" }
    var roundtableDebate: String { en ? "Roundtable" : "圆桌辩论" }
    var moralDilemma: String { en ? "Dilemmas" : "道德困境" }
    var mindProfile: String { en ? "Mind profile" : "思维画像" }
    var philosophyDebate: String { en ? "Philosophy" : "哲学辩论" }
    var disciplinesDebate: String { en ? "Disciplines" : "学科辩论" }
    var heroMapTitle: String { en ? "Pick an era and ideas on the world map" : "在世界地图上挑选时代与思想" }
    var heroMapSubtitle: String {
        en
            ? "Choose a time period, tap a region, and see philosophers active in that phase."
            : "先选时间，再点大洲区域，就能看到这个阶段活跃的哲学家。"
    }
    var timelineTitle: String { en ? "Timeline" : "时间轴" }
    var footerTagline: String {
        en ? "Cognitive Arena · map, time, and ideas together" : "Cognitive Arena · 让世界地图、时间与思想连起来"
    }
    var noPhilosophersInRegion: String { en ? "No philosophers to show for" : "目前没有可展示的哲学家。" }
    func noPhilosophersSentence(periodLabel: String, regionName: String) -> String {
        if en { return "No philosophers to show for \(regionName) in \(periodLabel)." }
        return "\(periodLabel) 的 \(regionName) 目前没有可展示的哲学家。"
    }
    var backToMap: String { en ? "Back to map" : "返回地图" }

    func regionName(id: String) -> String {
        if !en {
            return CatalogMeta.regions.first { $0.id == id }?.name ?? id
        }
        switch id {
        case "Americas": return "Americas"
        case "Europe": return "Europe"
        case "Middle East": return "Middle East"
        case "South Asia": return "South Asia"
        case "East Asia": return "East Asia"
        default: return id
        }
    }

    func periodLabel(_ p: CatalogTimePeriodMeta) -> String {
        if !en { return p.label }
        switch p.id {
        case "all": return "All"
        case "bce-6": return "6th century BCE"
        case "bce-5": return "5th century BCE"
        case "bce-4": return "4th century BCE"
        case "bce-3": return "3rd century BCE"
        case "2nd": return "2nd century CE"
        case "5th": return "5th century CE"
        case "11th": return "11th century CE"
        case "12th": return "12th century CE"
        case "13th": return "13th century CE"
        case "17th": return "17th century CE"
        case "18th": return "18th century CE"
        case "19th": return "19th century CE"
        case "20th": return "20th century CE"
        default: return p.label
        }
    }

    func periodEra(_ p: CatalogTimePeriodMeta) -> String {
        if !en { return p.era }
        switch p.era {
        case "跨时代": return "All eras"
        case "古代": return "Ancient"
        case "古典晚期": return "Late antiquity"
        case "中古": return "Medieval"
        case "近代": return "Early modern"
        case "现代": return "Modern"
        default: return p.era
        }
    }

    func describePeriod(_ p: CatalogTimePeriodMeta) -> String {
        if p.showAll == true {
            return en ? "Showing philosophers from all time periods" : "显示全部时代的哲学家"
        }
        let s = p.startYear ?? 0
        let e = p.endYear ?? 0
        return en ? "\(s) – \(e)" : "\(s) 至 \(e)"
    }

    var timelineEraTags: [String] {
        en
            ? ["Ancient", "Late antiquity", "Medieval", "Early modern", "Modern", "Cross-region", "All"]
            : ["古代", "古典晚期", "中古", "近代", "现代", "跨地域", "全部"]
    }

    // MARK: - World map section

    var worldMapTitle: String { en ? "World map" : "世界地图" }
    var noFiguresShort: String { en ? "None" : "暂无人物" }
    func philosopherCount(_ n: Int) -> String {
        en ? "\(n) philosophers" : "\(n) 位哲学家"
    }

    // MARK: - Account (iOS)

    var accountNavTitle: String { en ? "Account & settings" : "账号与设置" }
    var avatar: String { en ? "Avatar" : "头像" }
    var removeAvatar: String { en ? "Remove avatar" : "移除头像" }
    var accountInfo: String { en ? "Account" : "账号信息" }
    var nickname: String { en ? "Display name" : "昵称" }
    var nicknamePrompt: String { en ? "Name shown in the app" : "用于展示的名称" }
    var email: String { en ? "Email" : "邮箱" }
    var password: String { en ? "Password" : "密码" }
    var language: String { en ? "Language" : "语言" }
    var languagePickerTitle: String { en ? "App language" : "界面语言" }
    var simplifiedChinese: String { en ? "简体中文" : "简体中文" }
    var english: String { en ? "English" : "English" }
    var languageFootnote: String {
        en
            ? "Some system UI follows the device language; in-app labels use your choice here."
            : "部分系统组件仍随系统语言；此处选择决定应用内可见文案语言。"
    }
    // MARK: - Login / register（与 Web login.* 对齐）

    var loginTitle: String { en ? "Login" : "登录" }
    var registerTitle: String { en ? "Register" : "注册账号" }
    var loginSubtitle: String { en ? "Enter your cognitive arena" : "进入你的认知竞技场" }
    var registerSubtitle: String { en ? "Create your mind profile account" : "创建你的思维画像账号" }
    var loginAccountLabel: String { en ? "Nickname or email" : "昵称或邮箱" }
    var loginAccountPlaceholder: String { en ? "Enter nickname or email" : "输入昵称或邮箱" }
    var emailPlaceholder: String { en ? "Enter email" : "输入邮箱" }
    var passwordPlaceholder: String { en ? "Enter password" : "输入密码" }
    var loginSubmit: String { en ? "Login" : "登录" }
    var registerSubmit: String { en ? "Register & login" : "注册并登录" }
    var loginProcessing: String { en ? "Processing…" : "处理中..." }
    var hasAccount: String { en ? "Already have an account?" : "已有账号？" }
    var noAccount: String { en ? "Don't have an account?" : "还没有账号？" }
    var loginNow: String { en ? "Login now" : "直接登录" }
    var registerNow: String { en ? "Register now" : "立即注册" }
    var profileGuestTitle: String { en ? "Your mind profile" : "你的思维画像" }
    var profileGuestHint: String {
        en ? "Login to view your personalized mind analysis." : "登录后即可查看属于你的个性化思维分析。"
    }
    var profileLoginRegister: String { en ? "Login / Register" : "登录 / 注册" }
    var saveNote: String { en ? "Save note" : "保存笔记" }
    var savingNote: String { en ? "Saving…" : "保存中…" }
    var loginToSaveNote: String { en ? "Login to save" : "登录后保存" }
    var noteSaved: String { en ? "Note saved" : "笔记已保存" }
    var personalNotes: String { en ? "Personal notes" : "个人笔记" }
    var notesPlaceholder: String {
        en ? "Record your thoughts from this debate…" : "记录你对这次辩论的思考…"
    }
    var aiGenerateBattle: String { en ? "AI generate topic" : "AI 智能出题" }
    var aiGenerating: String { en ? "Generating…" : "生成中…" }
    var logout: String { en ? "Log out" : "退出登录" }

    var profileSaved: String { en ? "Profile saved" : "资料已保存" }
    var emailReadOnlyHint: String {
        en ? "Email is used for login and cannot be changed here." : "邮箱用于登录，此处不可修改。"
    }
    var loginToManageAccount: String {
        en ? "Please log in to manage your account." : "请先登录后再管理账号信息。"
    }
    var accountSettingsMacOnly: String {
        en ? "Account settings are available on iPhone and iPad." : "账号设置请在 iPhone / iPad 应用中使用。"
    }

    // MARK: - Disciplines

    var disciplinesHeroTitle: String { en ? "Are you sure you thought it through?" : "你真的想对了吗？" }
    var disciplinesHeroSubtitle: String {
        en
            ? "Explore cognitive clashes in business, psychology, learning, and more."
            : "探索商业、心理学、学习方法等领域的认知对抗"
    }
    var todayFeatured: String { en ? "Today’s match" : "今日推荐对局" }
    var enterBattle: String { en ? "Enter match →" : "进入对局 →" }
    var allBattles: String { en ? "All matches" : "所有对局" }
    var cognitiveArena: String { en ? "Cognitive Arena" : "认知竞技场" }
    var backToPhilosophy: String { en ? "Philosophy" : "哲学辩论" }

    var categoriesAll: String { en ? "All" : "全部" }
    var categoriesBusiness: String { en ? "Business" : "商业" }
    var categoriesPsychology: String { en ? "Psychology" : "心理学" }
    var categoriesLearning: String { en ? "Learning" : "学习方法" }
    var categoriesHot: String { en ? "Hot topics" : "热点问题" }
    var disciplineCategories: [String] {
        [categoriesAll, categoriesBusiness, categoriesPsychology, categoriesLearning, categoriesHot]
    }

    // MARK: - Battle

    var battleNavTitle: String { en ? "Match" : "对局" }
    var reasonTooShortTitle: String { en ? "Reason too short" : "理由太短" }
    var reasonTooShortOK: String { en ? "OK" : "好的" }
    var apiRequestFailedTitle: String { en ? "Request failed" : "请求失败" }
    var alertConfirm: String { en ? "OK" : "确定" }
    var reasonTooShortMessage: String {
        en ? "Write a bit more (at least 10 characters)." : "请写下更详细的理由（至少10个字）"
    }
    var battleMissing: String { en ? "Match not found" : "对局不存在" }
    var backToDisciplines: String { en ? "Back to disciplines" : "返回学科辩论" }
    var battleInProgress: String { en ? "Match in progress" : "对局进行中" }
    var builderSubtitle: String { en ? "Builder" : "建构者" }
    var breakerSubtitle: String { en ? "Breaker" : "破坏者" }
    var yourStance: String { en ? "Your stance" : "你的立场" }
    func supportBuilderTitle(builder: String) -> String {
        en ? "I support \(builder)" : "我支持 Builder"
    }
    func supportBuilderSubtitle(builder: String) -> String {
        en ? "\(builder)’s view is more convincing" : "建构者的观点更有说服力"
    }
    func supportBreakerTitle(breaker: String) -> String {
        en ? "I support \(breaker)" : "我支持 Breaker"
    }
    func supportBreakerSubtitle(breaker: String) -> String {
        en ? "\(breaker)’s view is more convincing" : "破坏者的观点更有说服力"
    }
    var uncertainChoiceTitle: String { en ? "I’m not sure" : "我不确定" }
    var uncertainChoiceSubtitle: String { en ? "But I’ll explain my doubts" : "但我会解释我的困惑" }
    var continueToReason: String { en ? "Next: explain your reasoning" : "继续：说明理由" }
    var explainReasonTitle: String { en ? "Explain your reasoning" : "说明你的理由" }
    var explainReasonSubtitle: String {
        en
            ? "Not picking an answer—explain why you lean this way. That’s the core of thinking."
            : "不是选答案，是解释你为什么这么选。这是思考的关键环节。"
    }
    func characterCount(_ n: Int) -> String { en ? "\(n) characters" : "\(n) 字" }
    var submitReason: String { en ? "Submit" : "提交理由" }
    var calmJudge: String { en ? "Calm examiner" : "冷静的考官" }
    func judgeFollowUp(index: Int, total: Int) -> String {
        en ? "Judge follow-up \(index + 1) / \(total)" : "Judge 追问 \(index + 1) / \(total)"
    }
    var continueThinking: String { en ? "Continue" : "继续思考" }
    var viewFullAnalysis: String { en ? "View full analysis" : "查看完整分析" }
    var fullPerspective: String { en ? "Full perspective" : "完整视角" }
    var fullPerspectiveSubtitle: String {
        en ? "After reflection, here is a fuller analysis." : "经过思考后，这是一个更完整的分析"
    }
    var backHome: String { en ? "Home" : "返回首页" }
    var viewMindProfile: String { en ? "Mind profile" : "查看思维画像" }

    // MARK: - Philosophy battle

    var philosophyNavTitle: String { philosophyDebate }
    var philosopherMissing: String { en ? "Philosopher not found" : "思想家不存在" }
    var backToPhilosophyHome: String { en ? "Back" : "返回哲学辩论" }
    var agentDisclaimer: String {
        en ? "Topic and views are generated by the backend model." : "辩题与观点由后端大模型生成"
    }
    var topicGenerating: String { en ? "Loading topic from server…" : "正在从服务器生成辩题…" }
    var tablePreparing: String {
        en ? "The debate table is being prepared…" : "辩论桌正在准备中"
    }
    func philosopherThinking(name: String) -> String {
        en ? "\(name) is thinking…" : "「\(name)」正在思考中"
    }
    var judgeThinking: String { en ? "Judge is thinking…" : "Judge 正在思考中" }
    var philosophyPhilosopherToUserTask: String {
        en
            ? "The user just spoke. Reply as the philosopher in first person only. Do not output Judge content."
            : "用户本轮已发言。仅以该哲学家第一人称回应用户，不要生成 Judge 内容。"
    }
    var philosophyJudgeStepTask: String {
        en
            ? "Read the history including the latest user and philosopher messages. As Judge, decide whether to intervene. Do not speak as the philosopher."
            : "阅读对话历史（含用户与哲学家刚才的发言）。你作为 Judge 决定是否介入引导双方。不替哲学家发言。"
    }
    var philosophyPhilosopherToJudgeTask: String {
        en
            ? "The Judge has questioned the philosopher (see last Judge line). Reply as the philosopher in first person to the Judge only."
            : "Judge 已向哲学家追问（见历史最后一条 Judge）。请以该哲学家第一人称回应 Judge，不要回应用户，不要生成 Judge 内容。"
    }
    var topicRetry: String { en ? "Retry" : "重试" }
    var summaryMissing: String {
        en ? "The model did not return a summary. Check the backend and try again."
            : "模型未能生成总结，请检查后端服务后重试。"
    }
    var topicBadJson: String {
        en ? "The model returned invalid JSON." : "模型返回的 JSON 无效或不完整。"
    }
    func philosopherStanceTitle(name: String) -> String {
        en ? "\(name)’s stance" : "\(name) 立场"
    }
    var oppositeStance: String { en ? "Counter stance" : "反方立场" }
    var startDebate: String { en ? "Start debate" : "开始辩论" }
    var yourStanceQuestion: String { en ? "Your stance?" : "你的立场？" }
    var debateFlowHint: String {
        en ? "You’ll debate in multiple rounds; keep adding your thoughts." : "接下来会进入多轮辩论，可连续输入观点"
    }
    var agree: String { en ? "Agree" : "同意" }
    var disagree: String { en ? "Disagree" : "不同意" }
    var uncertain: String { en ? "Uncertain" : "不确定" }
    var debateRoundHint: String {
        en ? "You debate directly with the philosopher; the judge may step in to guide both sides."
            : "你与哲学家直接对辩；裁判在旁观察，必要时介入引导双方"
    }
    var philosophyTurnTask: String {
        en
            ? "User spoke. philosopherReplyToUser required every round (direct debate). Judge may intervene (judgeSpeaks); addressTo marks who you mainly question—never silence the philosopher. addressTo=philosopher → also philosopherReplyToJudge. Set continueDebate."
            : "用户已发言。philosopherReplyToUser 每轮必填（你与哲学家直接辩论）。Judge 可介入引导双方；addressTo 表示追问重点，不得让哲学家沉默。addressTo=philosopher 时另填 philosopherReplyToJudge。设置 continueDebate。"
    }
    var philosophyTurnCriteria: String {
        en ? "Return philosopherReplyToUser, judgeSpeaks, judgeMessage, addressTo, philosopherReplyToJudge, continueDebate"
            : "返回 philosopherReplyToUser、judgeSpeaks、judgeMessage、addressTo、philosopherReplyToJudge、continueDebate"
    }
    var philosophyTurnConstraints: String {
        en ? "Chinese; JSON only; continueDebate is boolean"
            : "中文；仅返回 JSON；continueDebate 为布尔值"
    }
    var currentDebateTopic: String { en ? "Current topic" : "当前议题" }
    var agentThinking: String { en ? "Agent thinking…" : "Agent 思考中..." }
    var continueYourThought: String { en ? "Add your next thought…" : "继续输入你的观点..." }
    var goToSummary: String { en ? "Summary" : "进入总结" }
    var fullAnalysis: String { en ? "Full analysis" : "完整分析" }
    var agentGeneratingSummary: String { en ? "Generating summary…" : "Agent 正在生成总结..." }

    func choiceDisplay(_ c: PhilosophyChoice) -> String {
        switch c {
        case .agree: return agree
        case .disagree: return disagree
        case .uncertain: return uncertain
        }
    }

    func judgeOpeningAfterChoice(choiceText: String) -> String {
        if en { return "You chose “\(choiceText)”. State your first round of reasoning." }
        return "你选择了「\(choiceText)」。请先陈述你的第一轮理由。"
    }

    // MARK: - Debate summary

    var debateSummaryTitle: String { en ? "Debate recap" : "辩论小结" }
    var corePoints: String { en ? "Key takeaways" : "核心观点提炼" }
    var stanceCompare: String { en ? "Stance comparison" : "立场对比" }
    func philosopherStanceLabel(name: String) -> String {
        en ? "\(name)’s stance" : "\(name)的立场"
    }
    var yourStanceLabel: String { en ? "Your stance" : "你的立场" }
    func alignmentLabel(_ text: String) -> String {
        en ? "Alignment: \(text)" : "一致性评估：\(text)"
    }
    var deepQuestions: String { en ? "Questions to go deeper" : "深度思考问题" }
    func agreeWith(name: String) -> String { en ? "Agree with \(name)" : "同意\(name)" }
    var opposeStance: String { en ? "Opposing stance" : "持反对立场" }
    var expressedUncertainty: String { en ? "Expressed uncertainty" : "表示不确定" }
    var defaultCoreIdea: String { en ? "Core idea" : "核心思想" }
    func corePointPhilosopher(name: String, idea: String) -> String {
        en ? "\(name)’s core idea: \(idea)" : "\(name)的核心观点：\(idea)"
    }
    var corePointOpposite: String {
        en ? "The counter stance stresses pragmatism and real-world constraints." : "反方立场强调实用性和现实考量"
    }
    func corePointYourChoice(choice: String) -> String {
        en ? "You chose \(choice), showing your leaning." : "你选择了\(choice)，展示了你的思考倾向"
    }
    func defaultPhilosopherStance(name: String) -> String {
        en ? "\(name)’s philosophical stance" : "\(name)的哲学立场"
    }
    var alignmentHigh: String { en ? "Strongly aligned" : "高度一致" }
    var alignmentOppose: String { en ? "Opposed" : "对立" }
    var alignmentExploring: String { en ? "Still exploring" : "尚在探索" }
    func deepQModern(name: String) -> String {
        en ? "If \(name) lived today, how might they see this issue?" : "如果\(name)生活在现代，他会如何看待这个问题？"
    }
    var deepQChangeMind: String {
        en ? "Under what conditions might your stance change?" : "你的立场在什么情况下可能会改变？"
    }
    var deepQDailyLife: String {
        en ? "What practical impact does this have on daily life?" : "这个问题对你的日常生活有什么实际影响？"
    }

    // MARK: - Philosopher sheet

    var coreThought: String { en ? "Core ideas" : "核心思想" }
    var keyConcepts: String { en ? "Key concepts" : "关键概念" }
    var majorWorks: String { en ? "Major works" : "代表著作" }
    var influencedBy: String { en ? "Influenced by" : "受其影响" }
    var influenced: String { en ? "Influenced" : "影响了" }
    var startPhilosophyBattle: String { en ? "Start philosophy debate" : "开始哲学辩论" }
    var philosopherNavTitle: String { en ? "Philosopher" : "思想家" }

    // MARK: - Mind profile

    var mindProfileNavTitle: String { mindProfile }
    var mindProfileTitle: String { en ? "Your mind profile" : "你的思维画像" }
    var mindProfileSubtitle: String { en ? "Understand how you think" : "认识自己的思考方式" }
    var biasMapTitle: String { en ? "Your bias map" : "你的思维偏差地图" }
    var biasMapFootnote: String {
        en
            ? "Based on your match choices and reasons. Noticing bias is the first step to better thinking."
            : "这些数据基于你在对局中的选择和理由。认识到自己的偏差，是改进思维的第一步。"
    }
    func occurrences(_ n: Int) -> String { en ? "\(n) times" : "\(n) 次出现" }
    var keyInsights: String { en ? "Key insights" : "关键洞察" }
    var insightWatchOutTitle: String { en ? "Watch out" : "需要注意" }
    var insightWatchOutBody: String {
        en
            ? "In many cases you tend to skip counter-evidence. Try actively seeking views that challenge yours."
            : "在 72% 的情况下，你倾向于忽略反例和相反证据。尝试主动寻找挑战你观点的信息。"
    }
    var insightStrengthTitle: String { en ? "Strength" : "优势" }
    var insightStrengthBody: String {
        en
            ? "You’ve changed stance several times—sign of openness, a key trait of sound reasoning."
            : "你愿意改变立场（7次改变），说明你具有开放的心态。这是理性思考的重要品质。"
    }
    var recentThoughts: String { en ? "Recent reflections" : "最近的思考记录" }
    var stanceChanged: String { en ? "Stance changed" : "已改变立场" }
    var yourPick: String { en ? "Your choice" : "你的选择" }
    var judgeFollowUpShort: String { en ? "Judge’s follow-up" : "Judge 的追问" }
    var growthQuote: String {
        en ? "“I see how naive I used to be”—that feeling is growth." : "\"我以前想得有多不成熟\" — 这是成长感的来源"
    }

    func localizeMindStatLabel(_ label: String) -> String {
        if !en { return label }
        switch label {
        case "已完成对局": return "Matches completed"
        case "改变立场次数": return "Stance changes"
        case "思维盲区": return "Blind spots"
        case "准确判断率": return "Accuracy"
        default: return label
        }
    }

    func localizeBiasName(_ name: String) -> String {
        if !en { return name }
        switch name {
        case "确认偏差": return "Confirmation bias"
        case "权威依赖": return "Authority bias"
        case "过度自信": return "Overconfidence"
        case "忽略反例": return "Ignoring counterexamples"
        case "二元思维": return "Binary thinking"
        default: return name
        }
    }

    func localizeBiasDescription(_ text: String) -> String {
        if !en { return text }
        switch text {
        case "倾向于寻找支持已有观点的证据": return "Tendency to seek evidence that supports prior beliefs"
        case "容易被权威或逻辑清晰的论述说服": return "Easily persuaded by authority or crisp logic"
        case "在不确定的情况下表现出过高的确定性": return "Shows high certainty when evidence is thin"
        case "倾向于忽视与观点相悖的案例": return "Tends to overlook cases against one’s view"
        case "倾向于用非黑即白的方式看待问题": return "Tends to see issues in black-and-white terms"
        default: return text
        }
    }

    func localizeRecentChoice(_ choice: String) -> String {
        if !en { return choice }
        switch choice {
        case "我不确定": return "Uncertain"
        case "支持 Breaker": return "Support Breaker"
        case "支持 Builder": return "Support Builder"
        default: return choice
        }
    }

    func localizeRecentQuestion(_ q: String) -> String {
        if !en { return q }
        switch q {
        case "努力 vs 选择，哪个更重要？": return "Effort vs choice—which matters more?"
        case "多任务处理真的有效吗？": return "Is multitasking really effective?"
        case "AI 会让人变笨吗？": return "Does AI make people think less?"
        default: return q
        }
    }

    func localizeRecentJudge(_ c: String) -> String {
        if !en { return c }
        switch c {
        case "你忽略了时间维度": return "You skipped the time dimension."
        case "你的假设是所有任务都需要高认知": return "You assumed all tasks need high cognition."
        case "你混淆了工具和依赖性": return "You conflated tools with dependence."
        default: return c
        }
    }

    // MARK: - Roundtable

    var roundtableNavTitle: String { roundtableDebate }
    var backToHome: String { en ? "Home" : "返回主页" }
    var roundtableHeadline: String { en ? "Multi-philosopher roundtable" : "多哲学家圆桌辩论" }
    var pickThinkers: String { en ? "Pick philosophers" : "选择哲学家" }
    var viewAllPhilosophers: String { en ? "All" : "全部" }
    var roundtablePickerTitle: String { en ? "Choose philosophers" : "选择哲学家" }
    var roundtablePickerHint: String {
        en ? "Full catalog from Philosophy Debate — pick 2–4" : "与哲学辩论相同的全量目录，可选 2–4 位"
    }
    func roundtablePickerCount(total: Int, count: Int) -> String {
        en ? "\(total) total · \(count) / 4 selected" : "共 \(total) 位 · 已选 \(count) / 4"
    }
    var roundtablePickerConfirm: String { en ? "Confirm selection" : "确认选择" }
    var roundtableSearchPlaceholder: String {
        en ? "Search by name or school…" : "搜索哲学家姓名或学派…"
    }
    var pickThinkersHint: String { en ? "(2–4, any era)" : "（2-4位，可跨时空）" }
    func selectedCount(_ n: Int) -> String { en ? "Selected \(n) / 4" : "已选择 \(n) / 4" }
    var picked: String { en ? "✓ Selected" : "✓ 已选择" }
    var pickTopic: String { en ? "Pick or enter a topic" : "选择或输入辩题" }
    var customTopicLabel: String { en ? "Or type your own topic:" : "或者，输入你自己的辩题：" }
    var customTopicPlaceholder: String {
        en ? "e.g. Does the metaverse make people escape reality?" : "例如：元宇宙是否会导致人类逃避现实？"
    }
    var startRoundtable: String { en ? "Start roundtable" : "开始圆桌辩论" }
    var roundtableSetupError: String {
        en ? "Pick at least 2 philosophers and a topic." : "请至少选择2位哲学家并设定辩题"
    }
    var participants: String { en ? "Participants:" : "参与者：" }
    var thinkersThinking: String { en ? "Philosophers are reflecting…" : "哲学家们正在思考..." }
    func roundtablePhilosopherThinking(name: String) -> String {
        en ? "\(name) is thinking…" : "「\(name)」正在思考中"
    }
    var roundtableInputPlaceholder: String { en ? "Interject or add a new angle…" : "插话或提出新的观点..." }
    var roundtableOpeningFailed: String {
        en ? "Could not generate opening statements from the server." : "无法从服务器生成开场发言。"
    }
    var roundtableReplyFailed: String {
        en ? "Could not generate replies; your message was restored." : "无法生成回应，已恢复你输入的内容。"
    }

    func presetTopic(id: String) -> (title: String, description: String) {
        switch id {
        case "ai-free-will":
            return en
                ? ("Will AI replace human free will?", "AI, consciousness, and freedom of choice.")
                : ("AI是否会取代人类自由意志？", "探讨人工智能、意识与自由选择的关系")
        case "utopia":
            return en
                ? ("Absolute equality or liberty in an ideal society?", "Justice, fairness, and individual rights.")
                : ("理想社会应该追求绝对平等还是自由？", "关于正义、公平与个人权利的永恒辩论")
        case "truth":
            return en
                ? ("Does objective truth exist?", "Core epistemology: the nature of truth.")
                : ("客观真理是否存在？", "认识论的核心问题：真理的本质")
        case "education":
            return en
                ? ("Education: train tools or whole persons?", "Skills vs character in modern education.")
                : ("教育的目的是培养工具还是完整的人？", "人才培养vs人格教育的现代困境")
        default:
            return ("", "")
        }
    }

    // MARK: - Moral dilemma (/dilemma)

    var dilemmaNavTitle: String { moralDilemma }
    var dilemmaHeroKicker: String { en ? "Moral dilemmas" : "Moral Dilemmas" }
    var dilemmaHeroSubtitle: String {
        en ? "Discuss moral dilemmas with a philosopher." : "和哲学家讨论道德困境"
    }
    var dilemmaCoreQuestionLabel: String { en ? "Key question" : "核心提问" }
    var dilemmaYourStanceSection: String { en ? "Your current stance" : "你当前的立场" }
    var dilemmaChoosePhilosopherTitle: String {
        en ? "Pick a philosopher to discuss with" : "选择一位哲学家和你讨论"
    }
    var dilemmaChoosePhilosopherHint: String {
        en
            ? "After you tap a card, you’ll enter a focused chat about this dilemma."
            : "点击哲学家卡片后，会直接进入和他围绕当前困境的讨论窗口。"
    }
    var dilemmaRecommended: String { en ? "Recommended" : "推荐哲学家" }
    var dilemmaAllPhilosophers: String { en ? "All philosophers" : "全部哲学家" }
    var dilemmaExpandPhilosophers: String { en ? "Show more" : "展开更多" }
    var dilemmaCollapsePhilosophers: String { en ? "Collapse" : "收起" }
    var dilemmaFeaturedBadge: String { en ? "Featured" : "推荐" }
    var dilemmaRechoosePhilosopher: String { en ? "Pick another philosopher" : "重新选择哲学家" }
    var dilemmaCurrentDilemmaLabel: String { en ? "Current dilemma" : "当前困境" }
    var dilemmaDiscussionNote: String {
        en
            ? "Discussion proceeds as philosopher reply + Judge follow-up, like the debate flow."
            : "讨论会按“哲学家回应 + Judge 追问”的方式推进，和辩论窗口保持一致。"
    }
    var dilemmaThinking: String { en ? "Philosopher and Judge are thinking…" : "哲学家与 Judge 正在思考..." }
    func dilemmaInputPlaceholder(name: String) -> String {
        en
            ? "Press \(name) further, or add your reasoning…"
            : "继续追问 \(name)，或者补充你的理由..."
    }
    func dilemmaRevealLine(option: String, philosopher: String) -> String {
        en
            ? "You chose: \(option). Discussing with \(philosopher)."
            : "你选择的是「\(option)」，讨论对象是 \(philosopher)。"
    }
    func dilemmaJudgeOpening(optionLabel: String) -> String {
        en
            ? "You chose “\(optionLabel)”. Explain your reasoning and respond to the sharpest objection to your view."
            : "你当前选择了“\(optionLabel)”。请先说明你的理由，并尝试回应这个困境最尖锐的反对意见。"
    }
    var dilemmaContinueWithPhilosopher: String { en ? "Discuss with another philosopher" : "继续换哲学家讨论" }
}

extension Philosopher {
    /// 界面主显示名：英文界面优先拉丁名，否则中文名。
    func displayName(isEnglish: Bool) -> String {
        if isEnglish {
            let n = name.trimmingCharacters(in: .whitespacesAndNewlines)
            if !n.isEmpty { return n }
        }
        return nameCN
    }
}
