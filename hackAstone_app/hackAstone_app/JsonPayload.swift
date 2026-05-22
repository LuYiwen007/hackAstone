import Foundation

enum JsonPayload {
    static func parse<T: Decodable>(_ raw: String, as type: T.Type = T.self) -> T? {
        var trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if let cut = trimmed.range(of: "}{\"output\"") {
            trimmed = String(trimmed[..<cut.upperBound])
        }
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
        if let slice = extractFirstJsonObject(trimmed) {
            return tryParse(slice, as: T.self)
        }
        return nil
    }

    /// 取第一个完整 JSON 对象，避免流式尾包 `{"output":...}` 导致 lastIndex 截错
    private static func extractFirstJsonObject(_ raw: String) -> String? {
        guard let start = raw.firstIndex(of: "{") else { return nil }
        var depth = 0
        var inString = false
        var escape = false
        var i = start
        while i < raw.endIndex {
            let c = raw[i]
            if inString {
                if escape { escape = false }
                else if c == "\\" { escape = true }
                else if c == "\"" { inString = false }
            } else if c == "\"" { inString = true }
            else if c == "{" { depth += 1 }
            else if c == "}" {
                depth -= 1
                if depth == 0 {
                    return String(raw[start ... i])
                }
            }
            i = raw.index(after: i)
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
