if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DisciplinesPage_Params {
    pageStack?: NavPathStack;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import { localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { DisciplinesContent } from "@bundle:com.hackastone.arena/entry/ets/pages/DisciplinesContent";
export class DisciplinesPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DisciplinesPage_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
    }
    updateStateVars(params: DisciplinesPage_Params) {
        this.__pageStack.reset(params.pageStack);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/DisciplinesPage.ets(11:5)", "entry");
            Scroll.width('100%');
            Scroll.height('100%');
            Scroll.backgroundColor(ArenaTheme.background);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/DisciplinesPage.ets(12:7)", "entry");
            Column.padding({ left: 16, right: 16, bottom: 28 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/DisciplinesPage.ets(13:9)", "entry");
            Row.width('100%');
            Row.padding({ top: 4, bottom: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({ type: ButtonType.Normal });
            Button.debugLine("entry/src/main/ets/pages/DisciplinesPage.ets(14:11)", "entry");
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => {
                this.pageStack.clear();
            });
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/DisciplinesPage.ets(15:13)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/DisciplinesPage.ets(16:15)", "entry");
            Text.fontSize(18);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.backToPhilosophy);
            Text.debugLine("entry/src/main/ets/pages/DisciplinesPage.ets(19:15)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/DisciplinesPage.ets(28:11)", "entry");
        }, Blank);
        Blank.pop();
        Row.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new DisciplinesContent(this, { pageStack: this.pageStack }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DisciplinesPage.ets", line: 33, col: 9 });
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
        Column.pop();
        Scroll.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
