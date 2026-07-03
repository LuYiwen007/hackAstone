if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface AccountSettingsPage_Params {
    onDismiss?: () => void;
    section?: SettingsSection;
    nickname?: string;
    email?: string;
    serverAvatarURL?: string;
    profileMessage?: string;
    loadingProfile?: boolean;
    saving?: boolean;
    notifications?: NotificationPrefs;
    prefs?: PreferencePrefs;
    theme?: AppearanceTheme;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import { ArenaConfiguration } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaConfiguration";
import { ArenaAPI } from "@bundle:com.hackastone.arena/entry/ets/api/ArenaAPI";
import { JsonBody } from "@bundle:com.hackastone.arena/entry/ets/common/JsonPayload";
import { authStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
type SettingsSection = 'general' | 'subscription' | 'language' | 'appearance' | 'notifications';
class PreferencePrefs {
    autoSave: boolean = true;
    sound: boolean = false;
    timer: boolean = true;
    compact: boolean = false;
    animations: boolean = true;
    copyWithAutoSave(v: boolean): PreferencePrefs {
        const next = new PreferencePrefs();
        next.autoSave = v;
        next.sound = this.sound;
        next.timer = this.timer;
        next.compact = this.compact;
        next.animations = this.animations;
        return next;
    }
    copyWithSound(v: boolean): PreferencePrefs {
        const next = new PreferencePrefs();
        next.autoSave = this.autoSave;
        next.sound = v;
        next.timer = this.timer;
        next.compact = this.compact;
        next.animations = this.animations;
        return next;
    }
    copyWithTimer(v: boolean): PreferencePrefs {
        const next = new PreferencePrefs();
        next.autoSave = this.autoSave;
        next.sound = this.sound;
        next.timer = v;
        next.compact = this.compact;
        next.animations = this.animations;
        return next;
    }
    copyWithCompact(v: boolean): PreferencePrefs {
        const next = new PreferencePrefs();
        next.autoSave = this.autoSave;
        next.sound = this.sound;
        next.timer = this.timer;
        next.compact = v;
        next.animations = this.animations;
        return next;
    }
    copyWithAnimations(v: boolean): PreferencePrefs {
        const next = new PreferencePrefs();
        next.autoSave = this.autoSave;
        next.sound = this.sound;
        next.timer = this.timer;
        next.compact = this.compact;
        next.animations = v;
        return next;
    }
}
class NotificationPrefs {
    daily: boolean = true;
    weekly: boolean = false;
    updates: boolean = true;
    copyWithDaily(v: boolean): NotificationPrefs {
        const next = new NotificationPrefs();
        next.daily = v;
        next.weekly = this.weekly;
        next.updates = this.updates;
        return next;
    }
    copyWithWeekly(v: boolean): NotificationPrefs {
        const next = new NotificationPrefs();
        next.daily = this.daily;
        next.weekly = v;
        next.updates = this.updates;
        return next;
    }
    copyWithUpdates(v: boolean): NotificationPrefs {
        const next = new NotificationPrefs();
        next.daily = this.daily;
        next.weekly = this.weekly;
        next.updates = v;
        return next;
    }
}
type AppearanceTheme = 'dark' | 'darker' | 'midnight';
class SubscriptionPlanDef {
    id: string = '';
    icon: string = '';
    isCurrent: boolean = false;
    accent: ResourceColor = ArenaTheme.textMuted;
    border: ResourceColor = ArenaTheme.border;
    cardBackground: ResourceColor = Color.Transparent;
    buttonFill: ResourceColor = ArenaTheme.orangeAccent;
    constructor(id: string, icon: string, isCurrent: boolean, accent: ResourceColor, border: ResourceColor, cardBackground: ResourceColor, buttonFill: ResourceColor) {
        this.id = id;
        this.icon = icon;
        this.isCurrent = isCurrent;
        this.accent = accent;
        this.border = border;
        this.cardBackground = cardBackground;
        this.buttonFill = buttonFill;
    }
}
export class AccountSettingsPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.onDismiss = () => { };
        this.__section = new ObservedPropertySimplePU('general', this, "section");
        this.__nickname = new ObservedPropertySimplePU('', this, "nickname");
        this.__email = new ObservedPropertySimplePU('', this, "email");
        this.__serverAvatarURL = new ObservedPropertySimplePU('', this, "serverAvatarURL");
        this.__profileMessage = new ObservedPropertySimplePU('', this, "profileMessage");
        this.__loadingProfile = new ObservedPropertySimplePU(false, this, "loadingProfile");
        this.__saving = new ObservedPropertySimplePU(false, this, "saving");
        this.__notifications = new ObservedPropertyObjectPU(new NotificationPrefs(), this, "notifications");
        this.__prefs = new ObservedPropertyObjectPU(new PreferencePrefs(), this, "prefs");
        this.__theme = new ObservedPropertySimplePU('dark', this, "theme");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: AccountSettingsPage_Params) {
        if (params.onDismiss !== undefined) {
            this.onDismiss = params.onDismiss;
        }
        if (params.section !== undefined) {
            this.section = params.section;
        }
        if (params.nickname !== undefined) {
            this.nickname = params.nickname;
        }
        if (params.email !== undefined) {
            this.email = params.email;
        }
        if (params.serverAvatarURL !== undefined) {
            this.serverAvatarURL = params.serverAvatarURL;
        }
        if (params.profileMessage !== undefined) {
            this.profileMessage = params.profileMessage;
        }
        if (params.loadingProfile !== undefined) {
            this.loadingProfile = params.loadingProfile;
        }
        if (params.saving !== undefined) {
            this.saving = params.saving;
        }
        if (params.notifications !== undefined) {
            this.notifications = params.notifications;
        }
        if (params.prefs !== undefined) {
            this.prefs = params.prefs;
        }
        if (params.theme !== undefined) {
            this.theme = params.theme;
        }
    }
    updateStateVars(params: AccountSettingsPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__section.purgeDependencyOnElmtId(rmElmtId);
        this.__nickname.purgeDependencyOnElmtId(rmElmtId);
        this.__email.purgeDependencyOnElmtId(rmElmtId);
        this.__serverAvatarURL.purgeDependencyOnElmtId(rmElmtId);
        this.__profileMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__loadingProfile.purgeDependencyOnElmtId(rmElmtId);
        this.__saving.purgeDependencyOnElmtId(rmElmtId);
        this.__notifications.purgeDependencyOnElmtId(rmElmtId);
        this.__prefs.purgeDependencyOnElmtId(rmElmtId);
        this.__theme.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__section.aboutToBeDeleted();
        this.__nickname.aboutToBeDeleted();
        this.__email.aboutToBeDeleted();
        this.__serverAvatarURL.aboutToBeDeleted();
        this.__profileMessage.aboutToBeDeleted();
        this.__loadingProfile.aboutToBeDeleted();
        this.__saving.aboutToBeDeleted();
        this.__notifications.aboutToBeDeleted();
        this.__prefs.aboutToBeDeleted();
        this.__theme.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private onDismiss: () => void;
    private __section: ObservedPropertySimplePU<SettingsSection>;
    get section() {
        return this.__section.get();
    }
    set section(newValue: SettingsSection) {
        this.__section.set(newValue);
    }
    private __nickname: ObservedPropertySimplePU<string>;
    get nickname() {
        return this.__nickname.get();
    }
    set nickname(newValue: string) {
        this.__nickname.set(newValue);
    }
    private __email: ObservedPropertySimplePU<string>;
    get email() {
        return this.__email.get();
    }
    set email(newValue: string) {
        this.__email.set(newValue);
    }
    private __serverAvatarURL: ObservedPropertySimplePU<string>;
    get serverAvatarURL() {
        return this.__serverAvatarURL.get();
    }
    set serverAvatarURL(newValue: string) {
        this.__serverAvatarURL.set(newValue);
    }
    private __profileMessage: ObservedPropertySimplePU<string>;
    get profileMessage() {
        return this.__profileMessage.get();
    }
    set profileMessage(newValue: string) {
        this.__profileMessage.set(newValue);
    }
    private __loadingProfile: ObservedPropertySimplePU<boolean>;
    get loadingProfile() {
        return this.__loadingProfile.get();
    }
    set loadingProfile(newValue: boolean) {
        this.__loadingProfile.set(newValue);
    }
    private __saving: ObservedPropertySimplePU<boolean>;
    get saving() {
        return this.__saving.get();
    }
    set saving(newValue: boolean) {
        this.__saving.set(newValue);
    }
    private __notifications: ObservedPropertyObjectPU<NotificationPrefs>;
    get notifications() {
        return this.__notifications.get();
    }
    set notifications(newValue: NotificationPrefs) {
        this.__notifications.set(newValue);
    }
    private __prefs: ObservedPropertyObjectPU<PreferencePrefs>;
    get prefs() {
        return this.__prefs.get();
    }
    set prefs(newValue: PreferencePrefs) {
        this.__prefs.set(newValue);
    }
    private __theme: ObservedPropertySimplePU<AppearanceTheme>;
    get theme() {
        return this.__theme.get();
    }
    set theme(newValue: AppearanceTheme) {
        this.__theme.set(newValue);
    }
    aboutToAppear(): void {
        if (authStore.isLoggedIn) {
            this.loadProfileFromServer();
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(158:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(ArenaTheme.background);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (authStore.isLoggedIn) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(160:9)", "entry");
                        Row.width('100%');
                        Row.height('100%');
                    }, Row);
                    this.sidebar.bind(this)();
                    this.contentPanel.bind(this)();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.guestOnlyContent.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    guestOnlyContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(177:5)", "entry");
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(178:7)", "entry");
            Row.width('100%');
            Row.padding({ left: 20, right: 20, top: 14, bottom: 14 });
            Row.border({ width: { bottom: 1 }, color: ArenaTheme.border });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsNavGeneral);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(179:9)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(180:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.done);
            Button.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(181:9)", "entry");
            Button.fontWeight(FontWeight.Medium);
            Button.onClick(() => this.onDismiss());
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(187:7)", "entry");
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(188:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.loginToManageAccount);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(189:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
            Text.textAlign(TextAlign.Center);
            Text.padding({ left: 32, right: 32 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.profileLoginRegister);
            Button.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(194:9)", "entry");
            Button.width('80%');
            Button.height(44);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.borderRadius(10);
            Button.onClick(() => {
                // Login navigation handled by parent via onDismiss + route
                this.onDismiss();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(204:9)", "entry");
        }, Blank);
        Blank.pop();
        Column.pop();
        Column.pop();
    }
    sidebar(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(214:5)", "entry");
            Column.width(this.sidebarWidth);
            Column.height('100%');
            Column.backgroundColor('#050508');
            Column.border({ width: { right: 1 }, color: ArenaTheme.border });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(215:7)", "entry");
            Row.padding({ left: 12, right: 12, top: 14, bottom: 14 });
            Row.width('100%');
            Row.border({ width: { bottom: 1 }, color: ArenaTheme.border });
        }, Row);
        this.avatarThumb.bind(this)(32);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(217:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.displayName);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(218:11)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
            Text.maxLines(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsPlanFree);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(219:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(227:7)", "entry");
            Scroll.layoutWeight(1);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(228:9)", "entry");
            Column.padding({ left: 6, right: 6, top: 8, bottom: 8 });
        }, Column);
        this.settingsNavButton.bind(this)('general');
        this.settingsNavButton.bind(this)('subscription');
        this.settingsNavButton.bind(this)('language');
        this.settingsNavButton.bind(this)('appearance');
        this.settingsNavButton.bind(this)('notifications');
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    settingsNavButton(item: SettingsSection, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(247:5)", "entry");
            Row.padding({ left: 8, right: 8, top: 9, bottom: 9 });
            Row.width('100%');
            Row.backgroundColor(this.section === item ? ArenaTheme.surface : Color.Transparent);
            Row.borderRadius(8);
            Row.onClick(() => { this.section = item; });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.navIcon(item));
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(248:7)", "entry");
            Text.fontSize(13);
            Text.width(16);
            Text.fontColor(this.section === item ? ArenaTheme.textPrimary : ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.navLabel(item));
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(252:7)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.maxLines(1);
            Text.fontColor(this.section === item ? ArenaTheme.textPrimary : ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.section === item) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('›');
                        Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(258:9)", "entry");
                        Text.fontSize(10);
                        Text.fontColor(ArenaTheme.textMuted);
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
        Row.pop();
    }
    contentPanel(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(270:5)", "entry");
            Column.layoutWeight(1);
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(271:7)", "entry");
            Row.width('100%');
            Row.padding({ left: 20, right: 20, top: 14, bottom: 14 });
            Row.border({ width: { bottom: 1 }, color: ArenaTheme.border });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.navLabel(this.section));
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(272:9)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(273:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.done);
            Button.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(274:9)", "entry");
            Button.fontWeight(FontWeight.Medium);
            Button.enabled(!this.saving);
            Button.onClick(() => { this.saveAndDismiss(); });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(283:7)", "entry");
            Scroll.layoutWeight(1);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(284:9)", "entry");
            Column.padding({ left: 20, right: 20, top: 12, bottom: 32 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.section === 'general') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.generalSection.bind(this)();
                });
            }
            else if (this.section === 'subscription') {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.subscriptionSection.bind(this)();
                });
            }
            else if (this.section === 'language') {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.languageSection.bind(this)();
                });
            }
            else if (this.section === 'appearance') {
                this.ifElseBranchUpdateFunction(3, () => {
                    this.appearanceSection.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(4, () => {
                    this.notificationsSection.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    generalSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(308:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (authStore.isLoggedIn) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 12 });
                        Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(310:9)", "entry");
                        Column.width('100%');
                        Column.alignItems(HorizontalAlign.Center);
                        Column.padding({ top: 8, bottom: 8 });
                    }, Column);
                    this.avatarThumb.bind(this)(88);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(localeStore.L.removeAvatar);
                        Button.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(312:11)", "entry");
                        Button.fontSize(12);
                        Button.fontColor(ArenaTheme.textMuted);
                        Button.backgroundColor(Color.Transparent);
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.sectionHeader.bind(this)(localeStore.L.settingsSectionAccount);
        this.accountTypeCard.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (authStore.isLoggedIn) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.sectionHeader.bind(this)(localeStore.L.accountInfo);
                    this.accountInfoCard.bind(this)();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(localeStore.L.logout);
                        Button.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(329:9)", "entry");
                        Button.width('100%');
                        Button.height(44);
                        Button.fontColor(Color.Red);
                        Button.border({ width: 1, color: ArenaTheme.border, radius: 8 });
                        Button.onClick(() => {
                            authStore.clear();
                            this.onDismiss();
                        });
                    }, Button);
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.sectionHeader.bind(this)(localeStore.L.settingsSectionPreferences);
        this.preferencesCard.bind(this)();
        Column.pop();
    }
    accountTypeCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(349:5)", "entry");
            Column.padding({ left: 14, right: 14 });
            Column.width('100%');
            Column.backgroundColor('#1C1C1E8C');
            Column.borderRadius(12);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(350:7)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
            Row.border({ width: { bottom: 1 }, color: '#29292B99' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(351:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsAccountType);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(352:11)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsAccountTypeDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(353:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.settingsUpgrade);
            Button.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(357:9)", "entry");
            Button.fontSize(12);
            Button.fontWeight(FontWeight.Medium);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.borderRadius(8);
            Button.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Button.onClick(() => { this.section = 'subscription'; });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(370:7)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(371:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsDataPrivacy);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(372:11)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsDataPrivacyDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(373:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsManage);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(377:9)", "entry");
            Text.fontSize(12);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.fontColor(ArenaTheme.textMuted);
            Text.border({ width: 1, color: ArenaTheme.border, radius: 8 });
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    accountInfoCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(394:5)", "entry");
            Column.padding({ left: 14, right: 14 });
            Column.width('100%');
            Column.backgroundColor('#1C1C1E8C');
            Column.borderRadius(12);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.loadingProfile) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(396:9)", "entry");
                        LoadingProgress.width(32);
                        LoadingProgress.height(32);
                    }, LoadingProgress);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.labeledField.bind(this)(localeStore.L.nickname, this.nickname, localeStore.L.nicknamePrompt, (v: string) => { this.nickname = v; });
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(399:7)", "entry");
            Column.width('100%');
            Column.padding({ top: 8, bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.email);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(400:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.email.length === 0 ? '—' : this.email);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(401:9)", "entry");
            Text.width('100%');
            Text.padding(12);
            Text.fontColor(ArenaTheme.textMuted);
            Text.backgroundColor('#0A0A0B99');
            Text.border({ width: 1, color: ArenaTheme.border, radius: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.emailReadOnlyHint);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(407:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.profileMessage.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.profileMessage);
                        Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(412:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(this.profileMessage === localeStore.L.profileSaved ? Color.Green : ArenaTheme.orangeAccent);
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
        Column.pop();
    }
    preferencesCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(425:5)", "entry");
            Column.padding({ left: 14, right: 14 });
            Column.width('100%');
            Column.backgroundColor('#1C1C1E8C');
            Column.borderRadius(12);
        }, Column);
        this.autoSaveToggleRow.bind(this)();
        this.soundToggleRow.bind(this)();
        this.timerToggleRow.bind(this)();
        Column.pop();
    }
    autoSaveToggleRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(438:5)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
            Row.border({ width: { bottom: 1 }, color: '#29292B99' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(439:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsAutoSave);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(440:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsAutoSaveDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(441:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.settingsToggle.bind(this)(this.prefs.autoSave, (v: boolean) => {
            this.prefs = this.prefs.copyWithAutoSave(v);
            this.persistPreferences();
        });
        Row.pop();
    }
    soundToggleRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(457:5)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
            Row.border({ width: { bottom: 1 }, color: '#29292B99' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(458:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsSound);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(459:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsSoundDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(460:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.settingsToggle.bind(this)(this.prefs.sound, (v: boolean) => {
            this.prefs = this.prefs.copyWithSound(v);
            this.persistPreferences();
        });
        Row.pop();
    }
    timerToggleRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(476:5)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(477:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsTimer);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(478:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsTimerDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(479:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.settingsToggle.bind(this)(this.prefs.timer, (v: boolean) => {
            this.prefs = this.prefs.copyWithTimer(v);
            this.persistPreferences();
        });
        Row.pop();
    }
    subscriptionSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(494:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsSubscriptionLead);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(495:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const plan = _item;
                this.subscriptionPlanCard.bind(this)(plan);
            };
            this.forEachUpdateFunction(elmtId, AccountSettingsPage.PLANS, forEachItemGenFunction, (plan: SubscriptionPlanDef) => plan.id, false, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
    }
    languageSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(506:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.sectionHeader.bind(this)(localeStore.L.settingsInterfaceLanguage);
        this.languageCard.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsSystemLanguageNote);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(509:7)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
    }
    languageCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(517:5)", "entry");
            Column.padding({ left: 14, right: 14 });
            Column.width('100%');
            Column.backgroundColor('#1C1C1E8C');
            Column.borderRadius(12);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(518:7)", "entry");
            Row.padding({ top: 8, bottom: 8 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 4 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(519:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.prefersEnglish ? localeStore.L.english : localeStore.L.simplifiedChinese);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(520:11)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.prefersEnglish ? localeStore.L.simplifiedChinese : localeStore.L.english);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(524:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(529:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('✓');
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(530:9)", "entry");
            Text.fontColor(ArenaTheme.orangeAccent);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    appearanceSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(543:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.sectionHeader.bind(this)(localeStore.L.settingsColorTheme);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(545:7)", "entry");
        }, Row);
        this.themeChip.bind(this)('dark');
        this.themeChip.bind(this)('darker');
        this.themeChip.bind(this)('midnight');
        Row.pop();
        this.sectionHeader.bind(this)(localeStore.L.settingsLayoutDensity);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(551:7)", "entry");
            Column.padding({ left: 14, right: 14 });
            Column.width('100%');
            Column.backgroundColor('#1C1C1E8C');
            Column.borderRadius(12);
        }, Column);
        this.compactToggleRow.bind(this)();
        this.animationsToggleRow.bind(this)();
        Column.pop();
        Column.pop();
    }
    compactToggleRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(566:5)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
            Row.border({ width: { bottom: 1 }, color: '#29292B99' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(567:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsCompact);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(568:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsCompactDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(569:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.settingsToggle.bind(this)(this.prefs.compact, (v: boolean) => {
            this.prefs = this.prefs.copyWithCompact(v);
            this.persistPreferences();
        });
        Row.pop();
    }
    animationsToggleRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(585:5)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(586:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsAnimations);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(587:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsAnimationsDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(588:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.settingsToggle.bind(this)(this.prefs.animations, (v: boolean) => {
            this.prefs = this.prefs.copyWithAnimations(v);
            this.persistPreferences();
        });
        Row.pop();
    }
    notificationsSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(603:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.sectionHeader.bind(this)(localeStore.L.settingsNotificationSection);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(605:7)", "entry");
            Column.padding({ left: 14, right: 14 });
            Column.width('100%');
            Column.backgroundColor('#1C1C1E8C');
            Column.borderRadius(12);
        }, Column);
        this.dailyNotifyToggleRow.bind(this)();
        this.weeklyNotifyToggleRow.bind(this)();
        this.updatesNotifyToggleRow.bind(this)();
        Column.pop();
        Column.pop();
    }
    dailyNotifyToggleRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(621:5)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
            Row.border({ width: { bottom: 1 }, color: '#29292B99' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(622:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsNotifyDaily);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(623:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsNotifyDailyDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(624:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.settingsToggle.bind(this)(this.notifications.daily, (v: boolean) => {
            this.notifications = this.notifications.copyWithDaily(v);
            this.persistNotifications();
        });
        Row.pop();
    }
    weeklyNotifyToggleRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(640:5)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
            Row.border({ width: { bottom: 1 }, color: '#29292B99' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(641:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsNotifyWeekly);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(642:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsNotifyWeeklyDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(643:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.settingsToggle.bind(this)(this.notifications.weekly, (v: boolean) => {
            this.notifications = this.notifications.copyWithWeekly(v);
            this.persistNotifications();
        });
        Row.pop();
    }
    updatesNotifyToggleRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(659:5)", "entry");
            Row.padding({ top: 12, bottom: 12 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(660:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsNotifyUpdates);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(661:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsNotifyUpdatesDesc);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(662:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.settingsToggle.bind(this)(this.notifications.updates, (v: boolean) => {
            this.notifications = this.notifications.copyWithUpdates(v);
            this.persistNotifications();
        });
        Row.pop();
    }
    avatarThumb(size: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(677:5)", "entry");
            Stack.width(size);
            Stack.height(size);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(678:7)", "entry");
            Column.width(size);
            Column.height(size);
            Column.borderRadius(size / 2);
            Column.linearGradient({ angle: 135, colors: [[ArenaTheme.orangeAccent, 0], ['#DC2626D9', 1]] });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.serverAvatarURL) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(this.serverAvatarURL);
                        Image.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(684:9)", "entry");
                        Image.width(size);
                        Image.height(size);
                        Image.borderRadius(size / 2);
                        Image.objectFit(ImageFit.Cover);
                    }, Image);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.displayName.substring(0, 1).toUpperCase());
                        Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(690:9)", "entry");
                        Text.fontSize(size * 0.38);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(Color.White);
                    }, Text);
                    Text.pop();
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    sectionHeader(title: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title.toUpperCase());
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(702:5)", "entry");
            Text.fontSize(11);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textMuted);
            Text.letterSpacing(1);
        }, Text);
        Text.pop();
    }
    settingsToggle(isOn: boolean, onChange: (v: boolean) => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: isOn ? Alignment.End : Alignment.Start });
            Stack.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(711:5)", "entry");
            Stack.width(44);
            Stack.height(26);
            Stack.onClick(() => onChange(!isOn));
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(712:7)", "entry");
            Column.width(44);
            Column.height(26);
            Column.borderRadius(13);
            Column.backgroundColor(isOn ? ArenaTheme.orangeAccent : '#404047');
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(717:7)", "entry");
            Column.width(22);
            Column.height(22);
            Column.borderRadius(11);
            Column.backgroundColor(Color.White);
            Column.margin(2);
        }, Column);
        Column.pop();
        Stack.pop();
    }
    labeledField(title: string, value: string, prompt: string, onChange: (v: string) => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(731:5)", "entry");
            Column.padding({ top: 8, bottom: 8 });
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(732:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: prompt, text: value });
            TextInput.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(733:7)", "entry");
            TextInput.fontColor(ArenaTheme.textPrimary);
            TextInput.padding(12);
            TextInput.backgroundColor(ArenaTheme.background);
            TextInput.border({ width: 1, color: ArenaTheme.border, radius: 10 });
            TextInput.onChange(onChange);
        }, TextInput);
        Column.pop();
    }
    themeChip(item: AppearanceTheme, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(747:5)", "entry");
            Column.width('31%');
            Column.borderRadius(10);
            Column.clip(true);
            Column.border({
                width: this.theme === item ? 2 : 1,
                color: this.theme === item ? ArenaTheme.orangeAccent : ArenaTheme.border
            });
            Column.onClick(() => {
                this.theme = item;
                const appearance = new JsonBody().put('theme', item).build();
                const body = new JsonBody().put('appearance', appearance).build();
                ArenaAPI.updateSettings(body).catch(() => { });
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.Bottom });
            Stack.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(748:7)", "entry");
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(749:9)", "entry");
            Column.width('100%');
            Column.height(52);
            Column.backgroundColor(this.themeBackground(item));
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(753:9)", "entry");
            Column.width('90%');
            Column.height(6);
            Column.borderRadius(3);
            Column.backgroundColor(`${this.themeAccent(item)}BF`);
            Column.margin({ bottom: 8 });
        }, Column);
        Column.pop();
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.themeLabel(item));
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(760:7)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
            Text.width('100%');
            Text.textAlign(TextAlign.Center);
            Text.padding({ top: 6, bottom: 6 });
            Text.backgroundColor(ArenaTheme.surface);
        }, Text);
        Text.pop();
        Column.pop();
    }
    subscriptionPlanCard(plan: SubscriptionPlanDef, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(785:5)", "entry");
            Column.padding(14);
            Column.width('100%');
            Column.backgroundColor(plan.cardBackground);
            Column.border({ width: 1, color: plan.border, radius: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(786:7)", "entry");
            Row.alignItems(VerticalAlign.Top);
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(plan.icon);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(787:9)", "entry");
            Text.fontColor(plan.accent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(788:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
            Column.margin({ left: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsPlanName(plan.id));
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(789:11)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsPlanDesc(plan.id));
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(790:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(795:9)", "entry");
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (plan.isCurrent) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.settingsCurrentPlan);
                        Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(797:13)", "entry");
                        Text.fontSize(11);
                        Text.padding({ left: 8, right: 8, top: 3, bottom: 3 });
                        Text.backgroundColor(ArenaTheme.surface);
                        Text.borderRadius(12);
                        Text.fontColor(ArenaTheme.textMuted);
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
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(804:11)", "entry");
            Row.alignItems(VerticalAlign.Bottom);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsPlanPrice(plan.id));
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(805:13)", "entry");
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(plan.accent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.settingsPlanPeriod);
            Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(806:13)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
            Text.margin({ left: 2 });
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const line = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Row.create({ space: 6 });
                    Row.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(816:9)", "entry");
                }, Row);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('✓');
                    Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(817:11)", "entry");
                    Text.fontSize(11);
                    Text.fontColor(ArenaTheme.textMuted);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(line);
                    Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(818:11)", "entry");
                    Text.fontSize(11);
                    Text.fontColor(ArenaTheme.textMuted);
                }, Text);
                Text.pop();
                Row.pop();
            };
            this.forEachUpdateFunction(elmtId, localeStore.L.settingsPlanFeatures(plan.id), forEachItemGenFunction, (line: string) => line, false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!plan.isCurrent) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.settingsUpgradeTo(localeStore.L.settingsPlanName(plan.id)));
                        Text.debugLine("entry/src/main/ets/pages/AccountSettingsPage.ets(823:9)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(Color.White);
                        Text.width('100%');
                        Text.textAlign(TextAlign.Center);
                        Text.padding({ top: 10, bottom: 10 });
                        Text.backgroundColor(plan.buttonFill);
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
        Column.pop();
    }
    private navLabel(item: SettingsSection): string {
        switch (item) {
            case 'general': return localeStore.L.settingsNavGeneral;
            case 'subscription': return localeStore.L.settingsNavSubscription;
            case 'language': return localeStore.L.settingsNavLanguage;
            case 'appearance': return localeStore.L.settingsNavAppearance;
            default: return localeStore.L.settingsNavNotifications;
        }
    }
    private navIcon(item: SettingsSection): string {
        switch (item) {
            case 'general': return '👤';
            case 'subscription': return '💳';
            case 'language': return '🌐';
            case 'appearance': return '🎨';
            default: return '🔔';
        }
    }
    private themeBackground(item: AppearanceTheme): ResourceColor {
        switch (item) {
            case 'darker': return '#09090A';
            case 'midnight': return '#0F0F19';
            default: return '#17171C';
        }
    }
    private themeAccent(item: AppearanceTheme): ResourceColor {
        switch (item) {
            case 'darker': return Color.Red;
            case 'midnight': return ArenaTheme.purpleAccent;
            default: return ArenaTheme.orangeAccent;
        }
    }
    private themeLabel(item: AppearanceTheme): string {
        switch (item) {
            case 'darker': return localeStore.L.settingsThemeDarker;
            case 'midnight': return localeStore.L.settingsThemeMidnight;
            default: return localeStore.L.settingsThemeDark;
        }
    }
    private static readonly PLANS: SubscriptionPlanDef[] = [
        new SubscriptionPlanDef('free', '🛡', true, ArenaTheme.textMuted, ArenaTheme.border, '#1C1C1E66', ArenaTheme.orangeAccent),
        new SubscriptionPlanDef('pro', '⚡', false, ArenaTheme.orangeAccent, '#F9731680', '#F9731614', ArenaTheme.orangeAccent),
        new SubscriptionPlanDef('elite', '👑', false, ArenaTheme.purpleAccent, '#A855F780', '#A855F714', ArenaTheme.purpleAccent),
    ];
    private applySettingsFromServer(s: Record<string, Object> | null | undefined): void {
        if (s === null || s === undefined) {
            return;
        }
        const prefsRaw = s['preferences'];
        if (prefsRaw !== undefined && prefsRaw !== null && typeof prefsRaw === 'object' && !Array.isArray(prefsRaw)) {
            const prefs = prefsRaw as Record<string, Object>;
            if (prefs['autoSave'] !== undefined) {
                this.prefs.autoSave = prefs['autoSave'] as boolean;
            }
            if (prefs['sound'] !== undefined) {
                this.prefs.sound = prefs['sound'] as boolean;
            }
            if (prefs['timer'] !== undefined) {
                this.prefs.timer = prefs['timer'] as boolean;
            }
            if (prefs['compact'] !== undefined) {
                this.prefs.compact = prefs['compact'] as boolean;
            }
            if (prefs['animations'] !== undefined) {
                this.prefs.animations = prefs['animations'] as boolean;
            }
        }
        const notesRaw = s['notifications'];
        if (notesRaw !== undefined && notesRaw !== null && typeof notesRaw === 'object' && !Array.isArray(notesRaw)) {
            const n = notesRaw as Record<string, Object>;
            if (n['daily'] !== undefined) {
                this.notifications.daily = n['daily'] as boolean;
            }
            if (n['weekly'] !== undefined) {
                this.notifications.weekly = n['weekly'] as boolean;
            }
            if (n['updates'] !== undefined) {
                this.notifications.updates = n['updates'] as boolean;
            }
        }
        const appearanceRaw = s['appearance'];
        if (appearanceRaw !== undefined && appearanceRaw !== null &&
            typeof appearanceRaw === 'object' && !Array.isArray(appearanceRaw)) {
            const appearance = appearanceRaw as Record<string, Object>;
            const themeVal = appearance['theme'];
            if (themeVal !== undefined) {
                this.theme = String(themeVal) as AppearanceTheme;
            }
        }
    }
    private persistPreferences(): void {
        const prefs = new JsonBody()
            .put('autoSave', this.prefs.autoSave)
            .put('sound', this.prefs.sound)
            .put('timer', this.prefs.timer)
            .put('compact', this.prefs.compact)
            .put('animations', this.prefs.animations)
            .build();
        const body = new JsonBody().put('preferences', prefs).build();
        ArenaAPI.updateSettings(body).catch(() => { });
    }
    private persistNotifications(): void {
        const notes = new JsonBody()
            .put('daily', this.notifications.daily)
            .put('weekly', this.notifications.weekly)
            .put('updates', this.notifications.updates)
            .build();
        const body = new JsonBody().put('notifications', notes).build();
        ArenaAPI.updateSettings(body).catch(() => { });
    }
    private async loadProfileFromServer(): Promise<void> {
        if (!authStore.isLoggedIn) {
            return;
        }
        this.loadingProfile = true;
        try {
            const profile = await ArenaAPI.fetchCurrentUser();
            this.nickname = profile.nickname;
            this.email = profile.email ?? '';
            if (profile.avatarUrl) {
                this.serverAvatarURL = AccountSettingsPage.resolveAvatarURL(profile.avatarUrl);
            }
            this.applySettingsFromServer(profile.settings as Record<string, Object>);
            authStore.refreshProfile(profile.userId, profile.nickname, profile.email ?? null);
        }
        catch (e) {
            this.profileMessage = (e as Error).message ?? String(e);
        }
        this.loadingProfile = false;
    }
    private async saveAndDismiss(): Promise<void> {
        if (!authStore.isLoggedIn) {
            this.onDismiss();
            return;
        }
        this.saving = true;
        try {
            const profile = await ArenaAPI.updateProfile(this.nickname.trim());
            authStore.refreshProfile(profile.userId, profile.nickname, profile.email ?? null);
            this.profileMessage = localeStore.L.profileSaved;
            setTimeout(() => this.onDismiss(), 400);
        }
        catch (e) {
            this.profileMessage = (e as Error).message ?? String(e);
        }
        this.saving = false;
    }
    private static resolveAvatarURL(path: string): string {
        const t = path.trim();
        if (!t) {
            return '';
        }
        if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) {
            return t;
        }
        const base = ArenaConfiguration.apiBaseURLString;
        return t.startsWith('/') ? base + t : `${base}/${t}`;
    }
    rerender() {
        this.updateDirtyElements();
    }
}
