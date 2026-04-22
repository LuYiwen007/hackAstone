import SwiftUI

private enum DilemmaStage {
    case setup, debate, reveal
}

private struct DMMessage: Identifiable {
    let id: String
    var role: DMRole
    let content: String
}

private enum DMRole {
    case user, philosopher, judge
}

private struct DilemmaTurnDTO: Decodable {
    let philosopherReply: String?
    let judgeQuestion: String?
    let continueDebate: Bool?
}

private struct DilemmaSummaryDTO: Decodable {
    let fullExplanation: String?
}

/// 与 Web `/dilemma` 对齐：选择困境与立场，再选哲学家，多轮 Echo 讨论与总结。
struct DilemmaView: View {
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath

    @State private var selectedDilemmaId = MoralDilemmaCatalog.all[0].id
    @State private var selectedOptionId: String?
    @State private var selectedPhilosopherId: String?
    @State private var stage: DilemmaStage = .setup
    @State private var messages: [DMMessage] = []
    @State private var userInput = ""
    @State private var isThinking = false
    @State private var canReveal = false
    @State private var fullExplanation = ""
    @State private var isGeneratingSummary = false

    private var L: ArenaL10n { locale.L }
    private var en: Bool { L.prefersEnglish }

    private var currentDilemma: MoralDilemma { MoralDilemmaCatalog.dilemma(id: selectedDilemmaId) }
    private var selectedOption: MoralDilemmaOption? {
        guard let oid = selectedOptionId else { return nil }
        return currentDilemma.options.first { $0.id == oid }
    }
    private var selectedPhilosopher: Philosopher? {
        guard let pid = selectedPhilosopherId else { return nil }
        return catalog.philosophers.first { $0.id == pid }
    }

    private var recommendedPhilosophers: [Philosopher] {
        let preferred = Set(currentDilemma.recommendedPhilosopherIds)
        return catalog.philosophers.filter { preferred.contains($0.id) }
    }

    private var otherPhilosophers: [Philosopher] {
        let preferred = Set(currentDilemma.recommendedPhilosopherIds)
        return catalog.philosophers.filter { !preferred.contains($0.id) }.sorted { $0.period < $1.period }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                switch stage {
                case .setup:
                    setupContent
                case .debate:
                    if let opt = selectedOption, let p = selectedPhilosopher {
                        debateContent(dilemma: currentDilemma, option: opt, philosopher: p)
                    }
                case .reveal:
                    if let opt = selectedOption, let p = selectedPhilosopher {
                        revealContent(dilemma: currentDilemma, option: opt, philosopher: p)
                    }
                }
            }
            .padding(16)
            .padding(.bottom, 32)
        }
        .background(ArenaTheme.background)
        .navigationTitle(L.dilemmaNavTitle)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button(L.backToHome) { path = NavigationPath() }
            }
        }
    }

    private var setupContent: some View {
        VStack(alignment: .leading, spacing: 20) {
            VStack(spacing: 8) {
                Text(L.dilemmaHeroKicker)
                    .font(.caption)
                    .foregroundStyle(ArenaTheme.cyanAccent)
                    .tracking(3)
                Text(L.moralDilemma)
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(ArenaTheme.textPrimary)
                Text(L.dilemmaHeroSubtitle)
                    .font(.subheadline)
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            .frame(maxWidth: .infinity)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(MoralDilemmaCatalog.all) { d in
                        Button {
                            changeDilemma(d.id)
                        } label: {
                            Text(d.title(en))
                                .font(.subheadline.weight(d.id == currentDilemma.id ? .bold : .regular))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .foregroundStyle(d.id == currentDilemma.id ? Color.cyan.opacity(0.95) : ArenaTheme.textMuted)
                                .background(d.id == currentDilemma.id ? Color.cyan.opacity(0.15) : ArenaTheme.surface)
                                .clipShape(Capsule())
                                .overlay(Capsule().stroke(d.id == currentDilemma.id ? ArenaTheme.cyanAccent.opacity(0.6) : ArenaTheme.border))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            dilemmaHeroCard(currentDilemma)

            VStack(alignment: .leading, spacing: 16) {
                Text(currentDilemma.title(en))
                    .font(.title2.weight(.bold))
                    .foregroundStyle(ArenaTheme.textPrimary)
                Text(currentDilemma.subtitle(en))
                    .font(.subheadline)
                    .foregroundStyle(ArenaTheme.textMuted)

                VStack(alignment: .leading, spacing: 8) {
                    Text(L.dilemmaCoreQuestionLabel)
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.cyanAccent)
                    Text(currentDilemma.question(en))
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(ArenaTheme.textPrimary)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.cyan.opacity(0.06))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.cyan.opacity(0.25)))
                .clipShape(RoundedRectangle(cornerRadius: 12))

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(currentDilemma.options) { opt in
                        Button {
                            selectOption(opt.id)
                        } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(opt.label(en))
                                    .font(.headline)
                                    .foregroundStyle(ArenaTheme.textPrimary)
                                Text(opt.summary(en))
                                    .font(.caption)
                                    .foregroundStyle(ArenaTheme.textMuted)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(selectedOptionId == opt.id ? Color.cyan.opacity(0.12) : ArenaTheme.background)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(selectedOptionId == opt.id ? ArenaTheme.cyanAccent.opacity(0.55) : ArenaTheme.border))
                        }
                        .buttonStyle(.plain)
                    }
                }

                if let opt = selectedOption {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(L.dilemmaYourStanceSection)
                            .font(.caption)
                            .foregroundStyle(Color.orange.opacity(0.85))
                        Text(opt.label(en))
                            .font(.headline)
                            .foregroundStyle(ArenaTheme.textPrimary)
                        Text(opt.summary(en))
                            .font(.caption)
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.orange.opacity(0.08))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.orange.opacity(0.3)))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    Text(L.dilemmaChoosePhilosopherTitle)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(ArenaTheme.textPrimary)
                    Text(L.dilemmaChoosePhilosopherHint)
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)

                    if !recommendedPhilosophers.isEmpty {
                        Text(L.dilemmaRecommended)
                            .font(.caption)
                            .foregroundStyle(ArenaTheme.cyanAccent)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 260))], spacing: 12) {
                            ForEach(recommendedPhilosophers) { p in
                                philosopherChoiceCard(p, featured: true)
                            }
                        }
                    }

                    Text(L.dilemmaAllPhilosophers)
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 260))], spacing: 12) {
                        ForEach(otherPhilosophers) { p in
                            philosopherChoiceCard(p, featured: false)
                        }
                    }
                }
            }
            .padding(16)
            .background(ArenaTheme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(ArenaTheme.border))
        }
    }

    private func dilemmaHeroCard(_ dilemma: MoralDilemma) -> some View {
        let symbol: String = {
            switch dilemma.id {
            case "trolley-problem": return "tram.fill"
            case "brain-in-a-vat": return "brain.head.profile"
            default: return "theatermasks.fill"
            }
        }()
        return VStack(alignment: .leading, spacing: 0) {
            ZStack {
                LinearGradient(colors: [Color.cyan.opacity(0.35), ArenaTheme.background], startPoint: .topLeading, endPoint: .bottomTrailing)
                Image(systemName: symbol)
                    .font(.system(size: 80))
                    .foregroundStyle(.white.opacity(0.25))
            }
            .frame(height: 200)
            .frame(maxWidth: .infinity)
            Text(dilemma.imageCaption(en))
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(ArenaTheme.background.opacity(0.9))
        }
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(ArenaTheme.border))
        .accessibilityLabel(dilemma.imageAlt(en))
    }

    @ViewBuilder
    private func philosopherChoiceCard(_ p: Philosopher, featured: Bool) -> some View {
        Button {
            choosePhilosopher(p)
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top, spacing: 10) {
                    PhilosopherAvatarView(philosopher: p, size: 48)
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(p.displayName(isEnglish: en))
                                .font(.headline)
                                .foregroundStyle(ArenaTheme.textPrimary)
                                .lineLimit(1)
                            if featured {
                                Text(L.dilemmaFeaturedBadge)
                                    .font(.caption2.weight(.semibold))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color.cyan.opacity(0.2))
                                    .foregroundStyle(ArenaTheme.cyanAccent)
                                    .clipShape(Capsule())
                            }
                        }
                        Text(p.name)
                            .font(.caption2)
                            .foregroundStyle(ArenaTheme.textMuted)
                            .lineLimit(1)
                        Text("\(p.school) · \(formatPeriod(p.period))")
                            .font(.caption2)
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                    Spacer(minLength: 0)
                }
                Text(p.keyIdeas.prefix(3).joined(separator: en ? ", " : "、"))
                    .font(.caption)
                    .foregroundStyle(ArenaTheme.textMuted)
                    .lineLimit(2)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(featured ? Color.cyan.opacity(0.06) : ArenaTheme.background)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(featured ? ArenaTheme.cyanAccent.opacity(0.35) : ArenaTheme.border))
        }
        .buttonStyle(.plain)
    }

    private func debateContent(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(dilemma.title(en))
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.cyanAccent)
                    Text("\(philosopher.displayName(isEnglish: en)) — \(L.dilemmaNavTitle)")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(ArenaTheme.textPrimary)
                }
                Spacer()
                Button(L.dilemmaRechoosePhilosopher) {
                    resetDiscussion()
                }
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
            }

            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(L.dilemmaCurrentDilemmaLabel).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                    Text(dilemma.question(en)).font(.headline).foregroundStyle(ArenaTheme.textPrimary)
                    Text(dilemma.promptLead(en)).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(ArenaTheme.surface)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))

                VStack(alignment: .leading, spacing: 8) {
                    Text(L.yourPick).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                    Text(option.label(en)).font(.headline).foregroundStyle(ArenaTheme.textPrimary)
                    Text(option.summary(en)).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(ArenaTheme.surface)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
            }

            Label(L.dilemmaDiscussionNote, systemImage: "exclamationmark.circle")
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)

            ForEach(messages) { m in
                dmBubble(m, philosopher: philosopher)
            }
            if isThinking {
                Text(L.dilemmaThinking)
                    .font(.caption)
                    .foregroundStyle(ArenaTheme.textMuted)
            }

            HStack(spacing: 10) {
                TextField(L.dilemmaInputPlaceholder(name: philosopher.displayName(isEnglish: en)), text: $userInput)
                    .textFieldStyle(.roundedBorder)
                Button {
                    Task { await handleUserTurn(dilemma: dilemma, option: option, philosopher: philosopher) }
                } label: {
                    Image(systemName: "bubble.left.and.bubble.right.fill")
                }
                .disabled(userInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isThinking)
            }

            Button(L.goToSummary) {
                Task { await handleReveal(dilemma: dilemma, option: option, philosopher: philosopher) }
            }
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color.yellow.opacity(0.85))
            .foregroundStyle(.black)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .disabled((!canReveal && messages.count < 4))
        }
    }

    @ViewBuilder
    private func dmBubble(_ m: DMMessage, philosopher: Philosopher) -> some View {
        let border: Color = {
            switch m.role {
            case .user: return ArenaTheme.cyanAccent.opacity(0.55)
            case .philosopher: return ArenaTheme.border
            case .judge: return Color.yellow.opacity(0.45)
            }
        }()
        let bg: Color = {
            switch m.role {
            case .user: return ArenaTheme.cyanAccent.opacity(0.1)
            case .philosopher: return ArenaTheme.surface
            case .judge: return Color.yellow.opacity(0.08)
            }
        }()
        let who: String = {
            switch m.role {
            case .user: return L.you
            case .philosopher: return philosopher.displayName(isEnglish: en)
            case .judge: return L.judge
            }
        }()
        VStack(alignment: .leading, spacing: 6) {
            Text(who).font(.caption2).foregroundStyle(ArenaTheme.textMuted)
            Text(m.content).font(.subheadline).foregroundStyle(ArenaTheme.textPrimary)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(bg)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(border))
    }

    private func revealContent(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher) -> some View {
        let displayName = philosopher.displayName(isEnglish: en)
        return VStack(alignment: .leading, spacing: 16) {
            Text(dilemma.title(en)).font(.caption).foregroundStyle(ArenaTheme.cyanAccent)
            Text(L.fullAnalysis).font(.title2.weight(.bold)).foregroundStyle(ArenaTheme.textPrimary)
            Text(L.dilemmaRevealLine(option: option.label(en), philosopher: displayName))
                .font(.subheadline)
                .foregroundStyle(ArenaTheme.textMuted)

            Text(isGeneratingSummary ? L.agentGeneratingSummary : fullExplanation)
                .font(.body)
                .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(16)
                .background(ArenaTheme.background)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))

            DebateSummarySection(
                philosopher: philosopher,
                question: "\(dilemma.title(en))：\(dilemma.question(en))",
                userChoice: .uncertain,
                userReason: messages.filter { $0.role == .user }.map(\.content).joined(separator: "\n")
            )

            HStack(spacing: 12) {
                Button(L.dilemmaContinueWithPhilosopher) {
                    resetDiscussion()
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                Button(L.viewMindProfile) {
                    path = NavigationPath()
                    path.append(AppRoute.profile)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(ArenaTheme.cyanAccent)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(18)
        .background(ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
    }

    private func changeDilemma(_ id: String) {
        selectedDilemmaId = id
        selectedOptionId = nil
        selectedPhilosopherId = nil
        stage = .setup
        messages = []
        userInput = ""
        canReveal = false
        fullExplanation = ""
    }

    private func selectOption(_ id: String) {
        selectedOptionId = id
        selectedPhilosopherId = nil
        stage = .setup
        messages = []
        userInput = ""
        canReveal = false
        fullExplanation = ""
    }

    private func choosePhilosopher(_ p: Philosopher) {
        guard let opt = selectedOption else { return }
        selectedPhilosopherId = p.id
        messages = [
            DMMessage(id: "judge-open-\(UUID().uuidString)", role: .judge, content: L.dilemmaJudgeOpening(optionLabel: opt.label(en))),
        ]
        userInput = ""
        canReveal = false
        fullExplanation = ""
        stage = .debate
    }

    private func resetDiscussion() {
        stage = .setup
        selectedPhilosopherId = nil
        messages = []
        userInput = ""
        canReveal = false
        fullExplanation = ""
    }

    private func handleUserTurn(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher) async {
        let content = userInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !content.isEmpty, !isThinking else { return }
        await MainActor.run {
            userInput = ""
            isThinking = true
        }
        var next = await MainActor.run { messages }
        next.append(DMMessage(id: "u-\(UUID().uuidString)", role: .user, content: content))
        await MainActor.run { messages = next }

        let historyText = next.map { m -> String in
            let speaker: String = {
                switch m.role {
                case .user: return L.user
                case .judge: return L.judge
                case .philosopher: return philosopher.displayName(isEnglish: en)
                }
            }()
            return "\(speaker)：\(m.content)"
        }.joined(separator: "\n")

        do {
            let resp = try await ArenaAPI.dilemmaTurn(
                moralDilemmaTitle: dilemma.title(false),
                moralDilemmaEnglishTitle: dilemma.title(true),
                question: dilemma.question(false),
                promptLead: dilemma.promptLead(false),
                userStance: option.stancePrompt(false),
                philosopherName: philosopher.nameCN,
                philosopherSchool: philosopher.school,
                keyIdeas: philosopher.keyIdeas.joined(separator: "、"),
                history: historyText
            )
            let dto = JsonPayload.parse(resp.text, as: DilemmaTurnDTO.self)
            let turn: (String, String, Bool)
            if let dto, let pr = dto.philosopherReply, let jq = dto.judgeQuestion {
                turn = (pr, jq, dto.continueDebate ?? true)
            } else {
                turn = localTurnFallback(philosopher: philosopher, dilemma: dilemma, option: option, userInput: content)
            }
            await MainActor.run {
                messages.append(DMMessage(id: "ph-\(UUID().uuidString)", role: .philosopher, content: turn.0))
                messages.append(DMMessage(id: "jg-\(UUID().uuidString)", role: .judge, content: turn.1))
                canReveal = turn.2 == false
                isThinking = false
            }
        } catch {
            let turn = localTurnFallback(philosopher: philosopher, dilemma: dilemma, option: option, userInput: content)
            await MainActor.run {
                messages.append(DMMessage(id: "ph-\(UUID().uuidString)", role: .philosopher, content: turn.0))
                messages.append(DMMessage(id: "jg-\(UUID().uuidString)", role: .judge, content: turn.1))
                canReveal = false
                isThinking = false
            }
        }
    }

    private func handleReveal(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher) async {
        await MainActor.run {
            stage = .reveal
            isGeneratingSummary = true
            fullExplanation = localSummaryFallback(philosopher: philosopher, dilemma: dilemma, option: option)
        }

        let history = await MainActor.run { messages }.map { m -> String in
            let speaker: String = {
                switch m.role {
                case .user: return L.user
                case .judge: return L.judge
                case .philosopher: return philosopher.displayName(isEnglish: en)
                }
            }()
            return "\(speaker)：\(m.content)"
        }.joined(separator: "\n")

        do {
            let resp = try await ArenaAPI.dilemmaSummary(
                moralDilemmaTitle: dilemma.title(false),
                question: dilemma.question(false),
                userStance: option.stancePrompt(false),
                philosopherName: philosopher.nameCN,
                philosopherSchool: philosopher.school,
                history: history
            )
            if let parsed = JsonPayload.parse(resp.text, as: DilemmaSummaryDTO.self), let fe = parsed.fullExplanation, !fe.isEmpty {
                await MainActor.run { fullExplanation = fe }
            }
        } catch {}
        await MainActor.run { isGeneratingSummary = false }
    }

    private func localTurnFallback(philosopher: Philosopher, dilemma: MoralDilemma, option: MoralDilemmaOption, userInput: String) -> (String, String, Bool) {
        let clip = String(userInput.prefix(24))
        let name = philosopher.nameCN
        let title = dilemma.title(false)
        let label = option.label(false)
        let reply = "\(name)：你刚才坚持「\(label)」，这说明你把 \(clip) 放在了论证中心。但在 \(title) 中，真正关键的是你愿意为哪一种原则承担后果，以及你如何界定人的价值。"
        let judge = "Judge：如果把你的立场推广成所有人都遵守的规则，它最容易在哪个情境下失效？你会怎么修补它？"
        return (reply, judge, true)
    }

    private func localSummaryFallback(philosopher: Philosopher, dilemma: MoralDilemma, option: MoralDilemmaOption) -> String {
        let name = philosopher.nameCN
        let title = dilemma.title(false)
        let label = option.label(false)
        let sum = option.summary(false)
        return [
            "\(name) 会把这场关于「\(title)」的讨论，拉回到更深层的原则问题。",
            "",
            "你的选择是：\(label)。",
            "这意味着你优先考虑的是：\(sum)",
            "",
            "如果继续沿着 \(name) 的思路推进，讨论通常会落到三个问题上：",
            "1. 你究竟把什么看作最应该被保护的价值。",
            "2. 你的规则是否能在更普遍的情境中成立。",
            "3. 当后果与原则冲突时，你愿意牺牲哪一边。",
            "",
            "这一版先保留为通用总结，后续我们还可以继续细化每个困境的专属生成结果。",
        ].joined(separator: "\n")
    }

    private func formatPeriod(_ period: Int) -> String {
        if period < 0 {
            return en ? "BCE \(abs(period))" : "公元前 \(abs(period))"
        }
        return en ? "CE \(period)" : "公元 \(period)"
    }
}
