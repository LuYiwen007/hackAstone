if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface RoundtablePage_Params {
    pageStack?: NavPathStack;
    stage?: RTStage;
    selected?: Philosopher[];
    debateTopic?: string;
    customTopic?: string;
    messages?: RTMessage[];
    userInput?: string;
    isThinking?: boolean;
    errorAlert?: string;
    showErrorDialog?: boolean;
    showPicker?: boolean;
    activeSpeakerId?: string;
    presetTopicIds?: string[];
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import type { Philosopher } from '../common/ArenaModels';
import { philosopherDisplayName } from "@bundle:com.hackastone.arena/entry/ets/l10n/ArenaL10n";
import { JsonPayload } from "@bundle:com.hackastone.arena/entry/ets/common/JsonPayload";
import { ArenaAPI } from "@bundle:com.hackastone.arena/entry/ets/api/ArenaAPI";
import { catalogStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { RoundtablePhilosopherPicker } from "@bundle:com.hackastone.arena/entry/ets/pages/RoundtablePhilosopherPicker";
type RTStage = 'setup' | 'debate';
class RTMessage {
    id: string = '';
    speaker: string = '';
    content: string = '';
    constructor(id: string, speaker: string, content: string) {
        this.id = id;
        this.speaker = speaker;
        this.content = content;
    }
    withContent(nextContent: string): RTMessage {
        return new RTMessage(this.id, this.speaker, nextContent);
    }
}
interface RTContentPayload {
    content?: string;
}
function rtStreamDisplay(acc: string): string {
    const trimmed = acc.trim();
    const parsed = JsonPayload.parse<RTContentPayload>(trimmed);
    if (parsed?.content && parsed.content.length > 0) {
        return parsed.content;
    }
    const match = trimmed.match(/"content"\s*:\s*"/);
    if (match && match.index !== undefined) {
        let tail = trimmed.substring(match.index + match[0].length);
        const end = tail.indexOf('"');
        if (end >= 0) {
            tail = tail.substring(0, end);
        }
        return tail.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
    return trimmed;
}
export class RoundtablePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.__stage = new ObservedPropertySimplePU('setup', this, "stage");
        this.__selected = new ObservedPropertyObjectPU([], this, "selected");
        this.__debateTopic = new ObservedPropertySimplePU('', this, "debateTopic");
        this.__customTopic = new ObservedPropertySimplePU('', this, "customTopic");
        this.__messages = new ObservedPropertyObjectPU([], this, "messages");
        this.__userInput = new ObservedPropertySimplePU('', this, "userInput");
        this.__isThinking = new ObservedPropertySimplePU(false, this, "isThinking");
        this.__errorAlert = new ObservedPropertySimplePU('', this, "errorAlert");
        this.__showErrorDialog = new ObservedPropertySimplePU(false, this, "showErrorDialog");
        this.__showPicker = new ObservedPropertySimplePU(false, this, "showPicker");
        this.__activeSpeakerId = new ObservedPropertySimplePU('', this, "activeSpeakerId");
        this.presetTopicIds = ['ai-free-will', 'utopia', 'truth', 'education'];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: RoundtablePage_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
        if (params.stage !== undefined) {
            this.stage = params.stage;
        }
        if (params.selected !== undefined) {
            this.selected = params.selected;
        }
        if (params.debateTopic !== undefined) {
            this.debateTopic = params.debateTopic;
        }
        if (params.customTopic !== undefined) {
            this.customTopic = params.customTopic;
        }
        if (params.messages !== undefined) {
            this.messages = params.messages;
        }
        if (params.userInput !== undefined) {
            this.userInput = params.userInput;
        }
        if (params.isThinking !== undefined) {
            this.isThinking = params.isThinking;
        }
        if (params.errorAlert !== undefined) {
            this.errorAlert = params.errorAlert;
        }
        if (params.showErrorDialog !== undefined) {
            this.showErrorDialog = params.showErrorDialog;
        }
        if (params.showPicker !== undefined) {
            this.showPicker = params.showPicker;
        }
        if (params.activeSpeakerId !== undefined) {
            this.activeSpeakerId = params.activeSpeakerId;
        }
        if (params.presetTopicIds !== undefined) {
            this.presetTopicIds = params.presetTopicIds;
        }
    }
    updateStateVars(params: RoundtablePage_Params) {
        this.__pageStack.reset(params.pageStack);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
        this.__stage.purgeDependencyOnElmtId(rmElmtId);
        this.__selected.purgeDependencyOnElmtId(rmElmtId);
        this.__debateTopic.purgeDependencyOnElmtId(rmElmtId);
        this.__customTopic.purgeDependencyOnElmtId(rmElmtId);
        this.__messages.purgeDependencyOnElmtId(rmElmtId);
        this.__userInput.purgeDependencyOnElmtId(rmElmtId);
        this.__isThinking.purgeDependencyOnElmtId(rmElmtId);
        this.__errorAlert.purgeDependencyOnElmtId(rmElmtId);
        this.__showErrorDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__showPicker.purgeDependencyOnElmtId(rmElmtId);
        this.__activeSpeakerId.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        this.__stage.aboutToBeDeleted();
        this.__selected.aboutToBeDeleted();
        this.__debateTopic.aboutToBeDeleted();
        this.__customTopic.aboutToBeDeleted();
        this.__messages.aboutToBeDeleted();
        this.__userInput.aboutToBeDeleted();
        this.__isThinking.aboutToBeDeleted();
        this.__errorAlert.aboutToBeDeleted();
        this.__showErrorDialog.aboutToBeDeleted();
        this.__showPicker.aboutToBeDeleted();
        this.__activeSpeakerId.aboutToBeDeleted();
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
    private __stage: ObservedPropertySimplePU<RTStage>;
    get stage() {
        return this.__stage.get();
    }
    set stage(newValue: RTStage) {
        this.__stage.set(newValue);
    }
    private __selected: ObservedPropertyObjectPU<Philosopher[]>;
    get selected() {
        return this.__selected.get();
    }
    set selected(newValue: Philosopher[]) {
        this.__selected.set(newValue);
    }
    private __debateTopic: ObservedPropertySimplePU<string>;
    get debateTopic() {
        return this.__debateTopic.get();
    }
    set debateTopic(newValue: string) {
        this.__debateTopic.set(newValue);
    }
    private __customTopic: ObservedPropertySimplePU<string>;
    get customTopic() {
        return this.__customTopic.get();
    }
    set customTopic(newValue: string) {
        this.__customTopic.set(newValue);
    }
    private __messages: ObservedPropertyObjectPU<RTMessage[]>;
    get messages() {
        return this.__messages.get();
    }
    set messages(newValue: RTMessage[]) {
        this.__messages.set(newValue);
    }
    private __userInput: ObservedPropertySimplePU<string>;
    get userInput() {
        return this.__userInput.get();
    }
    set userInput(newValue: string) {
        this.__userInput.set(newValue);
    }
    private __isThinking: ObservedPropertySimplePU<boolean>;
    get isThinking() {
        return this.__isThinking.get();
    }
    set isThinking(newValue: boolean) {
        this.__isThinking.set(newValue);
    }
    private __errorAlert: ObservedPropertySimplePU<string>;
    get errorAlert() {
        return this.__errorAlert.get();
    }
    set errorAlert(newValue: string) {
        this.__errorAlert.set(newValue);
    }
    private __showErrorDialog: ObservedPropertySimplePU<boolean>;
    get showErrorDialog() {
        return this.__showErrorDialog.get();
    }
    set showErrorDialog(newValue: boolean) {
        this.__showErrorDialog.set(newValue);
    }
    private __showPicker: ObservedPropertySimplePU<boolean>;
    get showPicker() {
        return this.__showPicker.get();
    }
    set showPicker(newValue: boolean) {
        this.__showPicker.set(newValue);
    }
    private __activeSpeakerId: ObservedPropertySimplePU<string>;
    get activeSpeakerId() {
        return this.__activeSpeakerId.get();
    }
    set activeSpeakerId(newValue: string) {
        this.__activeSpeakerId.set(newValue);
    }
    private readonly presetTopicIds: string[];
    private isPhilosopherPicked(p: Philosopher): boolean {
        return this.selected.some((x: Philosopher) => x.id === p.id);
    }
    private isQuickPickFull(p: Philosopher): boolean {
        return this.selected.length >= 4 && !this.isPhilosopherPicked(p);
    }
    private messagePhilosopher(msg: RTMessage): Philosopher | undefined {
        return catalogStore.philosophers.find((x: Philosopher) => x.id === msg.speaker);
    }
    private isUserMessage(msg: RTMessage): boolean {
        return msg.speaker === 'user';
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(84:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(ArenaTheme.background);
            Column.bindContentCover(this.showErrorDialog, { builder: () => {
                    this.errorDialog.call(this);
                } }, {
                onDisappear: () => { this.showErrorDialog = false; }
            });
            Column.bindContentCover(this.showPicker, { builder: () => {
                    this.pickerCover.call(this);
                } }, {
                onDisappear: () => { this.showPicker = false; }
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(85:7)", "entry");
            Scroll.layoutWeight(1);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(86:9)", "entry");
            Column.padding({ left: 16, right: 16, bottom: 28, top: 16 });
            Column.width('100%');
        }, Column);
        this.header.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.stage === 'setup') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.setup.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.debate.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    errorDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(112:5)", "entry");
            Column.padding(24);
            Column.backgroundColor(ArenaTheme.surface);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.apiRequestFailedTitle);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(113:7)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.errorAlert);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(114:7)", "entry");
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.alertConfirm);
            Button.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(115:7)", "entry");
            Button.onClick(() => {
                this.showErrorDialog = false;
                this.errorAlert = '';
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    pickerCover(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(127:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(ArenaTheme.background);
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new RoundtablePhilosopherPicker(this, { pageStack: this.pageStack, selected: this.__selected }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/RoundtablePage.ets", line: 128, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            pageStack: this.pageStack,
                            selected: this.selected
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        pageStack: this.pageStack
                    });
                }
            }, { name: "RoundtablePhilosopherPicker" });
        }
        Column.pop();
    }
    header(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(137:5)", "entry");
            Row.width('100%');
            Row.padding({ top: 4, bottom: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({ type: ButtonType.Normal });
            Button.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(138:7)", "entry");
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => this.pageStack.clear());
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(139:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(140:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.backToHome);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(141:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(146:7)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(147:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('👥');
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(148:9)", "entry");
            Text.fontColor(ArenaTheme.orangeAccent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.roundtableHeadline);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(149:9)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Row.pop();
        Row.pop();
    }
    setup(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 24 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(158:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(159:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(160:9)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('1.');
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(161:11)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.orangeAccent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.pickThinkers);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(162:11)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.pickThinkersHint);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(163:11)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
            Text.margin({ left: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(164:11)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.viewAllPhilosophers);
            Button.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(165:11)", "entry");
            Button.fontSize(14);
            Button.fontWeight(FontWeight.Medium);
            Button.fontColor(ArenaTheme.orangeAccent);
            Button.backgroundColor(Color.Transparent);
            Button.border({ width: 1, color: '#F9731680', radius: 8 });
            Button.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Button.onClick(() => { this.showPicker = true; });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.selected.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 8 });
                        Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(178:11)", "entry");
                        Column.padding(12);
                        Column.width('100%');
                        Column.alignItems(HorizontalAlign.Start);
                        Column.backgroundColor(ArenaTheme.surface);
                        Column.border({ width: 1, color: '#F9731659', radius: 10 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.selectedCount(this.selected.length));
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(179:13)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(ArenaTheme.orangeAccent);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Flex.create({ wrap: FlexWrap.Wrap });
                        Flex.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(183:13)", "entry");
                    }, Flex);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const p = _item;
                            this.selectedChip.bind(this)(p);
                        };
                        this.forEachUpdateFunction(elmtId, this.selected, forEachItemGenFunction, (p: Philosopher) => p.id, false, false);
                    }, ForEach);
                    ForEach.pop();
                    Flex.pop();
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
            Flex.create({ wrap: FlexWrap.Wrap });
            Flex.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(196:9)", "entry");
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const p = _item;
                this.quickPickTile.bind(this)(p);
            };
            this.forEachUpdateFunction(elmtId, catalogStore.philosophers.filter((p: Philosopher) => p.majorWorks != null), forEachItemGenFunction, (p: Philosopher) => p.id, false, false);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(206:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 6 });
            Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(207:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('2.');
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(208:11)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.orangeAccent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.pickTopic);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(209:11)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap });
            Flex.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(211:9)", "entry");
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const id = _item;
                this.presetTopicTile.bind(this)(id);
            };
            this.forEachUpdateFunction(elmtId, this.presetTopicIds, forEachItemGenFunction, (id: string) => id, false, false);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(217:9)", "entry");
            Column.padding(12);
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: 1, color: ArenaTheme.border, radius: 10, style: BorderStyle.Dashed });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.customTopicLabel);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(218:11)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: localeStore.L.customTopicPlaceholder, text: this.customTopic });
            TextInput.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(219:11)", "entry");
            TextInput.fontColor(ArenaTheme.textPrimary);
            TextInput.backgroundColor(ArenaTheme.background);
            TextInput.border({ width: 1, color: ArenaTheme.border, radius: 8 });
            TextInput.onChange((v: string) => {
                this.customTopic = v;
                this.debateTopic = v;
            });
        }, TextInput);
        Column.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(237:7)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(`✨ ${localeStore.L.startRoundtable}`);
            Button.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(238:9)", "entry");
            Button.width('100%');
            Button.height(48);
            Button.fontSize(16);
            Button.fontWeight(FontWeight.Bold);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.borderRadius(12);
            Button.enabled(this.selected.length >= 2 && this.debateTopic.trim().length > 0);
            Button.onClick(() => this.startDebate());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.selected.length < 2 || this.debateTopic.trim().length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.roundtableSetupError);
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(249:11)", "entry");
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
        Column.pop();
        Column.pop();
    }
    selectedChip(p: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(259:5)", "entry");
            Row.padding(8);
            Row.width('48%');
            Row.margin({ right: 8, bottom: 8 });
            Row.backgroundColor(ArenaTheme.background);
            Row.border({ width: 1, color: ArenaTheme.border, radius: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(260:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(philosopherDisplayName(p, localeStore.L.prefersEnglish));
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(261:9)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(p.school);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(262:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('✕');
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(266:7)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
            Text.onClick(() => {
                this.selected = this.selected.filter((x: Philosopher) => x.id !== p.id);
            });
        }, Text);
        Text.pop();
        Row.pop();
    }
    quickPickTile(p: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 4 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(282:5)", "entry");
            Column.padding(10);
            Column.width('31%');
            Column.margin({ right: 8, bottom: 8 });
            Column.alignItems(HorizontalAlign.Start);
            Column.opacity(this.isQuickPickFull(p) ? 0.35 : 1);
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({
                width: 1,
                color: this.isPhilosopherPicked(p) ? '#F9731699' : ArenaTheme.border,
                radius: 10
            });
            Column.enabled(!this.isPhilosopherPicked(p) && !this.isQuickPickFull(p));
            Column.onClick(() => this.addPhilosopher(p));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(philosopherDisplayName(p, localeStore.L.prefersEnglish));
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(283:7)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(p.school);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(287:7)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isPhilosopherPicked(p)) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.picked);
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(289:9)", "entry");
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
        Column.pop();
    }
    presetTopicTile(id: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(309:5)", "entry");
            Column.padding(12);
            Column.width('48%');
            Column.margin({ right: 10, bottom: 10 });
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(this.debateTopic === localeStore.L.presetTopic(id).title ? '#F9731626' : ArenaTheme.surface);
            Column.border({
                width: 1,
                color: this.debateTopic === localeStore.L.presetTopic(id).title ? '#F97316A6' : ArenaTheme.border,
                radius: 10
            });
            Column.onClick(() => {
                this.debateTopic = localeStore.L.presetTopic(id).title;
                this.customTopic = '';
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.presetTopic(id).title);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(310:7)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.presetTopic(id).description);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(311:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
    }
    debate(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(331:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(332:7)", "entry");
            Column.padding(16);
            Column.width('100%');
            Column.linearGradient({
                angle: 90,
                colors: [['#F973161F', 0], ['#EF444414', 1]]
            });
            Column.border({ width: 1, color: '#F973164D', radius: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.debateTopic);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(333:9)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.orangeAccent);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(338:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.participants);
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(339:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.selected.map((p: Philosopher) => philosopherDisplayName(p, localeStore.L.prefersEnglish))
                .join(localeStore.L.prefersEnglish ? ', ' : '、'));
            Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(340:11)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(355:7)", "entry");
            Scroll.constraintSize({ minHeight: 320 });
            Scroll.padding(12);
            Scroll.width('100%');
            Scroll.backgroundColor(ArenaTheme.surface);
            Scroll.border({ width: 1, color: ArenaTheme.border, radius: 12 });
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(356:9)", "entry");
            Column.padding({ top: 8, bottom: 8 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const msg = _item;
                this.messageRow.bind(this)(msg);
            };
            this.forEachUpdateFunction(elmtId, this.messages, forEachItemGenFunction, (msg: RTMessage) => msg.id, false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isThinking) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 10 });
                        Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(361:13)", "entry");
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(362:15)", "entry");
                        Column.width(40);
                        Column.height(40);
                        Column.borderRadius(20);
                        Column.backgroundColor(ArenaTheme.border);
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.thinkersThinking);
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(363:15)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(376:7)", "entry");
            Row.padding(12);
            Row.width('100%');
            Row.backgroundColor(ArenaTheme.surface);
            Row.border({ width: 1, color: ArenaTheme.border, radius: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: localeStore.L.roundtableInputPlaceholder, text: this.userInput });
            TextInput.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(377:9)", "entry");
            TextInput.layoutWeight(1);
            TextInput.fontColor(ArenaTheme.textPrimary);
            TextInput.enabled(!this.isThinking);
            TextInput.onChange((v: string) => { this.userInput = v; });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.send);
            Button.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(382:9)", "entry");
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.fontColor(Color.White);
            Button.enabled(this.userInput.trim().length > 0 && !this.isThinking);
            Button.onClick(() => this.sendUser());
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    messageRow(msg: RTMessage, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(398:5)", "entry");
            Row.width('100%');
            Row.justifyContent(this.isUserMessage(msg) ? FlexAlign.End : FlexAlign.Start);
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!this.isUserMessage(msg) && this.messagePhilosopher(msg)) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(400:9)", "entry");
                    }, Stack);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(401:11)", "entry");
                        Column.width(40);
                        Column.height(40);
                        Column.borderRadius(20);
                        Column.linearGradient({ angle: 135, colors: [[ArenaTheme.orangeAccent, 0], ['#EF4444D9', 1]] });
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(philosopherDisplayName(this.messagePhilosopher(msg)!, localeStore.L.prefersEnglish).substring(0, 1));
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(406:11)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(Color.White);
                    }, Text);
                    Text.pop();
                    Stack.pop();
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
            if (this.isUserMessage(msg)) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                        Blank.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(413:9)", "entry");
                        Blank.constraintSize({ minWidth: 48 });
                    }, Blank);
                    Blank.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 4 });
            Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(415:7)", "entry");
            Column.padding(12);
            Column.constraintSize(this.isUserMessage(msg) ? { maxWidth: 280 } : { minWidth: 0 });
            Column.alignItems(this.isUserMessage(msg) ? HorizontalAlign.End : HorizontalAlign.Start);
            Column.backgroundColor(this.isUserMessage(msg) ? '#F973162E' : ArenaTheme.background);
            Column.border({
                width: 1,
                color: this.isUserMessage(msg) ? '#F9731673' : ArenaTheme.border,
                radius: 10
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isUserMessage(msg)) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.you);
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(417:11)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(ArenaTheme.orangeAccent);
                    }, Text);
                    Text.pop();
                });
            }
            else if (this.messagePhilosopher(msg)) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(419:11)", "entry");
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(philosopherDisplayName(this.messagePhilosopher(msg)!, localeStore.L.prefersEnglish));
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(420:13)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Medium);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.messagePhilosopher(msg)!.school);
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(421:13)", "entry");
                        Text.fontSize(11);
                        Text.fontColor(ArenaTheme.textMuted);
                        Text.margin({ left: 6 });
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!this.isUserMessage(msg) && msg.content.length === 0 && this.activeSpeakerId === msg.speaker && this.isThinking && this.messagePhilosopher(msg)) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.roundtablePhilosopherThinking(philosopherDisplayName(this.messagePhilosopher(msg)!, localeStore.L.prefersEnglish)));
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(425:11)", "entry");
                        Text.fontSize(14);
                        Text.fontStyle(FontStyle.Italic);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(msg.content);
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(430:11)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#D1D5DB');
                    }, Text);
                    Text.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isUserMessage(msg)) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Stack.create();
                        Stack.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(443:9)", "entry");
                    }, Stack);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(444:11)", "entry");
                        Column.width(40);
                        Column.height(40);
                        Column.borderRadius(20);
                        Column.backgroundColor(ArenaTheme.orangeAccent);
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('👤');
                        Text.debugLine("entry/src/main/ets/pages/RoundtablePage.ets(445:11)", "entry");
                        Text.fontColor(Color.White);
                    }, Text);
                    Text.pop();
                    Stack.pop();
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
    private addPhilosopher(p: Philosopher): void {
        if (this.selected.length >= 4) {
            return;
        }
        if (this.selected.some((x: Philosopher) => x.id === p.id)) {
            return;
        }
        this.selected = this.selected.concat([p]);
    }
    private historyText(msgs: RTMessage[]): string {
        return msgs.map((m: RTMessage) => {
            let who = m.speaker;
            if (m.speaker === 'user') {
                who = localeStore.L.user;
            }
            else {
                const p = catalogStore.philosophers.find((x: Philosopher) => x.id === m.speaker);
                if (p) {
                    who = philosopherDisplayName(p, localeStore.L.prefersEnglish);
                }
            }
            return `${who}：${m.content}`;
        }).join('\n');
    }
    private async streamPhilosopher(philosopher: Philosopher, mode: string, prior: RTMessage[], userText?: string): Promise<RTMessage> {
        const msgId = `${mode}-${philosopher.id}-${Date.now()}`;
        let row = new RTMessage(msgId, philosopher.id, '');
        this.messages = prior.concat([row]);
        this.activeSpeakerId = philosopher.id;
        const locale = localeStore.L.prefersEnglish ? 'en' : 'zh';
        const keyIdeas = philosopher.keyIdeas.join('。');
        const summary = philosopher.summary ?? '';
        const hist = this.historyText(prior);
        const onDelta = (_d: string, acc: string) => {
            row = new RTMessage(msgId, philosopher.id, rtStreamDisplay(acc));
            this.messages = prior.concat([row]);
        };
        const resp = mode === 'opening'
            ? await ArenaAPI.streamRoundtablePhilosopherOpening(this.debateTopic, philosopher.id, philosopherDisplayName(philosopher, localeStore.L.prefersEnglish), philosopher.school, keyIdeas, summary, hist, locale, onDelta)
            : await ArenaAPI.streamRoundtablePhilosopherReply(this.debateTopic, userText ?? '', philosopher.id, philosopherDisplayName(philosopher, localeStore.L.prefersEnglish), philosopher.school, keyIdeas, summary, hist, locale, onDelta);
        const final = rtStreamDisplay(resp.text);
        if (!final) {
            throw new Error('empty');
        }
        const done = new RTMessage(msgId, philosopher.id, final);
        this.messages = prior.concat([done]);
        return done;
    }
    private async startDebate(): Promise<void> {
        this.stage = 'debate';
        this.messages = [];
        this.isThinking = true;
        try {
            let hist: RTMessage[] = [];
            for (const p of this.selected) {
                const msg = await this.streamPhilosopher(p, 'opening', hist);
                hist = hist.concat([msg]);
            }
        }
        catch (_e) {
            this.stage = 'setup';
            this.messages = [];
            this.errorAlert = localeStore.L.roundtableOpeningFailed;
            this.showErrorDialog = true;
        }
        this.isThinking = false;
        this.activeSpeakerId = '';
    }
    private async sendUser(): Promise<void> {
        const text = this.userInput.trim();
        if (!text || this.isThinking) {
            return;
        }
        const userRowId = `u-${Date.now()}`;
        this.userInput = '';
        const userRow = new RTMessage(userRowId, 'user', text);
        const prior = this.messages.concat([userRow]);
        this.messages = prior;
        this.isThinking = true;
        try {
            let hist = prior;
            for (const p of this.selected) {
                const msg = await this.streamPhilosopher(p, 'reply', hist, text);
                hist = hist.concat([msg]);
            }
        }
        catch (_e) {
            this.messages = this.messages.filter((m: RTMessage) => m.id !== userRowId);
            this.userInput = text;
            this.errorAlert = localeStore.L.roundtableReplyFailed;
            this.showErrorDialog = true;
        }
        this.isThinking = false;
        this.activeSpeakerId = '';
    }
    rerender() {
        this.updateDirtyElements();
    }
}
