if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface LoginPage_Params {
    pageStack?: NavPathStack;
    isRegister?: boolean;
    email?: string;
    account?: string;
    password?: string;
    nickname?: string;
    showPassword?: boolean;
    loading?: boolean;
    error?: string;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import { authStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { AppRoutes } from "@bundle:com.hackastone.arena/entry/ets/route/AppRoutes";
import { ArenaAPI } from "@bundle:com.hackastone.arena/entry/ets/api/ArenaAPI";
export class LoginPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.__isRegister = new ObservedPropertySimplePU(false, this, "isRegister");
        this.__email = new ObservedPropertySimplePU('', this, "email");
        this.__account = new ObservedPropertySimplePU('', this, "account");
        this.__password = new ObservedPropertySimplePU('', this, "password");
        this.__nickname = new ObservedPropertySimplePU('', this, "nickname");
        this.__showPassword = new ObservedPropertySimplePU(false, this, "showPassword");
        this.__loading = new ObservedPropertySimplePU(false, this, "loading");
        this.__error = new ObservedPropertySimplePU('', this, "error");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: LoginPage_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
        if (params.isRegister !== undefined) {
            this.isRegister = params.isRegister;
        }
        if (params.email !== undefined) {
            this.email = params.email;
        }
        if (params.account !== undefined) {
            this.account = params.account;
        }
        if (params.password !== undefined) {
            this.password = params.password;
        }
        if (params.nickname !== undefined) {
            this.nickname = params.nickname;
        }
        if (params.showPassword !== undefined) {
            this.showPassword = params.showPassword;
        }
        if (params.loading !== undefined) {
            this.loading = params.loading;
        }
        if (params.error !== undefined) {
            this.error = params.error;
        }
    }
    updateStateVars(params: LoginPage_Params) {
        this.__pageStack.reset(params.pageStack);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
        this.__isRegister.purgeDependencyOnElmtId(rmElmtId);
        this.__email.purgeDependencyOnElmtId(rmElmtId);
        this.__account.purgeDependencyOnElmtId(rmElmtId);
        this.__password.purgeDependencyOnElmtId(rmElmtId);
        this.__nickname.purgeDependencyOnElmtId(rmElmtId);
        this.__showPassword.purgeDependencyOnElmtId(rmElmtId);
        this.__loading.purgeDependencyOnElmtId(rmElmtId);
        this.__error.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        this.__isRegister.aboutToBeDeleted();
        this.__email.aboutToBeDeleted();
        this.__account.aboutToBeDeleted();
        this.__password.aboutToBeDeleted();
        this.__nickname.aboutToBeDeleted();
        this.__showPassword.aboutToBeDeleted();
        this.__loading.aboutToBeDeleted();
        this.__error.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __pageStack: SynchedPropertySimpleOneWayPU<NavPathStack>;
    get pageStack() {
        return this.__pageStack.get();
    }
    set pageStack(newValue: NavPathStack) {
        this.__pageStack.set(newValue);
    }
    private __isRegister: ObservedPropertySimplePU<boolean>;
    get isRegister() {
        return this.__isRegister.get();
    }
    set isRegister(newValue: boolean) {
        this.__isRegister.set(newValue);
    }
    private __email: ObservedPropertySimplePU<string>;
    get email() {
        return this.__email.get();
    }
    set email(newValue: string) {
        this.__email.set(newValue);
    }
    private __account: ObservedPropertySimplePU<string>;
    get account() {
        return this.__account.get();
    }
    set account(newValue: string) {
        this.__account.set(newValue);
    }
    private __password: ObservedPropertySimplePU<string>;
    get password() {
        return this.__password.get();
    }
    set password(newValue: string) {
        this.__password.set(newValue);
    }
    private __nickname: ObservedPropertySimplePU<string>;
    get nickname() {
        return this.__nickname.get();
    }
    set nickname(newValue: string) {
        this.__nickname.set(newValue);
    }
    private __showPassword: ObservedPropertySimplePU<boolean>;
    get showPassword() {
        return this.__showPassword.get();
    }
    set showPassword(newValue: boolean) {
        this.__showPassword.set(newValue);
    }
    private __loading: ObservedPropertySimplePU<boolean>;
    get loading() {
        return this.__loading.get();
    }
    set loading(newValue: boolean) {
        this.__loading.set(newValue);
    }
    private __error: ObservedPropertySimplePU<string>;
    get error() {
        return this.__error.get();
    }
    set error(newValue: string) {
        this.__error.set(newValue);
    }
    private localizedLoginError(err: Error): string {
        const msg = err.message ?? '';
        if (msg.includes('1002') || msg.includes('用户不存在')) {
            return localeStore.L.errorUserNotExist;
        }
        if (msg.includes('1003') || msg.includes('密码错误')) {
            return localeStore.L.errorPassword;
        }
        if (msg.includes('1001') || msg.includes('用户已存在')) {
            return localeStore.L.errorUserExist;
        }
        if (msg.includes('该邮箱已被注册')) {
            return localeStore.L.errorEmailTaken;
        }
        if (msg.includes('该昵称已被使用')) {
            return localeStore.L.errorNicknameTaken;
        }
        return msg.length > 0 ? msg : localeStore.L.errorGeneric;
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
            }
            else {
                const session = await ArenaAPI.login(this.account.trim(), this.password);
                authStore.save(session);
            }
            this.pageStack.clear();
            this.pageStack.pushPath({ name: AppRoutes.profile() });
        }
        catch (e) {
            this.error = this.localizedLoginError(e instanceof Error ? e : new Error(String(e)));
        }
        finally {
            this.loading = false;
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/LoginPage.ets(64:5)", "entry");
            Scroll.width('100%');
            Scroll.height('100%');
            Scroll.backgroundColor(ArenaTheme.background);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 24 });
            Column.debugLine("entry/src/main/ets/pages/LoginPage.ets(65:7)", "entry");
            Column.width('100%');
            Column.padding(20);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/LoginPage.ets(66:9)", "entry");
            Column.width('100%');
            Column.padding({ top: 24 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🧠');
            Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(67:11)", "entry");
            Text.fontSize(48);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.isRegister ? localeStore.L.registerTitle : localeStore.L.loginTitle);
            Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(69:11)", "entry");
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.isRegister ? localeStore.L.registerSubtitle : localeStore.L.loginSubtitle);
            Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(73:11)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.error.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.error);
                        Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(81:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(Color.Red);
                        Text.width('100%');
                        Text.padding(12);
                        Text.backgroundColor('#FF00001F');
                        Text.borderRadius(10);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/LoginPage.ets(90:9)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isRegister) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 6 });
                        Column.debugLine("entry/src/main/ets/pages/LoginPage.ets(92:13)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.email);
                        Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(93:15)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: localeStore.L.emailPlaceholder, text: this.email });
                        TextInput.debugLine("entry/src/main/ets/pages/LoginPage.ets(97:15)", "entry");
                        TextInput.fontColor(ArenaTheme.textPrimary);
                        TextInput.backgroundColor(ArenaTheme.surface);
                        TextInput.padding(12);
                        TextInput.borderRadius(10);
                        TextInput.border({ width: 1, color: ArenaTheme.border });
                        TextInput.onChange((v: string) => { this.email = v; });
                    }, TextInput);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 6 });
                        Column.debugLine("entry/src/main/ets/pages/LoginPage.ets(108:13)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.nickname);
                        Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(109:15)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: localeStore.L.nicknamePrompt, text: this.nickname });
                        TextInput.debugLine("entry/src/main/ets/pages/LoginPage.ets(113:15)", "entry");
                        TextInput.fontColor(ArenaTheme.textPrimary);
                        TextInput.backgroundColor(ArenaTheme.surface);
                        TextInput.padding(12);
                        TextInput.borderRadius(10);
                        TextInput.border({ width: 1, color: ArenaTheme.border });
                        TextInput.onChange((v: string) => { this.nickname = v; });
                    }, TextInput);
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 6 });
                        Column.debugLine("entry/src/main/ets/pages/LoginPage.ets(124:13)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.loginAccountLabel);
                        Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(125:15)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: localeStore.L.loginAccountPlaceholder, text: this.account });
                        TextInput.debugLine("entry/src/main/ets/pages/LoginPage.ets(129:15)", "entry");
                        TextInput.fontColor(ArenaTheme.textPrimary);
                        TextInput.backgroundColor(ArenaTheme.surface);
                        TextInput.padding(12);
                        TextInput.borderRadius(10);
                        TextInput.border({ width: 1, color: ArenaTheme.border });
                        TextInput.onChange((v: string) => { this.account = v; });
                    }, TextInput);
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/pages/LoginPage.ets(141:11)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.password);
            Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(142:13)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/LoginPage.ets(146:13)", "entry");
            Row.width('100%');
            Row.padding(12);
            Row.backgroundColor(ArenaTheme.surface);
            Row.borderRadius(10);
            Row.border({ width: 1, color: ArenaTheme.border });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showPassword) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: localeStore.L.passwordPlaceholder, text: this.password });
                        TextInput.debugLine("entry/src/main/ets/pages/LoginPage.ets(148:17)", "entry");
                        TextInput.layoutWeight(1);
                        TextInput.fontColor(ArenaTheme.textPrimary);
                        TextInput.type(InputType.Normal);
                        TextInput.onChange((v: string) => { this.password = v; });
                    }, TextInput);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextInput.create({ placeholder: localeStore.L.passwordPlaceholder, text: this.password });
                        TextInput.debugLine("entry/src/main/ets/pages/LoginPage.ets(154:17)", "entry");
                        TextInput.layoutWeight(1);
                        TextInput.fontColor(ArenaTheme.textPrimary);
                        TextInput.type(InputType.Password);
                        TextInput.onChange((v: string) => { this.password = v; });
                    }, TextInput);
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.showPassword ? '🙈' : '👁');
            Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(160:15)", "entry");
            Text.fontSize(18);
            Text.fontColor(ArenaTheme.textMuted);
            Text.padding({ left: 8 });
            Text.onClick(() => { this.showPassword = !this.showPassword; });
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.loading ? localeStore.L.loginProcessing : (this.isRegister ? localeStore.L.registerSubmit : localeStore.L.loginSubmit));
            Button.debugLine("entry/src/main/ets/pages/LoginPage.ets(175:11)", "entry");
            Button.width('100%');
            Button.height(48);
            Button.fontSize(16);
            Button.fontWeight(FontWeight.Medium);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.borderRadius(10);
            Button.enabled(!this.loading);
            Button.onClick(() => { this.submit(); });
        }, Button);
        Button.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/LoginPage.ets(188:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.isRegister ? localeStore.L.hasAccount : localeStore.L.noAccount);
            Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(189:11)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.isRegister ? localeStore.L.loginNow : localeStore.L.registerNow);
            Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(192:11)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.orangeAccent);
            Text.onClick(() => {
                this.isRegister = !this.isRegister;
                this.error = '';
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/LoginPage.ets(201:9)", "entry");
            Row.margin({ top: 8 });
            Row.onClick(() => {
                this.pageStack.clear();
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(202:11)", "entry");
            Text.fontSize(16);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.backHome);
            Text.debugLine("entry/src/main/ets/pages/LoginPage.ets(205:11)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        Scroll.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
