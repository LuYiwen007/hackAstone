import Combine
import Foundation
import SwiftUI

private struct StoredGeneratedBattle: Codable, Equatable {
    let id: String
    let en: StoredBattleSlice
    let zh: StoredBattleSlice
}

private struct StoredBattleSlice: Codable, Equatable {
    let question: String
    let category: String
    let builderView: String
    let breakerView: String
    let judgeQuestions: [String]
    let reveal: String
}

@MainActor
final class ArenaCatalogStore: ObservableObject {
    private static let generatedKey = "arena-generated-discipline-battles-v2"

    @Published private(set) var philosophers: [Philosopher] = []
    @Published private(set) var battles: [Battle] = []
    @Published private(set) var debateTopics: [String: DebateTopicContent] = [:]
    @Published private(set) var catalogFromServer = false
    @Published private(set) var catalogError: String?

    private var generatedBilingual: [StoredGeneratedBattle] = []

    func allBattles(english: Bool) -> [Battle] {
        let generated = generatedBilingual.map { stored -> Battle in
            let slice = english ? stored.en : stored.zh
            return Battle(
                id: stored.id,
                question: slice.question,
                category: slice.category,
                builderView: slice.builderView,
                breakerView: slice.breakerView,
                judgeQuestions: slice.judgeQuestions,
                reveal: slice.reveal
            )
        }
        return generated + battles
    }

    init() {
        generatedBilingual = Self.loadGenerated()
        let sys = AppLocaleStore.resolveSystemLanguageCode()
        let loc = sys.hasPrefix("zh") ? "zh" : "en"
        Task { await reload(locale: loc) }
    }

    func reload(locale: String) async {
        let fallback = Self.readBundledCatalogFile()
        let loc = locale.hasPrefix("zh") ? "zh" : "en"
        do {
            let parts = try await ArenaAPI.fetchCatalogParts(locale: loc)
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

    func battleForDisplay(id: String, english: Bool) -> Battle? {
        if let gen = generatedBilingual.first(where: { $0.id == id }) {
            let slice = english ? gen.en : gen.zh
            return Battle(
                id: gen.id,
                question: slice.question,
                category: slice.category,
                builderView: slice.builderView,
                breakerView: slice.breakerView,
                judgeQuestions: slice.judgeQuestions,
                reveal: slice.reveal
            )
        }
        return battles.first { $0.id == id }
    }

    @discardableResult
    func addGeneratedBattle(_ bilingual: DisciplineBattleBilingualParsed) -> String {
        let id = "gen-\(Int(Date().timeIntervalSince1970 * 1000))"
        let stored = StoredGeneratedBattle(
            id: id,
            en: StoredBattleSlice(
                question: bilingual.en.question,
                category: bilingual.en.category,
                builderView: bilingual.en.builderView,
                breakerView: bilingual.en.breakerView,
                judgeQuestions: Array(bilingual.en.judgeQuestions.prefix(3)),
                reveal: bilingual.en.reveal
            ),
            zh: StoredBattleSlice(
                question: bilingual.zh.question,
                category: bilingual.zh.category,
                builderView: bilingual.zh.builderView,
                breakerView: bilingual.zh.breakerView,
                judgeQuestions: Array(bilingual.zh.judgeQuestions.prefix(3)),
                reveal: bilingual.zh.reveal
            )
        )
        generatedBilingual.insert(stored, at: 0)
        Self.persistGenerated(generatedBilingual)
        return id
    }

    private static func loadGenerated() -> [StoredGeneratedBattle] {
        guard let data = UserDefaults.standard.data(forKey: generatedKey),
              let decoded = try? JSONDecoder().decode([StoredGeneratedBattle].self, from: data)
        else { return [] }
        return decoded
    }

    private static func persistGenerated(_ items: [StoredGeneratedBattle]) {
        if let data = try? JSONEncoder().encode(items) {
            UserDefaults.standard.set(data, forKey: generatedKey)
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
