if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    pageStack?: NavPathStack;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import { catalogStore, localeStore, } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { AppRouteName, AppRoutes } from "@bundle:com.hackastone.arena/entry/ets/route/AppRoutes";
import { HomePage } from "@bundle:com.hackastone.arena/entry/ets/pages/HomePage";
import { LoginPage } from "@bundle:com.hackastone.arena/entry/ets/pages/LoginPage";
import { DisciplinesPage } from "@bundle:com.hackastone.arena/entry/ets/pages/DisciplinesPage";
import { MindProfilePage } from "@bundle:com.hackastone.arena/entry/ets/pages/MindProfilePage";
import { RoundtablePage } from "@bundle:com.hackastone.arena/entry/ets/pages/RoundtablePage";
import { DilemmaPage } from "@bundle:com.hackastone.arena/entry/ets/pages/DilemmaPage";
import { BattlePage } from "@bundle:com.hackastone.arena/entry/ets/pages/BattlePage";
import { PhilosophyBattlePage } from "@bundle:com.hackastone.arena/entry/ets/pages/PhilosophyBattlePage";
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new ObservedPropertyObjectPU(new NavPathStack(), this, "pageStack");
        this.addProvidedVar("pageStack", this.__pageStack, false);
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
        if (params.pageStack !== undefined) {
            this.pageStack = params.pageStack;
        }
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __pageStack: ObservedPropertyObjectPU<NavPathStack>;
    get pageStack() {
        return this.__pageStack.get();
    }
    set pageStack(newValue: NavPathStack) {
        this.__pageStack.set(newValue);
    }
    pageMap(name: string, _param: Object, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (name === AppRouteName.LOGIN) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new LoginPage(this, { pageStack: this.pageStack }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 25, col: 7 });
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
                        }, { name: "LoginPage" });
                    }
                });
            }
            else if (name === AppRouteName.DISCIPLINES) {
                this.ifElseBranchUpdateFunction(1, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new DisciplinesPage(this, { pageStack: this.pageStack }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 27, col: 7 });
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
                        }, { name: "DisciplinesPage" });
                    }
                });
            }
            else if (name === AppRouteName.PROFILE) {
                this.ifElseBranchUpdateFunction(2, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new MindProfilePage(this, { pageStack: this.pageStack }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 29, col: 7 });
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
                        }, { name: "MindProfilePage" });
                    }
                });
            }
            else if (name === AppRouteName.ROUNDTABLE) {
                this.ifElseBranchUpdateFunction(3, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new RoundtablePage(this, { pageStack: this.pageStack }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 31, col: 7 });
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
                        }, { name: "RoundtablePage" });
                    }
                });
            }
            else if (name === AppRouteName.DILEMMA) {
                this.ifElseBranchUpdateFunction(4, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new DilemmaPage(this, { pageStack: this.pageStack }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 33, col: 7 });
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
                        }, { name: "DilemmaPage" });
                    }
                });
            }
            else if (name.startsWith(`${AppRouteName.BATTLE}/`)) {
                this.ifElseBranchUpdateFunction(5, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new BattlePage(this, {
                                    pageStack: this.pageStack,
                                    battleId: AppRoutes.parseBattleId(name) ?? '',
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 35, col: 7 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        pageStack: this.pageStack,
                                        battleId: AppRoutes.parseBattleId(name) ?? ''
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    pageStack: this.pageStack,
                                    battleId: AppRoutes.parseBattleId(name) ?? ''
                                });
                            }
                        }, { name: "BattlePage" });
                    }
                });
            }
            else if (name.startsWith(`${AppRouteName.PHILOSOPHY_BATTLE}/`)) {
                this.ifElseBranchUpdateFunction(6, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new PhilosophyBattlePage(this, {
                                    pageStack: this.pageStack,
                                    philosopherId: AppRoutes.parsePhilosophyBattleId(name) ?? '',
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 40, col: 7 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        pageStack: this.pageStack,
                                        philosopherId: AppRoutes.parsePhilosophyBattleId(name) ?? ''
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    pageStack: this.pageStack,
                                    philosopherId: AppRoutes.parsePhilosophyBattleId(name) ?? ''
                                });
                            }
                        }, { name: "PhilosophyBattlePage" });
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(7, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/Index.ets(45:7)", "entry");
                        Column.width('100%');
                        Column.height('100%');
                        Column.backgroundColor(ArenaTheme.background);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`Unknown route: ${name}`);
                        Text.debugLine("entry/src/main/ets/pages/Index.ets(46:9)", "entry");
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
        }, If);
        If.pop();
    }
    aboutToAppear(): void {
        localeStore.refreshFromSystem();
        catalogStore.reload(localeStore.catalogLocale);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Navigation.create(this.pageStack, { moduleName: "entry", pagePath: "entry/src/main/ets/pages/Index", isUserCreateStack: true });
            Navigation.debugLine("entry/src/main/ets/pages/Index.ets(61:5)", "entry");
            Navigation.mode(NavigationMode.Stack);
            Navigation.navDestination({ builder: this.pageMap.bind(this) });
            Navigation.hideNavBar(true);
            Navigation.hideTitleBar(true);
            Navigation.backgroundColor(ArenaTheme.background);
            Navigation.width('100%');
            Navigation.height('100%');
        }, Navigation);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new HomePage(this, { pageStack: this.pageStack }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 62, col: 7 });
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
            }, { name: "HomePage" });
        }
        Navigation.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.hackastone.arena", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
