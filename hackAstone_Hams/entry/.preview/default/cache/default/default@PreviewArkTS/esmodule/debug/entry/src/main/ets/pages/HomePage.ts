if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface HomePage_Params {
    pageStack?: NavPathStack;
    homeMainTab?: HomeMainTab;
    selectedPeriodId?: string;
    selectedRegion?: string | null;
    selectedPhilosopher?: Philosopher | null;
    showAccountSettings?: boolean;
    timelineSliderValue?: number;
    philosopherDialogController?: CustomDialogController | null;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import { authStore, catalogStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { AppRoutes } from "@bundle:com.hackastone.arena/entry/ets/route/AppRoutes";
import { philosopherDisplayName } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaModels";
import type { Philosopher, CatalogTimePeriodMeta } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaModels";
import { CatalogMeta } from "@bundle:com.hackastone.arena/entry/ets/data/CatalogMeta";
import { PhilosopherAvatar } from "@bundle:com.hackastone.arena/entry/ets/components/PhilosopherAvatar";
import { WorldMapSection } from "@bundle:com.hackastone.arena/entry/ets/components/WorldMapSection";
import { DisciplinesContent } from "@bundle:com.hackastone.arena/entry/ets/pages/DisciplinesContent";
import { PhilosopherDetailSheet } from "@bundle:com.hackastone.arena/entry/ets/pages/PhilosopherDetailSheet";
import { AccountSettingsPage } from "@bundle:com.hackastone.arena/entry/ets/pages/AccountSettingsPage";
enum HomeMainTab {
    PHILOSOPHY = 0,
    DISCIPLINES = 1
}
export class HomePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.__homeMainTab = new ObservedPropertySimplePU(HomeMainTab.PHILOSOPHY, this, "homeMainTab");
        this.__selectedPeriodId = new ObservedPropertySimplePU(CatalogMeta.timePeriods[0].id, this, "selectedPeriodId");
        this.__selectedRegion = new ObservedPropertyObjectPU(null, this, "selectedRegion");
        this.__selectedPhilosopher = new ObservedPropertyObjectPU(null, this, "selectedPhilosopher");
        this.__showAccountSettings = new ObservedPropertySimplePU(false, this, "showAccountSettings");
        this.__timelineSliderValue = new ObservedPropertySimplePU(0, this, "timelineSliderValue");
        this.philosopherDialogController = null;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: HomePage_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
        if (params.homeMainTab !== undefined) {
            this.homeMainTab = params.homeMainTab;
        }
        if (params.selectedPeriodId !== undefined) {
            this.selectedPeriodId = params.selectedPeriodId;
        }
        if (params.selectedRegion !== undefined) {
            this.selectedRegion = params.selectedRegion;
        }
        if (params.selectedPhilosopher !== undefined) {
            this.selectedPhilosopher = params.selectedPhilosopher;
        }
        if (params.showAccountSettings !== undefined) {
            this.showAccountSettings = params.showAccountSettings;
        }
        if (params.timelineSliderValue !== undefined) {
            this.timelineSliderValue = params.timelineSliderValue;
        }
        if (params.philosopherDialogController !== undefined) {
            this.philosopherDialogController = params.philosopherDialogController;
        }
    }
    updateStateVars(params: HomePage_Params) {
        this.__pageStack.reset(params.pageStack);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
        this.__homeMainTab.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedPeriodId.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedRegion.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedPhilosopher.purgeDependencyOnElmtId(rmElmtId);
        this.__showAccountSettings.purgeDependencyOnElmtId(rmElmtId);
        this.__timelineSliderValue.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        this.__homeMainTab.aboutToBeDeleted();
        this.__selectedPeriodId.aboutToBeDeleted();
        this.__selectedRegion.aboutToBeDeleted();
        this.__selectedPhilosopher.aboutToBeDeleted();
        this.__showAccountSettings.aboutToBeDeleted();
        this.__timelineSliderValue.aboutToBeDeleted();
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
    private __homeMainTab: ObservedPropertySimplePU<HomeMainTab>;
    get homeMainTab() {
        return this.__homeMainTab.get();
    }
    set homeMainTab(newValue: HomeMainTab) {
        this.__homeMainTab.set(newValue);
    }
    private __selectedPeriodId: ObservedPropertySimplePU<string>;
    get selectedPeriodId() {
        return this.__selectedPeriodId.get();
    }
    set selectedPeriodId(newValue: string) {
        this.__selectedPeriodId.set(newValue);
    }
    private __selectedRegion: ObservedPropertyObjectPU<string | null>;
    get selectedRegion() {
        return this.__selectedRegion.get();
    }
    set selectedRegion(newValue: string | null) {
        this.__selectedRegion.set(newValue);
    }
    private __selectedPhilosopher: ObservedPropertyObjectPU<Philosopher | null>;
    get selectedPhilosopher() {
        return this.__selectedPhilosopher.get();
    }
    set selectedPhilosopher(newValue: Philosopher | null) {
        this.__selectedPhilosopher.set(newValue);
    }
    private __showAccountSettings: ObservedPropertySimplePU<boolean>;
    get showAccountSettings() {
        return this.__showAccountSettings.get();
    }
    set showAccountSettings(newValue: boolean) {
        this.__showAccountSettings.set(newValue);
    }
    private __timelineSliderValue: ObservedPropertySimplePU<number>;
    get timelineSliderValue() {
        return this.__timelineSliderValue.get();
    }
    set timelineSliderValue(newValue: number) {
        this.__timelineSliderValue.set(newValue);
    }
    private philosopherDialogController: CustomDialogController | null;
    private currentPeriod(): CatalogTimePeriodMeta {
        const found = CatalogMeta.timePeriods.find((p: CatalogTimePeriodMeta) => p.id === this.selectedPeriodId);
        return found ?? CatalogMeta.timePeriods[0];
    }
    private regionPhilosophers(): Philosopher[] {
        if (!this.selectedRegion) {
            return [];
        }
        return CatalogMeta.getPhilosophersByPeriodAndRegion(this.currentPeriod(), this.selectedRegion, catalogStore.philosophers);
    }
    aboutToAppear(): void {
        const idx = CatalogMeta.timePeriods.findIndex((p: CatalogTimePeriodMeta) => p.id === this.selectedPeriodId);
        this.timelineSliderValue = idx >= 0 ? idx : 0;
    }
    private openPhilosopherSheet(p: Philosopher): void {
        this.selectedPhilosopher = p;
        this.philosopherDialogController = new CustomDialogController({
            builder: () => {
                let jsDialog = new PhilosopherDetailSheet(this, {
                    philosopher: p,
                    allPhilosophers: catalogStore.philosophers,
                    onClose: () => {
                        this.selectedPhilosopher = null;
                    },
                    onStartDebate: () => {
                        this.pageStack.pushPath({ name: AppRoutes.philosophyBattle(p.id) });
                        this.selectedPhilosopher = null;
                    }
                }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 53, col: 16 });
                jsDialog.setController(this.philosopherDialogController);
                ViewPU.create(jsDialog);
                let paramsLambda = () => {
                    return {
                        philosopher: p,
                        allPhilosophers: catalogStore.philosophers,
                        onClose: () => {
                            this.selectedPhilosopher = null;
                        },
                        onStartDebate: () => {
                            this.pageStack.pushPath({ name: AppRoutes.philosophyBattle(p.id) });
                            this.selectedPhilosopher = null;
                        }
                    };
                };
                jsDialog.paramsGenerator_ = paramsLambda;
            },
            autoCancel: true,
            alignment: DialogAlignment.Bottom,
            customStyle: true
        }, this);
        this.philosopherDialogController.open();
    }
    headerSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(73:5)", "entry");
            Column.width('100%');
            Column.padding({ top: 4, bottom: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/HomePage.ets(74:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/HomePage.ets(75:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (authStore.isLoggedIn) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('⚙');
                        Text.debugLine("entry/src/main/ets/pages/HomePage.ets(77:11)", "entry");
                        Text.fontSize(14);
                        Text.fontColor(ArenaTheme.textMuted);
                        Text.padding({ left: 4, right: 4, top: 6, bottom: 6 });
                        Text.onClick(() => {
                            this.showAccountSettings = true;
                        });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 4 });
                        Row.debugLine("entry/src/main/ets/pages/HomePage.ets(85:11)", "entry");
                        Row.onClick(() => {
                            this.pageStack.pushPath({ name: AppRoutes.login() });
                        });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('👤');
                        Text.debugLine("entry/src/main/ets/pages/HomePage.ets(86:13)", "entry");
                        Text.fontSize(14);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.loginTitle);
                        Text.debugLine("entry/src/main/ets/pages/HomePage.ets(88:13)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(ArenaTheme.orangeAccent);
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
        }, If);
        If.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/pages/HomePage.ets(100:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/HomePage.ets(101:9)", "entry");
            Row.layoutWeight(1);
            Row.justifyContent(FlexAlign.Center);
            Row.padding({ left: 6, right: 6, top: 10, bottom: 10 });
            Row.linearGradient({ angle: 90, colors: [['#FF8C00', 0], ['#EF4444D9', 1]] });
            Row.borderRadius(10);
            Row.onClick(() => { this.pageStack.pushPath({ name: AppRoutes.roundtable() }); });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('👥');
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(102:11)", "entry");
            Text.fontSize(12);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.roundtableDebate);
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(103:11)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Color.White);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/HomePage.ets(117:9)", "entry");
            Row.layoutWeight(1);
            Row.justifyContent(FlexAlign.Center);
            Row.padding({ left: 6, right: 6, top: 10, bottom: 10 });
            Row.linearGradient({ angle: 90, colors: [['#22D3EEE6', 0], ['#3B82F6BF', 1]] });
            Row.borderRadius(10);
            Row.onClick(() => { this.pageStack.pushPath({ name: AppRoutes.dilemma() }); });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('⚠');
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(118:11)", "entry");
            Text.fontSize(12);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.moralDilemma);
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(119:11)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Color.White);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/HomePage.ets(133:9)", "entry");
            Row.layoutWeight(1);
            Row.justifyContent(FlexAlign.Center);
            Row.padding({ left: 6, right: 6, top: 10, bottom: 10 });
            Row.backgroundColor(ArenaTheme.surface);
            Row.borderRadius(10);
            Row.border({ width: 1, color: ArenaTheme.border });
            Row.onClick(() => { this.pageStack.pushPath({ name: AppRoutes.profile() }); });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('👤');
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(134:11)", "entry");
            Text.fontSize(12);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.mindProfile);
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(135:11)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        Row.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/pages/HomePage.ets(152:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.philosophyDebate);
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(153:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(this.homeMainTab === HomeMainTab.PHILOSOPHY ? Color.White : ArenaTheme.textMuted);
            Text.padding({ left: 14, right: 14, top: 8, bottom: 8 });
            Text.backgroundColor(this.homeMainTab === HomeMainTab.PHILOSOPHY ? '#22D3EED9' : ArenaTheme.surface);
            Text.borderRadius(10);
            Text.border({
                width: 1,
                color: this.homeMainTab === HomeMainTab.PHILOSOPHY ? Color.Transparent : ArenaTheme.border
            });
            Text.onClick(() => { this.homeMainTab = HomeMainTab.PHILOSOPHY; });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.disciplinesDebate);
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(166:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(this.homeMainTab === HomeMainTab.DISCIPLINES ? Color.White : ArenaTheme.textMuted);
            Text.padding({ left: 14, right: 14, top: 8, bottom: 8 });
            Text.backgroundColor(this.homeMainTab === HomeMainTab.DISCIPLINES ? '#EA580CE6' : ArenaTheme.surface);
            Text.borderRadius(10);
            Text.border({
                width: 1,
                color: this.homeMainTab === HomeMainTab.DISCIPLINES ? Color.Transparent : ArenaTheme.border
            });
            Text.onClick(() => { this.homeMainTab = HomeMainTab.DISCIPLINES; });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/HomePage.ets(179:9)", "entry");
        }, Blank);
        Blank.pop();
        Row.pop();
        Column.pop();
    }
    heroSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(189:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.heroMapTitle);
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(190:7)", "entry");
            Text.fontSize(26);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.cyanMuted);
            Text.textAlign(TextAlign.Center);
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.heroMapSubtitle);
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(196:7)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
            Text.textAlign(TextAlign.Center);
            Text.width('100%');
        }, Text);
        Text.pop();
        Column.pop();
    }
    private timelineMaxIndex(): number {
        return Math.max(CatalogMeta.timePeriods.length - 1, 0);
    }
    private timelineFirstPeriod(): CatalogTimePeriodMeta {
        return CatalogMeta.timePeriods[0];
    }
    private timelineLastPeriod(): CatalogTimePeriodMeta {
        return CatalogMeta.timePeriods[CatalogMeta.timePeriods.length - 1];
    }
    timelineSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 14 });
            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(219:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor(ArenaTheme.surface);
            Column.borderRadius(14);
            Column.border({ width: 1, color: ArenaTheme.border });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/HomePage.ets(220:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🕐');
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(221:9)", "entry");
            Text.fontSize(18);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.timelineTitle);
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(222:9)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(228:7)", "entry");
            Column.width('100%');
            Column.padding({ top: 12, bottom: 12 });
            Column.backgroundColor('#22D3EE14');
            Column.borderRadius(12);
            Column.border({ width: 1, color: '#22D3EE40' });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.periodLabel(this.currentPeriod()));
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(229:9)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.cyanMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.periodEra(this.currentPeriod()));
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(233:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.describePeriod(this.currentPeriod()));
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(236:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/HomePage.ets(246:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.periodLabel(this.timelineFirstPeriod()));
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(247:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/HomePage.ets(250:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.periodLabel(this.timelineLastPeriod()));
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(251:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Slider.create({
                value: this.timelineSliderValue,
                min: 0,
                max: this.timelineMaxIndex(),
                step: 1,
                style: SliderStyle.OutSet
            });
            Slider.debugLine("entry/src/main/ets/pages/HomePage.ets(257:7)", "entry");
            Slider.blockColor(ArenaTheme.cyanAccent);
            Slider.trackColor(ArenaTheme.border);
            Slider.selectedColor(ArenaTheme.cyanAccent);
            Slider.onChange((value: number) => {
                const i = Math.round(value);
                if (i >= 0 && i < CatalogMeta.timePeriods.length) {
                    this.timelineSliderValue = i;
                    this.selectedPeriodId = CatalogMeta.timePeriods[i].id;
                    this.selectedRegion = null;
                }
            });
        }, Slider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap });
            Flex.debugLine("entry/src/main/ets/pages/HomePage.ets(276:7)", "entry");
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const tag = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(tag);
                    Text.debugLine("entry/src/main/ets/pages/HomePage.ets(278:11)", "entry");
                    Text.fontSize(10);
                    Text.fontColor('#8C9094BF');
                    Text.width('14%');
                    Text.textAlign(TextAlign.Center);
                    Text.margin({ bottom: 6 });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, localeStore.L.timelineEraTags, forEachItemGenFunction, (tag: string) => tag, false, false);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        Column.pop();
    }
    regionPhilosophersSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.selectedRegion) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.regionPhilosophers().length === 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create({ space: 12 });
                                    Column.debugLine("entry/src/main/ets/pages/HomePage.ets(300:9)", "entry");
                                    Column.width('100%');
                                    Column.padding(24);
                                    Column.backgroundColor(ArenaTheme.surface);
                                    Column.borderRadius(14);
                                    Column.border({ width: 1, color: ArenaTheme.border });
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(localeStore.L.noPhilosophersSentence(localeStore.L.periodLabel(this.currentPeriod()), localeStore.L.regionName(this.selectedRegion!)));
                                    Text.debugLine("entry/src/main/ets/pages/HomePage.ets(301:11)", "entry");
                                    Text.fontSize(14);
                                    Text.fontColor(ArenaTheme.textMuted);
                                    Text.textAlign(TextAlign.Center);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel(localeStore.L.backToMap);
                                    Button.debugLine("entry/src/main/ets/pages/HomePage.ets(308:11)", "entry");
                                    Button.fontSize(14);
                                    Button.fontColor(ArenaTheme.textPrimary);
                                    Button.backgroundColor(ArenaTheme.surface);
                                    Button.borderRadius(10);
                                    Button.onClick(() => { this.selectedRegion = null; });
                                }, Button);
                                Button.pop();
                                Column.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create({ space: 14 });
                                    Column.debugLine("entry/src/main/ets/pages/HomePage.ets(321:9)", "entry");
                                    Column.alignItems(HorizontalAlign.Start);
                                    Column.width('100%');
                                    Column.padding(16);
                                    Column.backgroundColor(ArenaTheme.surface);
                                    Column.borderRadius(14);
                                    Column.border({ width: 1, color: '#22D3EE59' });
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`${localeStore.L.regionName(this.selectedRegion!)} · ${localeStore.L.periodLabel(this.currentPeriod())}`);
                                    Text.debugLine("entry/src/main/ets/pages/HomePage.ets(322:11)", "entry");
                                    Text.fontSize(18);
                                    Text.fontWeight(FontWeight.Bold);
                                    Text.fontColor(ArenaTheme.textPrimary);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const p = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Row.create({ space: 12 });
                                            Row.debugLine("entry/src/main/ets/pages/HomePage.ets(328:13)", "entry");
                                            Row.width('100%');
                                            Row.padding(14);
                                            Row.alignItems(VerticalAlign.Top);
                                            Row.backgroundColor(ArenaTheme.background);
                                            Row.borderRadius(10);
                                            Row.border({ width: 1, color: ArenaTheme.border });
                                            Row.margin({ bottom: 12 });
                                            Row.onClick(() => { this.openPhilosopherSheet(p); });
                                        }, Row);
                                        {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                if (isInitialRender) {
                                                    let componentCall = new PhilosopherAvatar(this, { philosopher: p, avatarSize: 48 }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 329, col: 15 });
                                                    ViewPU.create(componentCall);
                                                    let paramsLambda = () => {
                                                        return {
                                                            philosopher: p,
                                                            avatarSize: 48
                                                        };
                                                    };
                                                    componentCall.paramsGenerator_ = paramsLambda;
                                                }
                                                else {
                                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                                        philosopher: p, avatarSize: 48
                                                    });
                                                }
                                            }, { name: "PhilosopherAvatar" });
                                        }
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Column.create({ space: 4 });
                                            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(330:15)", "entry");
                                            Column.alignItems(HorizontalAlign.Start);
                                            Column.layoutWeight(1);
                                        }, Column);
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(philosopherDisplayName(p, localeStore.L.prefersEnglish));
                                            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(331:17)", "entry");
                                            Text.fontSize(16);
                                            Text.fontWeight(FontWeight.Medium);
                                            Text.fontColor(ArenaTheme.textPrimary);
                                            Text.maxLines(1);
                                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(p.name);
                                            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(337:17)", "entry");
                                            Text.fontSize(12);
                                            Text.fontColor(ArenaTheme.textMuted);
                                            Text.maxLines(1);
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(`${p.school} · ${p.period}`);
                                            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(341:17)", "entry");
                                            Text.fontSize(10);
                                            Text.fontColor('#8C9094CC');
                                        }, Text);
                                        Text.pop();
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            ForEach.create();
                                            const forEachItemGenFunction = _item => {
                                                const idea = _item;
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(`• ${idea}`);
                                                    Text.debugLine("entry/src/main/ets/pages/HomePage.ets(345:19)", "entry");
                                                    Text.fontSize(10);
                                                    Text.fontColor(ArenaTheme.textMuted);
                                                    Text.maxLines(1);
                                                }, Text);
                                                Text.pop();
                                            };
                                            this.forEachUpdateFunction(elmtId, p.keyIdeas.slice(0, 2), forEachItemGenFunction, (idea: string) => `${p.id}-${idea}`, false, false);
                                        }, ForEach);
                                        ForEach.pop();
                                        Column.pop();
                                        Row.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, this.regionPhilosophers(), forEachItemGenFunction, (p: Philosopher) => p.id, false, false);
                                }, ForEach);
                                ForEach.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel(localeStore.L.backToMap);
                                    Button.debugLine("entry/src/main/ets/pages/HomePage.ets(364:11)", "entry");
                                    Button.width('100%');
                                    Button.height(44);
                                    Button.fontColor(ArenaTheme.textPrimary);
                                    Button.backgroundColor(Color.Transparent);
                                    Button.borderRadius(10);
                                    Button.border({ width: 1, color: ArenaTheme.border });
                                    Button.onClick(() => { this.selectedRegion = null; });
                                }, Button);
                                Button.pop();
                                Column.pop();
                            });
                        }
                    }, If);
                    If.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
    }
    footerSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.footerTagline);
            Text.debugLine("entry/src/main/ets/pages/HomePage.ets(385:5)", "entry");
            Text.fontSize(12);
            Text.fontColor('#8C9094BF');
            Text.textAlign(TextAlign.Center);
            Text.width('100%');
            Text.padding({ top: 24 });
        }, Text);
        Text.pop();
    }
    accountSettingsSheetContent(parent = null) {
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AccountSettingsPage(this, {
                        onDismiss: () => { this.showAccountSettings = false; }
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 395, col: 5 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            onDismiss: () => { this.showAccountSettings = false; }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "AccountSettingsPage" });
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/HomePage.ets(401:5)", "entry");
            Scroll.width('100%');
            Scroll.height('100%');
            Scroll.backgroundColor(ArenaTheme.background);
            Scroll.scrollBar(BarState.Off);
            Scroll.bindSheet(this.showAccountSettings, { builder: () => {
                    this.accountSettingsSheetContent.call(this);
                } }, {
                height: SheetSize.LARGE,
                dragBar: true,
                onDisappear: () => { this.showAccountSettings = false; }
            });
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/HomePage.ets(402:7)", "entry");
            Column.width('100%');
            Column.padding({ left: 16, right: 16, bottom: 28 });
        }, Column);
        this.headerSection.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.homeMainTab === HomeMainTab.PHILOSOPHY) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.heroSection.bind(this)();
                    this.timelineSection.bind(this)();
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new WorldMapSection(this, {
                                    selectedRegion: this.__selectedRegion,
                                    currentPeriod: this.currentPeriod(),
                                    philosophers: catalogStore.philosophers
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 408, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        selectedRegion: this.selectedRegion,
                                        currentPeriod: this.currentPeriod(),
                                        philosophers: catalogStore.philosophers
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    currentPeriod: this.currentPeriod(),
                                    philosophers: catalogStore.philosophers
                                });
                            }
                        }, { name: "WorldMapSection" });
                    }
                    this.regionPhilosophersSection.bind(this)();
                    this.footerSection.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new DisciplinesContent(this, { pageStack: this.pageStack }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 416, col: 11 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        pageStack: this.pageStack
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    pageStack: this.pageStack
                                });
                            }
                        }, { name: "DisciplinesContent" });
                    }
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
