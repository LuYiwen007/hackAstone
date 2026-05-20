import SwiftUI

struct RootView: View {
    @StateObject private var catalog = ArenaCatalogStore()
    @StateObject private var locale = AppLocaleStore()
    @StateObject private var auth = AuthStore()
    @State private var path = NavigationPath()
    @Environment(\.locale) private var systemLocale

    var body: some View {
        NavigationStack(path: $path) {
            HomeView(path: $path)
                .navigationDestination(for: AppRoute.self) { route in
                    Group {
                        switch route {
                        case .login:
                            LoginView(path: $path)
                        case .disciplines:
                            DisciplinesView(path: $path)
                        case .profile:
                            MindProfileView(path: $path)
                        case .roundtable:
                            RoundtableView(path: $path)
                        case .dilemma:
                            DilemmaView(path: $path)
                        case .battle(let id):
                            BattleView(battleId: id, path: $path)
                        case .philosophyBattle(let id):
                            PhilosophyBattleView(philosopherId: id, path: $path)
                        }
                    }
                    .arenaPushedScreenChrome()
                }
        }
        .arenaHiddenNavigationBar()
        #if os(iOS)
        .background {
            ArenaInputAppearanceInstaller()
        }
        #endif
        .preferredColorScheme(.dark)
        .environmentObject(catalog)
        .environmentObject(locale)
        .environmentObject(auth)
        .onAppear {
            syncLocaleAndCatalog()
        }
        .onChange(of: systemLocale) { _, _ in
            syncLocaleAndCatalog()
        }
    }

    private func syncLocaleAndCatalog() {
        locale.refreshFromSystem()
        Task { await catalog.reload(locale: locale.catalogLocale) }
    }
}
