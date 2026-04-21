import Combine
import Foundation
import SwiftUI

@MainActor
final class ArenaCatalogStore: ObservableObject {
    @Published private(set) var philosophers: [Philosopher] = []
    @Published private(set) var battles: [Battle] = []
    @Published private(set) var debateTopics: [String: DebateTopicContent] = [:]
    @Published private(set) var catalogFromServer = false
    @Published private(set) var catalogError: String?

    init() {
        Task { await reload() }
    }

    func reload() async {
        let fallback = Self.readBundledCatalogFile()
        do {
            let parts = try await ArenaAPI.fetchCatalogParts()
            philosophers = parts.philosophers
            battles = parts.battles.isEmpty ? (fallback?.battles ?? []) : parts.battles
            debateTopics = mergeDebateTopics(fallback: fallback?.debateTopics ?? [:], server: parts.debateTopics)
            catalogFromServer = true
            catalogError = nil
        } catch {
            catalogFromServer = false
            catalogError = error.localizedDescription
            if let fb = fallback {
                philosophers = fb.philosophers
                battles = fb.battles
                debateTopics = fb.debateTopics
            }
        }
    }

    private func mergeDebateTopics(fallback: [String: DebateTopicContent], server: [String: DebateTopicContent]) -> [String: DebateTopicContent] {
        var m = fallback
        for (k, v) in server { m[k] = v }
        return m
    }

    private static func readBundledCatalogFile() -> (philosophers: [Philosopher], battles: [Battle], debateTopics: [String: DebateTopicContent])? {
        guard let url = Bundle.main.url(forResource: "fallback_catalog", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let decoded = try? ArenaAPI.decodeCatalogDictionary(obj)
        else { return nil }
        return decoded
    }
}
