if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DisciplinesContent_Params {
    pageStack?: NavPathStack;
    selectedCategory?: DisciplineCategory;
    aiLoading?: boolean;
    aiError?: string;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import { catalogStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { AppRoutes } from "@bundle:com.hackastone.arena/entry/ets/route/AppRoutes";
import type { Battle } from '../common/ArenaModels';
import { ArenaAPI } from "@bundle:com.hackastone.arena/entry/ets/api/ArenaAPI";
enum DisciplineCategory {
    ALL = 0,
    BUSINESS = 1,
    PSYCHOLOGY = 2,
    LEARNING = 3,
    HOT = 4
}
function categoryMatches(cat: DisciplineCategory, battleCategory: string): boolean {
    const c = battleCategory.trim().toLowerCase();
    switch (cat) {
        case DisciplineCategory.ALL:
            return true;
        case DisciplineCategory.BUSINESS:
            return c === 'business' || c === '商业';
        case DisciplineCategory.PSYCHOLOGY:
            return c === 'psychology' || c === '心理学';
        case DisciplineCategory.LEARNING:
            return c === 'learning' || c === '学习方法';
        case DisciplineCategory.HOT:
            return c === 'hot topics' || c === '热点问题';
        default:
            return true;
    }
}
function categoryApiEn(cat: DisciplineCategory): string {
    switch (cat) {
        case DisciplineCategory.ALL: return 'General';
        case DisciplineCategory.BUSINESS: return 'Business';
        case DisciplineCategory.PSYCHOLOGY: return 'Psychology';
        case DisciplineCategory.LEARNING: return 'Learning';
        case DisciplineCategory.HOT: return 'Hot topics';
        default: return 'General';
    }
}
function categoryApiZh(cat: DisciplineCategory): string {
    switch (cat) {
        case DisciplineCategory.ALL: return '全部';
        case DisciplineCategory.BUSINESS: return '商业';
        case DisciplineCategory.PSYCHOLOGY: return '心理学';
        case DisciplineCategory.LEARNING: return '学习方法';
        case DisciplineCategory.HOT: return '热点问题';
        default: return '全部';
    }
}
const ALL_CATEGORIES: DisciplineCategory[] = [
    DisciplineCategory.ALL,
    DisciplineCategory.BUSINESS,
    DisciplineCategory.PSYCHOLOGY,
    DisciplineCategory.LEARNING,
    DisciplineCategory.HOT
];
export class DisciplinesContent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.__selectedCategory = new ObservedPropertySimplePU(DisciplineCategory.ALL, this, "selectedCategory");
        this.__aiLoading = new ObservedPropertySimplePU(false, this, "aiLoading");
        this.__aiError = new ObservedPropertySimplePU('', this, "aiError");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DisciplinesContent_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
        if (params.selectedCategory !== undefined) {
            this.selectedCategory = params.selectedCategory;
        }
        if (params.aiLoading !== undefined) {
            this.aiLoading = params.aiLoading;
        }
        if (params.aiError !== undefined) {
            this.aiError = params.aiError;
        }
    }
    updateStateVars(params: DisciplinesContent_Params) {
        this.__pageStack.reset(params.pageStack);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedCategory.purgeDependencyOnElmtId(rmElmtId);
        this.__aiLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__aiError.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        this.__selectedCategory.aboutToBeDeleted();
        this.__aiLoading.aboutToBeDeleted();
        this.__aiError.aboutToBeDeleted();
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
    private __selectedCategory: ObservedPropertySimplePU<DisciplineCategory>;
    get selectedCategory() {
        return this.__selectedCategory.get();
    }
    set selectedCategory(newValue: DisciplineCategory) {
        this.__selectedCategory.set(newValue);
    }
    private __aiLoading: ObservedPropertySimplePU<boolean>;
    get aiLoading() {
        return this.__aiLoading.get();
    }
    set aiLoading(newValue: boolean) {
        this.__aiLoading.set(newValue);
    }
    private __aiError: ObservedPropertySimplePU<string>;
    get aiError() {
        return this.__aiError.get();
    }
    set aiError(newValue: string) {
        this.__aiError.set(newValue);
    }
    private filteredBattles(): Battle[] {
        return catalogStore.allBattles(localeStore.L.prefersEnglish)
            .filter((b: Battle) => categoryMatches(this.selectedCategory, b.category));
    }
    private async handleAiGenerate(): Promise<void> {
        this.aiLoading = true;
        this.aiError = '';
        try {
            const resp = await ArenaAPI.generateDisciplineBattle(categoryApiEn(this.selectedCategory), categoryApiZh(this.selectedCategory));
            if (!resp.disciplineBattle) {
                throw new Error(localeStore.L.topicBadJson);
            }
            const id = catalogStore.addGeneratedBattle(resp.disciplineBattle);
            this.pageStack.pushPath({ name: AppRoutes.battle(id) });
        }
        catch (e) {
            this.aiError = e instanceof Error ? e.message : String(e);
        }
        finally {
            this.aiLoading = false;
        }
    }
    heroSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(99:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.disciplinesHeroTitle);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(100:7)", "entry");
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.orangeAccent);
            Text.textAlign(TextAlign.Center);
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.disciplinesHeroSubtitle);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(106:7)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
            Text.textAlign(TextAlign.Center);
            Text.width('100%');
        }, Text);
        Text.pop();
        Column.pop();
    }
    private featuredBattle(): Battle | null {
        const battles = this.filteredBattles();
        return battles.length > 0 ? battles[0] : null;
    }
    private categoryLabel(cat: DisciplineCategory, idx: number): string {
        return localeStore.L.disciplineCategories[idx] ?? categoryApiZh(cat);
    }
    private isCategoryActive(cat: DisciplineCategory): boolean {
        return this.selectedCategory === cat;
    }
    categoryRow(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(130:5)", "entry");
            Scroll.scrollable(ScrollDirection.Horizontal);
            Scroll.scrollBar(BarState.Off);
            Scroll.width('100%');
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(131:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, idx: number) => {
                const cat = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(this.categoryLabel(cat, idx));
                    Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(133:11)", "entry");
                    Text.fontSize(12);
                    Text.fontWeight(FontWeight.Medium);
                    Text.fontColor(this.isCategoryActive(cat) ? ArenaTheme.orangeAccent : ArenaTheme.textPrimary);
                    Text.padding({ left: 14, right: 14, top: 8, bottom: 8 });
                    Text.backgroundColor(this.isCategoryActive(cat) ? '#EA580C40' : ArenaTheme.surface);
                    Text.borderRadius(10);
                    Text.border({
                        width: 1,
                        color: this.isCategoryActive(cat) ? '#EA580C99' : ArenaTheme.border
                    });
                    Text.onClick(() => {
                        this.selectedCategory = cat;
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, ALL_CATEGORIES, forEachItemGenFunction, (cat: DisciplineCategory) => `cat-${cat}`, true, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Scroll.pop();
    }
    featuredCard(battle: Battle, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(157:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(158:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🧠');
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(159:9)", "entry");
            Text.fontSize(18);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.todayFeatured);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(161:9)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(167:7)", "entry");
            Column.width('100%');
            Column.padding(18);
            Column.linearGradient({
                angle: 135,
                colors: [['#EF44441F', 0], ['#EA580C14', 1]]
            });
            Column.borderRadius(14);
            Column.border({ width: 2, color: '#EA580C59' });
            Column.onClick(() => {
                this.pageStack.pushPath({ name: AppRoutes.battle(battle.id) });
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(168:9)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(169:11)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(battle.category);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(170:13)", "entry");
            Text.fontSize(12);
            Text.fontColor('#EA580CD9');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(battle.question);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(173:13)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.Center });
            Stack.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(181:11)", "entry");
            Stack.width(48);
            Stack.height(48);
            Stack.backgroundColor('#EA580C26');
            Stack.borderRadius(24);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('⚔');
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(182:13)", "entry");
            Text.fontSize(22);
            Text.fontColor(ArenaTheme.orangeAccent);
        }, Text);
        Text.pop();
        Stack.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(194:9)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Builder vs Breaker');
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(195:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(198:11)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.enterBattle);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(199:11)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.orangeAccent);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        Column.pop();
    }
    battleGridItem(b: Battle, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(224:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor(ArenaTheme.surface);
            Column.borderRadius(12);
            Column.border({ width: 1, color: ArenaTheme.border });
            Column.onClick(() => {
                this.pageStack.pushPath({ name: AppRoutes.battle(b.id) });
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.category.toUpperCase());
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(225:7)", "entry");
            Text.fontSize(10);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(b.question);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(228:7)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.enterBattle);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(232:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.orangeAccent);
        }, Text);
        Text.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(248:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.heroSection.bind(this)();
        this.categoryRow.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({ type: ButtonType.Normal });
            Button.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(252:7)", "entry");
            Button.width('100%');
            Button.height(48);
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.borderRadius(10);
            Button.enabled(!this.aiLoading);
            Button.onClick(() => { this.handleAiGenerate(); });
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(253:9)", "entry");
            Row.justifyContent(FlexAlign.Center);
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.aiLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(255:13)", "entry");
                        LoadingProgress.width(20);
                        LoadingProgress.height(20);
                        LoadingProgress.color(Color.White);
                    }, LoadingProgress);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.aiLoading ? localeStore.L.aiGenerating : localeStore.L.aiGenerateBattle);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(260:11)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        Row.pop();
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.aiError.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.aiError);
                        Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(276:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#E57373');
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
            if (this.featuredBattle() !== null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.featuredCard.bind(this)(this.featuredBattle()!);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(285:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.allBattles);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesContent.ets(286:9)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const b = _item;
                this.battleGridItem.bind(this)(b);
            };
            this.forEachUpdateFunction(elmtId, this.filteredBattles(), forEachItemGenFunction, (b: Battle) => b.id, false, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
