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

private enum PBThinkingRole {
    case philosopher, judge
}

private struct PhilosopherToUserDTO: Decodable {
    let philosopherReplyToUser: String?
    let philosopherReply: String?
}

private struct JudgeStepDTO: Decodable {
    let judgeSpeaks: Bool?
    let judgeMessage: String?
    let judgeQuestion: String?
    let addressTo: String?
    let continueDebate: Bool?
}

private struct PhilosopherToJudgeDTO: Decodable {
    let philosopherReplyToJudge: String?
}

private struct JudgeStepResult {
    let judgeSpeaks: Bool
    let judgeMessage: String
    let addressTo: String?
    let continueDebate: Bool
}

private func parsePhilosopherToUser(_ dto: PhilosopherToUserDTO?) -> String? {
    guard let dto else { return nil }
    let reply = (dto.philosopherReplyToUser ?? dto.philosopherReply ?? "")
        .trimmingCharacters(in: .whitespacesAndNewlines)
    return reply.isEmpty ? nil : reply
}

private func parseJudgeStep(_ dto: JudgeStepDTO?) -> JudgeStepResult? {
    guard let dto else { return nil }
    let judgeSpeaks = dto.judgeSpeaks == true
        || !(dto.judgeMessage ?? dto.judgeQuestion ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    let judgeMessage = (dto.judgeMessage ?? dto.judgeQuestion ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
    var addressTo = (dto.addressTo ?? "").lowercased()
    if judgeSpeaks && addressTo != "user" && addressTo != "philosopher" {
        addressTo = "user"
    }
    if judgeSpeaks && judgeMessage.isEmpty { return nil }
    if !judgeSpeaks { addressTo = "" }
    return JudgeStepResult(
        judgeSpeaks: judgeSpeaks,
        judgeMessage: judgeSpeaks ? judgeMessage : "",
        addressTo: judgeSpeaks ? addressTo : nil,
        continueDebate: dto.continueDebate ?? true
    )
}

private func parsePhilosopherToJudge(_ dto: PhilosopherToJudgeDTO?) -> String? {
    guard let dto else { return nil }
    let reply = (dto.philosopherReplyToJudge ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
    return reply.isEmpty ? nil : reply
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
    @State private var topicLoadError: String?
    @State private var isTopicLoading = false
    @State private var topicRetryNonce = 0
    @State private var messages: [PBMessage] = []
    @State private var userInput = ""
    @State private var isThinking = false
    @State private var thinkingRole: PBThinkingRole?
    @State private var canReveal = false
    @State private var fullExplanation = ""
    @State private var isGeneratingSummary = false
    @State private var errorAlert: String?
    @FocusState private var debateInputFocused: Bool

    private var philosopher: Philosopher? { catalog.philosophers.first { $0.id == philosopherId } }

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
                .scrollDismissesKeyboard(.interactively)
                .background(ArenaTheme.background)
                .task(id: "\(philosopherId)-\(topicRetryNonce)") { await loadTopic(philosopher: p) }
                .alert(L.apiRequestFailedTitle, isPresented: Binding(
                    get: { errorAlert != nil },
                    set: { if !$0 { errorAlert = nil } }
                )) {
                    Button(L.alertConfirm, role: .cancel) { errorAlert = nil }
                } message: {
                    Text(errorAlert ?? "")
                }
            } else {
                missing
            }
        }
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
        Group {
            if isTopicLoading {
                VStack(spacing: 12) {
                    ProgressView()
                        .tint(ArenaTheme.purpleAccent)
                    Text(L.tablePreparing)
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else if let err = topicLoadError {
                VStack(spacing: 16) {
                    Text(err)
                        .font(.subheadline)
                        .foregroundStyle(Color.red.opacity(0.9))
                        .multilineTextAlignment(.center)
                    Button(L.topicRetry) { topicRetryNonce += 1 }
                        .buttonStyle(.borderedProminent)
                        .tint(ArenaTheme.purpleAccent)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 24)
            } else if let t = topic {
                VStack(alignment: .leading, spacing: 20) {
                    Text(L.currentDebateTopic)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(ArenaTheme.purpleAccent.opacity(0.9))
                    Text(t.question)
                        .font(.headline.weight(.semibold))
                        .multilineTextAlignment(.leading)
                        .foregroundStyle(ArenaTheme.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Text(L.agentDisclaimer)
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: 14)], spacing: 14) {
                        topicCard(title: L.philosopherStanceTitle(name: philosopher.displayName(isEnglish: L.prefersEnglish)), text: t.philosopherView, accent: ArenaTheme.purpleAccent)
                        topicCard(title: L.oppositeStance, text: t.oppositeView, accent: ArenaTheme.textMuted)
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
        Group {
            if topic == nil {
                Text(L.topicGenerating).foregroundStyle(ArenaTheme.textMuted)
            } else {
                debateStageContent(philosopher: philosopher)
            }
        }
    }

    private func debateStageContent(philosopher: Philosopher) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            if let topic {
                VStack(alignment: .leading, spacing: 4) {
                    Text(L.currentDebateTopic)
                        .font(.caption2)
                        .foregroundStyle(ArenaTheme.purpleAccent.opacity(0.9))
                    Text(topic.question)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(ArenaTheme.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(ArenaTheme.background)
                .overlay(Rectangle().frame(height: 1).foregroundStyle(ArenaTheme.border), alignment: .bottom)
            }

            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        Label(L.debateRoundHint, systemImage: "exclamationmark.circle")
                            .font(.caption)
                            .foregroundStyle(ArenaTheme.textMuted)
                        ForEach(messages) { m in
                            messageBubble(m: m, philosopher: philosopher)
                        }
                        if isThinking, thinkingRole == .judge {
                            Text(L.judgeThinking)
                                .font(.caption)
                                .foregroundStyle(ArenaTheme.textMuted)
                        }
                        Color.clear.frame(height: 1).id("chatBottom")
                    }
                    .padding(12)
                }
                .scrollDismissesKeyboard(.interactively)
                .frame(maxHeight: 420)
                .onChange(of: messages.count) { _, _ in
                    withAnimation(.easeOut(duration: 0.2)) {
                        proxy.scrollTo("chatBottom", anchor: .bottom)
                    }
                }
                .onChange(of: isThinking) { _, _ in
                    withAnimation(.easeOut(duration: 0.2)) {
                        proxy.scrollTo("chatBottom", anchor: .bottom)
                    }
                }
                .onChange(of: thinkingRole) { _, _ in
                    withAnimation(.easeOut(duration: 0.2)) {
                        proxy.scrollTo("chatBottom", anchor: .bottom)
                    }
                }
            }

            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 10) {
                    TextField(L.continueYourThought, text: $userInput)
                        .arenaInputTextStyle()
                        .textFieldStyle(.roundedBorder)
                        .focused($debateInputFocused)
                        .disabled(isThinking)
                    Button {
                        Task { await handleUserTurn(philosopher: philosopher) }
                    } label: {
                        Image(systemName: "bubble.left.and.bubble.right.fill")
                    }
                    .disabled(userInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isThinking || choice == nil)
                }
                Button(L.goToSummary) {
                    debateInputFocused = false
                    Task { await handleReveal(philosopher: philosopher) }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.yellow.opacity(0.85))
                .foregroundStyle(.black)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .disabled((!canReveal && messages.count < 4) || choice == nil)
            }
            .padding(12)
            .background(ArenaTheme.surface)
            .overlay(Rectangle().frame(height: 1).foregroundStyle(ArenaTheme.border), alignment: .top)
        }
        .background(ArenaTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))
        .onChange(of: isThinking) { _, thinking in
            if thinking { debateInputFocused = false }
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
        let isStreamingPhilosopher = isThinking && thinkingRole == .philosopher
            && m.role == .philosopher && m.id.hasPrefix("to-")
        return VStack(alignment: .leading, spacing: 6) {
            Text(label).font(.caption2).foregroundStyle(ArenaTheme.textMuted)
            if isStreamingPhilosopher && m.content.isEmpty {
                Text(L.philosopherThinking(name: philosopher.displayName(isEnglish: L.prefersEnglish)))
                    .font(.subheadline)
                    .italic()
                    .foregroundStyle(ArenaTheme.textMuted)
            } else {
                Text(m.content)
                    .font(.subheadline)
                    .foregroundStyle(ArenaTheme.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
            }
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
            Text(isGeneratingSummary ? L.agentGeneratingSummary : (fullExplanation.isEmpty ? L.summaryMissing : fullExplanation))
                .font(.body)
                .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                .fixedSize(horizontal: false, vertical: true)
            if let q = topic?.question {
                DebateSummarySection(
                    philosopher: philosopher,
                    question: q,
                    userChoice: choice,
                    userReason: messages.filter { $0.role == .user }.map(\.content).joined(separator: "\n")
                )
            }
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
        debateInputFocused = false
        choice = c
        stage = .debate
        canReveal = false
        let label = L.choiceDisplay(c)
        messages = [
            PBMessage(id: UUID().uuidString, role: .judge, content: L.judgeOpeningAfterChoice(choiceText: label)),
        ]
    }

    private func loadTopic(philosopher: Philosopher) async {
        await MainActor.run {
            isTopicLoading = true
            topicLoadError = nil
        }
        do {
            let resp = try await ArenaAPI.generateTopic(
                philosopherName: philosopher.nameCN,
                philosopherSchool: philosopher.school,
                keyIdeas: philosopher.keyIdeas,
                locale: L.prefersEnglish ? "en" : "zh"
            )
            let parsed = resp.debateTopic ?? JsonPayload.parse(resp.text, as: DebateTopicContent.self)
            if let parsed,
               parsed.question.isEmpty == false,
               parsed.philosopherView.isEmpty == false,
               parsed.oppositeView.isEmpty == false
            {
                await MainActor.run {
                    topic = parsed
                    fullExplanation = parsed.fullExplanation ?? ""
                    topicLoadError = nil
                }
            } else {
                throw NSError(domain: "pb", code: 2, userInfo: [NSLocalizedDescriptionKey: L.topicBadJson])
            }
        } catch {
            await MainActor.run {
                topic = nil
                topicLoadError = (error as NSError).localizedDescription
            }
        }
        await MainActor.run { isTopicLoading = false }
    }

    private func handleUserTurn(philosopher: Philosopher) async {
        let content = userInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !content.isEmpty, let choice, let top = topic else { return }
        guard !isThinking else { return }
        debateInputFocused = false
        let userRowId = UUID().uuidString
        userInput = ""
        isThinking = true
        var next = messages
        next.append(PBMessage(id: userRowId, role: .user, content: content))
        messages = next

        let contextHeader = """
        辩题：\(top.question)
        哲学家：\(philosopher.nameCN)（\(philosopher.school)）
        用户立场：\(choiceLabel(choice))
        """

        func historyBlock(_ msgs: [PBMessage]) -> String {
            let lines = msgs.map { m -> String in
                let who: String = {
                    switch m.role {
                    case .user: return L.user
                    case .judge: return L.judge
                    case .philosopher: return philosopher.displayName(isEnglish: L.prefersEnglish)
                    }
                }()
                return "\(who)：\(m.content)"
            }.joined(separator: "\n")
            return """
            \(contextHeader)
            历史：
            \(lines)
            """
        }

        let localeCode = L.prefersEnglish ? "en" : "zh"
        let keyIdeas = philosopher.keyIdeas.joined(separator: "。")
        let summary = philosopher.summary ?? ""
        let userStance = choiceLabel(choice)

        func streamPhilosopher(mode: String, prior: [PBMessage]) async throws -> PBMessage {
            let msgId = "\(mode)-\(UUID().uuidString)"
            var row = PBMessage(id: msgId, role: .philosopher, content: "")
            await MainActor.run {
                thinkingRole = .philosopher
                messages = prior + [row]
            }
            let hist = historyBlock(prior)
            let onDelta: ArenaAPI.StreamDeltaHandler = { _, acc in
                Task { @MainActor in
                    let preview = streamDisplay(acc)
                    row = PBMessage(id: msgId, role: .philosopher, content: preview)
                    messages = prior + [row]
                }
            }
            let resp: AgentRunResponse
            if mode == "to-user" {
                resp = try await ArenaAPI.streamPhilosophyPhilosopherToUser(
                    debateQuestion: top.question,
                    philosopherId: philosopher.id,
                    philosopherName: philosopher.displayName(isEnglish: L.prefersEnglish),
                    school: philosopher.school,
                    keyIdeas: keyIdeas,
                    summary: summary,
                    userStance: userStance,
                    history: hist,
                    locale: localeCode,
                    onDelta: onDelta
                )
            } else {
                resp = try await ArenaAPI.streamPhilosophyPhilosopherToJudge(
                    debateQuestion: top.question,
                    philosopherId: philosopher.id,
                    philosopherName: philosopher.displayName(isEnglish: L.prefersEnglish),
                    school: philosopher.school,
                    keyIdeas: keyIdeas,
                    summary: summary,
                    userStance: userStance,
                    history: hist,
                    locale: localeCode,
                    onDelta: onDelta
                )
            }
            let final = streamDisplay(resp.text)
            guard !final.isEmpty else { throw NSError(domain: "pb", code: 3) }
            let done = PBMessage(id: msgId, role: .philosopher, content: final)
            await MainActor.run { messages = prior + [done] }
            return done
        }

        func streamJudge(prior: [PBMessage]) async throws -> (judge: JudgeStepResult, judgeMsg: PBMessage?) {
            let msgId = "judge-\(UUID().uuidString)"
            var row = PBMessage(id: msgId, role: .judge, content: "")
            await MainActor.run {
                thinkingRole = .judge
                messages = prior + [row]
            }
            let hist = historyBlock(prior)
            let onDelta: ArenaAPI.StreamDeltaHandler = { _, acc in
                Task { @MainActor in
                    let preview = judgeStreamDisplay(acc)
                    row = PBMessage(id: msgId, role: .judge, content: preview)
                    messages = prior + [row]
                }
            }
            let resp = try await ArenaAPI.streamPhilosophyJudgeStep(
                debateQuestion: top.question,
                philosopherName: philosopher.displayName(isEnglish: L.prefersEnglish),
                school: philosopher.school,
                userStance: userStance,
                history: hist,
                locale: localeCode,
                onDelta: onDelta
            )
            guard let parsed = resp.philosophyJudge else {
                throw NSError(domain: "pb", code: 3, userInfo: [NSLocalizedDescriptionKey: L.topicBadJson])
            }
            let judge = JudgeStepResult(
                judgeSpeaks: parsed.judgeSpeaks,
                judgeMessage: parsed.judgeMessage,
                addressTo: parsed.addressTo,
                continueDebate: parsed.continueDebate
            )
            if judge.judgeSpeaks, !judge.judgeMessage.isEmpty {
                let final = judgeStreamDisplay(resp.text).isEmpty ? judge.judgeMessage : judgeStreamDisplay(resp.text)
                let done = PBMessage(id: msgId, role: .judge, content: final)
                await MainActor.run { messages = prior + [done] }
                return (judge, done)
            }
            await MainActor.run { messages = prior }
            return (judge, nil)
        }

        do {
            let philToUser = try await streamPhilosopher(mode: "to-user", prior: next)
            var working = next + [philToUser]

            let judgeResult = try await streamJudge(prior: working)
            let judge = judgeResult.judge
            if let judgeMsg = judgeResult.judgeMsg {
                working.append(judgeMsg)
            }

            if judge.judgeSpeaks, judge.addressTo == "philosopher" {
                let philToJudge = try await streamPhilosopher(mode: "to-judge", prior: working)
                working.append(philToJudge)
                await MainActor.run { messages = working }
            }
            await MainActor.run { canReveal = judge.continueDebate == false }
        } catch {
            messages.removeAll { $0.id == userRowId }
            userInput = content
            errorAlert = (error as NSError).localizedDescription
        }
        await MainActor.run {
            isThinking = false
            thinkingRole = nil
        }
    }

    private func choiceLabel(_ c: PhilosophyChoice) -> String {
        switch c {
        case .agree: return "agree"
        case .disagree: return "disagree"
        case .uncertain: return "uncertain"
        }
    }

    private func handleReveal(philosopher: Philosopher) async {
        guard let choice, let top = topic else { return }
        stage = .reveal
        isGeneratingSummary = true
        fullExplanation = ""
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

        辩题：\(top.question)
        哲学家：\(philosopher.nameCN)
        用户立场：\(choiceLabel(choice))
        历史：
        \(history)
        """
        do {
            let resp = try await ArenaAPI.runEcho(query: summaryQuery)
            if let parsed = JsonPayload.parse(resp.text, as: SummaryOnly.self), let fe = parsed.fullExplanation, !fe.isEmpty {
                fullExplanation = fe
                if AuthStore.bearerToken != nil, let top = topic {
                    let choiceText: String = {
                        switch choice {
                        case .agree: return L.agree
                        case .disagree: return L.disagree
                        case .uncertain: return L.uncertain
                        case nil: return "--"
                        }
                    }()
                    Task {
                        try? await ArenaAPI.saveBattleRecord(
                            battleType: "philosophy",
                            topic: top.question,
                            userChoice: choiceText,
                            judgeSummary: fe,
                            changedStance: false,
                            messages: messages.map { m in
                                let roleName: String = {
                                    switch m.role {
                                    case .user: return "user"
                                    case .philosopher: return "philosopher"
                                    case .judge: return "judge"
                                    }
                                }()
                                return ["role": roleName, "content": m.content]
                            }
                        )
                    }
                }
            } else {
                errorAlert = L.topicBadJson
            }
        } catch {
            errorAlert = (error as NSError).localizedDescription
        }
        isGeneratingSummary = false
    }
}

private func streamDisplay(_ acc: String) -> String {
    let trimmed = acc.trimmingCharacters(in: .whitespacesAndNewlines)
    if let parsed = JsonPayload.parse(trimmed, as: RTContentPayload.self), let c = parsed.content, !c.isEmpty {
        return c
    }
    if let range = trimmed.range(of: #""content"\s*:\s*""#, options: .regularExpression) {
        var tail = String(trimmed[range.upperBound...])
        if let end = tail.range(of: "\"") {
            tail = String(tail[..<end.lowerBound])
        }
        return tail.replacingOccurrences(of: "\\n", with: "\n").replacingOccurrences(of: "\\\"", with: "\"")
    }
    return trimmed
}

private struct RTContentPayload: Decodable {
    let content: String?
}

private func judgeStreamDisplay(_ acc: String) -> String {
    var s = acc
    if let range = s.range(of: "\nMETA:", options: .backwards) {
        s = String(s[..<range.lowerBound])
    } else if s.hasPrefix("META:") {
        s = ""
    }
    s = s.trimmingCharacters(in: .whitespacesAndNewlines)
    if s == "[NO_JUDGE]" || s.hasPrefix("[NO_JUDGE]") { return "" }
    return s
}
