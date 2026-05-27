import SwiftUI

private enum HomeMainTab {
    case philosophy
    case disciplines
}

struct HomeView: View {
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @EnvironmentObject private var auth: AuthStore
    @Binding var path: NavigationPath

    @State private var homeMainTab: HomeMainTab = .philosophy
    @State private var selectedPeriodId = CatalogMeta.timePeriods[0].id
    @State private var selectedRegion: String?
    @State private var selectedPhilosopher: Philosopher?
    @State private var showAccountSettings = false

    private var currentPeriod: CatalogTimePeriodMeta {
        CatalogMeta.timePeriods.first { $0.id == selectedPeriodId } ?? CatalogMeta.timePeriods[0]
    }

    private var regionPhilosophers: [Philosopher] {
        guard let rid = selectedRegion else { return [] }
        return CatalogMeta.getPhilosophersByPeriodAndRegion(period: currentPeriod, region: rid, source: catalog.philosophers)
    }

    private var L: ArenaL10n { locale.L }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header
                Group {
                    if homeMainTab == .philosophy {
                        hero
                        timelineSection
                        WorldMapSectionView(selectedRegion: $selectedRegion, currentPeriod: currentPeriod, philosophers: catalog.philosophers)
                        regionPhilosophersSection
                        footer
                    } else {
                        DisciplinesContentView(path: $path)
                    }
                }
            }
            .padding(.horizontal, horizontalPadding)
            .padding(.bottom, 28)
        }
        .background(ArenaTheme.background)
        .sheet(item: $selectedPhilosopher) { p in
            PhilosopherDetailSheet(
                philosopher: p,
                allPhilosophers: catalog.philosophers,
                onClose: { selectedPhilosopher = nil },
                onStartDebate: {
                    selectedPhilosopher = nil
                    path.append(AppRoute.philosophyBattle(id: p.id))
                }
            )
            .presentationDetents([.large])
        }
        #if os(iOS)
        .fullScreenCover(isPresented: $showAccountSettings) {
            AccountSettingsView()
                .environmentObject(locale)
        }
        #else
        .sheet(isPresented: $showAccountSettings) {
            Text(L.accountSettingsMacOnly)
                .padding()
                .presentationDetents([.medium])
        }
        #endif
    }

    private var horizontalPadding: CGFloat {
        #if os(iOS)
        if UIDevice.current.userInterfaceIdiom == .pad { return 32 }
        #endif
        return 16
    }

    /// 与第二行功能按钮（圆桌 / 困境 / 画像）一致的字号
    private static let headerChipFont: Font = .caption.weight(.semibold)

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            // 第一行：登录 / 设置，靠右
            HStack {
                Spacer(minLength: 0)
                if auth.isLoggedIn {
                    Button {
                        showAccountSettings = true
                    } label: {
                        Image(systemName: "gearshape")
                            .font(Self.headerChipFont)
                            .foregroundStyle(ArenaTheme.textMuted)
                            .padding(.horizontal, 4)
                            .padding(.vertical, 6)
                    }
                    .buttonStyle(.plain)
                } else {
                    Button {
                        path.append(AppRoute.login)
                    } label: {
                        Label {
                            Text(L.loginTitle)
                                .font(Self.headerChipFont)
                        } icon: {
                            Image(systemName: "person.crop.circle")
                                .font(Self.headerChipFont)
                        }
                        .foregroundStyle(ArenaTheme.orangeAccent)
                    }
                    .buttonStyle(.plain)
                }
            }

            // 第二行：圆桌 / 道德困境 / 思维画像
            HStack(spacing: 8) {
                Button {
                    path.append(AppRoute.roundtable)
                } label: {
                    Label(L.roundtableDebate, systemImage: "person.3.sequence.fill")
                        .font(Self.headerChipFont)
                        .lineLimit(1)
                        .minimumScaleFactor(0.75)
                        .frame(maxWidth: .infinity)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 10)
                        .foregroundStyle(.white)
                        .background(LinearGradient(colors: [Color.orange, Color.red.opacity(0.85)], startPoint: .leading, endPoint: .trailing))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain)
                .frame(maxWidth: .infinity)

                Button {
                    path.append(AppRoute.dilemma)
                } label: {
                    Label(L.moralDilemma, systemImage: "exclamationmark.triangle.fill")
                        .font(Self.headerChipFont)
                        .lineLimit(1)
                        .minimumScaleFactor(0.75)
                        .frame(maxWidth: .infinity)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 10)
                        .foregroundStyle(.white)
                        .background(LinearGradient(colors: [Color.cyan.opacity(0.9), Color.blue.opacity(0.75)], startPoint: .leading, endPoint: .trailing))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain)
                .frame(maxWidth: .infinity)

                Button {
                    path.append(AppRoute.profile)
                } label: {
                    Label(L.mindProfile, systemImage: "person.fill")
                        .font(Self.headerChipFont)
                        .lineLimit(1)
                        .minimumScaleFactor(0.75)
                        .frame(maxWidth: .infinity)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 10)
                        .foregroundStyle(ArenaTheme.textPrimary)
                        .background(ArenaTheme.surface)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                }
                .buttonStyle(.plain)
                .frame(maxWidth: .infinity)
            }

            // 第三行：哲学辩论 / 学科辩论
            HStack(spacing: 8) {
                Button {
                    homeMainTab = .philosophy
                } label: {
                    Text(L.philosophyDebate)
                        .font(.subheadline.weight(.bold))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(homeMainTab == .philosophy ? Color.cyan.opacity(0.85) : ArenaTheme.surface)
                        .foregroundStyle(homeMainTab == .philosophy ? Color.white : ArenaTheme.textMuted)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(homeMainTab == .philosophy ? Color.clear : ArenaTheme.border)
                        )
                }
                .buttonStyle(.plain)
                Button {
                    homeMainTab = .disciplines
                } label: {
                    Text(L.disciplinesDebate)
                        .font(.subheadline.weight(.bold))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(homeMainTab == .disciplines ? Color.orange.opacity(0.9) : ArenaTheme.surface)
                        .foregroundStyle(homeMainTab == .disciplines ? Color.white : ArenaTheme.textMuted)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(homeMainTab == .disciplines ? Color.clear : ArenaTheme.border)
                        )
                }
                .buttonStyle(.plain)
                Spacer(minLength: 0)
            }
        }
        .padding(.top, 4)
        .padding(.bottom, 8)
    }

    private var hero: some View {
        VStack(spacing: 8) {
            Text(L.heroMapTitle)
                .font(.system(size: 26, weight: .bold))
                .multilineTextAlignment(.center)
                .foregroundStyle(
                    LinearGradient(colors: [ArenaTheme.cyanMuted, ArenaTheme.headerGradientEnd], startPoint: .leading, endPoint: .trailing)
                )
            Text(L.heroMapSubtitle)
                .font(.subheadline)
                .foregroundStyle(ArenaTheme.textMuted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }

    private var timelineSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 10) {
                Image(systemName: "clock.fill")
                    .foregroundStyle(ArenaTheme.cyanAccent)
                Text(L.timelineTitle)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(ArenaTheme.textPrimary)
            }

            if let idx = CatalogMeta.timePeriods.firstIndex(where: { $0.id == selectedPeriodId }) {
                VStack(spacing: 8) {
                    Text(L.periodLabel(currentPeriod))
                        .font(.title2.weight(.bold))
                        .foregroundStyle(ArenaTheme.cyanMuted)
                    Text(L.periodEra(currentPeriod))
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                    Text(L.describePeriod(currentPeriod))
                        .font(.subheadline)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.cyan.opacity(0.08))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.cyan.opacity(0.25)))
                .clipShape(RoundedRectangle(cornerRadius: 12))

                HStack {
                    Text(L.periodLabel(CatalogMeta.timePeriods[0]))
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                    Spacer()
                    Text(CatalogMeta.timePeriods.last.map { L.periodLabel($0) } ?? "")
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                }

                Slider(
                    value: Binding(
                        get: { Double(idx) },
                        set: { newVal in
                            let i = Int(newVal.rounded())
                            guard CatalogMeta.timePeriods.indices.contains(i) else { return }
                            selectedPeriodId = CatalogMeta.timePeriods[i].id
                            selectedRegion = nil
                        }
                    ),
                    in: 0 ... Double(max(CatalogMeta.timePeriods.count - 1, 0)),
                    step: 1
                )
                .tint(ArenaTheme.cyanAccent)

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 72), spacing: 6)], spacing: 6) {
                    ForEach(L.timelineEraTags, id: \.self) { tag in
                        Text(tag)
                            .font(.caption2)
                            .foregroundStyle(ArenaTheme.textMuted.opacity(0.75))
                            .frame(maxWidth: .infinity)
                    }
                }
            }
        }
        .padding(16)
        .background(ArenaTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
    }

    @ViewBuilder
    private var regionPhilosophersSection: some View {
        if let rid = selectedRegion {
            if regionPhilosophers.isEmpty {
                VStack(spacing: 12) {
                    Text(L.noPhilosophersSentence(periodLabel: L.periodLabel(currentPeriod), regionName: L.regionName(id: rid)))
                        .foregroundStyle(ArenaTheme.textMuted)
                        .multilineTextAlignment(.center)
                    Button(L.backToMap) { selectedRegion = nil }
                        .buttonStyle(.bordered)
                }
                .padding(24)
                .frame(maxWidth: .infinity)
                .background(ArenaTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
            } else {
                VStack(alignment: .leading, spacing: 14) {
                    Text("\(L.regionName(id: rid)) · \(L.periodLabel(currentPeriod))")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(ArenaTheme.textPrimary)

                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: 12)], spacing: 12) {
                        ForEach(regionPhilosophers) { p in
                            Button {
                                selectedPhilosopher = p
                            } label: {
                                HStack(alignment: .top, spacing: 12) {
                                    PhilosopherAvatarView(philosopher: p, size: 48)
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(p.displayName(isEnglish: L.prefersEnglish))
                                            .font(.headline)
                                            .foregroundStyle(ArenaTheme.textPrimary)
                                            .lineLimit(1)
                                        Text(p.name)
                                            .font(.caption)
                                            .foregroundStyle(ArenaTheme.textMuted)
                                            .lineLimit(1)
                                        Text("\(p.school) · \(p.period)")
                                            .font(.caption2)
                                            .foregroundStyle(ArenaTheme.textMuted.opacity(0.8))
                                        VStack(alignment: .leading, spacing: 2) {
                                            ForEach(p.keyIdeas.prefix(2), id: \.self) { idea in
                                                Text("• \(idea)")
                                                    .font(.caption2)
                                                    .foregroundStyle(ArenaTheme.textMuted)
                                                    .lineLimit(1)
                                            }
                                        }
                                    }
                                    Spacer(minLength: 0)
                                }
                                .padding(14)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(ArenaTheme.background)
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    Button(L.backToMap) {
                        selectedRegion = nil
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                }
                .padding(16)
                .background(ArenaTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.cyan.opacity(0.35)))
            }
        }
    }

    private var footer: some View {
        Text(L.footerTagline)
            .font(.footnote)
            .foregroundStyle(ArenaTheme.textMuted.opacity(0.75))
            .frame(maxWidth: .infinity)
            .padding(.top, 24)
    }
}
