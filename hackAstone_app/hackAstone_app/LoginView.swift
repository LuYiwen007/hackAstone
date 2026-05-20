import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var auth: AuthStore
    @EnvironmentObject private var locale: AppLocaleStore
    @Binding var path: NavigationPath

    @State private var isRegister = false
    @State private var email = ""
    @State private var account = ""
    @State private var password = ""
    @State private var nickname = ""
    @State private var showPassword = false
    @State private var loading = false
    @State private var error = ""

    private var L: ArenaL10n { locale.L }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Text("🧠")
                        .font(.system(size: 48))
                    Text(isRegister ? L.registerTitle : L.loginTitle)
                        .font(.title.weight(.bold))
                        .foregroundStyle(ArenaTheme.textPrimary)
                    Text(isRegister ? L.registerSubtitle : L.loginSubtitle)
                        .font(.subheadline)
                        .foregroundStyle(ArenaTheme.textMuted)
                }
                .padding(.top, 24)

                if !error.isEmpty {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(Color.red.opacity(0.12))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }

                VStack(alignment: .leading, spacing: 16) {
                    if isRegister {
                        fieldBlock(title: L.email, content: {
                            TextField(L.emailPlaceholder, text: $email)
                                .textContentType(.emailAddress)
                                #if os(iOS)
                                .keyboardType(.emailAddress)
                                .textInputAutocapitalization(.never)
                                #endif
                        })
                        fieldBlock(title: L.nickname, content: {
                            TextField(L.nicknamePrompt, text: $nickname)
                                .textContentType(.nickname)
                        })
                    } else {
                        fieldBlock(title: L.loginAccountLabel, content: {
                            TextField(L.loginAccountPlaceholder, text: $account)
                                .textContentType(.username)
                                #if os(iOS)
                                .textInputAutocapitalization(.never)
                                #endif
                        })
                    }

                    fieldBlock(title: L.password, content: {
                        HStack {
                            Group {
                                if showPassword {
                                    TextField(L.passwordPlaceholder, text: $password)
                                } else {
                                    SecureField(L.passwordPlaceholder, text: $password)
                                }
                            }
                            .textContentType(isRegister ? .newPassword : .password)
                            Button {
                                showPassword.toggle()
                            } label: {
                                Image(systemName: showPassword ? "eye.slash" : "eye")
                                    .foregroundStyle(ArenaTheme.textMuted)
                            }
                        }
                    })

                    Button {
                        Task { await submit() }
                    } label: {
                        Text(loading ? L.loginProcessing : (isRegister ? L.registerSubmit : L.loginSubmit))
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                    .disabled(loading)
                }

                HStack(spacing: 4) {
                    Text(isRegister ? L.hasAccount : L.noAccount)
                        .foregroundStyle(ArenaTheme.textMuted)
                    Button {
                        isRegister.toggle()
                        error = ""
                    } label: {
                        Text(isRegister ? L.loginNow : L.registerNow)
                            .foregroundStyle(ArenaTheme.orangeAccent)
                    }
                }
                .font(.subheadline)

                Button {
                    path = NavigationPath()
                } label: {
                    Label(L.backHome, systemImage: "chevron.left")
                        .foregroundStyle(ArenaTheme.textMuted)
                }
                .padding(.top, 8)
            }
            .padding(20)
        }
        .background(ArenaTheme.background)
    }

    @ViewBuilder
    private func fieldBlock<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption.weight(.medium))
                .foregroundStyle(ArenaTheme.textMuted)
            content()
                .arenaInputTextStyle()
                .padding(12)
                .background(ArenaTheme.surface)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(ArenaTheme.border))
        }
    }

    private func submit() async {
        await MainActor.run {
            loading = true
            error = ""
        }
        defer {
            Task { @MainActor in
                loading = false
            }
        }
        do {
            if isRegister {
                _ = try await ArenaAPI.register(
                    email: email.trimmingCharacters(in: .whitespacesAndNewlines),
                    password: password,
                    nickname: nickname.trimmingCharacters(in: .whitespacesAndNewlines)
                )
                let session = try await ArenaAPI.login(
                    account: email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased(),
                    password: password
                )
                await MainActor.run {
                    auth.save(session)
                    path = NavigationPath()
                    path.append(AppRoute.profile)
                }
            } else {
                let session = try await ArenaAPI.login(
                    account: account.trimmingCharacters(in: .whitespacesAndNewlines),
                    password: password
                )
                await MainActor.run {
                    auth.save(session)
                    path = NavigationPath()
                    path.append(AppRoute.profile)
                }
            }
        } catch let err {
            await MainActor.run {
                error = (err as? LocalizedError)?.errorDescription ?? err.localizedDescription
            }
        }
    }
}
