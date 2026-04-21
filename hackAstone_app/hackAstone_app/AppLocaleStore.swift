import Combine
import Foundation
import SwiftUI

/// 应用内界面语言（与系统语言独立）；写入 `UserDefaults` 键 `app_language_code`。
final class AppLocaleStore: ObservableObject {
    static let languageKey = "app_language_code"

    @Published var languageCode: String {
        didSet {
            UserDefaults.standard.set(languageCode, forKey: Self.languageKey)
        }
    }

    init() {
        languageCode = UserDefaults.standard.string(forKey: Self.languageKey) ?? "zh-Hans"
    }

    var L: ArenaL10n { ArenaL10n(languageCode: languageCode) }
}
