import Foundation

enum JsonPayload {
    static func parse<T: Decodable>(_ raw: String, as type: T.Type = T.self) -> T? {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if let v = tryParse(trimmed, as: T.self) { return v }
        if let range = trimmed.range(of: #"```json\s*"#, options: .regularExpression) {
            let after = trimmed[range.upperBound...]
            if let end = after.range(of: "```") {
                let inner = String(after[..<end.lowerBound]).trimmingCharacters(in: .whitespacesAndNewlines)
                if let v = tryParse(inner, as: T.self) { return v }
            }
        }
        if let range = trimmed.range(of: #"```"#, options: .regularExpression) {
            let after = trimmed[range.upperBound...]
            if let end = after.range(of: "```") {
                let inner = String(after[..<end.lowerBound]).trimmingCharacters(in: .whitespacesAndNewlines)
                if let v = tryParse(inner, as: T.self) { return v }
            }
        }
        if let first = trimmed.firstIndex(of: "{"), let last = trimmed.lastIndex(of: "}") {
            let slice = String(trimmed[first ... last])
            return tryParse(slice, as: T.self)
        }
        return nil
    }

    private static func tryParse<T: Decodable>(_ text: String, as type: T.Type) -> T? {
        guard let data = text.data(using: .utf8) else { return nil }
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            return nil
        }
    }
}
