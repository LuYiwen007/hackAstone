#if os(iOS)
import PhotosUI
import SwiftUI
import UIKit

private enum UserAccountStore {
    static let avatarKey = "user_avatar_jpeg_data"

    static var avatarData: Data? {
        get { UserDefaults.standard.data(forKey: avatarKey) }
        set {
            if let newValue { UserDefaults.standard.set(newValue, forKey: avatarKey) }
            else { UserDefaults.standard.removeObject(forKey: avatarKey) }
        }
    }
}

private enum SettingsSection: String, CaseIterable, Identifiable {
    case general, subscription, language, appearance, notifications
    var id: String { rawValue }
}

/// 账号信息走后端；头像仍仅存本地。UI 对齐「网页设计」SettingsModal。
struct AccountSettingsView: View {
    @EnvironmentObject private var locale: AppLocaleStore
    @EnvironmentObject private var auth: AuthStore
    @Environment(\.dismiss) private var dismiss

    @State private var section: SettingsSection = .general
    @State private var nickname = ""
    @State private var email = ""
    @State private var pickerItem: PhotosPickerItem?
    @State private var avatarUIImage: UIImage?
    @State private var serverAvatarURL: URL?
    @State private var profileMessage: String?
    @State private var loadingProfile = false
    @State private var saving = false
    @State private var notifications = NotificationPrefs()
    @State private var prefs = PreferencePrefs()
    @State private var theme: AppearanceTheme = .dark
    @State private var showLoginSheet = false
    @State private var loginNavPath = NavigationPath()

    private var L: ArenaL10n { locale.L }

    private var displayName: String {
        let n = nickname.trimmingCharacters(in: .whitespacesAndNewlines)
        if !n.isEmpty { return n }
        return L.settingsDefaultUser
    }

    var body: some View {
        NavigationStack {
            Group {
                if auth.isLoggedIn {
                    HStack(spacing: 0) {
                        sidebar
                        contentPanel
                    }
                } else {
                    guestOnlyContent
                }
            }
            .background(ArenaTheme.background)
        }
        .arenaPushedScreenChrome()
        .task {
            if auth.isLoggedIn {
                await loadProfileFromServer()
            }
        }
        .onAppear {
            if auth.isLoggedIn,
               let data = UserAccountStore.avatarData,
               let img = UIImage(data: data) {
                avatarUIImage = img
            }
        }
    }

    private var guestOnlyContent: some View {
        VStack(spacing: 0) {
            HStack {
                Text(L.settingsNavGeneral)
                    .font(.headline)
                    .foregroundStyle(ArenaTheme.textPrimary)
                Spacer()
                Button(L.done) { dismiss() }
                    .fontWeight(.semibold)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .overlay(alignment: .bottom) { Divider().background(ArenaTheme.border) }

            VStack(spacing: 16) {
                Spacer(minLength: 24)
                Text(L.loginToManageAccount)
                    .font(.subheadline)
                    .foregroundStyle(ArenaTheme.textMuted)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                Button {
                    showLoginSheet = true
                } label: {
                    Text(L.profileLoginRegister)
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(ArenaTheme.orangeAccent)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .padding(.horizontal, 40)
                Spacer()
            }
        }
        .sheet(isPresented: $showLoginSheet) {
            NavigationStack {
                LoginView(path: $loginNavPath)
            }
            .environmentObject(auth)
            .environmentObject(locale)
        }
    }

    // MARK: - Sidebar

    private var sidebar: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 12) {
                    avatarThumb(size: 36)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(displayName)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(ArenaTheme.textPrimary)
                            .lineLimit(1)
                        Text(L.settingsPlanFree)
                            .font(.caption2)
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 18)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(ArenaTheme.background)
            .overlay(alignment: .bottom) { Divider().background(ArenaTheme.border) }

            settingsNavList
        }
        .frame(width: 200)
        .background(Color(red: 0.02, green: 0.02, blue: 0.03))
        .overlay(alignment: .trailing) {
            Rectangle().fill(ArenaTheme.border).frame(width: 1)
        }
    }

    private var settingsNavList: some View {
        ScrollView {
            VStack(spacing: 2) {
                ForEach(SettingsSection.allCases) { item in
                    settingsNavButton(item)
                }
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 6)
        }
    }

    private func settingsNavButton(_ item: SettingsSection) -> some View {
        let active = section == item
        return Button {
            section = item
        } label: {
            HStack(spacing: 10) {
                Image(systemName: iconName(item))
                    .font(.system(size: 14))
                    .frame(width: 18)
                Text(navLabel(item))
                    .font(.caption.weight(.medium))
                Spacer(minLength: 0)
                if active {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(ArenaTheme.textMuted)
                }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 10)
            .foregroundStyle(active ? ArenaTheme.textPrimary : ArenaTheme.textMuted)
            .background(active ? ArenaTheme.surface : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
    }

    // MARK: - Content

    private var contentPanel: some View {
        VStack(spacing: 0) {
            HStack {
                Text(navLabel(section))
                    .font(.headline)
                    .foregroundStyle(ArenaTheme.textPrimary)
                Spacer()
                Button(L.done) {
                    Task { await saveAndDismiss() }
                }
                .fontWeight(.semibold)
                .disabled(!auth.isLoggedIn || saving)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .overlay(alignment: .bottom) { Divider().background(ArenaTheme.border) }

            ScrollView {
                sectionContent
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .padding(.bottom, 32)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    @ViewBuilder
    private var sectionContent: some View {
        switch section {
        case .general:
            generalSection
        case .subscription:
            subscriptionSection
        case .language:
            languageSection
        case .appearance:
            appearanceSection
        case .notifications:
            notificationsSection
        }
    }

    private var generalSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            if auth.isLoggedIn {
                avatarEditorBlock
            }

            sectionHeader(L.settingsSectionAccount)
            settingsCard {
                settingRow(
                    title: L.settingsAccountType,
                    subtitle: L.settingsAccountTypeDesc,
                    trailing: {
                        Button(L.settingsUpgrade) { section = .subscription }
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(ArenaTheme.orangeAccent)
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                )
                settingRow(
                    title: L.settingsDataPrivacy,
                    subtitle: L.settingsDataPrivacyDesc,
                    trailing: {
                        Text(L.settingsManage)
                            .font(.caption)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(ArenaTheme.surface)
                            .overlay(RoundedRectangle(cornerRadius: 8).stroke(ArenaTheme.border))
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                )
            }

            if auth.isLoggedIn {
                sectionHeader(L.accountInfo)
                settingsCard {
                    if loadingProfile {
                        ProgressView().frame(maxWidth: .infinity)
                    }
                    labeledField(title: L.nickname, text: $nickname, prompt: L.nicknamePrompt)
                    VStack(alignment: .leading, spacing: 6) {
                        Text(L.email).font(.caption).foregroundStyle(ArenaTheme.textMuted)
                        Text(email.isEmpty ? "—" : email)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                            .background(ArenaTheme.background.opacity(0.6))
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                            .foregroundStyle(ArenaTheme.textMuted)
                        Text(L.emailReadOnlyHint)
                            .font(.caption2)
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                    if let profileMessage {
                        Text(profileMessage)
                            .font(.caption)
                            .foregroundStyle(profileMessage == L.profileSaved ? Color.green : Color.orange)
                    }
                }

                Button(role: .destructive) {
                    auth.clear()
                    dismiss()
                } label: {
                    Text(L.logout)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
                .buttonStyle(.bordered)
            }

            sectionHeader(L.settingsSectionPreferences)
            settingsCard {
                toggleRow(L.settingsAutoSave, subtitle: L.settingsAutoSaveDesc, binding: prefBinding(\.autoSave))
                toggleRow(L.settingsSound, subtitle: L.settingsSoundDesc, binding: prefBinding(\.sound))
                toggleRow(L.settingsTimer, subtitle: L.settingsTimerDesc, binding: prefBinding(\.timer))
            }
        }
    }

    private var avatarEditorBlock: some View {
        VStack(spacing: 12) {
            PhotosPicker(selection: $pickerItem, matching: .images, photoLibrary: .shared()) {
                avatarThumb(size: 88)
            }
            .buttonStyle(.plain)
            .onChange(of: pickerItem) { _, item in
                guard let item else { return }
                Task {
                    if let data = try? await item.loadTransferable(type: Data.self),
                       let img = UIImage(data: data) {
                        let jpeg = img.jpegData(compressionQuality: 0.85) ?? data
                        await MainActor.run {
                            avatarUIImage = img
                            UserAccountStore.avatarData = jpeg
                        }
                        if auth.isLoggedIn {
                            do {
                                let profile = try await ArenaAPI.uploadAvatar(jpegData: jpeg)
                                await MainActor.run {
                                    serverAvatarURL = Self.resolveAvatarURL(profile.avatarUrl)
                                }
                            } catch {
                                await MainActor.run { profileMessage = error.localizedDescription }
                            }
                        }
                    }
                }
            }
            Button(L.removeAvatar) {
                avatarUIImage = nil
                pickerItem = nil
                UserAccountStore.avatarData = nil
            }
            .font(.caption)
            .foregroundStyle(ArenaTheme.textMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
    }

    private var subscriptionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.settingsSubscriptionLead)
                .font(.caption)
                .foregroundStyle(ArenaTheme.textMuted)
            ForEach(SubscriptionPlan.all) { plan in
                subscriptionPlanCard(plan)
            }
        }
    }

    private var languageSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(L.settingsInterfaceLanguage)
            settingsCard {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(locale.prefersEnglish ? L.english : L.simplifiedChinese)
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(ArenaTheme.textPrimary)
                        Text(locale.prefersEnglish ? L.simplifiedChinese : L.english)
                            .font(.caption)
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                    Spacer()
                    Image(systemName: "checkmark")
                        .foregroundStyle(ArenaTheme.orangeAccent)
                }
                .padding(.vertical, 8)
            }
            Text(L.settingsSystemLanguageNote)
                .font(.caption2)
                .foregroundStyle(ArenaTheme.textMuted)
        }
    }

    private var appearanceSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionHeader(L.settingsColorTheme)
            HStack(spacing: 10) {
                ForEach(AppearanceTheme.allCases) { t in
                    themeChip(t)
                }
            }
            sectionHeader(L.settingsLayoutDensity)
            settingsCard {
                toggleRow(L.settingsCompact, subtitle: L.settingsCompactDesc, binding: prefBinding(\.compact))
                toggleRow(L.settingsAnimations, subtitle: L.settingsAnimationsDesc, binding: prefBinding(\.animations))
            }
        }
    }

    private var notificationsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeader(L.settingsNotificationSection)
            settingsCard {
                toggleRow(L.settingsNotifyDaily, subtitle: L.settingsNotifyDailyDesc, binding: notificationBinding(\.daily))
                toggleRow(L.settingsNotifyWeekly, subtitle: L.settingsNotifyWeeklyDesc, binding: notificationBinding(\.weekly))
                toggleRow(L.settingsNotifyUpdates, subtitle: L.settingsNotifyUpdatesDesc, binding: notificationBinding(\.updates))
            }
        }
    }

    // MARK: - UI helpers

    private func avatarThumb(size: CGFloat) -> some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [ArenaTheme.orangeAccent, Color.red.opacity(0.85)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: size, height: size)
            if let avatarUIImage {
                Image(uiImage: avatarUIImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: size, height: size)
                    .clipShape(Circle())
            } else if let serverAvatarURL {
                AsyncImage(url: serverAvatarURL) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    default:
                        Text(String(displayName.prefix(1)).uppercased())
                            .font(.system(size: size * 0.38, weight: .bold))
                            .foregroundStyle(.white)
                    }
                }
                .frame(width: size, height: size)
                .clipShape(Circle())
            } else {
                Text(String(displayName.prefix(1)).uppercased())
                    .font(.system(size: size * 0.38, weight: .bold))
                    .foregroundStyle(.white)
            }
        }
    }

    private static func resolveAvatarURL(_ path: String?) -> URL? {
        guard let path else { return nil }
        let t = path.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty else { return nil }
        if t.hasPrefix("http://") || t.hasPrefix("https://") || t.hasPrefix("data:") {
            return URL(string: t)
        }
        let base = ArenaConfiguration.apiBaseURLString
        if t.hasPrefix("/") {
            return URL(string: base + t)
        }
        return URL(string: base + "/" + t)
    }

    private func sectionHeader(_ title: String) -> some View {
        Text(title.uppercased())
            .font(.caption2.weight(.semibold))
            .foregroundStyle(ArenaTheme.textMuted)
            .tracking(0.6)
    }

    private func settingsCard<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        VStack(spacing: 0) {
            content()
        }
        .padding(.horizontal, 14)
        .background(ArenaTheme.surface.opacity(0.55))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func settingRow<Trailing: View>(
        title: String,
        subtitle: String?,
        @ViewBuilder trailing: () -> Trailing
    ) -> some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(ArenaTheme.textPrimary)
                if let subtitle {
                    Text(subtitle)
                        .font(.caption2)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
            }
            Spacer(minLength: 12)
            trailing()
        }
        .padding(.vertical, 12)
        .overlay(alignment: .bottom) {
            Divider().background(ArenaTheme.border.opacity(0.6))
        }
    }

    private func toggleRow(_ title: String, subtitle: String, binding: Binding<Bool>) -> some View {
        settingRow(title: title, subtitle: subtitle) {
            SettingsToggle(isOn: binding)
        }
    }

    private func labeledField(title: String, text: Binding<String>, prompt: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.caption).foregroundStyle(ArenaTheme.textMuted)
            TextField(prompt, text: text)
                .arenaInputTextStyle()
                .padding(12)
                .background(ArenaTheme.background)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
        }
        .padding(.vertical, 8)
    }

    private func themeChip(_ item: AppearanceTheme) -> some View {
        let selected = theme == item
        return Button {
            theme = item
            Task {
                _ = try? await ArenaAPI.updateSettings(jsonBody: [
                    "appearance": ["theme": item.rawValue],
                ])
            }
        } label: {
            VStack(spacing: 0) {
                ZStack(alignment: .bottom) {
                    Rectangle()
                        .fill(item.background)
                        .frame(height: 52)
                    Capsule()
                        .fill(item.accent.opacity(0.75))
                        .frame(height: 6)
                        .padding(.horizontal, 8)
                        .padding(.bottom, 8)
                }
                Text(item.label(L: L))
                    .font(.caption2)
                    .foregroundStyle(ArenaTheme.textMuted)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                    .background(ArenaTheme.surface)
            }
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(selected ? ArenaTheme.orangeAccent : ArenaTheme.border, lineWidth: selected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }

    private func subscriptionPlanCard(_ plan: SubscriptionPlan) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                Image(systemName: plan.icon)
                    .foregroundStyle(plan.accent)
                VStack(alignment: .leading, spacing: 2) {
                    Text(L.settingsPlanName(id: plan.id))
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(ArenaTheme.textPrimary)
                    Text(L.settingsPlanDesc(id: plan.id))
                        .font(.caption2)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 0) {
                    if plan.isCurrent {
                        Text(L.settingsCurrentPlan)
                            .font(.caption2)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(ArenaTheme.surface)
                            .clipShape(Capsule())
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text(L.settingsPlanPrice(id: plan.id))
                            .font(.title3.weight(.bold))
                            .foregroundStyle(plan.accent)
                        Text(L.settingsPlanPeriod)
                            .font(.caption2)
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                }
            }
            ForEach(L.settingsPlanFeatures(id: plan.id), id: \.self) { line in
                Label(line, systemImage: "checkmark")
                    .font(.caption2)
                    .foregroundStyle(ArenaTheme.textMuted)
            }
            if !plan.isCurrent {
                Text(L.settingsUpgradeTo(planName: L.settingsPlanName(id: plan.id)))
                    .font(.caption.weight(.semibold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(plan.buttonFill)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(14)
        .background(plan.cardBackground)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(plan.border, lineWidth: 1))
    }

    private func navLabel(_ item: SettingsSection) -> String {
        switch item {
        case .general: return L.settingsNavGeneral
        case .subscription: return L.settingsNavSubscription
        case .language: return L.settingsNavLanguage
        case .appearance: return L.settingsNavAppearance
        case .notifications: return L.settingsNavNotifications
        }
    }

    private func iconName(_ item: SettingsSection) -> String {
        switch item {
        case .general: return "person.fill"
        case .subscription: return "creditcard.fill"
        case .language: return "globe"
        case .appearance: return "paintpalette.fill"
        case .notifications: return "bell.fill"
        }
    }

    // MARK: - Data

    private func applySettingsFromServer(_ s: ArenaAPI.UserSettingsDTO?) {
        guard let s else { return }
        if let p = s.preferences {
            if let v = p.autoSave { prefs.autoSave = v }
            if let v = p.sound { prefs.sound = v }
            if let v = p.timer { prefs.timer = v }
            if let v = p.compact { prefs.compact = v }
            if let v = p.animations { prefs.animations = v }
        }
        if let n = s.notifications {
            if let v = n.daily { notifications.daily = v }
            if let v = n.weekly { notifications.weekly = v }
            if let v = n.updates { notifications.updates = v }
        }
        if let raw = s.appearance?.theme, let t = AppearanceTheme(rawValue: raw) {
            theme = t
        }
    }

    private func prefBinding(_ keyPath: WritableKeyPath<PreferencePrefs, Bool>) -> Binding<Bool> {
        Binding(
            get: { prefs[keyPath: keyPath] },
            set: { newValue in
                prefs[keyPath: keyPath] = newValue
                persistPreferences()
            }
        )
    }

    private func notificationBinding(_ keyPath: WritableKeyPath<NotificationPrefs, Bool>) -> Binding<Bool> {
        Binding(
            get: { notifications[keyPath: keyPath] },
            set: { newValue in
                notifications[keyPath: keyPath] = newValue
                persistNotifications()
            }
        )
    }

    private func persistPreferences() {
        Task {
            _ = try? await ArenaAPI.updateSettings(jsonBody: [
                "preferences": [
                    "autoSave": prefs.autoSave,
                    "sound": prefs.sound,
                    "timer": prefs.timer,
                    "compact": prefs.compact,
                    "animations": prefs.animations,
                ],
            ])
        }
    }

    private func persistNotifications() {
        Task {
            _ = try? await ArenaAPI.updateSettings(jsonBody: [
                "notifications": [
                    "daily": notifications.daily,
                    "weekly": notifications.weekly,
                    "updates": notifications.updates,
                ],
            ])
        }
    }

    private func loadProfileFromServer() async {
        guard auth.isLoggedIn else { return }
        await MainActor.run { loadingProfile = true }
        do {
            let profile = try await ArenaAPI.fetchCurrentUser()
            await MainActor.run {
                nickname = profile.nickname
                email = profile.email ?? ""
                if avatarUIImage == nil {
                    serverAvatarURL = Self.resolveAvatarURL(profile.avatarUrl)
                }
                applySettingsFromServer(profile.settings)
                auth.refreshProfile(userId: profile.userId, nickname: profile.nickname, email: profile.email)
            }
        } catch {
            await MainActor.run { profileMessage = error.localizedDescription }
        }
        await MainActor.run { loadingProfile = false }
    }

    private func saveAndDismiss() async {
        guard auth.isLoggedIn else {
            dismiss()
            return
        }
        await MainActor.run { saving = true }
        do {
            let profile = try await ArenaAPI.updateProfile(
                nickname: nickname.trimmingCharacters(in: .whitespacesAndNewlines)
            )
            await MainActor.run {
                auth.refreshProfile(userId: profile.userId, nickname: profile.nickname, email: profile.email)
                profileMessage = L.profileSaved
            }
            try? await Task.sleep(nanoseconds: 400_000_000)
            await MainActor.run { dismiss() }
        } catch {
            await MainActor.run { profileMessage = error.localizedDescription }
        }
        await MainActor.run { saving = false }
    }
}

// MARK: - Local models & controls

private struct PreferencePrefs {
    var autoSave = true
    var sound = false
    var timer = true
    var compact = false
    var animations = true
}

private struct NotificationPrefs {
    var daily = true
    var weekly = false
    var updates = true
}

private enum AppearanceTheme: String, CaseIterable, Identifiable {
    case dark, darker, midnight
    var id: String { rawValue }

    var background: Color {
        switch self {
        case .dark: return Color(red: 0.09, green: 0.09, blue: 0.11)
        case .darker: return Color(red: 0.035, green: 0.035, blue: 0.04)
        case .midnight: return Color(red: 0.06, green: 0.06, blue: 0.10)
        }
    }

    var accent: Color {
        switch self {
        case .dark: return ArenaTheme.orangeAccent
        case .darker: return Color.red
        case .midnight: return ArenaTheme.purpleAccent
        }
    }

    func label(L: ArenaL10n) -> String {
        switch self {
        case .dark: return L.settingsThemeDark
        case .darker: return L.settingsThemeDarker
        case .midnight: return L.settingsThemeMidnight
        }
    }
}

private struct SubscriptionPlan: Identifiable {
    let id: String
    let icon: String
    let isCurrent: Bool
    let accent: Color
    let border: Color
    let cardBackground: Color
    let buttonFill: Color

    static let all: [SubscriptionPlan] = [
        SubscriptionPlan(
            id: "free",
            icon: "shield.fill",
            isCurrent: true,
            accent: ArenaTheme.textMuted,
            border: ArenaTheme.border,
            cardBackground: ArenaTheme.surface.opacity(0.4),
            buttonFill: ArenaTheme.orangeAccent
        ),
        SubscriptionPlan(
            id: "pro",
            icon: "bolt.fill",
            isCurrent: false,
            accent: ArenaTheme.orangeAccent,
            border: ArenaTheme.orangeAccent.opacity(0.5),
            cardBackground: ArenaTheme.orangeAccent.opacity(0.08),
            buttonFill: ArenaTheme.orangeAccent
        ),
        SubscriptionPlan(
            id: "elite",
            icon: "crown.fill",
            isCurrent: false,
            accent: ArenaTheme.purpleAccent,
            border: ArenaTheme.purpleAccent.opacity(0.5),
            cardBackground: ArenaTheme.purpleAccent.opacity(0.08),
            buttonFill: ArenaTheme.purpleAccent
        ),
    ]
}

private struct SettingsToggle: View {
    @Binding var isOn: Bool

    var body: some View {
        Button {
            isOn.toggle()
        } label: {
            ZStack(alignment: isOn ? .trailing : .leading) {
                Capsule()
                    .fill(isOn ? ArenaTheme.orangeAccent : Color(red: 0.25, green: 0.25, blue: 0.28))
                    .frame(width: 44, height: 26)
                Circle()
                    .fill(Color.white)
                    .frame(width: 22, height: 22)
                    .padding(2)
                    .shadow(radius: 1)
            }
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.15), value: isOn)
    }
}

#endif
