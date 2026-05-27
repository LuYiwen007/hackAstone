import SwiftUI

/// 对齐 Web Tailwind `zinc-950` / `cyan` / `orange` 等主色。
enum ArenaTheme {
    static let background = Color(red: 0.04, green: 0.04, blue: 0.05)
    static let surface = Color(red: 0.11, green: 0.11, blue: 0.12)
    static let border = Color(red: 0.16, green: 0.16, blue: 0.18)
    static let textPrimary = Color(red: 0.96, green: 0.96, blue: 0.97)
    static let textMuted = Color(red: 0.55, green: 0.56, blue: 0.58)
    static let cyanAccent = Color(red: 0.22, green: 0.82, blue: 0.90)
    static let cyanMuted = Color(red: 0.58, green: 0.91, blue: 0.98)
    static let orangeAccent = Color(red: 0.93, green: 0.45, blue: 0.13)
    static let purpleAccent = Color(red: 0.65, green: 0.33, blue: 0.96)
    static let headerGradientStart = Color(red: 0.06, green: 0.72, blue: 0.83)
    static let headerGradientEnd = Color(red: 0.23, green: 0.51, blue: 0.96)

    /// 用户输入文字：深色模式白字，浅色模式黑字
    static func inputText(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? textPrimary : .black
    }
}
