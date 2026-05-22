import Foundation

struct BattleLocaleSlice: Equatable {
    var question: String
    var category: String
    var builderView: String
    var breakerView: String
    var judgeQuestions: [String]
    var reveal: String

    func toBattle(id: String) -> Battle {
        Battle(
            id: id,
            question: question,
            category: category,
            builderView: builderView,
            breakerView: breakerView,
            judgeQuestions: judgeQuestions,
            reveal: reveal
        )
    }
}

struct DisciplineSummaryBilingualParsed: Equatable {
    let en: String
    let zh: String
}

struct DisciplineDualReplyParsed: Equatable {
    let builder: String
    let breaker: String
}

struct DisciplineBattleBilingualParsed: Equatable {
    let en: BattleLocaleSlice
    let zh: BattleLocaleSlice
}

struct DilemmaTurnSliceParsed: Equatable {
    let philosopherReply: String
    let judgeQuestion: String
    let continueDebate: Bool
}

struct DilemmaTurnBilingualParsed: Equatable {
    let en: DilemmaTurnSliceParsed
    let zh: DilemmaTurnSliceParsed

    func pick(english: Bool) -> DilemmaTurnSliceParsed {
        english ? en : zh
    }
}

struct DilemmaSummaryBilingualParsed: Equatable {
    let en: String
    let zh: String

    func pick(english: Bool) -> String {
        english ? en : zh
    }
}

struct RoundtableMessageSlice: Equatable {
    let speaker: String
    let content: String
}

struct RoundtableMessagesBilingualParsed: Equatable {
    let en: [RoundtableMessageSlice]
    let zh: [RoundtableMessageSlice]

    func pick(english: Bool) -> [RoundtableMessageSlice] {
        english ? en : zh
    }
}

enum ArenaBilingualParsing {

    private static func pickLocaleBlock(_ root: [String: Any], keys: [String]) -> [String: Any]? {
        for key in keys {
            if let v = root[key] as? [String: Any] { return v }
        }
        let lower = Set(keys.map { $0.lowercased() })
        for (k, v) in root {
            if lower.contains(k.lowercased()), let o = v as? [String: Any] { return o }
        }
        return nil
    }

    private static func normalizeBattleSlice(_ raw: Any?) -> BattleLocaleSlice? {
        guard let o = raw as? [String: Any] else { return nil }
        let judgeRaw = o["judgeQuestions"] ?? o["judge_questions"]
        let judgeQuestions: [String] = (judgeRaw as? [Any])?
            .map { String(describing: $0).trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty } ?? []
        let slice = BattleLocaleSlice(
            question: String(describing: o["question"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines),
            category: String(describing: o["category"] ?? "General").trimmingCharacters(in: .whitespacesAndNewlines),
            builderView: String(describing: o["builderView"] ?? o["builder_view"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines),
            breakerView: String(describing: o["breakerView"] ?? o["breaker_view"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines),
            judgeQuestions: judgeQuestions,
            reveal: String(describing: o["reveal"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        )
        guard !slice.question.isEmpty, !slice.builderView.isEmpty, !slice.breakerView.isEmpty else { return nil }
        return slice
    }

    static func parseDisciplineBattle(from text: String, structured: Any?) -> DisciplineBattleBilingualParsed? {
        if let dict = structured as? [String: Any] {
            if let parsed = parseDisciplineBattleDict(dict) { return parsed }
        }
        guard let data = text.data(using: .utf8),
              let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return nil }
        return parseDisciplineBattleDict(root)
    }

    private static func parseDisciplineBattleDict(_ root: [String: Any]) -> DisciplineBattleBilingualParsed? {
        if let en = normalizeBattleSlice(root["en"]),
           let zh = normalizeBattleSlice(root["zh"]) {
            return DisciplineBattleBilingualParsed(en: en, zh: zh)
        }
        if let en = normalizeBattleSlice(pickLocaleBlock(root, keys: ["en", "english"])),
           let zh = normalizeBattleSlice(pickLocaleBlock(root, keys: ["zh", "chinese", "cn"])) {
            return DisciplineBattleBilingualParsed(en: en, zh: zh)
        }
        if let single = normalizeBattleSlice(root) {
            return DisciplineBattleBilingualParsed(en: single, zh: single)
        }
        return nil
    }

    static func parseDilemmaTurn(from text: String, structured: Any?) -> DilemmaTurnBilingualParsed? {
        if let dict = structured as? [String: Any], let p = parseDilemmaTurnDict(dict) { return p }
        guard let data = text.data(using: .utf8),
              let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return nil }
        return parseDilemmaTurnDict(root)
    }

    private static func parseDilemmaTurnDict(_ root: [String: Any]) -> DilemmaTurnBilingualParsed? {
        func slice(_ raw: Any?) -> DilemmaTurnSliceParsed? {
            guard let o = raw as? [String: Any] else { return nil }
            let pr = String(describing: o["philosopherReply"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            let jq = String(describing: o["judgeQuestion"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            guard !pr.isEmpty, !jq.isEmpty else { return nil }
            let cont = (o["continueDebate"] as? Bool) ?? true
            return DilemmaTurnSliceParsed(philosopherReply: pr, judgeQuestion: jq, continueDebate: cont)
        }
        if let en = slice(root["en"]), let zh = slice(root["zh"]) {
            return DilemmaTurnBilingualParsed(en: en, zh: zh)
        }
        if let en = slice(pickLocaleBlock(root, keys: ["en", "english"])),
           let zh = slice(pickLocaleBlock(root, keys: ["zh", "chinese", "cn"])) {
            return DilemmaTurnBilingualParsed(en: en, zh: zh)
        }
        if let single = slice(root) {
            return DilemmaTurnBilingualParsed(en: single, zh: single)
        }
        return nil
    }

    static func parseDilemmaSummary(from text: String, structured: Any?) -> DilemmaSummaryBilingualParsed? {
        if let dict = structured as? [String: Any], let p = parseDilemmaSummaryDict(dict) { return p }
        guard let data = text.data(using: .utf8),
              let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return nil }
        return parseDilemmaSummaryDict(root)
    }

    private static func parseDilemmaSummaryDict(_ root: [String: Any]) -> DilemmaSummaryBilingualParsed? {
        func explanation(_ raw: Any?) -> String? {
            guard let o = raw as? [String: Any] else { return nil }
            let fe = String(describing: o["fullExplanation"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            return fe.isEmpty ? nil : fe
        }
        if let en = explanation(root["en"]), let zh = explanation(root["zh"]) {
            return DilemmaSummaryBilingualParsed(en: en, zh: zh)
        }
        if let en = explanation(pickLocaleBlock(root, keys: ["en", "english"])),
           let zh = explanation(pickLocaleBlock(root, keys: ["zh", "chinese", "cn"])) {
            return DilemmaSummaryBilingualParsed(en: en, zh: zh)
        }
        let fe = String(describing: root["fullExplanation"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        if !fe.isEmpty {
            return DilemmaSummaryBilingualParsed(en: fe, zh: fe)
        }
        return nil
    }

    static func parseRoundtableMessages(from text: String, structured: Any?) -> RoundtableMessagesBilingualParsed? {
        if let dict = structured as? [String: Any], let p = parseRoundtableDict(dict) { return p }
        guard let data = text.data(using: .utf8),
              let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return nil }
        return parseRoundtableDict(root)
    }

    private static func parseRoundtableDict(_ root: [String: Any]) -> RoundtableMessagesBilingualParsed? {
        func messages(_ raw: Any?) -> [RoundtableMessageSlice]? {
            guard let o = raw as? [String: Any],
                  let arr = o["messages"] as? [[String: Any]]
            else { return nil }
            let mapped = arr.compactMap { item -> RoundtableMessageSlice? in
                let speaker = String(describing: item["speaker"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                let content = String(describing: item["content"] ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
                guard !speaker.isEmpty, !content.isEmpty else { return nil }
                return RoundtableMessageSlice(speaker: speaker, content: content)
            }
            return mapped.isEmpty ? nil : mapped
        }
        if let en = messages(root["en"]), let zh = messages(root["zh"]) {
            return RoundtableMessagesBilingualParsed(en: en, zh: zh)
        }
        if let en = messages(pickLocaleBlock(root, keys: ["en", "english"])),
           let zh = messages(pickLocaleBlock(root, keys: ["zh", "chinese", "cn"])) {
            return RoundtableMessagesBilingualParsed(en: en, zh: zh)
        }
        if let single = messages(root) {
            return RoundtableMessagesBilingualParsed(en: single, zh: single)
        }
        return nil
    }

    static func parseDisciplineSummary(from text: String, structured: Any?) -> DisciplineSummaryBilingualParsed? {
        if let dict = structured as? [String: Any], let p = parseDisciplineSummaryDict(dict) { return p }
        guard let data = text.data(using: .utf8),
              let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return nil }
        return parseDisciplineSummaryDict(root)
    }

    private static func parseDisciplineSummaryDict(_ root: [String: Any]) -> DisciplineSummaryBilingualParsed? {
        func summary(_ raw: Any?) -> String? {
            guard let o = raw as? [String: Any] else { return nil }
            let s = String(describing: o["summary"] ?? o["reveal"] ?? o["fullExplanation"] ?? "")
                .trimmingCharacters(in: .whitespacesAndNewlines)
            return s.isEmpty ? nil : s
        }
        if let en = summary(root["en"]), let zh = summary(root["zh"]) {
            return DisciplineSummaryBilingualParsed(en: en, zh: zh)
        }
        if let en = summary(pickLocaleBlock(root, keys: ["en", "english"])),
           let zh = summary(pickLocaleBlock(root, keys: ["zh", "chinese", "cn"])) {
            return DisciplineSummaryBilingualParsed(en: en, zh: zh)
        }
        let single = summary(root)
        if let single { return DisciplineSummaryBilingualParsed(en: single, zh: single) }
        return nil
    }

    static func parseDisciplineDual(from text: String, structured: Any?) -> DisciplineDualReplyParsed? {
        if let dict = structured as? [String: Any],
           let b = dict["builder"] as? String,
           let k = dict["breaker"] as? String,
           !b.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
           !k.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return DisciplineDualReplyParsed(builder: b.trimmingCharacters(in: .whitespacesAndNewlines),
                                             breaker: k.trimmingCharacters(in: .whitespacesAndNewlines))
        }
        return parseDisciplineDualMarkers(from: finalizeStreamSpeech(text))
    }

    static func finalizeStreamSpeech(_ raw: String) -> String {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.hasPrefix("{"),
              let data = trimmed.data(using: .utf8),
              let o = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let c = o["content"] as? String,
              !c.isEmpty
        else { return trimmed }
        return c
    }

    private static func parseDisciplineDualMarkers(from text: String) -> DisciplineDualReplyParsed? {
        let patternBuilder = #"(?m)^\s*(?:\[Builder\]|【建构者】|建构者[:：])\s*"#
        let patternBreaker = #"(?m)^\s*(?:\[Breaker\]|【破坏者】|破坏者[:：])\s*"#
        guard let bRange = text.range(of: patternBuilder, options: .regularExpression),
              let kRange = text.range(of: patternBreaker, options: .regularExpression),
              bRange.lowerBound < kRange.lowerBound
        else { return nil }
        let builderText = String(text[bRange.upperBound..<kRange.lowerBound]).trimmingCharacters(in: .whitespacesAndNewlines)
        let breakerText = String(text[kRange.upperBound...]).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !builderText.isEmpty, !breakerText.isEmpty else { return nil }
        return DisciplineDualReplyParsed(builder: builderText, breaker: breakerText)
    }

    static func buildDebateNoteKey(philosopherId: String, question: String) -> String {
        "\(philosopherId)|\(question.trimmingCharacters(in: .whitespacesAndNewlines))"
    }
}
