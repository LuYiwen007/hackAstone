import SwiftUI

private enum PBStage: String {
    case topic, choose, debate, reveal
}

private enum PBMessageRole {
    case user, philosopher, judge
}

private struct PBMessage: Identifiable {
    let id: String
    let role: PBMessageRole
    let content: String
}

private struct TurnDTO: Decodable {
    let philosopherReply: String?
    let judgeQuestion: String?
    let continueDebate: Bool?
}

private struct TurnResult {
    let philosopherReply: String
    let judgeQuestion: String
    let continueDebate: Bool
}

private struct SummaryOnly: Decodable {
    let fullExplanation: String?
}

struct PhilosophyBattleView: View {
    let philosopherId: String
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath

    private var L: ArenaL10n { locale.L }

    @State private var stage: PBStage = .topic
    @State private var choice: PhilosophyChoice?
    @State private var topic: DebateTopicContent?
    @State private var messages: [PBMessage] = []
    @State private var userInput = ""
    @State private var isThinking = false
    @State private var canReveal = false
    @State private var fullExplanation = ""
    @State private var isGeneratingSummary = false

    private var philosopher: Philosopher? { catalog.philosophers.first { $0.id == philosopherId } }

    private var fallbackTopic: DebateTopicContent {
        guard let p = philosopher else {
            return localizedGenericTopic
        }
        return catalog.debateTopics[p.id] ?? catalog.debateTopics["confucius"] ?? localizedGenericTopic
    }

    private var localizedGenericTopic: DebateTopicContent {
        L.prefersEnglish ? Self.genericTopicEN : Self.genericTopic
    }

    private var currentTopic: DebateTopicContent { topic ?? fallbackTopic }

    var body: some View {
        Group {
            if let p = philosopher {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        battleHeader(philosopher: p)
                        content(philosopher: p)
                    }
                    .padding(16)
                    .padding(.bottom, 32)
                }
                .background(ArenaTheme.background)
                .task { await loadTopic(philosopher: p) }
            } else {
                missing
            }
        }
        .navigationTitle(L.philosophyNavTitle)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }

    private var missing: some View {
        VStack(spacing: 16) {
            Text(L.philosopherMissing)
                .font(.title2.weight(.bold))
            Button(L.backToPhilosophyHome) { path = NavigationPath() }
                .buttonStyle(.borderedProminent)
                .tint(ArenaTheme.purpleAccent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ArenaTheme.background)
    }

    private func battleHeader(philosopher: Philosopher) -> some View {
        HStack {
            Button {
                path = NavigationPath()
            } label: {
                Label(L.backToMap, systemImage: "chevron.left")
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(philosopher.displayName(isEnglish: L.prefersEnglish)).font(.headline)
                Text(philosopher.school).font(.caption).foregroundStyle(ArenaTheme.textMuted)
            }
        }
    }

    @ViewBuilder
    private func content(philosopher: Philosopher) -> some View {
        switch stage {
        case .topic:
            topicStage(philosopher: philosopher)
        case .choose:
            chooseStage
        case .debate:
            debateStage(philosopher: philosopher)
        case .reveal:
            revealStage(philosopher: philosopher)
        }
    }

    private func topicStage(philosopher: Philosopher) -> some View {
        VStack(spacing: 20) {
            Text(currentTopic.question)
                .font(.title.weight(.bold))
                .multilineTextAlignment(.center)
                .foregroundStyle(ArenaTheme.textPrimary)
            Text(L.agentDisclaimer)
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: 14)], spacing: 14) {
                topicCard(title: L.philosopherStanceTitle(name: philosopher.displayName(isEnglish: L.prefersEnglish)), text: currentTopic.philosopherView, accent: ArenaTheme.purpleAccent)
                topicCard(title: L.oppositeStance, text: currentTopic.oppositeView, accent: ArenaTheme.textMuted)
            }
            Button(L.startDebate) { stage = .choose }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(ArenaTheme.purpleAccent)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private func topicCard(title: String, text: String, accent: Color) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title).font(.headline).foregroundStyle(accent == ArenaTheme.purpleAccent ? ArenaTheme.purpleAccent : ArenaTheme.textPrimary)
            Text(text).font(.subheadline).foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(accent == ArenaTheme.purpleAccent ? ArenaTheme.purpleAccent.opacity(0.45) : ArenaTheme.border, lineWidth: 2))
    }

    private var chooseStage: some View {
        VStack(spacing: 18) {
            Text(L.yourStanceQuestion)
                .font(.title2.weight(.bold))
            Text(L.debateFlowHint)
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: 12)], spacing: 12) {
                Button(L.agree) { handleChoose(.agree) }
                    .padding(24)
                    .frame(maxWidth: .infinity)
                    .background(ArenaTheme.purpleAccent.opacity(0.15))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.purpleAccent, lineWidth: 2))
                Button(L.disagree) { handleChoose(.disagree) }
                    .padding(24)
                    .frame(maxWidth: .infinity)
                    .background(ArenaTheme.surface)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border, lineWidth: 2))
                Button(L.uncertain) { handleChoose(.uncertain) }
                    .padding(24)
                    .frame(maxWidth: .infinity)
                    .background(ArenaTheme.surface)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border, lineWidth: 2))
            }
            .buttonStyle(.plain)
            .foregroundStyle(ArenaTheme.textPrimary)
        }
    }

    private func debateStage(philosopher: Philosopher) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Label(L.debateRoundHint, systemImage: "exclamationmark.circle")
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
            ForEach(messages) { m in
                messageBubble(m: m, philosopher: philosopher)
            }
            if isThinking { Text(L.agentThinking).font(.caption).foregroundStyle(ArenaTheme.textMuted) }
            HStack(spacing: 10) {
                TextField(L.continueYourThought, text: $userInput)
                    .textFieldStyle(.roundedBorder)
                Button {
                    Task { await handleUserTurn(philosopher: philosopher) }
                } label: {
                    Image(systemName: "bubble.left.and.bubble.right.fill")
                }
                .disabled(userInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isThinking || choice == nil)
            }
            Button(L.goToSummary) {
                Task { await handleReveal(philosopher: philosopher) }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color.yellow.opacity(0.85))
            .foregroundStyle(.black)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .disabled((!canReveal && messages.count < 4) || choice == nil)
        }
    }

    private func messageBubble(m: PBMessage, philosopher: Philosopher) -> some View {
        let label: String = {
            switch m.role {
            case .user: return L.you
            case .philosopher: return philosopher.displayName(isEnglish: L.prefersEnglish)
            case .judge: return L.judge
            }
        }()
        let border: Color = {
            switch m.role {
            case .user: return ArenaTheme.purpleAccent.opacity(0.6)
            case .philosopher: return ArenaTheme.border
            case .judge: return Color.yellow.opacity(0.45)
            }
        }()
        let bg: Color = {
            switch m.role {
            case .user: return ArenaTheme.purpleAccent.opacity(0.12)
            case .philosopher: return ArenaTheme.surface
            case .judge: return Color.yellow.opacity(0.08)
            }
        }()
        return VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.caption2).foregroundStyle(ArenaTheme.textMuted)
            Text(m.content).font(.subheadline).foregroundStyle(ArenaTheme.textPrimary).fixedSize(horizontal: false, vertical: true)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(bg)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(border))
    }

    private func revealStage(philosopher: Philosopher) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(L.fullAnalysis)
                .font(.title2.weight(.bold))
            Text(isGeneratingSummary ? L.agentGeneratingSummary : (fullExplanation.isEmpty ? (currentTopic.fullExplanation ?? "") : fullExplanation))
                .font(.body)
                .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                .fixedSize(horizontal: false, vertical: true)
            DebateSummarySection(
                philosopher: philosopher,
                question: currentTopic.question,
                userChoice: choice,
                userReason: messages.filter { $0.role == .user }.map(\.content).joined(separator: "\n")
            )
            HStack(spacing: 12) {
                Button(L.backToMap) { path = NavigationPath() }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                Button(L.viewMindProfile) { path = NavigationPath(); path.append(AppRoute.profile) }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(ArenaTheme.purpleAccent)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(18)
        .background(ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
    }

    private func handleChoose(_ c: PhilosophyChoice) {
        choice = c
        stage = .debate
        canReveal = false
        let label = L.choiceDisplay(c)
        messages = [
            PBMessage(id: UUID().uuidString, role: .judge, content: L.judgeOpeningAfterChoice(choiceText: label)),
        ]
    }

    private func loadTopic(philosopher: Philosopher) async {
        let query = """
        [ROLE]
        CA-Echo-LLM

        [TASK]
        为指定哲学家生成一场辩论题，返回 JSON。

        [RETURN_FORMAT]
        json

        [CONSTRAINTS]
        中文输出；judgeQuestions 至少 3 条；仅返回 JSON

        [ACCEPTANCE_CRITERIA]
        返回字段 question/philosopherView/oppositeView/judgeQuestions/fullExplanation

        思想家：\(philosopher.nameCN)；学派：\(philosopher.school)；关键思想：\(philosopher.keyIdeas.joined(separator: "、"))
        """
        do {
            let resp = try await ArenaAPI.runEcho(query: query)
            if let parsed = JsonPayload.parse(resp.text, as: DebateTopicContent.self),
               parsed.question.isEmpty == false
            {
                topic = parsed
                fullExplanation = parsed.fullExplanation ?? ""
            } else {
                topic = nil
                fullExplanation = fallbackTopic.fullExplanation ?? ""
            }
        } catch {
            topic = nil
            fullExplanation = fallbackTopic.fullExplanation ?? ""
        }
    }

    private func handleUserTurn(philosopher: Philosopher) async {
        let content = userInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !content.isEmpty, let choice else { return }
        guard !isThinking else { return }
        userInput = ""
        isThinking = true
        var next = messages
        next.append(PBMessage(id: UUID().uuidString, role: .user, content: content))
        messages = next

        let historyText = next.map { m -> String in
            let who: String = {
                switch m.role {
                case .user: return L.user
                case .judge: return L.judge
                case .philosopher: return philosopher.displayName(isEnglish: L.prefersEnglish)
                }
            }()
            return "\(who)：\(m.content)"
        }.joined(separator: "\n")

        let turnQuery = """
        [ROLE]
        CA-Echo-LLM

        [TASK]
        继续一轮哲学辩论：先给哲学家回应，再给裁判追问，并判断是否继续辩论。

        [RETURN_FORMAT]
        json

        [CONSTRAINTS]
        中文；仅返回 JSON；continueDebate 为布尔值

        [ACCEPTANCE_CRITERIA]
        返回 philosopherReply/judgeQuestion/continueDebate 三个字段

        辩题：\(currentTopic.question)
        哲学家：\(philosopher.nameCN)（\(philosopher.school)）
        用户立场：\(choiceLabel(choice))
        历史：
        \(historyText)
        """

        do {
            let resp = try await ArenaAPI.runEcho(query: turnQuery)
            let dto = JsonPayload.parse(resp.text, as: TurnDTO.self)
            let turn: TurnResult
            if let dto, let pr = dto.philosopherReply, let jq = dto.judgeQuestion {
                turn = TurnResult(philosopherReply: pr, judgeQuestion: jq, continueDebate: dto.continueDebate ?? true)
            } else {
                turn = Self.localTurnFallback(L: L, philosopher: philosopher, userInput: content)
            }
            messages.append(PBMessage(id: UUID().uuidString, role: .philosopher, content: turn.philosopherReply))
            messages.append(PBMessage(id: UUID().uuidString, role: .judge, content: turn.judgeQuestion))
            canReveal = turn.continueDebate == false
        } catch {
                let turn = Self.localTurnFallback(L: L, philosopher: philosopher, userInput: content)
            messages.append(PBMessage(id: UUID().uuidString, role: .philosopher, content: turn.philosopherReply))
            messages.append(PBMessage(id: UUID().uuidString, role: .judge, content: turn.judgeQuestion))
            canReveal = false
        }
        isThinking = false
    }

    private func choiceLabel(_ c: PhilosophyChoice) -> String {
        switch c {
        case .agree: return "agree"
        case .disagree: return "disagree"
        case .uncertain: return "uncertain"
        }
    }

    private func handleReveal(philosopher: Philosopher) async {
        guard choice != nil else { return }
        stage = .reveal
        isGeneratingSummary = true
        let history = messages.map { m -> String in
            let who: String = {
                switch m.role {
                case .user: return L.user
                case .judge: return L.judge
                case .philosopher: return philosopher.displayName(isEnglish: L.prefersEnglish)
                }
            }()
            return "\(who)：\(m.content)"
        }.joined(separator: "\n")

        let summaryQuery = """
        [ROLE]
        CA-Echo-LLM

        [TASK]
        根据辩论历史生成完整总结解释。

        [RETURN_FORMAT]
        json

        [CONSTRAINTS]
        中文；仅返回 JSON；内容有层次

        [ACCEPTANCE_CRITERIA]
        返回 fullExplanation 字段

        辩题：\(currentTopic.question)
        哲学家：\(philosopher.nameCN)
        用户立场：\(choiceLabel(choice!))
        历史：
        \(history)
        """
        do {
            let resp = try await ArenaAPI.runEcho(query: summaryQuery)
            if let parsed = JsonPayload.parse(resp.text, as: SummaryOnly.self), let fe = parsed.fullExplanation, !fe.isEmpty {
                fullExplanation = fe
            }
        } catch {}
        isGeneratingSummary = false
    }

    private static func localTurnFallback(L: ArenaL10n, philosopher: Philosopher, userInput: String) -> TurnResult {
        let clip = String(userInput.prefix(30))
        let name = philosopher.displayName(isEnglish: L.prefersEnglish)
        let t = L.philosophyTurnFallback(philosopherName: name, clip: clip)
        return TurnResult(philosopherReply: t.reply, judgeQuestion: t.judge, continueDebate: true)
    }

    private static let genericTopicEN = DebateTopicContent(
        question: "Philosophical dialogue",
        philosopherView: "Let us proceed carefully from reason and experience.",
        oppositeView: "Let us question every premise from doubt and critique.",
        judgeQuestions: [
            "What is your key concept?",
            "Are there counterexamples?",
            "What hidden premises does your conclusion rely on?",
        ],
        fullExplanation: "This is a practice dialogue. Keep asking and testing premises to move understanding forward.",
    )

    private static let genericTopic = DebateTopicContent(
        question: "哲学对话",
        philosopherView: "让我们从理性与经验出发，审慎地展开讨论。",
        oppositeView: "让我们从怀疑与批判出发，检验每一个前提。",
        judgeQuestions: ["你的关键概念是什么？", "是否存在反例？", "你的结论依赖哪些隐含前提？"],
        fullExplanation: "这是一场练习性的哲学对话。继续提问、继续检验前提，是推进理解的关键。"
    )
}
