import SwiftUI

private enum BattleChoice: String {
    case builder, breaker, uncertain
}

private enum BattleStage {
    case choose, debate, summary
}

private enum DisciplineSpeaker: String {
    case user, builder, breaker
}

private struct DisciplineChatMessage: Identifiable {
    let id: String
    let speaker: DisciplineSpeaker
    var content: String
    let timestamp: Date
}

struct BattleView: View {
    let battleId: String
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath

    private var L: ArenaL10n { locale.L }

    @State private var stage: BattleStage = .choose
    @State private var choice: BattleChoice?
    @State private var messages: [DisciplineChatMessage] = []
    @State private var userInput = ""
    @State private var isThinking = false
    @State private var summaryText: String?
    @State private var isGeneratingSummary = false
    @State private var errorMessage: String?

    private var battle: Battle? {
        catalog.battleForDisplay(id: battleId, english: L.prefersEnglish)
            ?? catalog.allBattles(english: L.prefersEnglish).first { $0.id == battleId }
    }

    private var dialogueRounds: Int {
        messages.filter { $0.speaker == .user }.count
    }

    private var canEndDebate: Bool {
        dialogueRounds >= 1 && !isThinking
    }

    var body: some View {
        Group {
            if let battle {
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        header(battle: battle)
                        questionBlock(battle: battle)
                        builderBreaker(battle: battle)
                        stageContent(battle: battle)
                    }
                    .padding(16)
                    .padding(.bottom, 32)
                }
                .background(ArenaTheme.background)
            } else {
                missingBattle
            }
        }
        .onChange(of: stage) { _, newStage in
            if newStage == .summary, let battle, let choice, AuthStore.bearerToken != nil {
                let summary = summaryText ?? battle.reveal
                Task {
                    try? await ArenaAPI.saveBattleRecord(
                        battleType: "battle",
                        topic: battle.question,
                        userChoice: choice.rawValue,
                        judgeSummary: summary,
                        changedStance: false
                    )
                }
            }
        }
    }

    private var missingBattle: some View {
        VStack(spacing: 16) {
            Text(L.battleMissing)
                .font(.title2.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            Button(L.backToDisciplines) { path = NavigationPath(); path.append(AppRoute.disciplines) }
                .buttonStyle(.borderedProminent)
                .tint(.orange)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ArenaTheme.background)
    }

    private func header(battle: Battle) -> some View {
        HStack(alignment: .center) {
            Button {
                path = NavigationPath()
                path.append(AppRoute.disciplines)
            } label: {
                Label(L.backToDisciplines, systemImage: "chevron.left")
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            .buttonStyle(.plain)
            Spacer()
            Text(battle.category)
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
        }
    }

    private func questionBlock(battle: Battle) -> some View {
        VStack(spacing: 10) {
            Text(battle.question)
                .font(.system(size: 28, weight: .bold))
                .multilineTextAlignment(.center)
                .foregroundStyle(ArenaTheme.textPrimary)
            HStack(spacing: 6) {
                Circle().fill(ArenaTheme.orangeAccent).frame(width: 6, height: 6)
                Text(L.battleInProgress)
                    .font(.caption)
                    .foregroundStyle(ArenaTheme.textMuted)
            }
        }
        .frame(maxWidth: .infinity)
    }

    private func builderBreaker(battle: Battle) -> some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: 14)], spacing: 14) {
            stanceCard(title: "Builder", subtitle: L.builderSubtitle, letter: "B", text: battle.builderView, color: .blue, selected: choice == .builder)
            stanceCard(title: "Breaker", subtitle: L.breakerSubtitle, letter: "B", text: battle.breakerView, color: .red, selected: choice == .breaker)
        }
    }

    private func stanceCard(title: String, subtitle: String, letter: String, text: String, color: Color, selected: Bool) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                ZStack {
                    Circle().fill(color.opacity(0.85)).frame(width: 40, height: 40)
                    Text(letter).font(.headline).foregroundStyle(.white)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.headline).foregroundStyle(ArenaTheme.textPrimary)
                    Text(subtitle).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                }
            }
            Text(text)
                .font(.subheadline)
                .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(selected ? color.opacity(0.12) : ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(selected ? color : ArenaTheme.border, lineWidth: 2))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    @ViewBuilder
    private func stageContent(battle: Battle) -> some View {
        switch stage {
        case .choose:
            choosePanel
        case .debate:
            debatePanel(battle: battle)
        case .summary:
            summaryPanel(battle: battle)
        }
    }

    private var choosePanel: some View {
        VStack(spacing: 14) {
            Text(L.yourStance)
                .font(.title3.weight(.bold))
                .frame(maxWidth: .infinity)
            choiceButton(title: L.supportBuilderTitle(builder: "Builder"), subtitle: L.supportBuilderSubtitle(builder: "Builder"), picked: choice == .builder) { choice = .builder }
            choiceButton(title: L.supportBreakerTitle(breaker: "Breaker"), subtitle: L.supportBreakerSubtitle(breaker: "Breaker"), picked: choice == .breaker) { choice = .breaker }
            choiceButton(title: L.uncertainChoiceTitle, subtitle: L.uncertainChoiceSubtitle, picked: choice == .uncertain) { choice = .uncertain }
            if choice != nil {
                Button(L.startDialogue) {
                    stage = .debate
                    messages = []
                    userInput = ""
                    summaryText = nil
                    errorMessage = nil
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.orange)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(20)
        .background(ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
    }

    private func choiceButton(title: String, subtitle: String, picked: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.headline).foregroundStyle(ArenaTheme.textPrimary)
                Text(subtitle).font(.caption).foregroundStyle(ArenaTheme.textMuted)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .background(picked ? Color.orange.opacity(0.12) : ArenaTheme.background)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(picked ? Color.orange : ArenaTheme.border, lineWidth: 2))
        }
        .buttonStyle(.plain)
    }

    private func debatePanel(battle: Battle) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(L.dialogueHint)
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
                .frame(maxWidth: .infinity)

            VStack(alignment: .leading, spacing: 12) {
                if messages.isEmpty {
                    Text(L.dialogueEmpty)
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, 24)
                }
                ForEach(messages) { msg in
                    chatBubble(msg)
                }
            }
            .padding(14)
            .frame(minHeight: 240)
            .background(ArenaTheme.surface)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))

            HStack(spacing: 10) {
                TextField(L.dialoguePlaceholder, text: $userInput, axis: .vertical)
                    .arenaInputTextStyle()
                    .lineLimit(3...6)
                    .disabled(isThinking)
                Button(L.send) { Task { await sendUserTurn(battle: battle) } }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                    .disabled(userInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isThinking)
            }

            if let errorMessage {
                Text(errorMessage).font(.caption).foregroundStyle(.red)
            }

            HStack(spacing: 12) {
                Button(L.back) {
                    stage = .choose
                    messages = []
                }
                .buttonStyle(.bordered)
                Button(L.endDebate) { Task { await endDebate(battle: battle) } }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                    .disabled(!canEndDebate || isGeneratingSummary)
            }
            if !canEndDebate && dialogueRounds == 0 {
                Text(L.endDebateHint).font(.caption2).foregroundStyle(ArenaTheme.textMuted)
            }
        }
    }

    private func chatBubble(_ msg: DisciplineChatMessage) -> some View {
        let isUser = msg.speaker == .user
        let label: String = {
            switch msg.speaker {
            case .user: return L.you
            case .builder: return "Builder"
            case .breaker: return "Breaker"
            }
        }()
        let color: Color = msg.speaker == .builder ? .blue : msg.speaker == .breaker ? .red : .orange
        return HStack {
            if isUser { Spacer(minLength: 40) }
            VStack(alignment: isUser ? .trailing : .leading, spacing: 4) {
                Text(label).font(.caption2).foregroundStyle(ArenaTheme.textMuted)
                Text(msg.content.isEmpty && isThinking ? "…" : msg.content)
                    .font(.subheadline)
                    .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                    .multilineTextAlignment(isUser ? .trailing : .leading)
            }
            .padding(12)
            .background(isUser ? Color.orange.opacity(0.15) : color.opacity(0.12))
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(isUser ? Color.orange.opacity(0.4) : color.opacity(0.35)))
            if !isUser { Spacer(minLength: 40) }
        }
    }

    private func summaryPanel(battle: Battle) -> some View {
        VStack(spacing: 20) {
            Text("💡").font(.system(size: 44))
            Text(L.fullPerspective)
                .font(.title2.weight(.bold))
            Text(L.fullPerspectiveSubtitle)
                .font(.subheadline)
                .foregroundStyle(ArenaTheme.textMuted)
            if isGeneratingSummary {
                ProgressView(L.summaryGenerating)
            }
            Text(summaryText ?? battle.reveal)
                .font(.body)
                .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                .frame(maxWidth: .infinity, alignment: .leading)
            HStack(spacing: 12) {
                Button(L.backHome) { path = NavigationPath() }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                Button(L.viewMindProfile) { path = NavigationPath(); path.append(AppRoute.profile) }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.orange)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(22)
        .background(
            LinearGradient(colors: [ArenaTheme.surface, ArenaTheme.background], startPoint: .top, endPoint: .bottom)
        )
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.orange.opacity(0.35), lineWidth: 2))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func buildHistory() -> String {
        messages.map { msg in
            let who: String
            switch msg.speaker {
            case .user: who = L.prefersEnglish ? "User" : "用户"
            case .builder: who = "Builder"
            case .breaker: who = "Breaker"
            }
            return "\(who): \(msg.content)"
        }.joined(separator: "\n")
    }

    private func sendUserTurn(battle: Battle) async {
        guard let choice else { return }
        let content = userInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !content.isEmpty, !isThinking else { return }

        let userMsg = DisciplineChatMessage(id: "user-\(Date().timeIntervalSince1970)", speaker: .user, content: content, timestamp: Date())
        let prior = messages
        messages.append(userMsg)
        userInput = ""
        isThinking = true
        errorMessage = nil
        let history = buildHistory()

        do {
            if choice == .uncertain {
                let builderId = "builder-\(Date().timeIntervalSince1970)"
                messages.append(DisciplineChatMessage(id: builderId, speaker: .builder, content: "", timestamp: Date()))

                let resp = try await ArenaAPI.streamDisciplineDebateDual(
                    question: battle.question,
                    builderView: battle.builderView,
                    breakerView: battle.breakerView,
                    userMessage: content,
                    history: history,
                    locale: L.prefersEnglish ? "en" : "zh",
                    onDelta: { _, acc in
                        let preview = ArenaBilingualParsing.finalizeStreamSpeech(acc)
                        let dual = ArenaBilingualParsing.parseDisciplineDual(from: acc, structured: nil)
                        Task { @MainActor in
                            if let i = messages.firstIndex(where: { $0.id == builderId }) {
                                messages[i].content = dual?.builder ?? preview
                            }
                        }
                    }
                )
                guard let dual = resp.disciplineDual ?? ArenaBilingualParsing.parseDisciplineDual(from: resp.text, structured: nil) else {
                    throw ArenaAPIError.serverMessage(L.disciplineTurnFailed)
                }
                let ts = Date().timeIntervalSince1970
                messages = prior + [
                    userMsg,
                    DisciplineChatMessage(id: builderId, speaker: .builder, content: dual.builder, timestamp: Date(timeIntervalSince1970: ts)),
                    DisciplineChatMessage(id: "breaker-\(ts)", speaker: .breaker, content: dual.breaker, timestamp: Date(timeIntervalSince1970: ts + 0.001)),
                ]
            } else {
                let role: DisciplineSpeaker = choice == .builder ? .breaker : .builder
                let oppId = "\(role.rawValue)-\(Date().timeIntervalSince1970)"
                messages.append(DisciplineChatMessage(id: oppId, speaker: role, content: "", timestamp: Date()))

                let resp = try await ArenaAPI.streamDisciplineDebateOpponent(
                    question: battle.question,
                    builderView: battle.builderView,
                    breakerView: battle.breakerView,
                    userChoice: choice.rawValue,
                    userMessage: content,
                    history: history,
                    locale: L.prefersEnglish ? "en" : "zh",
                    onDelta: { _, acc in
                        let preview = ArenaBilingualParsing.finalizeStreamSpeech(acc)
                        Task { @MainActor in
                            if let i = messages.firstIndex(where: { $0.id == oppId }) {
                                messages[i].content = preview
                            }
                        }
                    }
                )
                let finalText = ArenaBilingualParsing.finalizeStreamSpeech(resp.text)
                guard !finalText.isEmpty else { throw ArenaAPIError.serverMessage(L.disciplineTurnFailed) }
                messages = prior + [userMsg, DisciplineChatMessage(id: oppId, speaker: role, content: finalText, timestamp: Date())]
            }
        } catch {
            messages = prior
            userInput = content
            errorMessage = (error as? LocalizedError)?.errorDescription ?? L.disciplineTurnFailed
        }
        isThinking = false
    }

    private func endDebate(battle: Battle) async {
        guard let choice, canEndDebate else { return }
        stage = .summary
        isGeneratingSummary = true
        summaryText = nil
        let history = buildHistory()
        do {
            let resp = try await ArenaAPI.streamDisciplineDebateSummary(
                question: battle.question,
                builderView: battle.builderView,
                breakerView: battle.breakerView,
                userChoice: choice.rawValue,
                history: history
            )
            if let sum = resp.disciplineSummary {
                summaryText = L.prefersEnglish ? sum.en : sum.zh
            } else if let parsed = ArenaBilingualParsing.parseDisciplineSummary(from: resp.text, structured: nil) {
                summaryText = L.prefersEnglish ? parsed.en : parsed.zh
            } else {
                throw ArenaAPIError.serverMessage(L.disciplineSummaryFailed)
            }
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? L.disciplineSummaryFailed
            stage = .debate
        }
        isGeneratingSummary = false
    }
}
