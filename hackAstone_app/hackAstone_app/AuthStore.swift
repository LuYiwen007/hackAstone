import Foundation
import Combine

/// 与 Web `hackastone_auth` 对齐的登录会话。
struct AuthSession: Codable, Equatable {
    let token: String
    let userId: String
    let nickname: String
    var email: String?

    var displayName: String {
        if let email, !email.isEmpty { return nickname.isEmpty ? email : nickname }
        return nickname
    }
}

@MainActor
final class AuthStore: ObservableObject {
    static let storageKey = "hackastone_auth"

    @Published private(set) var session: AuthSession?

    var isLoggedIn: Bool { session != nil }

    static var bearerToken: String? {
        UserDefaults.standard.data(forKey: storageKey)
            .flatMap { try? JSONDecoder().decode(AuthSession.self, from: $0) }?
            .token
    }

    init() {
        load()
    }

    func load() {
        guard let data = UserDefaults.standard.data(forKey: Self.storageKey),
              let decoded = try? JSONDecoder().decode(AuthSession.self, from: data)
        else {
            session = nil
            return
        }
        session = decoded
    }

    func save(_ newSession: AuthSession) {
        session = newSession
        if let data = try? JSONEncoder().encode(newSession) {
            UserDefaults.standard.set(data, forKey: Self.storageKey)
        }
    }

    func clear() {
        session = nil
        UserDefaults.standard.removeObject(forKey: Self.storageKey)
    }

    func refreshProfile(userId: String, nickname: String, email: String?) {
        guard let current = session else { return }
        save(AuthSession(
            token: current.token,
            userId: userId,
            nickname: nickname,
            email: email
        ))
    }
}
