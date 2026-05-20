import Foundation

struct Influences: Codable, Hashable {
    var influencedBy: [String]?
    var influenced: [String]?
}

struct Philosopher: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let nameCN: String
    let region: String
    let period: Int
    let school: String
    let keyIdeas: [String]
    var lifespan: String?
    var birthPlace: String?
    var majorWorks: [String]?
    var famousQuotes: [String]?
    var summary: String?
    var influences: Influences?
}

struct RegionMeta: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let x: Int
    let y: Int
}

struct CatalogTimePeriodMeta: Codable, Identifiable, Hashable {
    let id: String
    let year: Int
    let label: String
    let era: String
    var startYear: Int?
    var endYear: Int?
    var showAll: Bool?
}

struct Battle: Codable, Identifiable, Hashable {
    let id: String
    let question: String
    let category: String
    let builderView: String
    let breakerView: String
    let judgeQuestions: [String]
    let reveal: String
}

struct DebateTopicContent: Codable, Hashable {
    let question: String
    let philosopherView: String
    let oppositeView: String
    let judgeQuestions: [String]
    var fullExplanation: String?
}

struct MindProfileStat: Codable, Hashable {
    let label: String
    let value: String
}

struct MindProfileBias: Codable, Hashable {
    let name: String
    let description: String
    let percentage: Int
    let color: String
    let instances: Int
}

struct MindProfileRecentBattle: Codable, Hashable {
    let question: String
    let choice: String
    let judgeComment: String
    let changed: Bool
}

struct MindProfilePayload: Codable, Hashable {
    var biases: [MindProfileBias]
    var stats: [MindProfileStat]
    var recentBattles: [MindProfileRecentBattle]
}

