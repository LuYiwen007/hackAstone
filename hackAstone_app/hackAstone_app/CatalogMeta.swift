import Foundation

/// 与 Web `catalogMeta.ts` 一致：首页时间轴与地区锚点使用本地元数据；思想家列表来自服务端目录合并。
enum CatalogMeta {
    static let regions: [RegionMeta] = [
        RegionMeta(id: "Americas", name: "美洲", x: 20, y: 33),
        RegionMeta(id: "Europe", name: "欧洲", x: 49, y: 22),
        RegionMeta(id: "Middle East", name: "中东", x: 57, y: 33),
        RegionMeta(id: "South Asia", name: "南亚", x: 66, y: 40),
        RegionMeta(id: "East Asia", name: "东亚", x: 78, y: 30),
    ]

    static let timePeriods: [CatalogTimePeriodMeta] = [
        CatalogTimePeriodMeta(id: "all", year: 0, label: "全部", era: "跨时代", startYear: nil, endYear: nil, showAll: true),
        CatalogTimePeriodMeta(id: "bce-6", year: -550, label: "公元前6世纪", era: "古代", startYear: -600, endYear: -501, showAll: nil),
        CatalogTimePeriodMeta(id: "bce-5", year: -450, label: "公元前5世纪", era: "古代", startYear: -500, endYear: -401, showAll: nil),
        CatalogTimePeriodMeta(id: "bce-4", year: -350, label: "公元前4世纪", era: "古代", startYear: -400, endYear: -301, showAll: nil),
        CatalogTimePeriodMeta(id: "bce-3", year: -250, label: "公元前3世纪", era: "古代", startYear: -300, endYear: -201, showAll: nil),
        CatalogTimePeriodMeta(id: "2nd", year: 150, label: "2世纪", era: "古典晚期", startYear: 100, endYear: 199, showAll: nil),
        CatalogTimePeriodMeta(id: "5th", year: 450, label: "5世纪", era: "中古", startYear: 400, endYear: 499, showAll: nil),
        CatalogTimePeriodMeta(id: "11th", year: 1050, label: "11世纪", era: "中古", startYear: 1000, endYear: 1099, showAll: nil),
        CatalogTimePeriodMeta(id: "12th", year: 1150, label: "12世纪", era: "中古", startYear: 1100, endYear: 1199, showAll: nil),
        CatalogTimePeriodMeta(id: "13th", year: 1250, label: "13世纪", era: "中古", startYear: 1200, endYear: 1299, showAll: nil),
        CatalogTimePeriodMeta(id: "17th", year: 1650, label: "17世纪", era: "近代", startYear: 1600, endYear: 1699, showAll: nil),
        CatalogTimePeriodMeta(id: "18th", year: 1750, label: "18世纪", era: "近代", startYear: 1700, endYear: 1799, showAll: nil),
        CatalogTimePeriodMeta(id: "19th", year: 1850, label: "19世纪", era: "现代", startYear: 1800, endYear: 1899, showAll: nil),
        CatalogTimePeriodMeta(id: "20th", year: 1950, label: "20世纪", era: "现代", startYear: 1900, endYear: 1999, showAll: nil),
    ]

    struct RegionGeoLayout {
        let lon: Double
        let lat: Double
        var cardOffsetX: CGFloat = 0
        var cardOffsetY: CGFloat = 0
    }

    static let regionGeoLayout: [String: RegionGeoLayout] = [
        "Americas": RegionGeoLayout(lon: -99, lat: 38, cardOffsetX: -18, cardOffsetY: -4),
        "Europe": RegionGeoLayout(lon: 14, lat: 50, cardOffsetX: -28, cardOffsetY: 12),
        "Middle East": RegionGeoLayout(lon: 45, lat: 31, cardOffsetX: 18, cardOffsetY: 4),
        "South Asia": RegionGeoLayout(lon: 79, lat: 22, cardOffsetX: 24, cardOffsetY: 8),
        "East Asia": RegionGeoLayout(lon: 116, lat: 36, cardOffsetX: 22, cardOffsetY: -2),
    ]

    static let oceanLabels: [(id: String, x: CGFloat, y: CGFloat, text: String)] = [
        ("pacific-west", 118, 250, "PACIFIC"),
        ("atlantic", 405, 262, "ATLANTIC"),
        ("indian", 671, 345, "INDIAN"),
        ("pacific-east", 936, 286, "PACIFIC"),
    ]

    static let mapViewBox = CGSize(width: 1000, height: 520)
    static let mapLatRange = (min: -85.0, max: 85.0)

    static func getPhilosophersByPeriodAndRegion(
        period: CatalogTimePeriodMeta,
        region: String,
        source: [Philosopher]
    ) -> [Philosopher] {
        source.filter { p in
            guard p.region == region else { return false }
            if period.showAll == true { return true }
            let start = period.startYear ?? Int.min
            let end = period.endYear ?? Int.max
            return p.period >= start && p.period <= end
        }
        .sorted { $0.period < $1.period }
    }

    static func describePeriod(_ period: CatalogTimePeriodMeta) -> String {
        if period.showAll == true { return "显示全部时代的哲学家" }
        let s = period.startYear ?? 0
        let e = period.endYear ?? 0
        return "\(s) 至 \(e)"
    }
}
