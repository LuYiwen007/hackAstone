if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PhilosopherDetailSheet_Params {
    controller?: CustomDialogController;
    philosopher?: Philosopher;
    allPhilosophers?: Philosopher[];
    onClose?: () => void;
    onStartDebate?: () => void;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import type { Philosopher } from '../common/ArenaModels';
import { philosopherDisplayName } from "@bundle:com.hackastone.arena/entry/ets/l10n/ArenaL10n";
import { localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { PhilosopherAvatar } from "@bundle:com.hackastone.arena/entry/ets/components/PhilosopherAvatar";
export class PhilosopherDetailSheet extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.philosopher = {} as Philosopher;
        this.allPhilosophers = [];
        this.onClose = () => { };
        this.onStartDebate = () => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PhilosopherDetailSheet_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.philosopher !== undefined) {
            this.philosopher = params.philosopher;
        }
        if (params.allPhilosophers !== undefined) {
            this.allPhilosophers = params.allPhilosophers;
        }
        if (params.onClose !== undefined) {
            this.onClose = params.onClose;
        }
        if (params.onStartDebate !== undefined) {
            this.onStartDebate = params.onStartDebate;
        }
    }
    updateStateVars(params: PhilosopherDetailSheet_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private philosopher: Philosopher;
    private allPhilosophers: Philosopher[];
    private onClose: () => void;
    private onStartDebate: () => void;
    influenceSection(title: string, ids?: string[], parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (ids && ids.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 6 });
                        Column.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(22:7)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(title);
                        Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(23:9)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(ArenaTheme.textPrimary);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.resolveInfluenceNames(ids));
                        Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(27:9)", "entry");
                        Text.fontSize(14);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
    }
    private resolveInfluenceNames(ids: string[]): string {
        const names: string[] = [];
        ids.forEach((id: string) => {
            const p = this.allPhilosophers.find((x: Philosopher) => x.id === id);
            if (p) {
                names.push(philosopherDisplayName(p, localeStore.L.prefersEnglish));
            }
        });
        return names.join('、');
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(48:5)", "entry");
            Scroll.width('100%');
            Scroll.height('85%');
            Scroll.backgroundColor(ArenaTheme.background);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(49:7)", "entry");
            Column.padding(20);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(50:9)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(51:11)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.close);
            Button.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(52:11)", "entry");
            Button.fontSize(14);
            Button.fontWeight(FontWeight.Medium);
            Button.fontColor(ArenaTheme.textMuted);
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => {
                this.onClose();
                this.controller?.close();
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 14 });
            Row.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(64:9)", "entry");
            Row.alignItems(VerticalAlign.Top);
            Row.width('100%');
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new PhilosopherAvatar(this, { philosopher: this.philosopher, avatarSize: 64 }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/PhilosopherDetailSheet.ets", line: 65, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            philosopher: this.philosopher,
                            avatarSize: 64
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        philosopher: this.philosopher, avatarSize: 64
                    });
                }
            }, { name: "PhilosopherAvatar" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(66:11)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.displayName);
            Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(67:13)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.philosopher.name);
            Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(71:13)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(74:13)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.philosopher.lifespan) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`📅 ${this.philosopher.lifespan}`);
                        Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(76:17)", "entry");
                        Text.fontSize(12);
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
            If.create();
            if (this.philosopher.birthPlace) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`📍 ${this.philosopher.birthPlace}`);
                        Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(81:17)", "entry");
                        Text.fontSize(12);
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
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.philosopher.school);
            Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(93:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.purpleAccent);
            Text.padding({ left: 14, right: 14, top: 8, bottom: 8 });
            Text.backgroundColor('#A855F726');
            Text.borderRadius(20);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.philosopher.summary) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 8 });
                        Column.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(102:11)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.coreThought);
                        Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(103:13)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(ArenaTheme.textPrimary);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.philosopher.summary);
                        Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(107:13)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#D1D5DB');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(115:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.keyConcepts);
            Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(116:11)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.Start });
            Flex.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(120:11)", "entry");
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const idea = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(idea);
                    Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(122:15)", "entry");
                    Text.fontSize(12);
                    Text.padding({ left: 10, right: 10, top: 8, bottom: 8 });
                    Text.margin({ right: 8, bottom: 8 });
                    Text.fontColor(ArenaTheme.textPrimary);
                    Text.backgroundColor(ArenaTheme.background);
                    Text.border({ width: 1, color: ArenaTheme.border, radius: 8 });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, this.philosopher.keyIdeas, forEachItemGenFunction, (idea: string) => idea, false, false);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.philosopher.majorWorks && this.philosopher.majorWorks.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 8 });
                        Column.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(137:11)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.majorWorks);
                        Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(138:13)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(ArenaTheme.textPrimary);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const w = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(`• ${w}`);
                                Text.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(143:15)", "entry");
                                Text.fontSize(14);
                                Text.fontColor(ArenaTheme.textMuted);
                            }, Text);
                            Text.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.philosopher.majorWorks, forEachItemGenFunction, (w: string) => w, false, false);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.influenceSection.bind(this)(localeStore.L.influencedBy, this.philosopher.influences?.influencedBy);
        this.influenceSection.bind(this)(localeStore.L.influenced, this.philosopher.influences?.influenced);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.startPhilosophyBattle);
            Button.debugLine("entry/src/main/ets/pages/PhilosopherDetailSheet.ets(155:9)", "entry");
            Button.width('100%');
            Button.height(48);
            Button.fontSize(16);
            Button.fontWeight(FontWeight.Bold);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.purpleAccent);
            Button.borderRadius(12);
            Button.onClick(() => {
                this.onStartDebate();
                this.controller?.close();
            });
        }, Button);
        Button.pop();
        Column.pop();
        Scroll.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
