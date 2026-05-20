import Combine
import Foundation

/// 跟随系统语言（不持久化手动切换）；中文系统 → zh，其它 → en。
final class AppLocaleStore: ObservableObject {
    @Published private(set) var languageCode: String

    /// 传给后端 catalog 的 locale 参数
    var catalogLocale: String {
        prefersEnglish ? "en" : "zh"
    }

    var prefersEnglish: Bool {
        !languageCode.lowercased().hasPrefix("zh")
    }

    var L: ArenaL10n { ArenaL10n(languageCode: languageCode) }

    init() {
        languageCode = Self.resolveSystemLanguageCode()
    }

    func refreshFromSystem() {
        let next = Self.resolveSystemLanguageCode()
        if languageCode != next {
            languageCode = next
        }
    }

    /// 根据 `Locale.preferredLanguages` / 当前区域判断界面语言
    static func resolveSystemLanguageCode() -> String {
        let preferred = Locale.preferredLanguages.first ?? Locale.current.identifier
        let lower = preferred.lowercased()
        if lower.hasPrefix("zh") {
            return "zh-Hans"
        }
        return "en"
    }
}
