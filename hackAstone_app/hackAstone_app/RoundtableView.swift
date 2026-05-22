import SwiftUI

private struct RTMessage: Identifiable {
    let id: String
    var speaker: String
    let content: String
}

private struct RTMessagesPayload: Decodable {
    let messages: [RTMsg]?
}

private struct RTMsg: Decodable {
    let speaker: String
    let content: String
}

private enum RTStage {
    case setup, debate
}

struct RoundtableView: View {
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath

    private var L: ArenaL10n { locale.L }

    @State private var stage: RTStage = .setup
    @State private var selected: [Philosopher] = []
    @State private var debateTopic = ""
    @State private var customTopic = ""
    @State private var messages: [RTMessage] = []
    @State private var userInput = ""
    @State private var isThinking = false
    @State private var streamPreview = ""
    @State private var errorAlert: String?

    private let presetTopicIds: [String] = ["ai-free-will", "utopia", "truth", "education"]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header
                if stage == .setup { setup }
                else { debate }
            }
            .padding(16)
            .padding(.bottom, 28)
        }
        .background(ArenaTheme.background)
        .alert(L.apiRequestFailedTitle, isPresented: Binding(
            get: { errorAlert != nil },
            set: { if !$0 { errorAlert = nil } }
        )) {
            Button(L.alertConfirm, role: .cancel) { errorAlert = nil }
        } message: {
            Text(errorAlert ?? "")
        }
    }

    private var header: some View {
        HStack {
            Button { path = NavigationPath() } label: {
                Label(L.backToHome, systemImage: "chevron.left")
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            Spacer()
            HStack(spacing: 8) {
                Image(systemName: "person.3.sequence.fill").foregroundStyle(ArenaTheme.orangeAccent)
                Text(L.roundtableHeadline).font(.headline)
            }
        }
        .padding(.vertical, 4)
    }

    private var setup: some View {
        VStack(alignment: .leading, spacing: 24) {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("1.").font(.title2.weight(.bold)).foregroundStyle(ArenaTheme.orangeAccent)
                    Text(L.pickThinkers).font(.title2.weight(.bold))
                    Text(L.pickThinkersHint).font(.subheadline).foregroundStyle(ArenaTheme.textMuted)
                }
                .foregroundStyle(ArenaTheme.textPrimary)
                if !selected.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(L.selectedCount(selected.count)).font(.caption.weight(.semibold)).foregroundStyle(ArenaTheme.orangeAccent)
                        FlowSelected(philosophers: selected, isEnglish: L.prefersEnglish) { id in
                            selected.removeAll { $0.id == id }
                        }
                    }
                    .padding(12)
                    .background(ArenaTheme.surface)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.orange.opacity(0.35)))
                }
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 140), spacing: 8)], spacing: 8) {
                    ForEach(catalog.philosophers.filter { $0.majorWorks != nil }) { p in
                        let picked = selected.contains { $0.id == p.id }
                        let full = selected.count >= 4 && !picked
                        Button {
                            add(p)
                        } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(p.displayName(isEnglish: L.prefersEnglish)).font(.subheadline.weight(.semibold)).foregroundStyle(ArenaTheme.textPrimary)
                                Text(p.school).font(.caption2).foregroundStyle(ArenaTheme.textMuted)
                                if picked { Text(L.picked).font(.caption2).foregroundStyle(ArenaTheme.orangeAccent) }
                            }
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(ArenaTheme.surface)
                            .opacity(full ? 0.35 : 1)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(picked ? Color.orange.opacity(0.6) : ArenaTheme.border))
                        }
                        .disabled(picked || full)
                        .buttonStyle(.plain)
                    }
                }
            }

            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("2.").font(.title2.weight(.bold)).foregroundStyle(ArenaTheme.orangeAccent)
                    Text(L.pickTopic).font(.title2.weight(.bold))
                }
                .foregroundStyle(ArenaTheme.textPrimary)
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 260), spacing: 10)], spacing: 10) {
                    ForEach(presetTopicIds, id: \.self) { id in
                        let t = L.presetTopic(id: id)
                        Button {
                            debateTopic = t.title
                            customTopic = ""
                        } label: {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(t.title).font(.subheadline.weight(.semibold)).foregroundStyle(ArenaTheme.textPrimary)
                                Text(t.description).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(debateTopic == t.title ? Color.orange.opacity(0.15) : ArenaTheme.surface)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(debateTopic == t.title ? Color.orange.opacity(0.65) : ArenaTheme.border))
                        }
                        .buttonStyle(.plain)
                    }
                }
                VStack(alignment: .leading, spacing: 6) {
                    Text(L.customTopicLabel).font(.caption.weight(.semibold)).foregroundStyle(ArenaTheme.textMuted)
                    TextField(L.customTopicPlaceholder, text: $customTopic)
                        .arenaInputTextStyle()
                        .textFieldStyle(.roundedBorder)
                        .onChange(of: customTopic) { _, v in
                            debateTopic = v
                        }
                }
                .padding(12)
                .background(ArenaTheme.surface)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border, style: StrokeStyle(lineWidth: 1, dash: [4])))
            }

            VStack(spacing: 8) {
                Button {
                    startDebate()
                } label: {
                    Label(L.startRoundtable, systemImage: "sparkles")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(.orange)
                .disabled(selected.count < 2 || debateTopic.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                if selected.count < 2 || debateTopic.isEmpty {
                    Text(L.roundtableSetupError)
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
            }
            .frame(maxWidth: .infinity)
        }
    }

    private var debate: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(spacing: 8) {
                Text(debateTopic)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(ArenaTheme.orangeAccent)
                    .multilineTextAlignment(.center)
                HStack(spacing: 8) {
                    Text(L.participants).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                    Text(selected.map { $0.displayName(isEnglish: L.prefersEnglish) }.joined(separator: L.prefersEnglish ? ", " : "、"))
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(ArenaTheme.textPrimary)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity)
            .background(
                LinearGradient(colors: [Color.orange.opacity(0.12), Color.red.opacity(0.08)], startPoint: .leading, endPoint: .trailing)
            )
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.orange.opacity(0.3)))

            ScrollView {
                LazyVStack(alignment: .leading, spacing: 16) {
                    ForEach(messages) { msg in
                        messageRow(msg)
                    }
                    if isThinking {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 10) {
                                Circle().fill(ArenaTheme.border).frame(width: 40, height: 40)
                                Text(L.thinkersThinking)
                                    .font(.caption)
                                    .foregroundStyle(ArenaTheme.textMuted)
                            }
                            if !streamPreview.isEmpty {
                                Text(streamPreview)
                                    .font(.caption)
                                    .foregroundStyle(ArenaTheme.textMuted)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(12)
                                    .background(ArenaTheme.surface)
                                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                            }
                        }
                    }
                }
                .padding(.vertical, 8)
            }
            .frame(minHeight: 320)
            .padding(12)
            .background(ArenaTheme.surface)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))

            HStack(spacing: 10) {
                TextField(L.roundtableInputPlaceholder, text: $userInput)
                    .arenaInputTextStyle()
                    .textFieldStyle(.roundedBorder)
                Button(L.send) { sendUser() }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                    .disabled(userInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isThinking)
            }
            .padding(12)
            .background(ArenaTheme.surface)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
        }
    }

    @ViewBuilder
    private func messageRow(_ msg: RTMessage) -> some View {
        let isUser = msg.speaker == "user"
        let p = catalog.philosophers.first { $0.id == msg.speaker }
        HStack(alignment: .top, spacing: 10) {
            if !isUser, let p {
                ZStack {
                    Circle().fill(LinearGradient(colors: [.orange, .red.opacity(0.85)], startPoint: .topLeading, endPoint: .bottomTrailing))
                    Text(String(p.displayName(isEnglish: L.prefersEnglish).prefix(1))).font(.caption.weight(.bold)).foregroundStyle(.white)
                }
                .frame(width: 40, height: 40)
            }
            VStack(alignment: isUser ? .trailing : .leading, spacing: 4) {
                HStack {
                    if isUser {
                        Text(L.you).font(.caption.weight(.semibold)).foregroundStyle(ArenaTheme.orangeAccent)
                    } else if let p {
                        Text(p.displayName(isEnglish: L.prefersEnglish)).font(.caption.weight(.semibold))
                        Text(p.school).font(.caption2).foregroundStyle(ArenaTheme.textMuted)
                    }
                    Spacer(minLength: 0)
                }
                Text(msg.content)
                    .font(.subheadline)
                    .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                    .frame(maxWidth: .infinity, alignment: isUser ? .trailing : .leading)
                    .multilineTextAlignment(isUser ? .trailing : .leading)
                    .padding(12)
                    .background(isUser ? Color.orange.opacity(0.18) : ArenaTheme.background)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(isUser ? Color.orange.opacity(0.45) : ArenaTheme.border))
            }
            if isUser {
                ZStack {
                    Circle().fill(Color.orange)
                    Image(systemName: "person.fill").foregroundStyle(.white)
                }
                .frame(width: 40, height: 40)
            }
        }
        .frame(maxWidth: .infinity, alignment: isUser ? .trailing : .leading)
    }

    private func add(_ p: Philosopher) {
        if selected.count >= 4 { return }
        if selected.contains(where: { $0.id == p.id }) { return }
        selected.append(p)
    }

    private func startDebate() {
        stage = .debate
        isThinking = true
        streamPreview = ""
        let participants = selected.map { ["id": $0.id, "nameCN": $0.nameCN, "school": $0.school] as [String: Any] }
        Task {
            do {
                let resp = try await ArenaAPI.generateRoundtableOpenings(
                    topic: debateTopic,
                    participants: participants,
                    onDelta: { _, acc in Task { @MainActor in streamPreview = acc } }
                )
                let arr: [RoundtableMessageSlice]? = resp.roundtableMessages?.pick(english: L.prefersEnglish)
                    ?? JsonPayload.parse(resp.text, as: RTMessagesPayload.self)?.messages?.map {
                        RoundtableMessageSlice(speaker: $0.speaker, content: $0.content)
                    }
                if let arr, !arr.isEmpty {
                    await MainActor.run {
                        messages = arr.enumerated().map { i, m in
                            RTMessage(id: "o-\(m.speaker)-\(i)", speaker: m.speaker, content: m.content)
                        }
                    }
                } else {
                    throw NSError(domain: "rt", code: 0)
                }
            } catch {
                await MainActor.run {
                    stage = .setup
                    messages = []
                    errorAlert = L.roundtableOpeningFailed
                }
            }
            await MainActor.run {
                isThinking = false
                streamPreview = ""
            }
        }
    }

    private func sendUser() {
        let text = userInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        let userRowId = "u-\(UUID().uuidString)"
        userInput = ""
        messages.append(RTMessage(id: userRowId, speaker: "user", content: text))
        isThinking = true
        streamPreview = ""
        let participants = selected.map { ["id": $0.id, "nameCN": $0.nameCN, "school": $0.school] as [String: Any] }
        Task {
            do {
                let resp = try await ArenaAPI.generateRoundtableReply(
                    topic: debateTopic,
                    userInput: text,
                    participants: participants,
                    onDelta: { _, acc in Task { @MainActor in streamPreview = acc } }
                )
                let arr: [RoundtableMessageSlice]? = resp.roundtableMessages?.pick(english: L.prefersEnglish)
                    ?? JsonPayload.parse(resp.text, as: RTMessagesPayload.self)?.messages?.map {
                        RoundtableMessageSlice(speaker: $0.speaker, content: $0.content)
                    }
                if let arr, !arr.isEmpty {
                    let more = arr.enumerated().map { i, m in
                        RTMessage(id: "r-\(m.speaker)-\(i)-\(UUID().uuidString)", speaker: m.speaker, content: m.content)
                    }
                    await MainActor.run {
                        messages.append(contentsOf: more)
                    }
                } else {
                    throw NSError(domain: "rt", code: 1)
                }
            } catch {
                await MainActor.run {
                    messages.removeAll { $0.id == userRowId }
                    userInput = text
                    errorAlert = L.roundtableReplyFailed
                }
            }
            await MainActor.run {
                isThinking = false
                streamPreview = ""
            }
        }
    }
}

private struct FlowSelected: View {
    let philosophers: [Philosopher]
    var isEnglish: Bool
    var onRemove: (String) -> Void

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: 8)], spacing: 8) {
            ForEach(philosophers) { p in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(p.displayName(isEnglish: isEnglish)).font(.caption.weight(.semibold))
                        Text(p.school).font(.caption2).foregroundStyle(ArenaTheme.textMuted)
                    }
                    Spacer(minLength: 0)
                    Button { onRemove(p.id) } label: {
                        Image(systemName: "xmark.circle.fill").foregroundStyle(ArenaTheme.textMuted)
                    }
                }
                .padding(8)
                .background(ArenaTheme.background)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(ArenaTheme.border))
            }
        }
    }
}
