import { ArenaTheme } from '../common/ArenaTheme';
import { authStore, arenaL10n, arenaNavPush, arenaNavClear } from '../route/GlobalStores';
import { AppRoutes } from '../route/AppRoutes';
import { ArenaAPI } from '../api/ArenaAPI';

/** 登录 / 注册页，对齐 iOS `LoginView`。 */
@Component
export struct LoginPage {
  @State isRegister: boolean = false;
  @State email: string = '';
  @State account: string = '';
  @State password: string = '';
  @State nickname: string = '';
  @State loading: boolean = false;
  @State error: string = '';

  private localizedLoginError(err: Error): string {
    const msg = err.message ?? '';
    if (msg.includes('1002') || msg.includes('用户不存在')) {
      return arenaL10n().errorUserNotExist;
    }
    if (msg.includes('1003') || msg.includes('密码错误')) {
      return arenaL10n().errorPassword;
    }
    if (msg.includes('1001') || msg.includes('用户已存在')) {
      return arenaL10n().errorUserExist;
    }
    if (msg.includes('该邮箱已被注册')) {
      return arenaL10n().errorEmailTaken;
    }
    if (msg.includes('该昵称已被使用')) {
      return arenaL10n().errorNicknameTaken;
    }
    return msg.length > 0 ? msg : arenaL10n().errorGeneric;
  }

  private async submit(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      if (this.isRegister) {
        const trimmedEmail = this.email.trim();
        const trimmedNick = this.nickname.trim();
        await ArenaAPI.register(trimmedEmail, this.password, trimmedNick);
        const session = await ArenaAPI.login(trimmedEmail.toLowerCase(), this.password);
        authStore.save(session);
      } else {
        const session = await ArenaAPI.login(this.account.trim(), this.password);
        authStore.save(session);
      }
      arenaNavClear();
      arenaNavPush({ name: AppRoutes.profile() });
    } catch (e) {
      this.error = this.localizedLoginError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      this.loading = false;
    }
  }

  build() {
    Scroll() {
      Column({ space: 24 }) {
        Column({ space: 8 }) {
          Text('🧠')
            .fontSize(48)
          Text(this.isRegister ? arenaL10n().registerTitle : arenaL10n().loginTitle)
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor(ArenaTheme.textPrimary)
          Text(this.isRegister ? arenaL10n().registerSubtitle : arenaL10n().loginSubtitle)
            .fontSize(14)
            .fontColor(ArenaTheme.textMuted)
        }
        .width('100%')
        .padding({ top: 24 })

        if (this.error.length > 0) {
          Text(this.error)
            .fontSize(12)
            .fontColor(Color.Red)
            .width('100%')
            .padding(12)
            .backgroundColor('#FF00001F')
            .borderRadius(10)
        }

        Column({ space: 16 }) {
          if (this.isRegister) {
            Column({ space: 6 }) {
              Text(arenaL10n().email)
                .fontSize(12)
                .fontWeight(FontWeight.Medium)
                .fontColor(ArenaTheme.textMuted)
              TextInput({ placeholder: arenaL10n().emailPlaceholder, text: this.email })
                .fontColor(ArenaTheme.textPrimary)
                .backgroundColor(ArenaTheme.surface)
                .padding(12)
                .borderRadius(10)
                .border({ width: 1, color: ArenaTheme.border })
                .onChange((v: string) => { this.email = v; })
            }
            .alignItems(HorizontalAlign.Start)
            .width('100%')

            Column({ space: 6 }) {
              Text(arenaL10n().nickname)
                .fontSize(12)
                .fontWeight(FontWeight.Medium)
                .fontColor(ArenaTheme.textMuted)
              TextInput({ placeholder: arenaL10n().nicknamePrompt, text: this.nickname })
                .fontColor(ArenaTheme.textPrimary)
                .backgroundColor(ArenaTheme.surface)
                .padding(12)
                .borderRadius(10)
                .border({ width: 1, color: ArenaTheme.border })
                .onChange((v: string) => { this.nickname = v; })
            }
            .alignItems(HorizontalAlign.Start)
            .width('100%')
          } else {
            Column({ space: 6 }) {
              Text(arenaL10n().loginAccountLabel)
                .fontSize(12)
                .fontWeight(FontWeight.Medium)
                .fontColor(ArenaTheme.textMuted)
              TextInput({ placeholder: arenaL10n().loginAccountPlaceholder, text: this.account })
                .fontColor(ArenaTheme.textPrimary)
                .backgroundColor(ArenaTheme.surface)
                .padding(12)
                .borderRadius(10)
                .border({ width: 1, color: ArenaTheme.border })
                .onChange((v: string) => { this.account = v; })
            }
            .alignItems(HorizontalAlign.Start)
            .width('100%')
          }

          Column({ space: 6 }) {
            Text(arenaL10n().password)
              .fontSize(12)
              .fontWeight(FontWeight.Medium)
              .fontColor(ArenaTheme.textMuted)
            TextInput({ placeholder: arenaL10n().passwordPlaceholder, text: this.password })
              .fontColor(ArenaTheme.textPrimary)
              .backgroundColor(ArenaTheme.surface)
              .padding(12)
              .borderRadius(10)
              .border({ width: 1, color: ArenaTheme.border })
              .type(InputType.Password)
              .onChange((v: string) => { this.password = v; })
          }
          .alignItems(HorizontalAlign.Start)
          .width('100%')

          Button(this.loading ? arenaL10n().loginProcessing : (this.isRegister ? arenaL10n().registerSubmit : arenaL10n().loginSubmit))
            .width('100%')
            .height(48)
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor(Color.White)
            .backgroundColor(ArenaTheme.orangeAccent)
            .borderRadius(10)
            .enabled(!this.loading)
            .onClick(() => { this.submit(); })
        }
        .width('100%')

        Row({ space: 4 }) {
          Text(this.isRegister ? arenaL10n().hasAccount : arenaL10n().noAccount)
            .fontSize(14)
            .fontColor(ArenaTheme.textMuted)
          Text(this.isRegister ? arenaL10n().loginNow : arenaL10n().registerNow)
            .fontSize(14)
            .fontColor(ArenaTheme.orangeAccent)
            .onClick(() => {
              this.isRegister = !this.isRegister;
              this.error = '';
            })
        }

        Row({ space: 4 }) {
          Text('‹')
            .fontSize(16)
            .fontColor(ArenaTheme.textMuted)
          Text(arenaL10n().backHome)
            .fontSize(14)
            .fontColor(ArenaTheme.textMuted)
        }
        .margin({ top: 8 })
        .onClick(() => {
          arenaNavClear();
        })
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
    .scrollBar(BarState.Off)
  }
}
