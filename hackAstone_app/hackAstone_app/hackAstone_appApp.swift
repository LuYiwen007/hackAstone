//
//  hackAstone_appApp.swift
//  hackAstone_app
//

import SwiftUI

@main
struct hackAstone_appApp: App {
    init() {
        #if os(iOS)
        // 启动时先设一次，避免首屏 TextField 在 Installer 挂载前用系统默认黑字
        ArenaInputAppearance.apply(colorScheme: .dark)
        #endif
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
