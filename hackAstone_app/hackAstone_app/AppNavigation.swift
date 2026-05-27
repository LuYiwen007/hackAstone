import SwiftUI

enum AppRoute: Hashable {
    case login
    case disciplines
    case profile
    case roundtable
    case dilemma
    case battle(id: String)
    case philosophyBattle(id: String)
}
