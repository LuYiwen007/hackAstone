import SwiftUI

private struct ArenaInputTextModifier: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        let color = ArenaTheme.inputText(for: colorScheme)
        content
            .foregroundStyle(color)
            .foregroundColor(color)
            #if os(iOS)
            .tint(ArenaTheme.cyanAccent)
            #endif
    }
}

extension View {
    /// 输入框已输入文字：深色模式白色，浅色模式黑色
    func arenaInputTextStyle() -> some View {
        modifier(ArenaInputTextModifier())
    }

    /// 隐藏系统半透明导航栏，内容由安全区（含灵动岛）自然顶格。
    @ViewBuilder
    func arenaHiddenNavigationBar() -> some View {
        #if os(iOS)
        self
            .toolbar(.hidden, for: .navigationBar)
            .toolbarBackground(.hidden, for: .navigationBar)
        #else
        self
        #endif
    }

    /// 导航栈内推入的页面：无系统导航栏/返回键，仅用应用内「‹ 返回」按钮。
    @ViewBuilder
    func arenaPushedScreenChrome() -> some View {
        #if os(iOS)
        self
            .navigationBarBackButtonHidden(true)
            .toolbar(.hidden, for: .navigationBar)
            .toolbarBackground(.hidden, for: .navigationBar)
        #else
        self
        #endif
    }
}
