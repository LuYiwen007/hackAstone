#if os(iOS)
import PhotosUI
import SwiftUI
import UIKit

private enum UserAccountStore {
    static let avatarKey = "user_avatar_jpeg_data"
    static let displayNameKey = "user_display_name"
    static let emailKey = "user_email"
    static let languageKey = "app_language_code"

    static var avatarData: Data? {
        get { UserDefaults.standard.data(forKey: avatarKey) }
        set {
            if let newValue { UserDefaults.standard.set(newValue, forKey: avatarKey) }
            else { UserDefaults.standard.removeObject(forKey: avatarKey) }
        }
    }
}

/// 全屏账号与偏好设置（不向用户暴露后端连接信息）。
struct AccountSettingsView: View {
    @EnvironmentObject private var locale: AppLocaleStore
    @Environment(\.dismiss) private var dismiss

    @State private var displayName: String = UserDefaults.standard.string(forKey: UserAccountStore.displayNameKey) ?? ""
    @State private var email: String = UserDefaults.standard.string(forKey: UserAccountStore.emailKey) ?? ""

    private var L: ArenaL10n { locale.L }
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var pickerItem: PhotosPickerItem?
    @State private var avatarUIImage: UIImage?
    @State private var passwordMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    avatarSection
                    accountSection
                    passwordSection
                    languageSection
                }
                .padding(20)
                .padding(.bottom, 40)
            }
            .background(ArenaTheme.background)
            .navigationTitle(L.accountNavTitle)
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(L.done) {
                        persistProfile()
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
        .preferredColorScheme(.dark)
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
            labeledField(title: L.nickname, text: $displayName, prompt: L.nicknamePrompt)
            labeledField(title: L.email, text: $email, prompt: "name@example.com")
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)
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
                .padding(12)
                .background(ArenaTheme.background)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                .foregroundStyle(ArenaTheme.textPrimary)
        }
    }

    private var passwordSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.password)
                .font(.headline)
                .foregroundStyle(ArenaTheme.textPrimary)
            SecureField(L.newPassword, text: $newPassword)
                .padding(12)
                .background(ArenaTheme.background)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                .foregroundStyle(ArenaTheme.textPrimary)
            SecureField(L.confirmPassword, text: $confirmPassword)
                .padding(12)
                .background(ArenaTheme.background)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
                .foregroundStyle(ArenaTheme.textPrimary)
            Button(L.savePassword) {
                savePasswordTapped()
            }
            .buttonStyle(.borderedProminent)
            .tint(ArenaTheme.cyanAccent)
            .disabled(newPassword.isEmpty)
            if let passwordMessage {
                Text(passwordMessage)
                    .font(.caption)
                    .foregroundStyle(passwordMessage == L.passwordSavedDemo ? Color.green : Color.orange)
            }
        }
        .padding(16)
        .background(ArenaTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
    }

    private var languageSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.language)
                .font(.headline)
                .foregroundStyle(ArenaTheme.textPrimary)
            Picker(L.languagePickerTitle, selection: Binding(
                get: { locale.languageCode },
                set: { locale.languageCode = $0 }
            )) {
                Text(L.simplifiedChinese).tag("zh-Hans")
                Text(L.english).tag("en")
            }
            .pickerStyle(.segmented)
            Text(L.languageFootnote)
                .font(.caption2)
                .foregroundStyle(ArenaTheme.textMuted)
        }
        .padding(16)
        .background(ArenaTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ArenaTheme.border))
    }

    private func savePasswordTapped() {
        guard newPassword == confirmPassword else {
            passwordMessage = L.passwordMismatch
            return
        }
        guard newPassword.count >= 6 else {
            passwordMessage = L.passwordTooShort
            return
        }
        // 演示：不落库、不暴露后端；仅本地提示。
        newPassword = ""
        confirmPassword = ""
        passwordMessage = L.passwordSavedDemo
    }

    private func persistProfile() {
        UserDefaults.standard.set(displayName, forKey: UserAccountStore.displayNameKey)
        UserDefaults.standard.set(email, forKey: UserAccountStore.emailKey)
        UserDefaults.standard.set(locale.languageCode, forKey: UserAccountStore.languageKey)
    }
}

#endif
