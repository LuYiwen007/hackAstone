import SwiftUI

private enum BattleChoice: String {
    case builder, breaker, uncertain
}

private enum BattleStage {
    case choose, reason, judge, reveal
}

struct BattleView: View {
    let battleId: String
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath

    private var L: ArenaL10n { locale.L }

    @State private var stage: BattleStage = .choose
    @State private var choice: BattleChoice?
    @State private var reason = ""
    @State private var judgeIndex = 0
    @State private var showShortReasonAlert = false

    private var battle: Battle? {
        catalog.battleForDisplay(id: battleId, english: L.prefersEnglish)
            ?? catalog.allBattles(english: L.prefersEnglish).first { $0.id == battleId }
    }

    var body: some View {
        Group {
            if let battle {
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        header(battle: battle)
                        questionBlock(battle: battle)
                        builderBreaker(battle: battle)
                        stageContent(battle: battle)
                    }
                    .padding(16)
                    .padding(.bottom, 32)
                }
                .background(ArenaTheme.background)
            } else {
                missingBattle
            }
        }
        .alert(L.reasonTooShortTitle, isPresented: $showShortReasonAlert) {
            Button(L.reasonTooShortOK, role: .cancel) {}
        } message: {
            Text(L.reasonTooShortMessage)
        }
        .onChange(of: stage) { _, newStage in
            if newStage == .reveal, let battle, AuthStore.bearerToken != nil {
                Task {
                    try? await ArenaAPI.saveBattleRecord(
                        battleType: "battle",
                        topic: battle.question,
                        userChoice: choiceLabel,
                        judgeSummary: battle.reveal,
                        changedStance: false
                    )
                }
            }
        }
    }

    private var choiceLabel: String {
        switch choice {
        case .builder: return "Builder"
        case .breaker: return "Breaker"
        case .uncertain: return L.uncertainChoiceTitle
        case nil: return "--"
        }
    }

    private var missingBattle: some View {
        VStack(spacing: 16) {
            Text(L.battleMissing)
                .font(.title2.weight(.bold))
                .foregroundStyle(ArenaTheme.textPrimary)
            Button(L.backToDisciplines) { path = NavigationPath(); path.append(AppRoute.disciplines) }
                .buttonStyle(.borderedProminent)
                .tint(.orange)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(ArenaTheme.background)
    }

    private func header(battle: Battle) -> some View {
        HStack(alignment: .center) {
            Button {
                path = NavigationPath()
                path.append(AppRoute.disciplines)
            } label: {
                Label(L.backToDisciplines, systemImage: "chevron.left")
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            .buttonStyle(.plain)
            Spacer()
            Text(battle.category)
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
        }
    }

    private func questionBlock(battle: Battle) -> some View {
        VStack(spacing: 10) {
            Text(battle.question)
                .font(.system(size: 28, weight: .bold))
                .multilineTextAlignment(.center)
                .foregroundStyle(ArenaTheme.textPrimary)
            HStack(spacing: 6) {
                Circle().fill(ArenaTheme.orangeAccent).frame(width: 6, height: 6)
                Text(L.battleInProgress)
                    .font(.caption)
                    .foregroundStyle(ArenaTheme.textMuted)
            }
        }
        .frame(maxWidth: .infinity)
    }

    private func builderBreaker(battle: Battle) -> some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 280), spacing: 14)], spacing: 14) {
            stanceCard(title: "Builder", subtitle: L.builderSubtitle, letter: "B", text: battle.builderView, color: .blue, selected: choice == .builder)
            stanceCard(title: "Breaker", subtitle: L.breakerSubtitle, letter: "B", text: battle.breakerView, color: .red, selected: choice == .breaker)
        }
    }

    private func stanceCard(title: String, subtitle: String, letter: String, text: String, color: Color, selected: Bool) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                ZStack {
                    Circle().fill(color.opacity(0.85)).frame(width: 40, height: 40)
                    Text(letter).font(.headline).foregroundStyle(.white)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.headline).foregroundStyle(ArenaTheme.textPrimary)
                    Text(subtitle).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                }
            }
            Text(text)
                .font(.subheadline)
                .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(selected ? color.opacity(0.12) : ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(selected ? color : ArenaTheme.border, lineWidth: 2))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    @ViewBuilder
    private func stageContent(battle: Battle) -> some View {
        switch stage {
        case .choose:
            choosePanel(battle: battle)
        case .reason:
            reasonPanel(battle: battle)
        case .judge:
            judgePanel(battle: battle)
        case .reveal:
            revealPanel(battle: battle)
        }
    }

    private func choosePanel(battle: Battle) -> some View {
        VStack(spacing: 14) {
            Text(L.yourStance)
                .font(.title3.weight(.bold))
                .frame(maxWidth: .infinity)
            choiceButton(title: L.supportBuilderTitle(builder: "Builder"), subtitle: L.supportBuilderSubtitle(builder: "Builder"), picked: choice == .builder) { choice = .builder }
            choiceButton(title: L.supportBreakerTitle(breaker: "Breaker"), subtitle: L.supportBreakerSubtitle(breaker: "Breaker"), picked: choice == .breaker) { choice = .breaker }
            choiceButton(title: L.uncertainChoiceTitle, subtitle: L.uncertainChoiceSubtitle, picked: choice == .uncertain) { choice = .uncertain }
            if choice != nil {
                Button(L.continueToReason) { stage = .reason }
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.orange)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(20)
        .background(ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
    }

    private func choiceButton(title: String, subtitle: String, picked: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.headline).foregroundStyle(ArenaTheme.textPrimary)
                Text(subtitle).font(.caption).foregroundStyle(ArenaTheme.textMuted)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .background(picked ? Color.orange.opacity(0.12) : ArenaTheme.background)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(picked ? Color.orange : ArenaTheme.border, lineWidth: 2))
        }
        .buttonStyle(.plain)
    }

    private func reasonPanel(battle: Battle) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Label {
                VStack(alignment: .leading, spacing: 6) {
                    Text(L.explainReasonTitle).font(.title3.weight(.bold))
                    Text(L.explainReasonSubtitle)
                        .font(.caption)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
            } icon: {
                Image(systemName: "bubble.left.and.bubble.right.fill").foregroundStyle(ArenaTheme.orangeAccent)
            }
            TextEditor(text: $reason)
                .arenaInputTextStyle()
                .frame(minHeight: 160)
                .padding(8)
                .scrollContentBackground(.hidden)
                .background(ArenaTheme.background)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
            HStack {
                Text(L.characterCount(reason.count)).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                Spacer()
                Button(L.back) { stage = .choose }
                    .buttonStyle(.bordered)
                Button(L.submitReason) { submitReason() }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
            }
        }
        .padding(20)
        .background(ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
    }

    private func judgePanel(battle: Battle) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 12) {
                ZStack {
                    Circle().fill(Color.orange).frame(width: 48, height: 48)
                    Text("J").font(.title2.weight(.bold)).foregroundStyle(.white)
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text("Judge").font(.title3.weight(.bold))
                    Text(L.calmJudge).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                }
            }
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "exclamationmark.circle.fill").foregroundStyle(ArenaTheme.orangeAccent)
                Text(battle.judgeQuestions[judgeIndex])
                    .font(.title3)
                    .foregroundStyle(ArenaTheme.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(16)
            .background(ArenaTheme.background)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
            Text(L.judgeFollowUp(index: judgeIndex, total: battle.judgeQuestions.count))
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
                .frame(maxWidth: .infinity)
            Button(judgeIndex < battle.judgeQuestions.count - 1 ? L.continueThinking : L.viewFullAnalysis) {
                if judgeIndex < battle.judgeQuestions.count - 1 {
                    judgeIndex += 1
                } else {
                    stage = .reveal
                }
            }
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.orange)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .padding(20)
        .background(ArenaTheme.surface)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.orange.opacity(0.35), lineWidth: 2))
    }

    private func revealPanel(battle: Battle) -> some View {
        VStack(spacing: 20) {
            Text("💡").font(.system(size: 44))
            Text(L.fullPerspective)
                .font(.title2.weight(.bold))
            Text(L.fullPerspectiveSubtitle)
                .font(.subheadline)
                .foregroundStyle(ArenaTheme.textMuted)
            Text(battle.reveal)
                .font(.body)
                .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                .frame(maxWidth: .infinity, alignment: .leading)
            HStack(spacing: 12) {
                Button(L.backHome) { path = NavigationPath() }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                Button(L.viewMindProfile) { path = NavigationPath(); path.append(AppRoute.profile) }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.orange)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(22)
        .background(
            LinearGradient(colors: [ArenaTheme.surface, ArenaTheme.background], startPoint: .top, endPoint: .bottom)
        )
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.orange.opacity(0.35), lineWidth: 2))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func submitReason() {
        if reason.trimmingCharacters(in: .whitespacesAndNewlines).count < 10 {
            showShortReasonAlert = true
            return
        }
        stage = .judge
    }
}
