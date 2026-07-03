if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MindProfilePage_Params {
    pageStack?: NavPathStack;
    data?: MindProfilePayload;
    loadError?: string;
    loading?: boolean;
    serverAvatarURL?: string;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import type { MindProfilePayload, MindProfileStat, MindProfileBias, MindProfileRecentBattle } from '../common/ArenaModels';
import { ArenaConfiguration } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaConfiguration";
import { ArenaAPI } from "@bundle:com.hackastone.arena/entry/ets/api/ArenaAPI";
import { AppRoutes } from "@bundle:com.hackastone.arena/entry/ets/route/AppRoutes";
import { authStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { authSessionDisplayName } from "@bundle:com.hackastone.arena/entry/ets/store/AuthStore";
export class MindProfilePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.__data = new ObservedPropertyObjectPU(MindProfilePage.FALLBACK, this, "data");
        this.__loadError = new ObservedPropertySimplePU('', this, "loadError");
        this.__loading = new ObservedPropertySimplePU(true, this, "loading");
        this.__serverAvatarURL = new ObservedPropertySimplePU('', this, "serverAvatarURL");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: MindProfilePage_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
        if (params.data !== undefined) {
            this.data = params.data;
        }
        if (params.loadError !== undefined) {
            this.loadError = params.loadError;
        }
        if (params.loading !== undefined) {
            this.loading = params.loading;
        }
        if (params.serverAvatarURL !== undefined) {
            this.serverAvatarURL = params.serverAvatarURL;
        }
    }
    updateStateVars(params: MindProfilePage_Params) {
        this.__pageStack.reset(params.pageStack);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
        this.__data.purgeDependencyOnElmtId(rmElmtId);
        this.__loadError.purgeDependencyOnElmtId(rmElmtId);
        this.__loading.purgeDependencyOnElmtId(rmElmtId);
        this.__serverAvatarURL.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        this.__data.aboutToBeDeleted();
        this.__loadError.aboutToBeDeleted();
        this.__loading.aboutToBeDeleted();
        this.__serverAvatarURL.aboutToBeDeleted();
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
    private __data: ObservedPropertyObjectPU<MindProfilePayload>;
    get data() {
        return this.__data.get();
    }
    set data(newValue: MindProfilePayload) {
        this.__data.set(newValue);
    }
    private __loadError: ObservedPropertySimplePU<string>;
    get loadError() {
        return this.__loadError.get();
    }
    set loadError(newValue: string) {
        this.__loadError.set(newValue);
    }
    private __loading: ObservedPropertySimplePU<boolean>;
    get loading() {
        return this.__loading.get();
    }
    set loading(newValue: boolean) {
        this.__loading.set(newValue);
    }
    private __serverAvatarURL: ObservedPropertySimplePU<string>;
    get serverAvatarURL() {
        return this.__serverAvatarURL.get();
    }
    set serverAvatarURL(newValue: string) {
        this.__serverAvatarURL.set(newValue);
    }
    aboutToAppear(): void {
        if (authStore.isLoggedIn) {
            this.load();
        }
        else {
            this.loading = false;
        }
    }
    private async load(): Promise<void> {
        await this.loadUserAvatar();
        this.loading = true;
        try {
            const profile = await ArenaAPI.fetchMindProfile(localeStore.catalogLocale);
            this.data = profile;
            this.loadError = '';
        }
        catch (e) {
            this.loadError = (e as Error).message ?? String(e);
            this.data = MindProfilePage.EMPTY;
        }
        this.loading = false;
    }
    private async loadUserAvatar(): Promise<void> {
        if (!authStore.isLoggedIn) {
            return;
        }
        try {
            const user = await ArenaAPI.fetchCurrentUser();
            if (user.avatarUrl) {
                this.serverAvatarURL = MindProfilePage.resolveAvatarURL(user.avatarUrl);
            }
        }
        catch (_e) {
            // ignore
        }
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(81:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(ArenaTheme.background);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!authStore.isLoggedIn) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.guestView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.loggedInView.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    guestView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 24 });
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(95:5)", "entry");
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({ type: ButtonType.Normal });
            Button.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(96:7)", "entry");
            Button.backgroundColor(Color.Transparent);
            Button.alignSelf(ItemAlign.Start);
            Button.margin({ left: 16, top: 16 });
            Button.onClick(() => this.pageStack.clear());
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(97:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(98:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.backHome);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(99:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(107:7)", "entry");
        }, Blank);
        Blank.pop();
        this.profileAvatar.bind(this)(80);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.profileGuestTitle);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(109:7)", "entry");
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.profileGuestHint);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(113:7)", "entry");
            Text.fontSize(16);
            Text.fontColor(ArenaTheme.textMuted);
            Text.textAlign(TextAlign.Center);
            Text.padding({ left: 32, right: 32 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.profileLoginRegister);
            Button.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(118:7)", "entry");
            Button.width('80%');
            Button.height(48);
            Button.fontSize(16);
            Button.fontWeight(FontWeight.Bold);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.borderRadius(12);
            Button.onClick(() => {
                this.pageStack.pushPath({ name: AppRoutes.login() });
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(129:7)", "entry");
        }, Blank);
        Blank.pop();
        Column.pop();
    }
    loggedInView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(137:5)", "entry");
            Scroll.layoutWeight(1);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 24 });
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(138:7)", "entry");
            Column.padding({ left: 16, right: 16, bottom: 32 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(139:9)", "entry");
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({ type: ButtonType.Normal });
            Button.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(140:11)", "entry");
            Button.backgroundColor(Color.Transparent);
            Button.alignSelf(ItemAlign.Start);
            Button.onClick(() => this.pageStack.clear());
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(141:13)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(142:15)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.backHome);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(143:15)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        Button.pop();
        this.profileAvatar.bind(this)(72);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.mindProfileTitle);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(151:11)", "entry");
            Text.fontSize(32);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.mindProfileSubtitle);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(155:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (authStore.session !== null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(authSessionDisplayName(authStore.session));
                        Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(158:13)", "entry");
                        Text.fontSize(14);
                        Text.fontColor(ArenaTheme.orangeAccent);
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
            If.create();
            if (this.loadError) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.loadError);
                        Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(163:13)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.orangeAccent);
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.loading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(172:11)", "entry");
                        LoadingProgress.color(ArenaTheme.orangeAccent);
                        LoadingProgress.width(40);
                        LoadingProgress.height(40);
                        LoadingProgress.margin({ top: 40, bottom: 40 });
                    }, LoadingProgress);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.statsGrid.bind(this)();
                    this.biasesSection.bind(this)();
                    this.insightsSection.bind(this)();
                    this.recentSection.bind(this)();
                    this.cta.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
    }
    profileAvatar(size: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(193:5)", "entry");
            Stack.width(size);
            Stack.height(size);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(194:7)", "entry");
            Column.width(size);
            Column.height(size);
            Column.borderRadius(size / 2);
            Column.linearGradient({
                angle: 135,
                colors: [[ArenaTheme.orangeAccent, 0], ['#DC2626D9', 1]]
            });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.serverAvatarURL) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(this.serverAvatarURL);
                        Image.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(203:9)", "entry");
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
                        Text.create(this.profileDisplayName.substring(0, 1).toUpperCase());
                        Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(209:9)", "entry");
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
    statsGrid(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Start });
            Flex.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(221:5)", "entry");
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, idx: number) => {
                const s = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create({ space: 10 });
                    Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(223:9)", "entry");
                    Column.padding(18);
                    Column.width('46%');
                    Column.margin({ right: 8, bottom: 12 });
                    Column.backgroundColor(ArenaTheme.surface);
                    Column.border({ width: 1, color: ArenaTheme.border, radius: 14 });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('👥');
                    Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(224:11)", "entry");
                    Text.fontSize(22);
                    Text.fontColor(ArenaTheme.orangeAccent);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(s.value);
                    Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(227:11)", "entry");
                    Text.fontSize(28);
                    Text.fontWeight(FontWeight.Bold);
                    Text.fontColor(ArenaTheme.textPrimary);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(localeStore.L.localizeMindStatLabel(s.label));
                    Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(231:11)", "entry");
                    Text.fontSize(12);
                    Text.fontColor(ArenaTheme.textMuted);
                }, Text);
                Text.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.data.stats, forEachItemGenFunction, (s: MindProfileStat, idx: number) => `${idx}-${s.label}`, true, true);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
    }
    biasesSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(247:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.biasMapTitle);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(248:7)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.biasMapFootnote);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(252:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.data.biases.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.prefersEnglish
                            ? 'Complete debates while logged in to build your bias map.'
                            : '登录后完成辩论，即可生成你的偏差地图。');
                        Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(256:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, idx: number) => {
                            const bias = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create({ space: 6 });
                                Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(263:11)", "entry");
                                Column.padding(14);
                                Column.width('100%');
                                Column.backgroundColor(ArenaTheme.surface);
                                Column.border({ width: 1, color: ArenaTheme.border, radius: 12 });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Row.create();
                                Row.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(264:13)", "entry");
                                Row.width('100%');
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(bias.name);
                                Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(265:15)", "entry");
                                Text.fontSize(16);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(ArenaTheme.textPrimary);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Blank.create();
                                Blank.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(266:15)", "entry");
                            }, Blank);
                            Blank.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`${bias.percentage}%`);
                                Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(267:15)", "entry");
                                Text.fontSize(16);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(ArenaTheme.orangeAccent);
                            }, Text);
                            Text.pop();
                            Row.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(bias.description);
                                Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(273:13)", "entry");
                                Text.fontSize(12);
                                Text.fontColor(ArenaTheme.textMuted);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(localeStore.L.occurrences(bias.instances));
                                Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(274:13)", "entry");
                                Text.fontSize(11);
                                Text.fontColor(ArenaTheme.textMuted);
                            }, Text);
                            Text.pop();
                            Column.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.data.biases, forEachItemGenFunction, (bias: MindProfileBias, idx: number) => `${idx}-${bias.name}`, true, true);
                    }, ForEach);
                    ForEach.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    insightsSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(289:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.keyInsights);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(290:7)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(294:7)", "entry");
            Column.padding(14);
            Column.width('100%');
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: 1, color: ArenaTheme.border, radius: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.insightWatchOutTitle);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(295:9)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#EF4444E6');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.insightWatchOutBody);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(299:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(306:7)", "entry");
            Column.padding(14);
            Column.width('100%');
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: 1, color: ArenaTheme.border, radius: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.insightStrengthTitle);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(307:9)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.cyanAccent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.insightStrengthBody);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(311:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        Column.pop();
    }
    recentSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(324:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.recentThoughts);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(325:7)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.data.recentBattles.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.prefersEnglish ? 'No recent matches yet.' : '暂无近期对局记录。');
                        Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(330:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = (_item, idx: number) => {
                            const b = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create({ space: 8 });
                                Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(335:11)", "entry");
                                Column.padding(14);
                                Column.width('100%');
                                Column.backgroundColor(ArenaTheme.surface);
                                Column.border({ width: 1, color: ArenaTheme.border, radius: 12 });
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(b.question);
                                Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(336:13)", "entry");
                                Text.fontSize(16);
                                Text.fontWeight(FontWeight.Bold);
                                Text.fontColor(ArenaTheme.textPrimary);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (b.changed) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(localeStore.L.stanceChanged);
                                            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(338:15)", "entry");
                                            Text.fontSize(11);
                                            Text.fontColor(ArenaTheme.orangeAccent);
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
                                Row.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(340:13)", "entry");
                                Row.width('100%');
                                Row.alignItems(VerticalAlign.Top);
                            }, Row);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create({ space: 4 });
                                Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(341:15)", "entry");
                                Column.alignItems(HorizontalAlign.Start);
                                Column.layoutWeight(1);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(localeStore.L.yourPick);
                                Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(342:17)", "entry");
                                Text.fontSize(11);
                                Text.fontColor(ArenaTheme.textMuted);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(localeStore.L.localizeRecentChoice(b.choice));
                                Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(343:17)", "entry");
                                Text.fontSize(12);
                            }, Text);
                            Text.pop();
                            Column.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Column.create({ space: 4 });
                                Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(347:15)", "entry");
                                Column.alignItems(HorizontalAlign.Start);
                                Column.layoutWeight(1);
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(localeStore.L.judgeFollowUpShort);
                                Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(348:17)", "entry");
                                Text.fontSize(11);
                                Text.fontColor(ArenaTheme.textMuted);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(b.judgeComment);
                                Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(349:17)", "entry");
                                Text.fontSize(12);
                            }, Text);
                            Text.pop();
                            Column.pop();
                            Row.pop();
                            Column.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.data.recentBattles, forEachItemGenFunction, (b: MindProfileRecentBattle, idx: number) => `${idx}-${b.question}`, true, true);
                    }, ForEach);
                    ForEach.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    cta(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(370:5)", "entry");
            Column.padding({ top: 8 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.growthQuote);
            Text.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(371:7)", "entry");
            Text.fontSize(12);
            Text.fontStyle(FontStyle.Italic);
            Text.fontColor(ArenaTheme.textMuted);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(376:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.philosophyDebate);
            Button.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(377:9)", "entry");
            Button.layoutWeight(1);
            Button.height(48);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.purpleAccent);
            Button.borderRadius(12);
            Button.onClick(() => this.pageStack.clear());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.disciplinesDebate);
            Button.debugLine("entry/src/main/ets/pages/MindProfilePage.ets(384:9)", "entry");
            Button.layoutWeight(1);
            Button.height(48);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.borderRadius(12);
            Button.onClick(() => {
                this.pageStack.clear();
                this.pageStack.pushPath({ name: AppRoutes.disciplines() });
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    private static readonly EMPTY: MindProfilePayload = {
        biases: [],
        stats: [
            { label: '已完成对局', value: '0' },
            { label: '改变立场次数', value: '0' },
            { label: '思维盲区', value: '0' },
            { label: '准确判断率', value: '--' },
        ],
        recentBattles: []
    };
    private static readonly FALLBACK: MindProfilePayload = {
        biases: [
            {
                name: '确认偏差',
                description: '倾向于寻找支持已有观点的证据',
                percentage: 72,
                color: 'bg-red-500',
                instances: 13
            }
        ],
        stats: [
            { label: '已完成对局', value: '18' },
            { label: '改变立场次数', value: '7' },
            { label: '思维盲区', value: '5' },
            { label: '准确判断率', value: '61%' },
        ],
        recentBattles: []
    };
    rerender() {
        this.updateDirtyElements();
    }
}
