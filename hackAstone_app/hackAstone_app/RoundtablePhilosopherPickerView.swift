import SwiftUI

struct RoundtablePhilosopherPickerView: View {
    @EnvironmentObject private var catalog: ArenaCatalogStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Environment(\.dismiss) private var dismiss

    @Binding var selected: [Philosopher]

    @State private var draftIds: Set<String> = []
    @State private var query = ""

    private var L: ArenaL10n { locale.L }
    private let maxPick = 4

    private var sorted: [Philosopher] {
        catalog.philosophers.sorted {
            $0.displayName(isEnglish: L.prefersEnglish)
                .localizedCompare($1.displayName(isEnglish: L.prefersEnglish)) == .orderedAscending
        }
    }

    private var filtered: [Philosopher] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !q.isEmpty else { return sorted }
        return sorted.filter { p in
            let hay = "\(p.displayName(isEnglish: L.prefersEnglish)) \(p.nameCN) \(p.school)".lowercased()
            return hay.contains(q)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(L.roundtablePickerHint)
                    .font(.subheadline)
                    .foregroundStyle(ArenaTheme.textMuted)
                Text(L.roundtablePickerCount(total: catalog.philosophers.count, count: draftIds.count))
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(ArenaTheme.orangeAccent)

                TextField(L.roundtableSearchPlaceholder, text: $query)
                    .arenaInputTextStyle()
                    .textFieldStyle(.roundedBorder)

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: 10)], spacing: 10) {
                    ForEach(filtered) { p in
                        let picked = draftIds.contains(p.id)
                        let full = draftIds.count >= maxPick && !picked
                        Button {
                            toggle(p.id)
                        } label: {
                            HStack(spacing: 10) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(p.displayName(isEnglish: L.prefersEnglish))
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(ArenaTheme.textPrimary)
                                    Text(p.school)
                                        .font(.caption2)
                                        .foregroundStyle(ArenaTheme.textMuted)
                                }
                                Spacer()
                                if picked {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundStyle(ArenaTheme.orangeAccent)
                                }
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(picked ? Color.orange.opacity(0.12) : ArenaTheme.surface)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(picked ? Color.orange.opacity(0.6) : ArenaTheme.border)
                            )
                        }
                        .disabled(full)
                        .opacity(full ? 0.4 : 1)
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(16)
            .padding(.bottom, 28)
        }
        .background(ArenaTheme.background)
        .navigationTitle(L.roundtablePickerTitle)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button(L.roundtablePickerConfirm) {
                    confirm()
                }
                .disabled(draftIds.count < 2)
            }
        }
        .onAppear {
            draftIds = Set(selected.map(\.id))
        }
    }

    private func toggle(_ id: String) {
        if draftIds.contains(id) {
            draftIds.remove(id)
        } else if draftIds.count < maxPick {
            draftIds.insert(id)
        }
    }

    private func confirm() {
        let order = sorted.map(\.id)
        selected = order.compactMap { id in
            guard draftIds.contains(id) else { return nil }
            return catalog.philosophers.first { $0.id == id }
        }
        dismiss()
    }
}
