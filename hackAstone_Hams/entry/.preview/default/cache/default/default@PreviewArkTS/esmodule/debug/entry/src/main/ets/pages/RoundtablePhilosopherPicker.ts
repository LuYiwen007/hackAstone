if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface RoundtablePhilosopherPicker_Params {
    pageStack?: NavPathStack;
    selected?: Philosopher[];
    draftIds?: Set<string>;
    query?: string;
    maxPick?: number;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import type { Philosopher } from '../common/ArenaModels';
import { philosopherDisplayName } from "@bundle:com.hackastone.arena/entry/ets/l10n/ArenaL10n";
import { catalogStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
export class RoundtablePhilosopherPicker extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.__selected = new SynchedPropertyObjectTwoWayPU(params.selected, this, "selected");
        this.__draftIds = new ObservedPropertyObjectPU(new Set(), this, "draftIds");
        this.__query = new ObservedPropertySimplePU('', this, "query");
        this.maxPick = 4;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: RoundtablePhilosopherPicker_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
        if (params.draftIds !== undefined) {
            this.draftIds = params.draftIds;
        }
        if (params.query !== undefined) {
            this.query = params.query;
        }
        if (params.maxPick !== undefined) {
            this.maxPick = params.maxPick;
        }
    }
    updateStateVars(params: RoundtablePhilosopherPicker_Params) {
        this.__pageStack.reset(params.pageStack);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
        this.__selected.purgeDependencyOnElmtId(rmElmtId);
        this.__draftIds.purgeDependencyOnElmtId(rmElmtId);
        this.__query.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        this.__selected.aboutToBeDeleted();
        this.__draftIds.aboutToBeDeleted();
        this.__query.aboutToBeDeleted();
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
    private __selected: SynchedPropertySimpleOneWayPU<Philosopher[]>;
    get selected() {
        return this.__selected.get();
    }
    set selected(newValue: Philosopher[]) {
        this.__selected.set(newValue);
    }
    private __draftIds: ObservedPropertyObjectPU<Set<string>>;
    get draftIds() {
        return this.__draftIds.get();
    }
    set draftIds(newValue: Set<string>) {
        this.__draftIds.set(newValue);
    }
    private __query: ObservedPropertySimplePU<string>;
    get query() {
        return this.__query.get();
    }
    set query(newValue: string) {
        this.__query.set(newValue);
    }
    private readonly maxPick: number;
    aboutToAppear(): void {
        const ids = new Set<string>();
        this.selected.forEach((p: Philosopher) => ids.add(p.id));
        this.draftIds = ids;
    }
    private toggle(id: string): void {
        const next = new Set(this.draftIds);
        if (next.has(id)) {
            next.delete(id);
        }
        else if (next.size < this.maxPick) {
            next.add(id);
        }
        this.draftIds = next;
    }
    private confirm(): void {
        const order = this.sorted.map((p: Philosopher) => p.id);
        const picked: Philosopher[] = [];
        order.forEach((id: string) => {
            if (this.draftIds.has(id)) {
                const p = catalogStore.philosophers.find((x: Philosopher) => x.id === id);
                if (p) {
                    picked.push(p);
                }
            }
        });
        this.selected = picked;
        this.pageStack.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(69:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(ArenaTheme.background);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(70:7)", "entry");
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 14, bottom: 14 });
            Row.border({ width: { bottom: 1 }, color: ArenaTheme.border });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.roundtablePickerTitle);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(71:9)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(75:9)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.roundtablePickerConfirm);
            Button.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(76:9)", "entry");
            Button.fontSize(14);
            Button.fontWeight(FontWeight.Medium);
            Button.fontColor(ArenaTheme.orangeAccent);
            Button.backgroundColor(Color.Transparent);
            Button.enabled(this.draftIds.size >= 2);
            Button.onClick(() => this.confirm());
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(88:7)", "entry");
            Scroll.layoutWeight(1);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(89:9)", "entry");
            Column.padding({ left: 16, right: 16, top: 16, bottom: 28 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.roundtablePickerHint);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(90:11)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.roundtablePickerCount(catalogStore.philosophers.length, this.draftIds.size));
            Text.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(93:11)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.orangeAccent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: localeStore.L.roundtableSearchPlaceholder, text: this.query });
            TextInput.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(98:11)", "entry");
            TextInput.fontColor(ArenaTheme.textPrimary);
            TextInput.backgroundColor(ArenaTheme.surface);
            TextInput.border({ width: 1, color: ArenaTheme.border, radius: 8 });
            TextInput.onChange((v: string) => {
                this.query = v;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Start });
            Flex.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(106:11)", "entry");
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const p = _item;
                this.philosopherTile.bind(this)(p);
            };
            this.forEachUpdateFunction(elmtId, this.filtered, forEachItemGenFunction, (p: Philosopher) => p.id, false, false);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    philosopherTile(p: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(125:5)", "entry");
            Row.width('48%');
            Row.padding(12);
            Row.margin({ right: 8, bottom: 10 });
            Row.backgroundColor(this.draftIds.has(p.id) ? '#F9731620' : ArenaTheme.surface);
            Row.border({
                width: 1,
                color: this.draftIds.has(p.id) ? '#F9731699' : ArenaTheme.border,
                radius: 10
            });
            Row.opacity(this.draftIds.size >= this.maxPick && !this.draftIds.has(p.id) ? 0.4 : 1);
            Row.enabled(!(this.draftIds.size >= this.maxPick && !this.draftIds.has(p.id)));
            Row.onClick(() => this.toggle(p.id));
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 4 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(126:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(philosopherDisplayName(p, localeStore.L.prefersEnglish));
            Text.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(127:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(p.school);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(131:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.draftIds.has(p.id)) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('✓');
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePhilosopherPicker.ets(138:9)", "entry");
                        Text.fontSize(18);
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
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
