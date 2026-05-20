import SwiftUI

#if os(iOS)
import UIKit

/// 通过 UIKit 设置输入框文字色（SwiftUI 的 `foregroundStyle` 对 TextField 常不生效）。
enum ArenaInputAppearance {
    static func apply(colorScheme: ColorScheme) {
        let text = UIColor(ArenaTheme.inputText(for: colorScheme))
        let font = UIFont.preferredFont(forTextStyle: .body)
        let attrs: [NSAttributedString.Key: Any] = [
            .foregroundColor: text,
            .font: font,
        ]
        UITextField.appearance().defaultTextAttributes = attrs
        UITextField.appearance().textColor = text
        UITextField.appearance().tintColor = UIColor(ArenaTheme.cyanAccent)
        UITextField.appearance().keyboardAppearance = colorScheme == .dark ? .dark : .light

        UITextView.appearance().textColor = text
        UITextView.appearance().tintColor = UIColor(ArenaTheme.cyanAccent)
        UITextView.appearance().backgroundColor = .clear
    }
}

/// 挂在根视图，随系统深浅色刷新 UITextField / UITextView 样式。
struct ArenaInputAppearanceInstaller: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Color.clear
            .frame(width: 0, height: 0)
            .onAppear { ArenaInputAppearance.apply(colorScheme: colorScheme) }
            .onChange(of: colorScheme) { _, scheme in
                ArenaInputAppearance.apply(colorScheme: scheme)
            }
    }
}
#endif
