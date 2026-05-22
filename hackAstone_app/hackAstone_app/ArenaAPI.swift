import Foundation

enum ArenaAPIError: LocalizedError {
    case badURL
    case httpStatus(Int)
    case serverMessage(String)
    case decode
    case network(Error)

    var errorDescription: String? {
        switch self {
        case .badURL: return "无效的接口地址"
        case .httpStatus(let c): return "HTTP \(c)"
        case .serverMessage(let m): return m
        case .decode: return "数据解析失败"
        case .network(let err):
            if let urlErr = err as? URLError {
                switch urlErr.code {
                case .timedOut:
                    return "连接服务器超时，请检查网络或确认后端已启动（本地调试可用 http://127.0.0.1:8080/api）"
                case .notConnectedToInternet, .networkConnectionLost:
                    return "网络不可用，请检查网络连接"
                case .cannotConnectToHost, .cannotFindHost:
                    return "无法连接服务器，请确认 API 地址是否正确"
                default:
                    break
                }
            }
            return err.localizedDescription
        }
    }
}

struct AgentRunResponse {
    let agent: String
    let appId: String
    let text: String
    let cached: Bool
    let dilemmaTurn: DilemmaTurnBilingualParsed?
    let dilemmaSummary: DilemmaSummaryBilingualParsed?
    let roundtableMessages: RoundtableMessagesBilingualParsed?
    let disciplineBattle: DisciplineBattleBilingualParsed?

    static func fromDictionary(_ o: [String: Any]) -> AgentRunResponse {
        let text = o["text"] as? String ?? ""
        return AgentRunResponse(
            agent: o["agent"] as? String ?? "echo",
            appId: o["appId"] as? String ?? "",
            text: text,
            cached: o["cached"] as? Bool ?? false,
            dilemmaTurn: ArenaBilingualParsing.parseDilemmaTurn(from: text, structured: o["dilemmaTurn"]),
            dilemmaSummary: ArenaBilingualParsing.parseDilemmaSummary(from: text, structured: o["dilemmaSummary"]),
            roundtableMessages: ArenaBilingualParsing.parseRoundtableMessages(from: text, structured: o["roundtableMessages"]),
            disciplineBattle: ArenaBilingualParsing.parseDisciplineBattle(from: text, structured: o["battle"])
        )
    }
}

enum ArenaAPI {
    /// 避免默认 60s 超时导致注册/登录按钮长时间「处理中」
    private static let session: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 15
        config.timeoutIntervalForResource = 20
        config.waitsForConnectivity = false
        return URLSession(configuration: config)
    }()

    /// 大模型流式 SSE（通义千问 incremental_output）
    private static let streamSession: URLSession = {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 120
        config.timeoutIntervalForResource = 180
        config.waitsForConnectivity = false
        return URLSession(configuration: config)
    }()

    typealias StreamDeltaHandler = (_ delta: String, _ accumulated: String) -> Void

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
        if let token = AuthStore.bearerToken, !token.isEmpty {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let jsonBody {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try JSONSerialization.data(withJSONObject: jsonBody)
        }
        let data: Data
        let resp: URLResponse
        do {
            (data, resp) = try await session.data(for: req)
        } catch {
            throw ArenaAPIError.network(error)
        }
        guard let http = resp as? HTTPURLResponse else { throw ArenaAPIError.decode }
        guard (200 ... 299).contains(http.statusCode) else { throw ArenaAPIError.httpStatus(http.statusCode) }
        return data
    }

    // MARK: - User auth（与 Web 对齐）

    static func register(email: String, password: String, nickname: String) async throws -> String {
        let data = try await request(
            path: "/user/register",
            method: "POST",
            jsonBody: ["email": email, "password": password, "nickname": nickname]
        )
        let inner = try envelopeData(data) as? [String: Any]
        return String(describing: inner?["userId"] ?? "")
    }

    static func login(account: String, password: String) async throws -> AuthSession {
        let data = try await request(
            path: "/user/login",
            method: "POST",
            jsonBody: ["account": account, "password": password]
        )
        let inner = try envelopeData(data) as? [String: Any]
        guard let inner,
              let token = inner["token"] as? String,
              let userId = inner["userId"] as? String
        else { throw ArenaAPIError.decode }
        return AuthSession(
            token: token,
            userId: userId,
            nickname: inner["nickname"] as? String ?? "",
            email: inner["email"] as? String
        )
    }

    struct UserProfileDTO: Decodable {
        let userId: String
        let email: String?
        let nickname: String
        let avatarUrl: String?
    }

    static func fetchCurrentUser() async throws -> UserProfileDTO {
        let data = try await request(path: "/user/me", method: "GET")
        let inner = try envelopeData(data)
        let d = try JSONSerialization.data(withJSONObject: inner)
        return try JSONDecoder().decode(UserProfileDTO.self, from: d)
    }

    static func updateProfile(nickname: String) async throws -> UserProfileDTO {
        let data = try await request(
            path: "/user/profile",
            method: "PUT",
            jsonBody: ["nickname": nickname]
        )
        let inner = try envelopeData(data)
        let d = try JSONSerialization.data(withJSONObject: inner)
        return try JSONDecoder().decode(UserProfileDTO.self, from: d)
    }

    // MARK: - Catalog & profile

    static func fetchCatalogParts(locale: String = "en") async throws -> (philosophers: [Philosopher], battles: [Battle], debateTopics: [String: DebateTopicContent]) {
        let loc = locale.hasPrefix("zh") ? "zh" : "en"
        let data = try await request(path: "/arena/catalog?locale=\(loc)", method: "GET")
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

    static func saveBattleRecord(
        battleType: String,
        topic: String,
        userChoice: String,
        judgeSummary: String,
        changedStance: Bool,
        messages: [[String: String]]? = nil
    ) async throws {
        var body: [String: Any] = [
            "battleType": battleType,
            "topic": topic,
            "userChoice": userChoice,
            "judgeSummary": judgeSummary,
            "changedStance": changedStance,
        ]
        if let messages { body["messages"] = messages }
        _ = try await request(path: "/arena/battle/record", method: "POST", jsonBody: body)
    }

    static func fetchDebateNote(sourceType: String, sourceKey: String) async throws -> String? {
        let encKey = sourceKey.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? sourceKey
        let data = try await request(
            path: "/arena/notes?sourceType=\(sourceType)&sourceKey=\(encKey)",
            method: "GET"
        )
        let inner = try envelopeData(data) as? [String: Any]
        guard let inner, let content = inner["content"] as? String, !content.isEmpty else { return nil }
        return content
    }

    static func saveDebateNote(sourceType: String, sourceKey: String, topic: String, content: String) async throws {
        _ = try await request(
            path: "/arena/notes",
            method: "POST",
            jsonBody: [
                "sourceType": sourceType,
                "sourceKey": sourceKey,
                "topic": topic,
                "content": content,
            ]
        )
    }

    // MARK: - Agents（流式 SSE）

    private static func requestAgentStream(
        path: String,
        jsonBody: [String: Any],
        onDelta: StreamDeltaHandler? = nil
    ) async throws -> [String: Any] {
        let base = ArenaConfiguration.apiBaseURLString
        let p = path.hasPrefix("/") ? path : "/\(path)"
        guard let url = URL(string: "\(base)\(p)") else { throw ArenaAPIError.badURL }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("text/event-stream", forHTTPHeaderField: "Accept")
        if let token = AuthStore.bearerToken, !token.isEmpty {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        req.httpBody = try JSONSerialization.data(withJSONObject: jsonBody)

        let bytes: URLSession.AsyncBytes
        let resp: URLResponse
        do {
            (bytes, resp) = try await streamSession.bytes(for: req)
        } catch {
            throw ArenaAPIError.network(error)
        }
        guard let http = resp as? HTTPURLResponse, (200 ... 299).contains(http.statusCode) else {
            throw ArenaAPIError.httpStatus((resp as? HTTPURLResponse)?.statusCode ?? -1)
        }

        var buffer = ""
        var donePayload: [String: Any]?
        for try await line in bytes.lines {
            buffer += line + "\n"
            while let range = buffer.range(of: "\n\n") {
                let block = String(buffer[..<range.lowerBound])
                buffer = String(buffer[range.upperBound...])
                for row in block.split(separator: "\n", omittingEmptySubsequences: false) {
                    let trimmed = row.trimmingCharacters(in: .whitespaces)
                    guard trimmed.hasPrefix("data:") else { continue }
                    let json = String(trimmed.dropFirst(5)).trimmingCharacters(in: .whitespaces)
                    if json.isEmpty || json == "[DONE]" { continue }
                    guard let rowData = json.data(using: .utf8),
                          let obj = try? JSONSerialization.jsonObject(with: rowData) as? [String: Any],
                          let type = obj["type"] as? String
                    else { continue }
                    if type == "delta" {
                        let delta = obj["text"] as? String ?? ""
                        let acc = obj["accumulated"] as? String ?? delta
                        if !delta.isEmpty { onDelta?(delta, acc) }
                    } else if type == "error" {
                        throw ArenaAPIError.serverMessage(obj["message"] as? String ?? "流式请求失败")
                    } else if type == "done" {
                        donePayload = obj
                    }
                }
            }
        }
        guard let donePayload else { throw ArenaAPIError.serverMessage("流式响应未收到完成事件") }
        return donePayload
    }

    static func runEcho(query: String, onDelta: StreamDeltaHandler? = nil) async throws -> AgentRunResponse {
        try await runAgent(agent: "echo", query: query, imageList: [], onDelta: onDelta)
    }

    /// 辩题生成：无 onDelta 时走非流式 `/arena/agent/topic`（辩论桌准备页）
    static func generateTopic(philosopherName: String, philosopherSchool: String, keyIdeas: [String], onDelta: StreamDeltaHandler? = nil) async throws -> AgentRunResponse {
        let body: [String: Any] = [
            "philosopherName": philosopherName,
            "philosopherSchool": philosopherSchool,
            "keyIdeas": keyIdeas.joined(separator: "。"),
        ]
        if onDelta == nil {
            let data = try await request(path: "/arena/agent/topic", method: "POST", jsonBody: body)
            let inner = try envelopeData(data) as? [String: Any]
            guard let inner else { throw ArenaAPIError.decode }
            return AgentRunResponse.fromDictionary(inner)
        }
        let inner = try await requestAgentStream(
            path: "/arena/agent/topic/stream",
            jsonBody: body,
            onDelta: onDelta
        )
        return AgentRunResponse.fromDictionary(inner)
    }

    static func generateDisciplineBattle(categoryEn: String, categoryZh: String, onDelta: StreamDeltaHandler? = nil) async throws -> AgentRunResponse {
        let inner = try await requestAgentStream(
            path: "/arena/agent/discipline/battle/stream",
            jsonBody: ["categoryEn": categoryEn, "categoryZh": categoryZh],
            onDelta: onDelta
        )
        return AgentRunResponse.fromDictionary(inner)
    }

    static func runAgent(agent: String, query: String, imageList: [String] = [], onDelta: StreamDeltaHandler? = nil) async throws -> AgentRunResponse {
        let inner = try await requestAgentStream(
            path: "/arena/agent/run/stream",
            jsonBody: ["agent": agent, "query": query, "imageList": imageList],
            onDelta: onDelta
        )
        return AgentRunResponse.fromDictionary(inner)
    }

    static func generateRoundtableOpenings(topic: String, participants: [[String: Any]], onDelta: StreamDeltaHandler? = nil) async throws -> AgentRunResponse {
        let inner = try await requestAgentStream(
            path: "/arena/agent/roundtable/openings/stream",
            jsonBody: ["topic": topic, "participants": participants],
            onDelta: onDelta
        )
        return AgentRunResponse.fromDictionary(inner)
    }

    static func generateRoundtableReply(topic: String, userInput: String, participants: [[String: Any]], onDelta: StreamDeltaHandler? = nil) async throws -> AgentRunResponse {
        let inner = try await requestAgentStream(
            path: "/arena/agent/roundtable/reply/stream",
            jsonBody: ["topic": topic, "userInput": userInput, "participants": participants],
            onDelta: onDelta
        )
        return AgentRunResponse.fromDictionary(inner)
    }

    static func dilemmaTurn(
        moralDilemmaTitle: String,
        moralDilemmaEnglishTitle: String,
        question: String,
        promptLead: String,
        userStance: String,
        philosopherName: String,
        philosopherSchool: String,
        keyIdeas: String,
        history: String,
        onDelta: StreamDeltaHandler? = nil
    ) async throws -> AgentRunResponse {
        let inner = try await requestAgentStream(
            path: "/arena/agent/dilemma/turn/stream",
            jsonBody: [
                "moralDilemmaTitle": moralDilemmaTitle,
                "moralDilemmaEnglishTitle": moralDilemmaEnglishTitle,
                "question": question,
                "promptLead": promptLead,
                "userStance": userStance,
                "philosopherName": philosopherName,
                "philosopherSchool": philosopherSchool,
                "keyIdeas": keyIdeas,
                "history": history,
            ],
            onDelta: onDelta
        )
        return AgentRunResponse.fromDictionary(inner)
    }

    static func dilemmaSummary(
        moralDilemmaTitle: String,
        question: String,
        userStance: String,
        philosopherName: String,
        philosopherSchool: String,
        history: String,
        onDelta: StreamDeltaHandler? = nil
    ) async throws -> AgentRunResponse {
        let inner = try await requestAgentStream(
            path: "/arena/agent/dilemma/summary/stream",
            jsonBody: [
                "moralDilemmaTitle": moralDilemmaTitle,
                "question": question,
                "userStance": userStance,
                "philosopherName": philosopherName,
                "philosopherSchool": philosopherSchool,
                "history": history,
            ],
            onDelta: onDelta
        )
        return AgentRunResponse.fromDictionary(inner)
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

    static func decodeCatalogDictionary(_ inner: [String: Any]) throws -> (philosophers: [Philosopher], battles: [Battle], debateTopics: [String: DebateTopicContent]) {
        let phil = try decodeArray(Philosopher.self, inner["philosophers"])
        let battles = try decodeArray(Battle.self, inner["battles"])
        let topics = try decodeDebateTopics(inner["debateTopics"])
        return (phil, battles, topics)
    }
}
