import SwiftUI

struct RootView: View {
    @StateObject private var catalog = ArenaCatalogStore()
    @StateObject private var locale = AppLocaleStore()
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            HomeView(path: $path)
                .navigationDestination(for: AppRoute.self) { route in
                    switch route {
                    case .disciplines:
                        DisciplinesView(path: $path)
                    case .profile:
                        MindProfileView(path: $path)
                    case .roundtable:
                        RoundtableView(path: $path)
                    case .battle(let id):
                        BattleView(battleId: id, path: $path)
                    case .philosophyBattle(let id):
                        PhilosophyBattleView(philosopherId: id, path: $path)
                    }
                }
        }
        .environmentObject(catalog)
        .environmentObject(locale)
    }
}
