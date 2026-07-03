if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DilemmaPage_Params {
    pageStack?: NavPathStack;
    selectedDilemmaId?: string;
    selectedOptionId?: string;
    selectedPhilosopherId?: string;
    stage?: DilemmaStage;
    messages?: DMMessage[];
    userInput?: string;
    isThinking?: boolean;
    thinkingRole?: DMThinkingRole | null;
    canReveal?: boolean;
    fullExplanation?: string;
    isGeneratingSummary?: boolean;
    errorAlert?: string;
    showErrorDialog?: boolean;
    otherPhilosophersVisible?: number;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import type { Philosopher } from '../common/ArenaModels';
import { PhilosophyChoice, philosopherDisplayName } from "@bundle:com.hackastone.arena/entry/ets/l10n/ArenaL10n";
import { JsonPayload } from "@bundle:com.hackastone.arena/entry/ets/common/JsonPayload";
import { ArenaAPI } from "@bundle:com.hackastone.arena/entry/ets/api/ArenaAPI";
import { AppRoutes } from "@bundle:com.hackastone.arena/entry/ets/route/AppRoutes";
import { catalogStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { AuthStore } from "@bundle:com.hackastone.arena/entry/ets/store/AuthStore";
import { MoralDilemmaCatalog } from "@bundle:com.hackastone.arena/entry/ets/data/DilemmaData";
import type { MoralDilemma, MoralDilemmaOption } from "@bundle:com.hackastone.arena/entry/ets/data/DilemmaData";
import { PhilosopherAvatar } from "@bundle:com.hackastone.arena/entry/ets/components/PhilosopherAvatar";
import { DebateSummarySection } from "@bundle:com.hackastone.arena/entry/ets/components/DebateSummarySection";
type DilemmaStage = 'setup' | 'debate' | 'reveal';
type DMRole = 'user' | 'philosopher' | 'judge';
type DMThinkingRole = 'philosopher' | 'judge';
class DMMessage {
    id: string = '';
    role: DMRole = 'user';
    content: string = '';
    constructor(id: string, role: DMRole, content: string) {
        this.id = id;
        this.role = role;
        this.content = content;
    }
    withContent(nextContent: string): DMMessage {
        return new DMMessage(this.id, this.role, nextContent);
    }
}
class JudgeStepResult {
    judgeSpeaks: boolean = false;
    judgeMessage: string = '';
    addressTo: string | null = null;
    continueDebate: boolean = true;
    constructor(judgeSpeaks: boolean, judgeMessage: string, addressTo: string | null, continueDebate: boolean) {
        this.judgeSpeaks = judgeSpeaks;
        this.judgeMessage = judgeMessage;
        this.addressTo = addressTo;
        this.continueDebate = continueDebate;
    }
}
class JudgeStreamOutcome {
    judge: JudgeStepResult;
    judgeMsg: DMMessage | null;
    constructor(judge: JudgeStepResult, judgeMsg: DMMessage | null) {
        this.judge = judge;
        this.judgeMsg = judgeMsg;
    }
}
interface DMContentPayload {
    content?: string;
}
interface DilemmaSummaryDTO {
    fullExplanation?: string;
}
function dmStreamDisplay(acc: string): string {
    const trimmed = acc.trim();
    const parsed = JsonPayload.parse<DMContentPayload>(trimmed);
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
function dmJudgeStreamDisplay(acc: string): string {
    let s = acc;
    const metaIdx = s.lastIndexOf('\nMETA:');
    if (metaIdx >= 0) {
        s = s.substring(0, metaIdx);
    }
    else if (s.startsWith('META:')) {
        s = '';
    }
    s = s.trim();
    if (s === '[NO_JUDGE]' || s.startsWith('[NO_JUDGE]')) {
        return '';
    }
    return s;
}
export class DilemmaPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.__selectedDilemmaId = new ObservedPropertySimplePU(MoralDilemmaCatalog.all[0].id, this, "selectedDilemmaId");
        this.__selectedOptionId = new ObservedPropertySimplePU('', this, "selectedOptionId");
        this.__selectedPhilosopherId = new ObservedPropertySimplePU('', this, "selectedPhilosopherId");
        this.__stage = new ObservedPropertySimplePU('setup', this, "stage");
        this.__messages = new ObservedPropertyObjectPU([], this, "messages");
        this.__userInput = new ObservedPropertySimplePU('', this, "userInput");
        this.__isThinking = new ObservedPropertySimplePU(false, this, "isThinking");
        this.__thinkingRole = new ObservedPropertySimplePU(null, this, "thinkingRole");
        this.__canReveal = new ObservedPropertySimplePU(false, this, "canReveal");
        this.__fullExplanation = new ObservedPropertySimplePU('', this, "fullExplanation");
        this.__isGeneratingSummary = new ObservedPropertySimplePU(false, this, "isGeneratingSummary");
        this.__errorAlert = new ObservedPropertySimplePU('', this, "errorAlert");
        this.__showErrorDialog = new ObservedPropertySimplePU(false, this, "showErrorDialog");
        this.__otherPhilosophersVisible = new ObservedPropertySimplePU(2, this, "otherPhilosophersVisible");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DilemmaPage_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
        if (params.selectedDilemmaId !== undefined) {
            this.selectedDilemmaId = params.selectedDilemmaId;
        }
        if (params.selectedOptionId !== undefined) {
            this.selectedOptionId = params.selectedOptionId;
        }
        if (params.selectedPhilosopherId !== undefined) {
            this.selectedPhilosopherId = params.selectedPhilosopherId;
        }
        if (params.stage !== undefined) {
            this.stage = params.stage;
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
        if (params.thinkingRole !== undefined) {
            this.thinkingRole = params.thinkingRole;
        }
        if (params.canReveal !== undefined) {
            this.canReveal = params.canReveal;
        }
        if (params.fullExplanation !== undefined) {
            this.fullExplanation = params.fullExplanation;
        }
        if (params.isGeneratingSummary !== undefined) {
            this.isGeneratingSummary = params.isGeneratingSummary;
        }
        if (params.errorAlert !== undefined) {
            this.errorAlert = params.errorAlert;
        }
        if (params.showErrorDialog !== undefined) {
            this.showErrorDialog = params.showErrorDialog;
        }
        if (params.otherPhilosophersVisible !== undefined) {
            this.otherPhilosophersVisible = params.otherPhilosophersVisible;
        }
    }
    updateStateVars(params: DilemmaPage_Params) {
        this.__pageStack.reset(params.pageStack);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedDilemmaId.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedOptionId.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedPhilosopherId.purgeDependencyOnElmtId(rmElmtId);
        this.__stage.purgeDependencyOnElmtId(rmElmtId);
        this.__messages.purgeDependencyOnElmtId(rmElmtId);
        this.__userInput.purgeDependencyOnElmtId(rmElmtId);
        this.__isThinking.purgeDependencyOnElmtId(rmElmtId);
        this.__thinkingRole.purgeDependencyOnElmtId(rmElmtId);
        this.__canReveal.purgeDependencyOnElmtId(rmElmtId);
        this.__fullExplanation.purgeDependencyOnElmtId(rmElmtId);
        this.__isGeneratingSummary.purgeDependencyOnElmtId(rmElmtId);
        this.__errorAlert.purgeDependencyOnElmtId(rmElmtId);
        this.__showErrorDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__otherPhilosophersVisible.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        this.__selectedDilemmaId.aboutToBeDeleted();
        this.__selectedOptionId.aboutToBeDeleted();
        this.__selectedPhilosopherId.aboutToBeDeleted();
        this.__stage.aboutToBeDeleted();
        this.__messages.aboutToBeDeleted();
        this.__userInput.aboutToBeDeleted();
        this.__isThinking.aboutToBeDeleted();
        this.__thinkingRole.aboutToBeDeleted();
        this.__canReveal.aboutToBeDeleted();
        this.__fullExplanation.aboutToBeDeleted();
        this.__isGeneratingSummary.aboutToBeDeleted();
        this.__errorAlert.aboutToBeDeleted();
        this.__showErrorDialog.aboutToBeDeleted();
        this.__otherPhilosophersVisible.aboutToBeDeleted();
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
    private __selectedDilemmaId: ObservedPropertySimplePU<string>;
    get selectedDilemmaId() {
        return this.__selectedDilemmaId.get();
    }
    set selectedDilemmaId(newValue: string) {
        this.__selectedDilemmaId.set(newValue);
    }
    private __selectedOptionId: ObservedPropertySimplePU<string>;
    get selectedOptionId() {
        return this.__selectedOptionId.get();
    }
    set selectedOptionId(newValue: string) {
        this.__selectedOptionId.set(newValue);
    }
    private __selectedPhilosopherId: ObservedPropertySimplePU<string>;
    get selectedPhilosopherId() {
        return this.__selectedPhilosopherId.get();
    }
    set selectedPhilosopherId(newValue: string) {
        this.__selectedPhilosopherId.set(newValue);
    }
    private __stage: ObservedPropertySimplePU<DilemmaStage>;
    get stage() {
        return this.__stage.get();
    }
    set stage(newValue: DilemmaStage) {
        this.__stage.set(newValue);
    }
    private __messages: ObservedPropertyObjectPU<DMMessage[]>;
    get messages() {
        return this.__messages.get();
    }
    set messages(newValue: DMMessage[]) {
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
    private __thinkingRole: ObservedPropertySimplePU<DMThinkingRole | null>;
    get thinkingRole() {
        return this.__thinkingRole.get();
    }
    set thinkingRole(newValue: DMThinkingRole | null) {
        this.__thinkingRole.set(newValue);
    }
    private __canReveal: ObservedPropertySimplePU<boolean>;
    get canReveal() {
        return this.__canReveal.get();
    }
    set canReveal(newValue: boolean) {
        this.__canReveal.set(newValue);
    }
    private __fullExplanation: ObservedPropertySimplePU<string>;
    get fullExplanation() {
        return this.__fullExplanation.get();
    }
    set fullExplanation(newValue: string) {
        this.__fullExplanation.set(newValue);
    }
    private __isGeneratingSummary: ObservedPropertySimplePU<boolean>;
    get isGeneratingSummary() {
        return this.__isGeneratingSummary.get();
    }
    set isGeneratingSummary(newValue: boolean) {
        this.__isGeneratingSummary.set(newValue);
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
    private __otherPhilosophersVisible: ObservedPropertySimplePU<number>;
    get otherPhilosophersVisible() {
        return this.__otherPhilosophersVisible.get();
    }
    set otherPhilosophersVisible(newValue: number) {
        this.__otherPhilosophersVisible.set(newValue);
    }
    private static readonly OTHER_PEEK = 2;
    private static readonly OTHER_PAGE = 5;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(164:5)", "entry");
            Scroll.width('100%');
            Scroll.height('100%');
            Scroll.backgroundColor(ArenaTheme.background);
            Scroll.bindContentCover(this.showErrorDialog, { builder: () => {
                    this.errorDialog.call(this);
                } }, {
                onDisappear: () => { this.showErrorDialog = false; }
            });
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(165:7)", "entry");
            Column.padding({ left: 16, right: 16, bottom: 32, top: 16 });
            Column.width('100%');
        }, Column);
        this.backToHomeBar.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.stage === 'setup') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.setupContent.bind(this)();
                });
            }
            else if (this.stage === 'debate' && this.selectedOption && this.selectedPhilosopher) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.debateContent.bind(this)(this.currentDilemma, this.selectedOption, this.selectedPhilosopher);
                });
            }
            else if (this.stage === 'reveal' && this.selectedOption && this.selectedPhilosopher) {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.revealContent.bind(this)(this.currentDilemma, this.selectedOption, this.selectedPhilosopher);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(3, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
    }
    errorDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(188:5)", "entry");
            Column.padding(24);
            Column.backgroundColor(ArenaTheme.surface);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.apiRequestFailedTitle);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(189:7)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.errorAlert);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(190:7)", "entry");
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.alertConfirm);
            Button.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(191:7)", "entry");
            Button.onClick(() => {
                this.showErrorDialog = false;
                this.errorAlert = '';
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    backToHomeBar(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(203:5)", "entry");
            Row.width('100%');
            Row.padding({ top: 4, bottom: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({ type: ButtonType.Normal });
            Button.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(204:7)", "entry");
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => this.pageStack.clear());
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(205:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(206:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.backToHome);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(207:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(212:7)", "entry");
        }, Blank);
        Blank.pop();
        Row.pop();
    }
    setupContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(220:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(221:7)", "entry");
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.dilemmaHeroKicker);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(222:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.cyanAccent);
            Text.letterSpacing(3);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.moralDilemma);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(226:9)", "entry");
            Text.fontSize(32);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.dilemmaHeroSubtitle);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(230:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(237:7)", "entry");
            Scroll.scrollable(ScrollDirection.Horizontal);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(238:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const d = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(d.title(this.en));
                    Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(240:13)", "entry");
                    Text.fontSize(14);
                    Text.fontWeight(d.id === this.currentDilemma.id ? FontWeight.Bold : FontWeight.Normal);
                    Text.padding({ left: 16, right: 16, top: 10, bottom: 10 });
                    Text.fontColor(d.id === this.currentDilemma.id ? '#06B6D4F2' : ArenaTheme.textMuted);
                    Text.backgroundColor(d.id === this.currentDilemma.id ? '#06B6D426' : ArenaTheme.surface);
                    Text.borderRadius(20);
                    Text.border({
                        width: 1,
                        color: d.id === this.currentDilemma.id ? '#22D3EE99' : ArenaTheme.border
                    });
                    Text.onClick(() => this.changeDilemma(d.id));
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, MoralDilemmaCatalog.all, forEachItemGenFunction, (d: MoralDilemma) => d.id, false, false);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Scroll.pop();
        this.dilemmaHeroCard.bind(this)(this.currentDilemma);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(260:7)", "entry");
            Column.padding(16);
            Column.width('100%');
            Column.backgroundColor(ArenaTheme.surface);
            Column.borderRadius(16);
            Column.border({ width: 1, color: ArenaTheme.border });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.currentDilemma.title(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(261:9)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.currentDilemma.subtitle(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(265:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(269:9)", "entry");
            Column.padding(14);
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor('#06B6D40F');
            Column.border({ width: 1, color: '#06B6D440', radius: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.dilemmaCoreQuestionLabel);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(270:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.cyanAccent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.currentDilemma.question(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(271:11)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap });
            Flex.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(282:9)", "entry");
            Flex.width('100%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const opt = _item;
                this.optionCard.bind(this)(opt);
            };
            this.forEachUpdateFunction(elmtId, this.currentDilemma.options, forEachItemGenFunction, (opt: MoralDilemmaOption) => opt.id, false, false);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.selectedOption) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 12 });
                        Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(290:11)", "entry");
                        Column.padding(14);
                        Column.width('100%');
                        Column.alignItems(HorizontalAlign.Start);
                        Column.backgroundColor('#F9731614');
                        Column.border({ width: 1, color: '#F973164D', radius: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.dilemmaYourStanceSection);
                        Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(291:13)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#F97316D9');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedOption.label(this.en));
                        Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(292:13)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.selectedOption.summary(this.en));
                        Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(293:13)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.dilemmaChoosePhilosopherTitle);
                        Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(301:11)", "entry");
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor(ArenaTheme.textPrimary);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.dilemmaChoosePhilosopherHint);
                        Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(305:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.recommendedPhilosophers.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(localeStore.L.dilemmaRecommended);
                                    Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(308:13)", "entry");
                                    Text.fontSize(12);
                                    Text.fontColor(ArenaTheme.cyanAccent);
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create({ space: 12 });
                                    Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(309:13)", "entry");
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    ForEach.create();
                                    const forEachItemGenFunction = _item => {
                                        const p = _item;
                                        this.philosopherChoiceCard.bind(this)(p, true);
                                    };
                                    this.forEachUpdateFunction(elmtId, this.recommendedPhilosophers, forEachItemGenFunction, (p: Philosopher) => p.id, false, false);
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
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.dilemmaAllPhilosophers);
                        Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(316:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 12 });
                        Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(317:11)", "entry");
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const p = _item;
                            this.philosopherChoiceCard.bind(this)(p, false);
                        };
                        this.forEachUpdateFunction(elmtId, this.visibleOtherPhilosophers, forEachItemGenFunction, (p: Philosopher) => p.id, false, false);
                    }, ForEach);
                    ForEach.pop();
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.otherPhilosophers.length > DilemmaPage.OTHER_PEEK) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Button.createWithLabel(this.otherPhilosophersVisible >= this.otherPhilosophers.length
                                        ? localeStore.L.dilemmaCollapsePhilosophers
                                        : localeStore.L.dilemmaExpandPhilosophers);
                                    Button.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(324:13)", "entry");
                                    Button.width('100%');
                                    Button.onClick(() => {
                                        if (this.otherPhilosophersVisible >= this.otherPhilosophers.length) {
                                            this.otherPhilosophersVisible = DilemmaPage.OTHER_PEEK;
                                        }
                                        else {
                                            this.otherPhilosophersVisible = Math.min(this.otherPhilosophersVisible + DilemmaPage.OTHER_PAGE, this.otherPhilosophers.length);
                                        }
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
    dilemmaHeroCard(dilemma: MoralDilemma, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 0 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(353:5)", "entry");
            Column.width('100%');
            Column.borderRadius(16);
            Column.clip(true);
            Column.border({ width: 1, color: ArenaTheme.border });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(354:7)", "entry");
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(355:9)", "entry");
            Column.width('100%');
            Column.height(200);
            Column.linearGradient({
                angle: 135,
                colors: [['#06B6D459', 0], [ArenaTheme.background, 1]]
            });
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.heroSymbol(dilemma.id));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(362:9)", "entry");
            Text.fontSize(80);
            Text.fontColor('#FFFFFF40');
        }, Text);
        Text.pop();
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(dilemma.imageCaption(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(366:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
            Text.padding(12);
            Text.width('100%');
            Text.backgroundColor('#0A0A0BE6');
        }, Text);
        Text.pop();
        Column.pop();
    }
    private heroSymbol(id: string): string {
        if (id === 'trolley-problem') {
            return '🚃';
        }
        if (id === 'brain-in-a-vat') {
            return '🧠';
        }
        return '🎭';
    }
    optionCard(opt: MoralDilemmaOption, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(391:5)", "entry");
            Column.padding(14);
            Column.width('31%');
            Column.margin({ right: 8, bottom: 12 });
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(this.selectedOptionId === opt.id ? '#06B6D41F' : ArenaTheme.background);
            Column.border({
                width: 1,
                color: this.selectedOptionId === opt.id ? '#22D3EE8C' : ArenaTheme.border,
                radius: 12
            });
            Column.onClick(() => this.selectOption(opt.id));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(opt.label(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(392:7)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(opt.summary(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(393:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
    }
    philosopherChoiceCard(p: Philosopher, featured: boolean, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(410:5)", "entry");
            Column.padding(14);
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(featured ? '#06B6D40F' : ArenaTheme.background);
            Column.border({
                width: 1,
                color: featured ? '#22D3EE59' : ArenaTheme.border,
                radius: 12
            });
            Column.onClick(() => this.choosePhilosopher(p));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(411:7)", "entry");
            Row.alignItems(VerticalAlign.Top);
            Row.width('100%');
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new PhilosopherAvatar(this, { philosopher: p, avatarSize: 48 }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DilemmaPage.ets", line: 412, col: 9 });
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
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(413:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(414:11)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(philosopherDisplayName(p, this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(415:13)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (featured) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.dilemmaFeaturedBadge);
                        Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(422:15)", "entry");
                        Text.fontSize(10);
                        Text.fontWeight(FontWeight.Medium);
                        Text.padding({ left: 6, right: 6, top: 2, bottom: 2 });
                        Text.margin({ left: 6 });
                        Text.fontColor(ArenaTheme.cyanAccent);
                        Text.backgroundColor('#06B6D433');
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
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(p.name);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(432:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
            Text.maxLines(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${p.school} · ${this.formatPeriod(p.period)}`);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(433:11)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(p.keyIdeas.slice(0, 3).join(this.en ? ', ' : '、'));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(442:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
            Text.maxLines(2);
        }, Text);
        Text.pop();
        Column.pop();
    }
    debateContent(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(461:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(462:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 4 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(463:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(dilemma.title(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(464:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.cyanAccent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${philosopherDisplayName(philosopher, this.en)} — ${localeStore.L.dilemmaNavTitle}`);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(465:11)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.dilemmaRechoosePhilosopher);
            Button.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(472:9)", "entry");
            Button.fontSize(12);
            Button.fontColor(ArenaTheme.textMuted);
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => this.resetDiscussion());
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(480:7)", "entry");
            Row.alignItems(VerticalAlign.Top);
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(481:9)", "entry");
            Column.padding(12);
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: 1, color: ArenaTheme.border, radius: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.dilemmaCurrentDilemmaLabel);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(482:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(dilemma.question(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(483:11)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(dilemma.promptLead(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(484:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(492:9)", "entry");
            Column.padding(12);
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: 1, color: ArenaTheme.border, radius: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.yourPick);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(493:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(option.label(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(494:11)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(option.summary(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(495:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 6 });
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(506:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('⚠');
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(507:9)", "entry");
            Text.fontSize(12);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.dilemmaDiscussionNote);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(508:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const m = _item;
                this.dmBubble.bind(this)(m, philosopher);
            };
            this.forEachUpdateFunction(elmtId, this.messages, forEachItemGenFunction, (m: DMMessage) => m.id, false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isThinking && this.thinkingRole) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.thinkingRole === 'philosopher'
                            ? localeStore.L.philosopherThinking(philosopherDisplayName(philosopher, this.en))
                            : localeStore.L.judgeThinking);
                        Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(516:9)", "entry");
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
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(523:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({
                placeholder: localeStore.L.dilemmaInputPlaceholder(philosopherDisplayName(philosopher, this.en)),
                text: this.userInput
            });
            TextInput.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(524:9)", "entry");
            TextInput.layoutWeight(1);
            TextInput.fontColor(ArenaTheme.textPrimary);
            TextInput.enabled(!this.isThinking);
            TextInput.onChange((v: string) => { this.userInput = v; });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('💬');
            Button.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(532:9)", "entry");
            Button.enabled(this.userInput.trim().length > 0 && !this.isThinking);
            Button.onClick(() => { this.handleUserTurn(dilemma, option, philosopher); });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.goToSummary);
            Button.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(537:7)", "entry");
            Button.width('100%');
            Button.height(44);
            Button.fontColor(Color.Black);
            Button.backgroundColor('#FACC15D9');
            Button.borderRadius(10);
            Button.enabled(this.canReveal || this.messages.length >= 4);
            Button.onClick(() => { this.handleReveal(dilemma, option, philosopher); });
        }, Button);
        Button.pop();
        Column.pop();
    }
    dmBubble(m: DMMessage, philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(551:5)", "entry");
            Column.padding(12);
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(m.role === 'user' ? '#22D3EE1A' : m.role === 'judge' ? '#FACC1514' : ArenaTheme.surface);
            Column.border({
                width: 1,
                color: m.role === 'user' ? '#22D3EE8C' : m.role === 'judge' ? '#FACC1573' : ArenaTheme.border,
                radius: 10
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(m.role === 'user' ? localeStore.L.you
                : m.role === 'philosopher' ? philosopherDisplayName(philosopher, this.en)
                    : localeStore.L.judge);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(552:7)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(m.content);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(557:7)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Column.pop();
    }
    revealContent(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(572:5)", "entry");
            Column.padding(18);
            Column.width('100%');
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: 1, color: ArenaTheme.border, radius: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(dilemma.title(this.en));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(573:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.cyanAccent);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.fullAnalysis);
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(574:7)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.dilemmaRevealLine(option.label(this.en), philosopherDisplayName(philosopher, this.en)));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(575:7)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.isGeneratingSummary ? localeStore.L.agentGeneratingSummary
                : (this.fullExplanation.length === 0 ? localeStore.L.summaryMissing : this.fullExplanation));
            Text.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(578:7)", "entry");
            Text.fontSize(16);
            Text.fontColor('#D1D5DB');
            Text.padding(16);
            Text.width('100%');
            Text.backgroundColor(ArenaTheme.background);
            Text.border({ width: 1, color: ArenaTheme.border, radius: 12 });
        }, Text);
        Text.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new DebateSummarySection(this, {
                        philosopher,
                        question: `${dilemma.title(this.en)}：${dilemma.question(this.en)}`,
                        userChoice: PhilosophyChoice.UNCERTAIN,
                        userReason: this.messages.filter((m: DMMessage) => m.role === 'user').map((m: DMMessage) => m.content).join('\n'),
                        sourceType: 'dilemma'
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/DilemmaPage.ets", line: 587, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            philosopher,
                            question: `${dilemma.title(this.en)}：${dilemma.question(this.en)}`,
                            userChoice: PhilosophyChoice.UNCERTAIN,
                            userReason: this.messages.filter((m: DMMessage) => m.role === 'user').map((m: DMMessage) => m.content).join('\n'),
                            sourceType: 'dilemma'
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        philosopher,
                        question: `${dilemma.title(this.en)}：${dilemma.question(this.en)}`,
                        userChoice: PhilosophyChoice.UNCERTAIN,
                        userReason: this.messages.filter((m: DMMessage) => m.role === 'user').map((m: DMMessage) => m.content).join('\n'),
                        sourceType: 'dilemma'
                    });
                }
            }, { name: "DebateSummarySection" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(595:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.dilemmaContinueWithPhilosopher);
            Button.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(596:9)", "entry");
            Button.layoutWeight(1);
            Button.height(44);
            Button.border({ width: 1, color: ArenaTheme.border, radius: 10 });
            Button.onClick(() => this.resetDiscussion());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.viewMindProfile);
            Button.debugLine("entry/src/main/ets/pages/DilemmaPage.ets(601:9)", "entry");
            Button.layoutWeight(1);
            Button.height(44);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.cyanAccent);
            Button.borderRadius(10);
            Button.onClick(() => {
                this.pageStack.clear();
                this.pageStack.pushPath({ name: AppRoutes.profile() });
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    private formatPeriod(period: number): string {
        if (period < 0) {
            return this.en ? `BCE ${Math.abs(period)}` : `公元前 ${Math.abs(period)}`;
        }
        return this.en ? `CE ${period}` : `公元 ${period}`;
    }
    private changeDilemma(id: string): void {
        this.selectedDilemmaId = id;
        this.selectedOptionId = '';
        this.selectedPhilosopherId = '';
        this.otherPhilosophersVisible = DilemmaPage.OTHER_PEEK;
        this.stage = 'setup';
        this.messages = [];
        this.userInput = '';
        this.canReveal = false;
        this.fullExplanation = '';
    }
    private selectOption(id: string): void {
        this.selectedOptionId = id;
        this.selectedPhilosopherId = '';
        this.otherPhilosophersVisible = DilemmaPage.OTHER_PEEK;
        this.stage = 'setup';
        this.messages = [];
        this.userInput = '';
        this.canReveal = false;
        this.fullExplanation = '';
    }
    private choosePhilosopher(p: Philosopher): void {
        const opt = this.selectedOption;
        if (!opt) {
            return;
        }
        this.selectedPhilosopherId = p.id;
        this.messages = [
            new DMMessage(`judge-open-${Date.now()}`, 'judge', localeStore.L.dilemmaJudgeOpening(opt.label(this.en)))
        ];
        this.userInput = '';
        this.canReveal = false;
        this.fullExplanation = '';
        this.stage = 'debate';
    }
    private resetDiscussion(): void {
        this.stage = 'setup';
        this.selectedPhilosopherId = '';
        this.messages = [];
        this.userInput = '';
        this.canReveal = false;
        this.fullExplanation = '';
    }
    private historyBlock(msgs: DMMessage[], displayName: string): string {
        return msgs.map((m: DMMessage) => {
            let speaker = localeStore.L.user;
            if (m.role === 'judge') {
                speaker = localeStore.L.judge;
            }
            else if (m.role === 'philosopher') {
                speaker = displayName;
            }
            return `${speaker}：${m.content}`;
        }).join('\n');
    }
    private async handleUserTurn(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher): Promise<void> {
        const content = this.userInput.trim();
        if (!content || this.isThinking) {
            return;
        }
        this.userInput = '';
        this.isThinking = true;
        this.thinkingRole = null;
        const userMsgId = `u-${Date.now()}`;
        const userMsg = new DMMessage(userMsgId, 'user', content);
        let next = this.messages.concat([userMsg]);
        this.messages = next;
        const localeCode = this.en ? 'en' : 'zh';
        const keyIdeas = philosopher.keyIdeas.join(this.en ? ', ' : '、');
        const summary = philosopher.summary ?? '';
        const displayName = philosopherDisplayName(philosopher, this.en);
        const userStance = option.stancePrompt(this.en);
        const streamPhilosopher = async (mode: string, prior: DMMessage[]): Promise<DMMessage> => {
            const msgId = `${mode}-${Date.now()}`;
            let row = new DMMessage(msgId, 'philosopher', '');
            this.thinkingRole = 'philosopher';
            this.messages = prior.concat([row]);
            const hist = this.historyBlock(prior, displayName);
            const onDelta = (_d: string, acc: string) => {
                row = new DMMessage(msgId, 'philosopher', dmStreamDisplay(acc));
                this.messages = prior.concat([row]);
            };
            const resp = mode === 'to-user'
                ? await ArenaAPI.streamDilemmaPhilosopherToUser(dilemma.title(false), dilemma.title(true), dilemma.question(false), dilemma.promptLead(false), userStance, philosopher.id, displayName, philosopher.school, keyIdeas, summary, hist, localeCode, onDelta)
                : await ArenaAPI.streamDilemmaPhilosopherToJudge(dilemma.title(false), dilemma.title(true), dilemma.question(false), dilemma.promptLead(false), userStance, philosopher.id, displayName, philosopher.school, keyIdeas, summary, hist, localeCode, onDelta);
            const final = dmStreamDisplay(resp.text);
            if (!final) {
                throw new Error(localeStore.L.topicBadJson);
            }
            const done = new DMMessage(msgId, 'philosopher', final);
            this.messages = prior.concat([done]);
            return done;
        };
        const streamJudge = async (prior: DMMessage[]): Promise<JudgeStreamOutcome> => {
            const msgId = `judge-${Date.now()}`;
            let row = new DMMessage(msgId, 'judge', '');
            this.thinkingRole = 'judge';
            this.messages = prior.concat([row]);
            const hist = this.historyBlock(prior, displayName);
            const onDelta = (_d: string, acc: string) => {
                row = new DMMessage(msgId, 'judge', dmJudgeStreamDisplay(acc));
                this.messages = prior.concat([row]);
            };
            const resp = await ArenaAPI.streamDilemmaJudgeStep(dilemma.title(false), dilemma.title(true), dilemma.question(false), dilemma.promptLead(false), userStance, displayName, philosopher.school, hist, localeCode, onDelta);
            if (!resp.philosophyJudge) {
                throw new Error(localeStore.L.topicBadJson);
            }
            const judge = new JudgeStepResult(resp.philosophyJudge.judgeSpeaks, resp.philosophyJudge.judgeMessage, resp.philosophyJudge.addressTo ?? null, resp.philosophyJudge.continueDebate);
            if (judge.judgeSpeaks && judge.judgeMessage.length > 0) {
                const final = dmJudgeStreamDisplay(resp.text).length === 0 ? judge.judgeMessage : dmJudgeStreamDisplay(resp.text);
                const done = new DMMessage(msgId, 'judge', final);
                this.messages = prior.concat([done]);
                return new JudgeStreamOutcome(judge, done);
            }
            this.messages = prior;
            return new JudgeStreamOutcome(judge, null);
        };
        try {
            const philToUser = await streamPhilosopher('to-user', next);
            let working = next.concat([philToUser]);
            const judgeResult = await streamJudge(working);
            if (judgeResult.judgeMsg) {
                working = working.concat([judgeResult.judgeMsg]);
            }
            if (judgeResult.judge.judgeSpeaks && judgeResult.judge.addressTo === 'philosopher') {
                const philToJudge = await streamPhilosopher('to-judge', working);
                working = working.concat([philToJudge]);
                this.messages = working;
            }
            this.canReveal = judgeResult.judge.continueDebate === false;
        }
        catch (e) {
            this.messages = this.messages.filter((m: DMMessage) => m.id !== userMsgId);
            this.userInput = content;
            this.errorAlert = (e as Error).message ?? String(e);
            this.showErrorDialog = true;
        }
        this.isThinking = false;
        this.thinkingRole = null;
    }
    private buildDilemmaProfileI18n(dilemma: MoralDilemma, option: MoralDilemmaOption, summaryText: string, enSummary: string | undefined, zhSummary: string | undefined): Record<string, Object> {
        const enEntry: Record<string, Object> = {};
        enEntry['topic'] = dilemma.title(true);
        enEntry['userChoice'] = option.label(true);
        enEntry['judgeSummary'] = enSummary ?? summaryText;
        const zhEntry: Record<string, Object> = {};
        zhEntry['topic'] = dilemma.title(false);
        zhEntry['userChoice'] = option.label(false);
        zhEntry['judgeSummary'] = zhSummary ?? summaryText;
        const out: Record<string, Object> = {};
        out['en'] = enEntry;
        out['zh'] = zhEntry;
        return out;
    }
    private async handleReveal(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher): Promise<void> {
        this.stage = 'reveal';
        this.isGeneratingSummary = true;
        this.fullExplanation = '';
        const history = this.messages.map((m: DMMessage) => {
            let speaker = localeStore.L.user;
            if (m.role === 'judge') {
                speaker = localeStore.L.judge;
            }
            else if (m.role === 'philosopher') {
                speaker = philosopherDisplayName(philosopher, this.en);
            }
            return `${speaker}：${m.content}`;
        }).join('\n');
        try {
            const resp = await ArenaAPI.dilemmaSummary(dilemma.title(false), dilemma.question(false), option.stancePrompt(false), philosopher.nameCN, philosopher.school, history, (_d: string, acc: string) => { this.fullExplanation = acc; });
            const summaryText = resp.dilemmaSummary?.pick(this.en)
                ?? JsonPayload.parse<DilemmaSummaryDTO>(resp.text)?.fullExplanation;
            if (summaryText && summaryText.length > 0) {
                this.fullExplanation = summaryText;
                if (AuthStore.bearerToken) {
                    ArenaAPI.saveBattleRecord('dilemma', dilemma.title(this.en), option.label(this.en), summaryText, false, undefined, this.buildDilemmaProfileI18n(dilemma, option, summaryText, resp.dilemmaSummary?.pick(true), resp.dilemmaSummary?.pick(false))).catch(() => { });
                }
            }
            else {
                this.errorAlert = localeStore.L.topicBadJson;
                this.showErrorDialog = true;
            }
        }
        catch (e) {
            this.errorAlert = (e as Error).message ?? String(e);
            this.showErrorDialog = true;
        }
        this.isGeneratingSummary = false;
    }
    rerender() {
        this.updateDirtyElements();
    }
}
