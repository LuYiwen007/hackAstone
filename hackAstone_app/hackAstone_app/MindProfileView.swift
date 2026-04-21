import SwiftUI

struct MindProfileView: View {
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath
    @State private var data = MindProfileView.fallback
    @State private var loadError: String?

    private var L: ArenaL10n { locale.L }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                header
                statsGrid
                biasesSection
                insightsSection
                recentSection
                cta
            }
            .padding(16)
            .padding(.bottom, 32)
        }
        .background(ArenaTheme.background)
        .navigationTitle(L.mindProfileNavTitle)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .task { await load() }
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

            Text("🧠")
                .font(.system(size: 48))
            Text(L.mindProfileTitle)
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            Text(L.mindProfileSubtitle)
                .foregroundStyle(ArenaTheme.textMuted)
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
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Image(systemName: "person.3.fill").foregroundStyle(ArenaTheme.orangeAccent)
                Text(L.biasMapTitle)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(ArenaTheme.textPrimary)
            }
            Text(L.biasMapFootnote)
                .font(.subheadline)
                .foregroundStyle(ArenaTheme.textMuted)
            VStack(spacing: 18) {
                ForEach(Array(data.biases.enumerated()), id: \.offset) { _, b in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(L.localizeBiasName(b.name)).font(.headline).foregroundStyle(ArenaTheme.textPrimary)
                                Text(L.localizeBiasDescription(b.description)).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 2) {
                                Text("\(b.percentage)%").font(.title2.weight(.bold))
                                Text(L.occurrences(b.instances)).font(.caption2).foregroundStyle(ArenaTheme.textMuted)
                            }
                        }
                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                Capsule().fill(ArenaTheme.background).frame(height: 8)
                                Capsule()
                                    .fill(barColor(b.color))
                                    .frame(width: geo.size.width * CGFloat(b.percentage) / 100, height: 8)
                            }
                        }
                        .frame(height: 8)
                    }
                }
            }
            .padding(16)
            .background(ArenaTheme.surface)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
        }
    }

    private func barColor(_ webClass: String) -> Color {
        if webClass.contains("red") { return .red.opacity(0.75) }
        if webClass.contains("orange") { return .orange.opacity(0.8) }
        if webClass.contains("yellow") { return .yellow.opacity(0.75) }
        return .orange
    }

    private var insightsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.keyInsights)
                .font(.title2.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 260), spacing: 12)], spacing: 12) {
                insightCard(title: L.insightWatchOutTitle, accent: .red, body: L.insightWatchOutBody)
                insightCard(title: L.insightStrengthTitle, accent: .blue, body: L.insightStrengthBody)
            }
        }
    }

    private func insightCard(title: String, accent: Color, body: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.headline).foregroundStyle(accent.opacity(0.9))
            Text(body).font(.subheadline).foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(ArenaTheme.surface)
        .overlay(alignment: .leading) {
            Rectangle().fill(accent).frame(width: 4)
        }
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
    }

    private var recentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.recentThoughts)
                .font(.title2.weight(.bold))
            ForEach(Array(data.recentBattles.enumerated()), id: \.offset) { _, b in
                VStack(alignment: .leading, spacing: 10) {
                    HStack(alignment: .top) {
                        Text(L.localizeRecentQuestion(b.question)).font(.headline).foregroundStyle(ArenaTheme.textPrimary)
                        if b.changed {
                            Text(L.stanceChanged)
                                .font(.caption2.weight(.bold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.orange.opacity(0.2))
                                .foregroundStyle(Color.orange)
                                .clipShape(Capsule())
                        }
                    }
                    HStack(alignment: .top, spacing: 16) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(L.yourPick).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                            Text(L.localizeRecentChoice(b.choice)).font(.subheadline).foregroundStyle(ArenaTheme.textPrimary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(L.judgeFollowUpShort).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                            Text(L.localizeRecentJudge(b.judgeComment)).font(.subheadline).foregroundStyle(ArenaTheme.textPrimary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .padding(16)
                .background(ArenaTheme.surface)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))
            }
        }
    }

    private var cta: some View {
        VStack(spacing: 16) {
            Text(L.growthQuote)
                .font(.subheadline)
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

    private func load() async {
        do {
            data = try await ArenaAPI.fetchMindProfile()
            loadError = nil
        } catch {
            loadError = error.localizedDescription
            data = Self.fallback
        }
    }

    private static let fallback = MindProfilePayload(
        biases: [
            MindProfileBias(name: "确认偏差", description: "倾向于寻找支持已有观点的证据", percentage: 72, color: "bg-red-500", instances: 13),
            MindProfileBias(name: "权威依赖", description: "容易被权威或逻辑清晰的论述说服", percentage: 58, color: "bg-orange-500", instances: 9),
            MindProfileBias(name: "过度自信", description: "在不确定的情况下表现出过高的确定性", percentage: 45, color: "bg-yellow-500", instances: 7),
            MindProfileBias(name: "忽略反例", description: "倾向于忽视与观点相悖的案例", percentage: 64, color: "bg-red-500", instances: 11),
            MindProfileBias(name: "二元思维", description: "倾向于用非黑即白的方式看待问题", percentage: 51, color: "bg-orange-500", instances: 8),
        ],
        stats: [
            MindProfileStat(label: "已完成对局", value: "18"),
            MindProfileStat(label: "改变立场次数", value: "7"),
            MindProfileStat(label: "思维盲区", value: "5"),
            MindProfileStat(label: "准确判断率", value: "61%"),
        ],
        recentBattles: [
            MindProfileRecentBattle(question: "努力 vs 选择，哪个更重要？", choice: "我不确定", judgeComment: "你忽略了时间维度", changed: true),
            MindProfileRecentBattle(question: "多任务处理真的有效吗？", choice: "支持 Breaker", judgeComment: "你的假设是所有任务都需要高认知", changed: false),
            MindProfileRecentBattle(question: "AI 会让人变笨吗？", choice: "支持 Builder", judgeComment: "你混淆了工具和依赖性", changed: true),
        ]
    )
}
