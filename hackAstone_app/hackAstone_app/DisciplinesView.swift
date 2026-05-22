import SwiftUI

private enum DisciplineCategory: Int, CaseIterable {
    case all, business, psychology, learning, hot

    func matches(_ battleCategory: String, english: Bool) -> Bool {
        let c = battleCategory.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        switch self {
        case .all: return true
        case .business: return c == "business" || c == "商业"
        case .psychology: return c == "psychology" || c == "心理学"
        case .learning: return c == "learning" || c == "学习方法"
        case .hot: return c == "hot topics" || c == "热点问题"
        }
    }

    var apiEn: String {
        switch self {
        case .all: return "General"
        case .business: return "Business"
        case .psychology: return "Psychology"
        case .learning: return "Learning"
        case .hot: return "Hot topics"
        }
    }

    var apiZh: String {
        switch self {
        case .all: return "全部"
        case .business: return "商业"
        case .psychology: return "心理学"
        case .learning: return "学习方法"
        case .hot: return "热点问题"
        }
    }
}

/// 学科辩论主体（列表与推荐），可在首页内嵌或作为独立导航页使用。
struct DisciplinesContentView: View {
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath

    @State private var selectedCategory: DisciplineCategory = .all
    @State private var aiLoading = false
    @State private var aiError: String?

    private var L: ArenaL10n { locale.L }

    private var filteredBattles: [Battle] {
        catalog.allBattles(english: L.prefersEnglish).filter { selectedCategory.matches($0.category, english: L.prefersEnglish) }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            hero
            categoryRow
            aiGenerateButton
            if let aiError {
                Text(aiError).font(.caption).foregroundStyle(.red.opacity(0.9))
            }
            if let first = filteredBattles.first {
                featured(first)
            }
            allBattles
        }
    }

    private var hero: some View {
        VStack(spacing: 8) {
            Text(L.disciplinesHeroTitle)
                .font(.system(size: 28, weight: .bold))
                .multilineTextAlignment(.center)
                .foregroundStyle(LinearGradient(colors: [.orange, .red.opacity(0.85)], startPoint: .leading, endPoint: .trailing))
            Text(L.disciplinesHeroSubtitle)
                .font(.subheadline)
                .foregroundStyle(ArenaTheme.textMuted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }

    private var categoryRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(Array(DisciplineCategory.allCases.enumerated()), id: \.offset) { idx, cat in
                    let label = L.disciplineCategories[safe: idx] ?? cat.apiZh
                    Button {
                        selectedCategory = cat
                    } label: {
                        Text(label)
                            .font(.caption.weight(.medium))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(selectedCategory == cat ? Color.orange.opacity(0.25) : ArenaTheme.surface)
                            .foregroundStyle(selectedCategory == cat ? ArenaTheme.orangeAccent : ArenaTheme.textPrimary)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(selectedCategory == cat ? ArenaTheme.orangeAccent.opacity(0.6) : ArenaTheme.border))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var aiGenerateButton: some View {
        Button {
            Task { await handleAiGenerate() }
        } label: {
            HStack {
                if aiLoading { ProgressView().tint(.white) }
                Text(aiLoading ? L.aiGenerating : L.aiGenerateBattle)
                    .font(.headline)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
        }
        .buttonStyle(.borderedProminent)
        .tint(.orange)
        .disabled(aiLoading)
    }

    private func featured(_ battle: Battle) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "brain.head.profile")
                    .foregroundStyle(ArenaTheme.orangeAccent)
                Text(L.todayFeatured)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(ArenaTheme.textPrimary)
            }
            Button {
                path.append(AppRoute.battle(id: battle.id))
            } label: {
                VStack(alignment: .leading, spacing: 12) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(battle.category)
                                .font(.caption)
                                .foregroundStyle(Color.orange.opacity(0.85))
                            Text(battle.question)
                                .font(.title3.weight(.bold))
                                .foregroundStyle(ArenaTheme.textPrimary)
                                .multilineTextAlignment(.leading)
                        }
                        Spacer()
                        Image(systemName: "figure.fencing")
                            .font(.title2)
                            .foregroundStyle(ArenaTheme.orangeAccent)
                            .padding(12)
                            .background(Color.orange.opacity(0.15))
                            .clipShape(Circle())
                    }
                    HStack {
                        Text("Builder vs Breaker")
                            .font(.caption)
                            .foregroundStyle(ArenaTheme.textMuted)
                        Spacer()
                        Text(L.enterBattle)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.orange)
                    }
                }
                .padding(18)
                .background(
                    LinearGradient(colors: [Color.red.opacity(0.12), Color.orange.opacity(0.08)], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.orange.opacity(0.35), lineWidth: 2))
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .buttonStyle(.plain)
        }
    }

    private var allBattles: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.allBattles)
                .font(.title3.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 300), spacing: 12)], spacing: 12) {
                ForEach(filteredBattles) { b in
                    Button {
                        path.append(AppRoute.battle(id: b.id))
                    } label: {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(b.category.uppercased())
                                .font(.caption2)
                                .foregroundStyle(ArenaTheme.textMuted)
                            Text(b.question)
                                .font(.headline)
                                .foregroundStyle(ArenaTheme.textPrimary)
                                .multilineTextAlignment(.leading)
                            Text(L.enterBattle)
                                .font(.caption)
                                .foregroundStyle(Color.orange)
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(ArenaTheme.surface)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(ArenaTheme.border))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func handleAiGenerate() async {
        await MainActor.run {
            aiLoading = true
            aiError = nil
        }
        do {
            let resp = try await ArenaAPI.generateDisciplineBattle(
                categoryEn: selectedCategory.apiEn,
                categoryZh: selectedCategory.apiZh,
                onDelta: nil
            )
            guard let bilingual = resp.disciplineBattle else {
                throw ArenaAPIError.serverMessage(L.topicBadJson)
            }
            let id = catalog.addGeneratedBattle(bilingual)
            await MainActor.run {
                path.append(AppRoute.battle(id: id))
            }
        } catch {
            await MainActor.run {
                aiError = error.localizedDescription
            }
        }
        await MainActor.run { aiLoading = false }
    }
}

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

/// 从导航栈进入的学科辩论整页（带返回首页的顶栏）。
struct DisciplinesView: View {
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath

    private var L: ArenaL10n { locale.L }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pushedHeader
                DisciplinesContentView(path: $path)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 28)
        }
        .background(ArenaTheme.background)
    }

    private var pushedHeader: some View {
        HStack {
            Button {
                path = NavigationPath()
            } label: {
                Label(L.backToPhilosophy, systemImage: "chevron.left")
                    .font(.subheadline)
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            .buttonStyle(.plain)
            Spacer(minLength: 0)
        }
        .padding(.vertical, 4)
    }
}
