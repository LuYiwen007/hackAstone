import SwiftUI

struct PhilosopherDetailSheet: View {
    @EnvironmentObject private var locale: AppLocaleStore
    let philosopher: Philosopher
    let allPhilosophers: [Philosopher]
    var onClose: () -> Void
    var onStartDebate: () -> Void

    private var L: ArenaL10n { locale.L }
    private var displayName: String { philosopher.displayName(isEnglish: L.prefersEnglish) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        Spacer()
                        Button(L.close, action: onClose)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(ArenaTheme.textMuted)
                    }

                    HStack(alignment: .top, spacing: 14) {
                        PhilosopherAvatarView(philosopher: philosopher, size: 64)
                        VStack(alignment: .leading, spacing: 6) {
                            Text(displayName)
                                .font(.title2.weight(.bold))
                                .foregroundStyle(ArenaTheme.textPrimary)
                            Text(philosopher.name)
                                .foregroundStyle(ArenaTheme.textMuted)
                            HStack(spacing: 10) {
                                if let lifespan = philosopher.lifespan {
                                    Label(lifespan, systemImage: "calendar")
                                        .font(.caption)
                                        .foregroundStyle(ArenaTheme.textMuted)
                                }
                                if let bp = philosopher.birthPlace {
                                    Label(bp, systemImage: "mappin.and.ellipse")
                                        .font(.caption)
                                        .foregroundStyle(ArenaTheme.textMuted)
                                }
                            }
                        }
                        Spacer()
                    }

                    Text(philosopher.school)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(ArenaTheme.purpleAccent)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(ArenaTheme.purpleAccent.opacity(0.15))
                        .clipShape(Capsule())

                    if let summary = philosopher.summary {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(L.coreThought)
                                .font(.headline)
                                .foregroundStyle(ArenaTheme.textPrimary)
                            Text(summary)
                                .foregroundStyle(Color(red: 0.82, green: 0.84, blue: 0.86))
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text(L.keyConcepts)
                            .font(.headline)
                            .foregroundStyle(ArenaTheme.textPrimary)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 72), spacing: 8)], spacing: 8) {
                            ForEach(philosopher.keyIdeas, id: \.self) { idea in
                                Text(idea)
                                    .font(.caption)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 8)
                                    .frame(maxWidth: .infinity)
                                    .background(ArenaTheme.background)
                                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(ArenaTheme.border))
                            }
                        }
                    }

                    if let works = philosopher.majorWorks, !works.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(L.majorWorks)
                                .font(.headline)
                            ForEach(works, id: \.self) { w in
                                Text("• \(w)")
                                    .foregroundStyle(ArenaTheme.textMuted)
                            }
                        }
                    }

                    influenceSection(title: L.influencedBy, ids: philosopher.influences?.influencedBy)
                    influenceSection(title: L.influenced, ids: philosopher.influences?.influenced)

                    Button(action: onStartDebate) {
                        Text(L.startPhilosophyBattle)
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(ArenaTheme.purpleAccent)
                }
                .padding(20)
            }
            .background(ArenaTheme.background)
        }
        .arenaPushedScreenChrome()
    }

    @ViewBuilder
    private func influenceSection(title: String, ids: [String]?) -> some View {
        if let ids, !ids.isEmpty {
            let names = ids.compactMap { id in
                allPhilosophers.first { $0.id == id }.map { $0.displayName(isEnglish: locale.L.prefersEnglish) }
            }
            if !names.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text(title)
                        .font(.headline)
                    Text(names.joined(separator: "、"))
                        .foregroundStyle(ArenaTheme.textMuted)
                }
            }
        }
    }
}
