import SwiftUI

/// 对齐 Web `DebateSummary`：Echo 智能总结 + 按用户 uid 保存笔记。
struct DebateSummarySection: View {
    @EnvironmentObject private var locale: AppLocaleStore
    @EnvironmentObject private var auth: AuthStore
    let philosopher: Philosopher
    let question: String
    let userChoice: PhilosophyChoice?
    let userReason: String
    var sourceType: String = "debate"

    @State private var insight: AiDebateInsight?
    @State private var isLoading = true
    @State private var loadError: String?
    @State private var notes = ""
    @State private var showNotes = false
    @State private var noteSaving = false
    @State private var noteMessage: String?

    private var L: ArenaL10n { locale.L }
    private var sourceKey: String {
        ArenaBilingualParsing.buildDebateNoteKey(philosopherId: philosopher.id, question: question)
    }

    var body: some View {
        let displayName = philosopher.displayName(isEnglish: L.prefersEnglish)
        VStack(alignment: .leading, spacing: 16) {
            Label(L.debateSummaryTitle, systemImage: "lightbulb.fill")
                .font(.title3.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)

            if isLoading {
                Text(L.topicGenerating).font(.caption).foregroundStyle(ArenaTheme.textMuted)
            } else if let err = loadError {
                Text(err).font(.caption).foregroundStyle(Color.red.opacity(0.9))
            } else if let s = insight {
                insightContent(s: s, displayName: displayName)
            }

            notesSection
        }
        .padding(16)
        .background(ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
        .padding(.top, 8)
        .task(id: "\(philosopher.id)-\(question.hashValue)-\(userReason.hashValue)-\(String(describing: userChoice))-\(auth.session?.userId ?? "")") {
            await loadInsight()
        }
        .task(id: "\(sourceKey)-\(auth.session?.userId ?? "")") {
            await loadNote()
        }
    }

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Button {
                showNotes.toggle()
            } label: {
                HStack {
                    Label(L.personalNotes, systemImage: "note.text")
                        .font(.headline)
                    Spacer()
                    Image(systemName: showNotes ? "chevron.down" : "chevron.right")
                        .foregroundStyle(ArenaTheme.textMuted)
                }
            }
            .buttonStyle(.plain)

            if showNotes {
                TextEditor(text: $notes)
                    .arenaInputTextStyle()
                    .frame(minHeight: 120)
                    .padding(8)
                    .background(ArenaTheme.background)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                Button {
                    Task { await saveNote() }
                } label: {
                    Text(noteSaving ? L.savingNote : (auth.isLoggedIn ? L.saveNote : L.loginToSaveNote))
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                }
                .buttonStyle(.borderedProminent)
                .tint(.purple)
                .disabled(noteSaving || !auth.isLoggedIn)
                if let noteMessage {
                    Text(noteMessage)
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
            }
        }
    }

    @ViewBuilder
    private func insightContent(s: AiDebateInsight, displayName: String) -> some View {
        Group {
            VStack(alignment: .leading, spacing: 8) {
                Text(L.corePoints)
                    .font(.headline)
                ForEach(Array(s.corePoints.enumerated()), id: \.offset) { _, p in
                    Text("• \(p)")
                        .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                }
            }

            VStack(alignment: .leading, spacing: 10) {
                Text(L.stanceCompare)
                    .font(.headline)
                Group {
                    Text(L.philosopherStanceLabel(name: displayName)).font(.subheadline.weight(.semibold))
                    Text(s.comparison.philosopherStance)
                        .foregroundStyle(ArenaTheme.textMuted)
                    Text(L.yourStanceLabel).font(.subheadline.weight(.semibold)).padding(.top, 4)
                    Text(s.comparison.userStance)
                        .foregroundStyle(ArenaTheme.textMuted)
                    Text(L.alignmentLabel(s.comparison.alignment))
                        .padding(.top, 4)
                        .foregroundStyle(ArenaTheme.cyanAccent)
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                Text(L.deepQuestions)
                    .font(.headline)
                ForEach(Array(s.deepQuestions.enumerated()), id: \.offset) { i, q in
                    Text("\(i + 1). \(q)")
                        .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                }
            }
        }
    }

    private struct InsightComparison: Decodable {
        let philosopherStance: String
        let userStance: String
        let alignment: String
    }

    private struct AiDebateInsight: Decodable {
        let corePoints: [String]
        let comparison: InsightComparison
        let deepQuestions: [String]
    }

    private func loadInsight() async {
        await MainActor.run {
            isLoading = true
            loadError = nil
            insight = nil
        }
        let prompt = buildInsightPrompt()
        do {
            let resp = try await ArenaAPI.runEcho(query: prompt, onDelta: nil)
            guard let parsed = JsonPayload.parse(resp.text, as: AiDebateInsight.self),
                  !parsed.corePoints.isEmpty,
                  !parsed.deepQuestions.isEmpty else {
                throw NSError(domain: "summary", code: 1, userInfo: [NSLocalizedDescriptionKey: L.topicBadJson])
            }
            await MainActor.run { insight = parsed }
        } catch {
            await MainActor.run { loadError = error.localizedDescription }
        }
        await MainActor.run { isLoading = false }
    }

    private func loadNote() async {
        guard auth.isLoggedIn else {
            await MainActor.run { notes = "" }
            return
        }
        do {
            if let content = try await ArenaAPI.fetchDebateNote(sourceType: sourceType, sourceKey: sourceKey) {
                await MainActor.run { notes = content }
            }
        } catch {
            /* 无笔记时忽略 */
        }
    }

    private func saveNote() async {
        guard auth.isLoggedIn else { return }
        await MainActor.run {
            noteSaving = true
            noteMessage = nil
        }
        do {
            try await ArenaAPI.saveDebateNote(
                sourceType: sourceType,
                sourceKey: sourceKey,
                topic: question,
                content: notes
            )
            await MainActor.run { noteMessage = L.noteSaved }
        } catch {
            await MainActor.run { noteMessage = error.localizedDescription }
        }
        await MainActor.run { noteSaving = false }
    }

    private func buildInsightPrompt() -> String {
        let choiceLabel: String = {
            switch userChoice {
            case .agree: return L.prefersEnglish ? "Agree with philosopher" : "同意哲学家立场"
            case .disagree: return L.prefersEnglish ? "Oppose philosopher" : "反对哲学家立场"
            case .uncertain: return L.prefersEnglish ? "Uncertain" : "不确定"
            case nil: return L.prefersEnglish ? "Not selected" : "未选择"
            }
        }()
        let ideas = philosopher.keyIdeas.joined(separator: "、")
        let reason = userReason.isEmpty ? (L.prefersEnglish ? "(No user text)" : "（用户未留下文字）") : userReason
        return """
        [ROLE]
        CA-Echo-LLM

        [TASK]
        根据一场哲学辩论的信息，生成结构化「智能总结」，仅返回 JSON。

        [RETURN_FORMAT]
        {"corePoints":["..."],"comparison":{"philosopherStance":"...","userStance":"...","alignment":"..."},"deepQuestions":["..."]}

        [CONSTRAINTS]
        中文；corePoints 至少 3 条；deepQuestions 至少 3 条；comparison.userStance 应概括用户理由；仅返回 JSON。

        哲学家：\(philosopher.nameCN)；学派：\(philosopher.school)；关键思想：\(ideas)
        辩题：\(question)
        用户立场标签：\(choiceLabel)
        用户陈述与理由：\(reason)
        """
    }
}

enum PhilosophyChoice: String, Hashable {
    case agree, disagree, uncertain
}
