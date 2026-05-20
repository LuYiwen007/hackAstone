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

/// 账号信息走后端；头像仍仅存本地。语言跟随系统，无手动切换。
struct AccountSettingsView: View {
    @EnvironmentObject private var locale: AppLocaleStore
    @EnvironmentObject private var auth: AuthStore
    @Environment(\.dismiss) private var dismiss

    @State private var nickname = ""
    @State private var email = ""
    @State private var pickerItem: PhotosPickerItem?
    @State private var avatarUIImage: UIImage?
    @State private var profileMessage: String?
    @State private var loadingProfile = false
    @State private var saving = false

    private var L: ArenaL10n { locale.L }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    HStack {
                        Text(L.accountNavTitle)
                            .font(.headline)
                            .foregroundStyle(ArenaTheme.textPrimary)
                        Spacer()
                        Button(L.done) {
                            Task { await saveAndDismiss() }
                        }
                        .fontWeight(.semibold)
                        .disabled(!auth.isLoggedIn || saving)
                    }

                    if !auth.isLoggedIn {
                        Text(L.loginToManageAccount)
                            .font(.subheadline)
                            .foregroundStyle(ArenaTheme.textMuted)
                    } else {
                        avatarSection
                        accountSection
                        logoutSection
                    }
                }
                .padding(20)
                .padding(.bottom, 40)
            }
            .background(ArenaTheme.background)
        }
        .arenaPushedScreenChrome()
        .task {
            await loadProfileFromServer()
        }
        .onAppear {
            if let data = UserAccountStore.avatarData, let img = UIImage(data: data) {
                avatarUIImage = img
            }
        }
    }

    private var avatarSection: some View {
        VStack(spacing: 14) {
            Text(L.avatar)
                .font(.headline)
                .foregroundStyle(ArenaTheme.textPrimary)
            PhotosPicker(selection: $pickerItem, matching: .images, photoLibrary: .shared()) {
                ZStack {
                    Circle()
                        .fill(ArenaTheme.surface)
                        .frame(width: 100, height: 100)
                        .overlay(Circle().stroke(ArenaTheme.border, lineWidth: 2))
                    if let avatarUIImage {
                        Image(uiImage: avatarUIImage)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 100, height: 100)
                            .clipShape(Circle())
                    } else {
                        Image(systemName: "person.crop.circle.fill")
                            .font(.system(size: 56))
                            .foregroundStyle(ArenaTheme.textMuted)
                    }
                }
            }
            .buttonStyle(.plain)
            .onChange(of: pickerItem) { _, item in
                guard let item else { return }
                Task {
                    if let data = try? await item.loadTransferable(type: Data.self),
                       let img = UIImage(data: data)
                    {
                        await MainActor.run {
                            avatarUIImage = img
                            UserAccountStore.avatarData = data
                        }
                    }
                }
            }
            Button(L.removeAvatar) {
                avatarUIImage = nil
                pickerItem = nil
                UserAccountStore.avatarData = nil
            }
            .font(.subheadline)
            .foregroundStyle(ArenaTheme.textMuted)
        }
        .frame(maxWidth: .infinity)
    }

    private var accountSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.accountInfo)
                .font(.headline)
                .foregroundStyle(ArenaTheme.textPrimary)
            if loadingProfile {
                ProgressView()
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
        .padding(16)
        .background(ArenaTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
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
    }

    private var logoutSection: some View {
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

    private func loadProfileFromServer() async {
        guard auth.isLoggedIn else { return }
        await MainActor.run { loadingProfile = true }
        do {
            let profile = try await ArenaAPI.fetchCurrentUser()
            await MainActor.run {
                nickname = profile.nickname
                email = profile.email ?? ""
                auth.refreshProfile(userId: profile.userId, nickname: profile.nickname, email: profile.email)
            }
        } catch {
            await MainActor.run {
                profileMessage = error.localizedDescription
            }
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
            let profile = try await ArenaAPI.updateProfile(nickname: nickname.trimmingCharacters(in: .whitespacesAndNewlines))
            await MainActor.run {
                auth.refreshProfile(userId: profile.userId, nickname: profile.nickname, email: profile.email)
                profileMessage = L.profileSaved
            }
            try? await Task.sleep(nanoseconds: 400_000_000)
            await MainActor.run { dismiss() }
        } catch {
            await MainActor.run {
                profileMessage = error.localizedDescription
            }
        }
        await MainActor.run { saving = false }
    }
}

#endif
