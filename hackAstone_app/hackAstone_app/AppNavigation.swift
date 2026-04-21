import SwiftUI

enum AppRoute: Hashable {
    case disciplines
    case profile
    case roundtable
    case battle(id: String)
    case philosophyBattle(id: String)
}
