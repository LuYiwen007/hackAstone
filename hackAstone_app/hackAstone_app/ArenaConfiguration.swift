import Foundation

/// 与 Web `VITE_API_BASE_URL` + Spring `server.servlet.context-path=/api` 对齐；默认连本机后端（模拟器可用 127.0.0.1）。
enum ArenaConfiguration {
    private static let apiKey = "arena_api_base_url"
    private static let assetsKey = "arena_assets_base_url"

    /// 例如 `http://127.0.0.1:8080/api`（不要末尾 `/`）
    static var apiBaseURLString: String {
        get {
            let raw = UserDefaults.standard.string(forKey: apiKey)?.trimmingCharacters(in: .whitespacesAndNewlines)
            if let raw, !raw.isEmpty { return raw.trimmingSuffixSlash() }
            return "http://127.0.0.1:8080/api"
        }
        set { UserDefaults.standard.set(newValue.trimmingSuffixSlash(), forKey: apiKey) }
    }

    /// 可选：头像等静态资源（Vite `public/philosophers`），例如 `http://127.0.0.1:8081`
    static var assetsBaseURLString: String? {
        get {
            let raw = UserDefaults.standard.string(forKey: assetsKey)?.trimmingCharacters(in: .whitespacesAndNewlines)
            return raw?.isEmpty == true ? nil : raw?.trimmingSuffixSlash()
        }
        set {
            if let newValue, !newValue.isEmpty { UserDefaults.standard.set(newValue.trimmingSuffixSlash(), forKey: assetsKey) }
            else { UserDefaults.standard.removeObject(forKey: assetsKey) }
        }
    }

    static func philosopherImageURL(id: String) -> URL? {
        guard let base = assetsBaseURLString else { return nil }
        return URL(string: "\(base)/philosophers/\(id).jpg")
    }
}

private extension String {
    func trimmingSuffixSlash() -> String {
        var s = self
        while s.hasSuffix("/") { s.removeLast() }
        return s
    }
}
