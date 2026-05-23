import SwiftUI
import UIKit

private enum ProfileAvatarStore {
    static let key = "user_avatar_jpeg_data"
    static var data: Data? {
        get { UserDefaults.standard.data(forKey: key) }
    }
}

struct MindProfileView: View {
    @EnvironmentObject private var locale: AppLocaleStore
    @EnvironmentObject private var auth: AuthStore
    @Binding var path: NavigationPath
    @State private var data = MindProfileView.fallback
    @State private var loadError: String?
    @State private var loading = true
    @State private var avatarUIImage: UIImage?
    @State private var serverAvatarURL: URL?

    private var L: ArenaL10n { locale.L }
    private var profileDisplayName: String {
        auth.session?.displayName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false
            ? auth.session!.displayName
            : L.mindProfileTitle
    }

    var body: some View {
        Group {
            if !auth.isLoggedIn {
                guestView
            } else {
                loggedInView
            }
        }
        .background(ArenaTheme.background)
        .task(id: auth.session?.userId) {
            guard auth.isLoggedIn else {
                loading = false
                return
            }
            await load()
        }
    }

    private var guestView: some View {
        VStack(spacing: 24) {
            Button {
                path = NavigationPath()
            } label: {
                Label(L.backHome, systemImage: "chevron.left")
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16)

            Spacer()
            profileAvatarView(size: 80)
            Text(L.profileGuestTitle)
                .font(.title.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            Text(L.profileGuestHint)
                .font(.body)
                .foregroundStyle(ArenaTheme.textMuted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Button {
                path.append(AppRoute.login)
            } label: {
                Text(L.profileLoginRegister)
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(.orange)
            .padding(.horizontal, 32)
            Spacer()
        }
    }

    private var loggedInView: some View {
        ScrollView {
            VStack(spacing: 24) {
                header
                if loading {
                    ProgressView()
                        .padding(.vertical, 40)
                } else {
                    statsGrid
                    biasesSection
                    insightsSection
                    recentSection
                    cta
                }
            }
            .padding(16)
            .padding(.bottom, 32)
        }
    }

    private var header: some View {
        VStack(spacing: 12) {
            Button {
                path = NavigationPath()
            } label: {
                Label(L.backHome, systemImage: "chevron.left")
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            profileAvatarView(size: 72)
            Text(L.mindProfileTitle)
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            Text(L.mindProfileSubtitle)
                .foregroundStyle(ArenaTheme.textMuted)
            if let name = auth.session?.displayName, !name.isEmpty {
                Text(name)
                    .font(.subheadline)
                    .foregroundStyle(ArenaTheme.orangeAccent)
            }
            if let loadError {
                Text(loadError)
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
        }
        .frame(maxWidth: .infinity)
    }

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 140), spacing: 12)], spacing: 12) {
            ForEach(Array(data.stats.enumerated()), id: \.offset) { _, s in
                VStack(spacing: 10) {
                    Image(systemName: "person.3.fill")
                        .font(.title2)
                        .foregroundStyle(ArenaTheme.orangeAccent)
                    Text(s.value)
                        .font(.title.weight(.bold))
                        .foregroundStyle(ArenaTheme.textPrimary)
                    Text(L.localizeMindStatLabel(s.label))
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
                .padding(18)
                .frame(maxWidth: .infinity)
                .background(ArenaTheme.surface)
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
            }
        }
    }

    private var biasesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.biasMapTitle)
                .font(.title2.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            Text(L.biasMapFootnote)
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
            if data.biases.isEmpty {
                Text(L.prefersEnglish ? "Complete debates while logged in to build your bias map." : "登录后完成辩论，即可生成你的偏差地图。")
                    .font(.caption)
                    .foregroundStyle(ArenaTheme.textMuted)
            } else {
                ForEach(Array(data.biases.enumerated()), id: \.offset) { _, bias in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(L.localizeBiasName(bias.name))
                                .font(.headline)
                            Spacer()
                            Text("\(bias.percentage)%")
                                .font(.headline)
                                .foregroundStyle(ArenaTheme.orangeAccent)
                        }
                        Text(L.localizeBiasDescription(bias.description))
                            .font(.caption)
                            .foregroundStyle(ArenaTheme.textMuted)
                        Text(L.occurrences(bias.instances))
                            .font(.caption2)
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                    .padding(14)
                    .background(ArenaTheme.surface)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))
                }
            }
        }
    }

    private var insightsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.keyInsights)
                .font(.title2.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            VStack(alignment: .leading, spacing: 8) {
                Text(L.insightWatchOutTitle)
                    .font(.headline)
                    .foregroundStyle(.red.opacity(0.9))
                Text(L.insightWatchOutBody)
                    .font(.caption)
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            .padding(14)
            .background(ArenaTheme.surface)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))

            VStack(alignment: .leading, spacing: 8) {
                Text(L.insightStrengthTitle)
                    .font(.headline)
                    .foregroundStyle(ArenaTheme.cyanAccent)
                Text(L.insightStrengthBody)
                    .font(.caption)
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            .padding(14)
            .background(ArenaTheme.surface)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))
        }
    }

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.recentThoughts)
                .font(.title2.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            if data.recentBattles.isEmpty {
                Text(L.prefersEnglish ? "No recent matches yet." : "暂无近期对局记录。")
                    .font(.caption)
                    .foregroundStyle(ArenaTheme.textMuted)
            } else {
                ForEach(Array(data.recentBattles.enumerated()), id: \.offset) { _, b in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(b.question)
                            .font(.headline)
                            .foregroundStyle(ArenaTheme.textPrimary)
                        if b.changed {
                            Text(L.stanceChanged)
                                .font(.caption2)
                                .foregroundStyle(ArenaTheme.orangeAccent)
                        }
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(L.yourPick)
                                    .font(.caption2)
                                    .foregroundStyle(ArenaTheme.textMuted)
                                Text(b.choice)
                                    .font(.caption)
                            }
                            VStack(alignment: .leading, spacing: 4) {
                                Text(L.judgeFollowUpShort)
                                    .font(.caption2)
                                    .foregroundStyle(ArenaTheme.textMuted)
                                Text(b.judgeComment)
                                    .font(.caption)
                            }
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(ArenaTheme.surface)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))
                }
            }
        }
    }

    private var cta: some View {
        VStack(spacing: 12) {
            Text(L.growthQuote)
                .font(.caption)
                .italic()
                .foregroundStyle(ArenaTheme.textMuted)
                .multilineTextAlignment(.center)
            HStack(spacing: 12) {
                Button(L.philosophyDebate) { path = NavigationPath() }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(ArenaTheme.purpleAccent)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                Button(L.disciplinesDebate) { path = NavigationPath(); path.append(AppRoute.disciplines) }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.orange)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(.top, 8)
    }

    private func profileAvatarView(size: CGFloat) -> some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [ArenaTheme.orangeAccent, Color.red.opacity(0.85)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: size, height: size)
            if let avatarUIImage {
                Image(uiImage: avatarUIImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: size, height: size)
                    .clipShape(Circle())
            } else if let serverAvatarURL {
                AsyncImage(url: serverAvatarURL) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().scaledToFill()
                    default:
                        Text(String(profileDisplayName.prefix(1)).uppercased())
                            .font(.system(size: size * 0.38, weight: .bold))
                            .foregroundStyle(.white)
                    }
                }
                .frame(width: size, height: size)
                .clipShape(Circle())
            } else {
                Text(String(profileDisplayName.prefix(1)).uppercased())
                    .font(.system(size: size * 0.38, weight: .bold))
                    .foregroundStyle(.white)
            }
        }
    }

    private static func resolveAvatarURL(_ path: String?) -> URL? {
        guard let path else { return nil }
        let t = path.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty else { return nil }
        if t.hasPrefix("http://") || t.hasPrefix("https://") || t.hasPrefix("data:") {
            return URL(string: t)
        }
        let base = ArenaConfiguration.apiBaseURLString
        return URL(string: t.hasPrefix("/") ? base + t : base + "/" + t)
    }

    private func loadUserAvatar() async {
        if let data = ProfileAvatarStore.data, let img = UIImage(data: data) {
            await MainActor.run { avatarUIImage = img }
        }
        guard auth.isLoggedIn else { return }
        do {
            let user = try await ArenaAPI.fetchCurrentUser()
            await MainActor.run {
                if avatarUIImage == nil {
                    serverAvatarURL = Self.resolveAvatarURL(user.avatarUrl)
                }
            }
        } catch { /* ignore */ }
    }

    private func load() async {
        await loadUserAvatar()
        await MainActor.run { loading = true }
        do {
            let profile = try await ArenaAPI.fetchMindProfile()
            await MainActor.run {
                data = profile
                loadError = nil
            }
        } catch {
            await MainActor.run {
                loadError = error.localizedDescription
                data = Self.emptyProfile
            }
        }
        await MainActor.run { loading = false }
    }

    private static let emptyProfile = MindProfilePayload(biases: [], stats: [
        MindProfileStat(label: "已完成对局", value: "0"),
        MindProfileStat(label: "改变立场次数", value: "0"),
        MindProfileStat(label: "思维盲区", value: "0"),
        MindProfileStat(label: "准确判断率", value: "--"),
    ], recentBattles: [])

    private static let fallback = MindProfilePayload(
        biases: [
            MindProfileBias(name: "确认偏差", description: "倾向于寻找支持已有观点的证据", percentage: 72, color: "bg-red-500", instances: 13),
        ],
        stats: [
            MindProfileStat(label: "已完成对局", value: "18"),
            MindProfileStat(label: "改变立场次数", value: "7"),
            MindProfileStat(label: "思维盲区", value: "5"),
            MindProfileStat(label: "准确判断率", value: "61%"),
        ],
        recentBattles: []
    )
}
