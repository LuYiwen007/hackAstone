import SwiftUI

/// 学科辩论主体（列表与推荐），可在首页内嵌或作为独立导航页使用。
struct DisciplinesContentView: View {
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath

    private var L: ArenaL10n { locale.L }

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            hero
            categoryRow
            if let first = catalog.battles.first {
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
                ForEach(L.disciplineCategories, id: \.self) { c in
                    Text(c)
                        .font(.caption.weight(.medium))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(ArenaTheme.surface)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                        .foregroundStyle(ArenaTheme.textPrimary)
                }
            }
        }
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
                ForEach(catalog.battles) { b in
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
        .navigationTitle(L.disciplinesDebate)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }

    private var pushedHeader: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 12) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(LinearGradient(colors: [.red, .orange], startPoint: .topLeading, endPoint: .bottomTrailing))
                            .frame(width: 40, height: 40)
                        Image(systemName: "figure.fencing")
                            .foregroundStyle(.white)
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Cognitive Arena")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(ArenaTheme.textPrimary)
                        Text(L.cognitiveArena)
                            .font(.caption)
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                }
                Spacer()
            }
            HStack(spacing: 8) {
                Button {
                    path = NavigationPath()
                } label: {
                    Label(L.backToPhilosophy, systemImage: "chevron.left")
                        .font(.subheadline)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
                .buttonStyle(.plain)
                Text(L.disciplinesDebate)
                    .font(.subheadline.weight(.bold))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(Color.orange.opacity(0.85))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(.vertical, 8)
    }
}
