import Foundation

enum ArenaAPIError: LocalizedError {
    case badURL
    case httpStatus(Int)
    case serverMessage(String)
    case decode

    var errorDescription: String? {
        switch self {
        case .badURL: return "无效的接口地址"
        case .httpStatus(let c): return "HTTP \(c)"
        case .serverMessage(let m): return m
        case .decode: return "数据解析失败"
        }
    }
}

enum ArenaAPI {
    private static func envelopeData(_ data: Data) throws -> Any {
        let obj = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let obj else { throw ArenaAPIError.decode }
        guard (obj["success"] as? Bool) == true else {
            let msg = (obj["message"] as? String) ?? "请求失败"
            throw ArenaAPIError.serverMessage(msg)
        }
        guard let inner = obj["data"] else { throw ArenaAPIError.decode }
        return inner
    }

    private static func request(path: String, method: String, jsonBody: [String: Any]? = nil) async throws -> Data {
        let base = ArenaConfiguration.apiBaseURLString
        let p = path.hasPrefix("/") ? path : "/\(path)"
        guard let url = URL(string: "\(base)\(p)") else { throw ArenaAPIError.badURL }
        var req = URLRequest(url: url)
        req.httpMethod = method
        if let jsonBody {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try JSONSerialization.data(withJSONObject: jsonBody)
        }
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw ArenaAPIError.decode }
        guard (200 ... 299).contains(http.statusCode) else { throw ArenaAPIError.httpStatus(http.statusCode) }
        return data
    }

    static func fetchCatalogParts() async throws -> (philosophers: [Philosopher], battles: [Battle], debateTopics: [String: DebateTopicContent]) {
        let data = try await request(path: "/arena/catalog", method: "GET")
        let inner = try envelopeData(data) as? [String: Any]
        guard let inner else { throw ArenaAPIError.decode }
        let phil = try decodeArray(Philosopher.self, inner["philosophers"])
        let battles = try decodeArray(Battle.self, inner["battles"])
        let topics = try decodeDebateTopics(inner["debateTopics"])
        return (phil, battles, topics)
    }

    static func fetchMindProfile() async throws -> MindProfilePayload {
        let data = try await request(path: "/arena/profile", method: "GET")
        let inner = try envelopeData(data)
        let d = try JSONSerialization.data(withJSONObject: inner)
        return try JSONDecoder().decode(MindProfilePayload.self, from: d)
    }

    static func runEcho(query: String) async throws -> AgentRunResponse {
        try await runAgent(agent: "echo", query: query, imageList: [])
    }

    static func runAgent(agent: String, query: String, imageList: [String] = []) async throws -> AgentRunResponse {
        let data = try await request(
            path: "/arena/agent/run",
            method: "POST",
            jsonBody: ["agent": agent, "query": query, "imageList": imageList]
        )
        let inner = try envelopeData(data)
        let o = inner as? [String: Any]
        guard let o else { throw ArenaAPIError.decode }
        return AgentRunResponse(
            agent: o["agent"] as? String ?? agent,
            appId: o["appId"] as? String ?? "",
            text: o["text"] as? String ?? "",
            cached: o["cached"] as? Bool ?? false
        )
    }

    static func generateRoundtableOpenings(topic: String, participants: [[String: Any]]) async throws -> AgentRunResponse {
        let data = try await request(
            path: "/arena/agent/roundtable/openings",
            method: "POST",
            jsonBody: ["topic": topic, "participants": participants]
        )
        let inner = try envelopeData(data)
        let o = inner as? [String: Any]
        guard let o else { throw ArenaAPIError.decode }
        return AgentRunResponse(
            agent: o["agent"] as? String ?? "echo",
            appId: o["appId"] as? String ?? "",
            text: o["text"] as? String ?? "",
            cached: o["cached"] as? Bool ?? false
        )
    }

    static func generateRoundtableReply(topic: String, userInput: String, participants: [[String: Any]]) async throws -> AgentRunResponse {
        let data = try await request(
            path: "/arena/agent/roundtable/reply",
            method: "POST",
            jsonBody: ["topic": topic, "userInput": userInput, "participants": participants]
        )
        let inner = try envelopeData(data)
        let o = inner as? [String: Any]
        guard let o else { throw ArenaAPIError.decode }
        return AgentRunResponse(
            agent: o["agent"] as? String ?? "echo",
            appId: o["appId"] as? String ?? "",
            text: o["text"] as? String ?? "",
            cached: o["cached"] as? Bool ?? false
        )
    }

    private static func decodeArray<T: Decodable>(_ type: T.Type, _ any: Any?) throws -> [T] {
        guard let any else { return [] }
        let d = try JSONSerialization.data(withJSONObject: any)
        return try JSONDecoder().decode([T].self, from: d)
    }

    private static func decodeDebateTopics(_ any: Any?) throws -> [String: DebateTopicContent] {
        guard let dict = any as? [String: Any] else { return [:] }
        var out: [String: DebateTopicContent] = [:]
        for (k, v) in dict {
            let d = try JSONSerialization.data(withJSONObject: v)
            out[k] = try JSONDecoder().decode(DebateTopicContent.self, from: d)
        }
        return out
    }

    /// 解析无 `Result` 包装的 `catalog.json` 根对象（用于包内 fallback）。
    static func decodeCatalogDictionary(_ inner: [String: Any]) throws -> (philosophers: [Philosopher], battles: [Battle], debateTopics: [String: DebateTopicContent]) {
        let phil = try decodeArray(Philosopher.self, inner["philosophers"])
        let battles = try decodeArray(Battle.self, inner["battles"])
        let topics = try decodeDebateTopics(inner["debateTopics"])
        return (phil, battles, topics)
    }
}
