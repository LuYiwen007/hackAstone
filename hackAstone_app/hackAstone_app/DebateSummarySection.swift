import SwiftUI

/// 对齐 Web `DebateSummary` 的核心信息块（本地生成，不额外请求 API）。
struct DebateSummarySection: View {
    @EnvironmentObject private var locale: AppLocaleStore
    let philosopher: Philosopher
    let question: String
    let userChoice: PhilosophyChoice?
    let userReason: String

    private var L: ArenaL10n { locale.L }

    var body: some View {
        let summary = buildSummary(L: L)
        let displayName = philosopher.displayName(isEnglish: L.prefersEnglish)
        VStack(alignment: .leading, spacing: 16) {
            Label(L.debateSummaryTitle, systemImage: "lightbulb.fill")
                .font(.title3.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)

            VStack(alignment: .leading, spacing: 8) {
                Text(L.corePoints)
                    .font(.headline)
                ForEach(Array(summary.corePoints.enumerated()), id: \.offset) { _, p in
                    Text("• \(p)")
                        .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                }
            }

            VStack(alignment: .leading, spacing: 10) {
                Text(L.stanceCompare)
                    .font(.headline)
                Group {
                    Text(L.philosopherStanceLabel(name: displayName)).font(.subheadline.weight(.semibold))
                    Text(summary.comparison.philosopherStance)
                        .foregroundStyle(ArenaTheme.textMuted)
                    Text(L.yourStanceLabel).font(.subheadline.weight(.semibold)).padding(.top, 4)
                    Text(summary.comparison.userStance)
                        .foregroundStyle(ArenaTheme.textMuted)
                    Text(L.alignmentLabel(summary.comparison.alignment))
                        .padding(.top, 4)
                        .foregroundStyle(ArenaTheme.cyanAccent)
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                Text(L.deepQuestions)
                    .font(.headline)
                ForEach(Array(summary.deepQuestions.enumerated()), id: \.offset) { i, q in
                    Text("\(i + 1). \(q)")
                        .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                }
            }
        }
        .padding(16)
        .background(ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
        .padding(.top, 8)
    }

    private struct Summary {
        let corePoints: [String]
        let comparison: (philosopherStance: String, userStance: String, alignment: String)
        let deepQuestions: [String]
    }

    private func buildSummary(L: ArenaL10n) -> Summary {
        let displayName = philosopher.displayName(isEnglish: L.prefersEnglish)
        let choiceText: String = {
            switch userChoice {
            case .agree: return L.agreeWith(name: displayName)
            case .disagree: return L.opposeStance
            case .uncertain, nil: return L.expressedUncertainty
            }
        }()
        let firstIdea = philosopher.keyIdeas.first ?? L.defaultCoreIdea
        return Summary(
            corePoints: [
                L.corePointPhilosopher(name: displayName, idea: firstIdea),
                L.corePointOpposite,
                L.corePointYourChoice(choice: choiceText),
            ],
            comparison: (
                philosopherStance: philosopher.summary ?? L.defaultPhilosopherStance(name: displayName),
                userStance: String(userReason.prefix(100)) + (userReason.count > 100 ? "..." : ""),
                alignment: userChoice == .agree ? L.alignmentHigh : userChoice == .disagree ? L.alignmentOppose : L.alignmentExploring
            ),
            deepQuestions: [
                L.deepQModern(name: displayName),
                L.deepQChangeMind,
                L.deepQDailyLife,
            ]
        )
    }
}

enum PhilosophyChoice: String, Hashable {
    case agree, disagree, uncertain
}
