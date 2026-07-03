if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PhilosophyBattlePage_Params {
    pageStack?: NavPathStack;
    philosopherId?: string;
    stage?: PBStage;
    choice?: PhilosophyChoice | null;
    topic?: DebateTopicContent | null;
    topicLoadError?: string;
    isTopicLoading?: boolean;
    topicRetryNonce?: number;
    messages?: PBMessage[];
    userInput?: string;
    isThinking?: boolean;
    thinkingRole?: PBThinkingRole | null;
    canReveal?: boolean;
    fullExplanation?: string;
    isGeneratingSummary?: boolean;
    errorAlert?: string;
    showErrorDialog?: boolean;
    scroller?: Scroller;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import type { DebateTopicContent, Philosopher } from '../common/ArenaModels';
import { PhilosophyChoice, philosopherDisplayName } from "@bundle:com.hackastone.arena/entry/ets/l10n/ArenaL10n";
import { JsonPayload } from "@bundle:com.hackastone.arena/entry/ets/common/JsonPayload";
import { ArenaAPI } from "@bundle:com.hackastone.arena/entry/ets/api/ArenaAPI";
import { AppRoutes } from "@bundle:com.hackastone.arena/entry/ets/route/AppRoutes";
import { catalogStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { AuthStore } from "@bundle:com.hackastone.arena/entry/ets/store/AuthStore";
import { DebateSummarySection } from "@bundle:com.hackastone.arena/entry/ets/components/DebateSummarySection";
type PBStage = 'topic' | 'choose' | 'debate' | 'reveal';
type PBMessageRole = 'user' | 'philosopher' | 'judge';
type PBThinkingRole = 'philosopher' | 'judge';
class PBMessage {
    id: string = '';
    role: PBMessageRole = 'user';
    content: string = '';
    constructor(id: string, role: PBMessageRole, content: string) {
        this.id = id;
        this.role = role;
        this.content = content;
    }
    withContent(nextContent: string): PBMessage {
        return new PBMessage(this.id, this.role, nextContent);
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
    judgeMsg: PBMessage | null;
    constructor(judge: JudgeStepResult, judgeMsg: PBMessage | null) {
        this.judge = judge;
        this.judgeMsg = judgeMsg;
    }
}
interface RTContentPayload {
    content?: string;
}
interface SummaryOnly {
    fullExplanation?: string;
}
function streamDisplay(acc: string): string {
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
function judgeStreamDisplay(acc: string): string {
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
export class PhilosophyBattlePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.__philosopherId = new SynchedPropertySimpleOneWayPU(params.philosopherId, this, "philosopherId");
        this.__stage = new ObservedPropertySimplePU('topic', this, "stage");
        this.__choice = new ObservedPropertySimplePU(null, this, "choice");
        this.__topic = new ObservedPropertyObjectPU(null, this, "topic");
        this.__topicLoadError = new ObservedPropertySimplePU('', this, "topicLoadError");
        this.__isTopicLoading = new ObservedPropertySimplePU(false, this, "isTopicLoading");
        this.__topicRetryNonce = new ObservedPropertySimplePU(0, this, "topicRetryNonce");
        this.__messages = new ObservedPropertyObjectPU([], this, "messages");
        this.__userInput = new ObservedPropertySimplePU('', this, "userInput");
        this.__isThinking = new ObservedPropertySimplePU(false, this, "isThinking");
        this.__thinkingRole = new ObservedPropertySimplePU(null, this, "thinkingRole");
        this.__canReveal = new ObservedPropertySimplePU(false, this, "canReveal");
        this.__fullExplanation = new ObservedPropertySimplePU('', this, "fullExplanation");
        this.__isGeneratingSummary = new ObservedPropertySimplePU(false, this, "isGeneratingSummary");
        this.__errorAlert = new ObservedPropertySimplePU('', this, "errorAlert");
        this.__showErrorDialog = new ObservedPropertySimplePU(false, this, "showErrorDialog");
        this.scroller = new Scroller();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PhilosophyBattlePage_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
        if (params.philosopherId === undefined) {
            this.__philosopherId.set('');
        }
        if (params.stage !== undefined) {
            this.stage = params.stage;
        }
        if (params.choice !== undefined) {
            this.choice = params.choice;
        }
        if (params.topic !== undefined) {
            this.topic = params.topic;
        }
        if (params.topicLoadError !== undefined) {
            this.topicLoadError = params.topicLoadError;
        }
        if (params.isTopicLoading !== undefined) {
            this.isTopicLoading = params.isTopicLoading;
        }
        if (params.topicRetryNonce !== undefined) {
            this.topicRetryNonce = params.topicRetryNonce;
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
        if (params.scroller !== undefined) {
            this.scroller = params.scroller;
        }
    }
    updateStateVars(params: PhilosophyBattlePage_Params) {
        this.__pageStack.reset(params.pageStack);
        this.__philosopherId.reset(params.philosopherId);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
        this.__philosopherId.purgeDependencyOnElmtId(rmElmtId);
        this.__stage.purgeDependencyOnElmtId(rmElmtId);
        this.__choice.purgeDependencyOnElmtId(rmElmtId);
        this.__topic.purgeDependencyOnElmtId(rmElmtId);
        this.__topicLoadError.purgeDependencyOnElmtId(rmElmtId);
        this.__isTopicLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__topicRetryNonce.purgeDependencyOnElmtId(rmElmtId);
        this.__messages.purgeDependencyOnElmtId(rmElmtId);
        this.__userInput.purgeDependencyOnElmtId(rmElmtId);
        this.__isThinking.purgeDependencyOnElmtId(rmElmtId);
        this.__thinkingRole.purgeDependencyOnElmtId(rmElmtId);
        this.__canReveal.purgeDependencyOnElmtId(rmElmtId);
        this.__fullExplanation.purgeDependencyOnElmtId(rmElmtId);
        this.__isGeneratingSummary.purgeDependencyOnElmtId(rmElmtId);
        this.__errorAlert.purgeDependencyOnElmtId(rmElmtId);
        this.__showErrorDialog.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        this.__philosopherId.aboutToBeDeleted();
        this.__stage.aboutToBeDeleted();
        this.__choice.aboutToBeDeleted();
        this.__topic.aboutToBeDeleted();
        this.__topicLoadError.aboutToBeDeleted();
        this.__isTopicLoading.aboutToBeDeleted();
        this.__topicRetryNonce.aboutToBeDeleted();
        this.__messages.aboutToBeDeleted();
        this.__userInput.aboutToBeDeleted();
        this.__isThinking.aboutToBeDeleted();
        this.__thinkingRole.aboutToBeDeleted();
        this.__canReveal.aboutToBeDeleted();
        this.__fullExplanation.aboutToBeDeleted();
        this.__isGeneratingSummary.aboutToBeDeleted();
        this.__errorAlert.aboutToBeDeleted();
        this.__showErrorDialog.aboutToBeDeleted();
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
    private __philosopherId: SynchedPropertySimpleOneWayPU<string>;
    get philosopherId() {
        return this.__philosopherId.get();
    }
    set philosopherId(newValue: string) {
        this.__philosopherId.set(newValue);
    }
    private __stage: ObservedPropertySimplePU<PBStage>;
    get stage() {
        return this.__stage.get();
    }
    set stage(newValue: PBStage) {
        this.__stage.set(newValue);
    }
    private __choice: ObservedPropertySimplePU<PhilosophyChoice | null>;
    get choice() {
        return this.__choice.get();
    }
    set choice(newValue: PhilosophyChoice | null) {
        this.__choice.set(newValue);
    }
    private __topic: ObservedPropertyObjectPU<DebateTopicContent | null>;
    get topic() {
        return this.__topic.get();
    }
    set topic(newValue: DebateTopicContent | null) {
        this.__topic.set(newValue);
    }
    private __topicLoadError: ObservedPropertySimplePU<string>;
    get topicLoadError() {
        return this.__topicLoadError.get();
    }
    set topicLoadError(newValue: string) {
        this.__topicLoadError.set(newValue);
    }
    private __isTopicLoading: ObservedPropertySimplePU<boolean>;
    get isTopicLoading() {
        return this.__isTopicLoading.get();
    }
    set isTopicLoading(newValue: boolean) {
        this.__isTopicLoading.set(newValue);
    }
    private __topicRetryNonce: ObservedPropertySimplePU<number>;
    get topicRetryNonce() {
        return this.__topicRetryNonce.get();
    }
    set topicRetryNonce(newValue: number) {
        this.__topicRetryNonce.set(newValue);
    }
    private __messages: ObservedPropertyObjectPU<PBMessage[]>;
    get messages() {
        return this.__messages.get();
    }
    set messages(newValue: PBMessage[]) {
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
    private __thinkingRole: ObservedPropertySimplePU<PBThinkingRole | null>;
    get thinkingRole() {
        return this.__thinkingRole.get();
    }
    set thinkingRole(newValue: PBThinkingRole | null) {
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
    private scroller: Scroller;
    aboutToAppear(): void {
        const p = this.philosopher;
        if (p) {
            this.loadTopic(p);
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(135:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(ArenaTheme.background);
            Column.bindContentCover(this.showErrorDialog, { builder: () => {
                    this.errorDialog.call(this);
                } }, {
                modalTransition: ModalTransition.DEFAULT,
                onDisappear: () => { this.showErrorDialog = false; }
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.philosopher) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create(this.scroller);
                        Scroll.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(137:9)", "entry");
                        Scroll.layoutWeight(1);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 20 });
                        Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(138:11)", "entry");
                        Column.padding({ left: 16, right: 16, bottom: 32, top: 16 });
                        Column.width('100%');
                    }, Column);
                    this.battleHeader.bind(this)(this.philosopher!);
                    this.content.bind(this)(this.philosopher!);
                    Column.pop();
                    Scroll.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.missing.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    errorDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(161:5)", "entry");
            Column.padding(24);
            Column.backgroundColor(ArenaTheme.surface);
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.apiRequestFailedTitle);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(162:7)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.errorAlert);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(163:7)", "entry");
            Text.fontSize(14);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.alertConfirm);
            Button.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(164:7)", "entry");
            Button.onClick(() => {
                this.showErrorDialog = false;
                this.errorAlert = '';
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    missing(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(177:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.philosopherMissing);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(178:7)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.backToPhilosophyHome);
            Button.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(179:7)", "entry");
            Button.backgroundColor(ArenaTheme.purpleAccent);
            Button.fontColor(Color.White);
            Button.onClick(() => this.pageStack.clear());
        }, Button);
        Button.pop();
        Column.pop();
    }
    battleHeader(philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(191:5)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({ type: ButtonType.Normal });
            Button.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(192:7)", "entry");
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => this.pageStack.clear());
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(193:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(194:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.backToMap);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(195:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(200:7)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(201:7)", "entry");
            Column.alignItems(HorizontalAlign.End);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(philosopherDisplayName(philosopher, localeStore.L.prefersEnglish));
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(202:9)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(philosopher.school);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(206:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
    }
    content(philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.stage === 'topic') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.topicStage.bind(this)(philosopher);
                });
            }
            else if (this.stage === 'choose') {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.chooseStage.bind(this)();
                });
            }
            else if (this.stage === 'debate') {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.debateStage.bind(this)(philosopher);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(3, () => {
                    this.revealStage.bind(this)(philosopher);
                });
            }
        }, If);
        If.pop();
    }
    topicStage(philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isTopicLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 12 });
                        Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(229:7)", "entry");
                        Column.width('100%');
                        Column.padding({ top: 40, bottom: 40 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(230:9)", "entry");
                        LoadingProgress.color(ArenaTheme.purpleAccent);
                    }, LoadingProgress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.tablePreparing);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(231:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else if (this.topicLoadError) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 16 });
                        Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(236:7)", "entry");
                        Column.width('100%');
                        Column.padding({ top: 24, bottom: 24 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.topicLoadError);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(237:9)", "entry");
                        Text.fontSize(14);
                        Text.fontColor('#EF4444E6');
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(localeStore.L.topicRetry);
                        Button.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(238:9)", "entry");
                        Button.backgroundColor(ArenaTheme.purpleAccent);
                        Button.fontColor(Color.White);
                        Button.onClick(() => {
                            this.topicRetryNonce++;
                            this.loadTopic(philosopher);
                        });
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            else if (this.topic) {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 20 });
                        Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(249:7)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.width('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.currentDebateTopic);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(250:9)", "entry");
                        Text.fontSize(12);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#A855F7E6');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.topic.question);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(254:9)", "entry");
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(ArenaTheme.textPrimary);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.agentDisclaimer);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(258:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create({ space: 14 });
                        Row.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(259:9)", "entry");
                        Row.width('100%');
                        Row.alignItems(VerticalAlign.Top);
                    }, Row);
                    this.topicCard.bind(this)(localeStore.L.philosopherStanceTitle(philosopherDisplayName(philosopher, localeStore.L.prefersEnglish)), this.topic.philosopherView, true);
                    this.topicCard.bind(this)(localeStore.L.oppositeStance, this.topic.oppositeView, false);
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(localeStore.L.startDebate);
                        Button.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(269:9)", "entry");
                        Button.width('100%');
                        Button.height(48);
                        Button.fontSize(16);
                        Button.fontWeight(FontWeight.Bold);
                        Button.fontColor(Color.White);
                        Button.backgroundColor(ArenaTheme.purpleAccent);
                        Button.borderRadius(12);
                        Button.onClick(() => { this.stage = 'choose'; });
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(3, () => {
                });
            }
        }, If);
        If.pop();
    }
    topicCard(title: string, text: string, accent: boolean, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(286:5)", "entry");
            Column.padding(16);
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({
                width: 2,
                color: accent ? '#A855F773' : ArenaTheme.border,
                radius: 14
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(287:7)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(accent ? ArenaTheme.purpleAccent : ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(text);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(291:7)", "entry");
            Text.fontSize(14);
            Text.fontColor('#D1D5DB');
        }, Text);
        Text.pop();
        Column.pop();
    }
    chooseStage(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 18 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(306:5)", "entry");
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.yourStanceQuestion);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(307:7)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.debateFlowHint);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(308:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(309:7)", "entry");
            Row.width('100%');
        }, Row);
        this.chooseButton.bind(this)(localeStore.L.agree, true, () => this.handleChoose(PhilosophyChoice.AGREE));
        this.chooseButton.bind(this)(localeStore.L.disagree, false, () => this.handleChoose(PhilosophyChoice.DISAGREE));
        this.chooseButton.bind(this)(localeStore.L.uncertain, false, () => this.handleChoose(PhilosophyChoice.UNCERTAIN));
        Row.pop();
        Column.pop();
    }
    chooseButton(label: string, accent: boolean, action: () => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(320:5)", "entry");
            Text.padding(24);
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
            Text.fontColor(ArenaTheme.textPrimary);
            Text.backgroundColor(accent ? '#A855F726' : ArenaTheme.surface);
            Text.border({
                width: 2,
                color: accent ? ArenaTheme.purpleAccent : ArenaTheme.border,
                radius: 14
            });
            Text.onClick(action);
        }, Text);
        Text.pop();
    }
    debateStage(philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!this.topic) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.topicGenerating);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(337:7)", "entry");
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.debateStageContent.bind(this)(philosopher);
                });
            }
        }, If);
        If.pop();
    }
    debateStageContent(philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 0 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(345:5)", "entry");
            Column.width('100%');
            Column.backgroundColor(ArenaTheme.surface);
            Column.borderRadius(12);
            Column.border({ width: 1, color: ArenaTheme.border });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.topic) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 4 });
                        Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(347:9)", "entry");
                        Column.alignItems(HorizontalAlign.Start);
                        Column.width('100%');
                        Column.padding(12);
                        Column.backgroundColor(ArenaTheme.background);
                        Column.border({ width: { bottom: 1 }, color: ArenaTheme.border });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.currentDebateTopic);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(348:11)", "entry");
                        Text.fontSize(11);
                        Text.fontColor('#A855F7E6');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.topic!.question);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(349:11)", "entry");
                        Text.fontSize(14);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor(ArenaTheme.textPrimary);
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
            Scroll.create();
            Scroll.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(361:7)", "entry");
            Scroll.constraintSize({ maxHeight: 420 });
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 14 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(362:9)", "entry");
            Column.padding(12);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 6 });
            Row.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(363:11)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('⚠');
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(364:13)", "entry");
            Text.fontSize(12);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.debateRoundHint);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(365:13)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const m = _item;
                this.messageBubble.bind(this)(m, philosopher);
            };
            this.forEachUpdateFunction(elmtId, this.messages, forEachItemGenFunction, (m: PBMessage) => m.id, false, false);
        }, ForEach);
        ForEach.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isThinking && this.thinkingRole === 'judge') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.judgeThinking);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(371:13)", "entry");
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
        Scroll.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(379:7)", "entry");
            Column.padding(12);
            Column.width('100%');
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: { top: 1 }, color: ArenaTheme.border });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(380:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: localeStore.L.continueYourThought, text: this.userInput });
            TextInput.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(381:11)", "entry");
            TextInput.layoutWeight(1);
            TextInput.fontColor(ArenaTheme.textPrimary);
            TextInput.enabled(!this.isThinking);
            TextInput.onChange((v: string) => { this.userInput = v; });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('💬');
            Button.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(386:11)", "entry");
            Button.enabled(this.userInput.trim().length > 0 && !this.isThinking && this.choice !== null);
            Button.onClick(() => { this.handleUserTurn(philosopher); });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.goToSummary);
            Button.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(390:9)", "entry");
            Button.width('100%');
            Button.height(44);
            Button.fontColor(Color.Black);
            Button.backgroundColor('#FACC15D9');
            Button.borderRadius(10);
            Button.enabled((this.canReveal || this.messages.length >= 4) && this.choice !== null);
            Button.onClick(() => { this.handleReveal(philosopher); });
        }, Button);
        Button.pop();
        Column.pop();
        Column.pop();
    }
    messageBubble(m: PBMessage, philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 6 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(412:5)", "entry");
            Column.padding(12);
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(this.messageBg(m.role));
            Column.border({ width: 1, color: this.messageBorder(m.role), radius: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.messageLabel(m.role, philosopher));
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(413:7)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isThinking && this.thinkingRole === 'philosopher' && m.role === 'philosopher'
                && m.id.startsWith('to-') && m.content.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.philosopherThinking(philosopherDisplayName(philosopher, localeStore.L.prefersEnglish)));
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(418:9)", "entry");
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
                        Text.create(m.content);
                        Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(423:9)", "entry");
                        Text.fontSize(14);
                        Text.fontColor(ArenaTheme.textPrimary);
                    }, Text);
                    Text.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    revealStage(philosopher: Philosopher, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 14 });
            Column.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(435:5)", "entry");
            Column.padding(18);
            Column.width('100%');
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: 1, color: ArenaTheme.border, radius: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.fullAnalysis);
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(436:7)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.isGeneratingSummary ? localeStore.L.agentGeneratingSummary
                : (this.fullExplanation.length === 0 ? localeStore.L.summaryMissing : this.fullExplanation));
            Text.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(437:7)", "entry");
            Text.fontSize(16);
            Text.fontColor('#D1D5DB');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.topic) {
                this.ifElseBranchUpdateFunction(0, () => {
                    {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            if (isInitialRender) {
                                let componentCall = new DebateSummarySection(this, {
                                    philosopher,
                                    question: this.topic.question,
                                    userChoice: this.choice,
                                    userReason: this.messages.filter((m: PBMessage) => m.role === 'user').map((m: PBMessage) => m.content).join('\n')
                                }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/PhilosophyBattlePage.ets", line: 442, col: 9 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {
                                        philosopher,
                                        question: this.topic.question,
                                        userChoice: this.choice,
                                        userReason: this.messages.filter((m: PBMessage) => m.role === 'user').map((m: PBMessage) => m.content).join('\n')
                                    };
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                this.updateStateVarsOfChildByElmtId(elmtId, {
                                    philosopher,
                                    question: this.topic.question,
                                    userChoice: this.choice,
                                    userReason: this.messages.filter((m: PBMessage) => m.role === 'user').map((m: PBMessage) => m.content).join('\n')
                                });
                            }
                        }, { name: "DebateSummarySection" });
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(449:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.backToMap);
            Button.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(450:9)", "entry");
            Button.layoutWeight(1);
            Button.height(44);
            Button.border({ width: 1, color: ArenaTheme.border, radius: 10 });
            Button.onClick(() => this.pageStack.clear());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.viewMindProfile);
            Button.debugLine("entry/src/main/ets/pages/PhilosophyBattlePage.ets(455:9)", "entry");
            Button.layoutWeight(1);
            Button.height(44);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.purpleAccent);
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
    private messageLabel(role: PBMessageRole, philosopher: Philosopher): string {
        if (role === 'user') {
            return localeStore.L.you;
        }
        if (role === 'philosopher') {
            return philosopherDisplayName(philosopher, localeStore.L.prefersEnglish);
        }
        return localeStore.L.judge;
    }
    private messageBorder(role: PBMessageRole): ResourceColor {
        if (role === 'user') {
            return '#A855F799';
        }
        if (role === 'judge') {
            return '#FACC1573';
        }
        return ArenaTheme.border;
    }
    private messageBg(role: PBMessageRole): ResourceColor {
        if (role === 'user') {
            return '#A855F71F';
        }
        if (role === 'judge') {
            return '#FACC1514';
        }
        return ArenaTheme.surface;
    }
    private recordMessageRole(m: PBMessage): string {
        if (m.role === 'user') {
            return 'user';
        }
        if (m.role === 'philosopher') {
            return 'philosopher';
        }
        return 'judge';
    }
    private toRecordMessage(m: PBMessage): Record<string, string> {
        const out: Record<string, string> = {};
        out['role'] = this.recordMessageRole(m);
        out['content'] = m.content;
        return out;
    }
    private handleChoose(c: PhilosophyChoice): void {
        this.choice = c;
        this.stage = 'debate';
        this.canReveal = false;
        this.messages = [
            new PBMessage(`${Date.now()}`, 'judge', localeStore.L.judgeOpeningAfterChoice(localeStore.L.choiceDisplay(c)))
        ];
    }
    private async loadTopic(philosopher: Philosopher): Promise<void> {
        this.isTopicLoading = true;
        this.topicLoadError = '';
        try {
            const resp = await ArenaAPI.generateTopic(philosopher.nameCN, philosopher.school, philosopher.keyIdeas, localeStore.L.prefersEnglish ? 'en' : 'zh');
            const parsed = resp.debateTopic ?? JsonPayload.parse<DebateTopicContent>(resp.text);
            if (parsed && parsed.question && parsed.philosopherView && parsed.oppositeView) {
                this.topic = parsed;
                this.fullExplanation = parsed.fullExplanation ?? '';
                this.topicLoadError = '';
            }
            else {
                throw new Error(localeStore.L.topicBadJson);
            }
        }
        catch (e) {
            this.topic = null;
            this.topicLoadError = (e as Error).message ?? String(e);
        }
        this.isTopicLoading = false;
    }
    private choiceLabel(c: PhilosophyChoice): string {
        return c;
    }
    private historyBlock(msgs: PBMessage[], philosopher: Philosopher): string {
        const top = this.topic!;
        const lines = msgs.map((m: PBMessage) => {
            let who = localeStore.L.user;
            if (m.role === 'judge') {
                who = localeStore.L.judge;
            }
            else if (m.role === 'philosopher') {
                who = philosopherDisplayName(philosopher, localeStore.L.prefersEnglish);
            }
            return `${who}：${m.content}`;
        }).join('\n');
        return `辩题：${top.question}\n哲学家：${philosopher.nameCN}（${philosopher.school}）\n用户立场：${this.choiceLabel(this.choice!)}\n历史：\n${lines}`;
    }
    private async handleUserTurn(philosopher: Philosopher): Promise<void> {
        const content = this.userInput.trim();
        if (!content || !this.choice || !this.topic || this.isThinking) {
            return;
        }
        const userRowId = `${Date.now()}-user`;
        this.userInput = '';
        this.isThinking = true;
        const userMsg = new PBMessage(userRowId, 'user', content);
        let next = this.messages.concat([userMsg]);
        this.messages = next;
        const localeCode = localeStore.L.prefersEnglish ? 'en' : 'zh';
        const keyIdeas = philosopher.keyIdeas.join('。');
        const summary = philosopher.summary ?? '';
        const userStance = this.choiceLabel(this.choice);
        const streamPhilosopher = async (mode: string, prior: PBMessage[]): Promise<PBMessage> => {
            const msgId = `${mode}-${Date.now()}`;
            let row = new PBMessage(msgId, 'philosopher', '');
            this.thinkingRole = 'philosopher';
            this.messages = prior.concat([row]);
            const hist = this.historyBlock(prior, philosopher);
            const onDelta = (_d: string, acc: string) => {
                row = new PBMessage(msgId, 'philosopher', streamDisplay(acc));
                this.messages = prior.concat([row]);
            };
            const resp = mode === 'to-user'
                ? await ArenaAPI.streamPhilosophyPhilosopherToUser(this.topic!.question, philosopher.id, philosopherDisplayName(philosopher, localeStore.L.prefersEnglish), philosopher.school, keyIdeas, summary, userStance, hist, localeCode, onDelta)
                : await ArenaAPI.streamPhilosophyPhilosopherToJudge(this.topic!.question, philosopher.id, philosopherDisplayName(philosopher, localeStore.L.prefersEnglish), philosopher.school, keyIdeas, summary, userStance, hist, localeCode, onDelta);
            const final = streamDisplay(resp.text);
            if (!final) {
                throw new Error('empty response');
            }
            const done = new PBMessage(msgId, 'philosopher', final);
            this.messages = prior.concat([done]);
            return done;
        };
        const streamJudge = async (prior: PBMessage[]): Promise<JudgeStreamOutcome> => {
            const msgId = `judge-${Date.now()}`;
            let row = new PBMessage(msgId, 'judge', '');
            this.thinkingRole = 'judge';
            this.messages = prior.concat([row]);
            const hist = this.historyBlock(prior, philosopher);
            const onDelta = (_d: string, acc: string) => {
                row = new PBMessage(msgId, 'judge', judgeStreamDisplay(acc));
                this.messages = prior.concat([row]);
            };
            const resp = await ArenaAPI.streamPhilosophyJudgeStep(this.topic!.question, philosopherDisplayName(philosopher, localeStore.L.prefersEnglish), philosopher.school, userStance, hist, localeCode, onDelta);
            if (!resp.philosophyJudge) {
                throw new Error(localeStore.L.topicBadJson);
            }
            const judge = new JudgeStepResult(resp.philosophyJudge.judgeSpeaks, resp.philosophyJudge.judgeMessage, resp.philosophyJudge.addressTo ?? null, resp.philosophyJudge.continueDebate);
            if (judge.judgeSpeaks && judge.judgeMessage.length > 0) {
                const final = judgeStreamDisplay(resp.text).length === 0 ? judge.judgeMessage : judgeStreamDisplay(resp.text);
                const done = new PBMessage(msgId, 'judge', final);
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
            this.messages = this.messages.filter((m: PBMessage) => m.id !== userRowId);
            this.userInput = content;
            this.errorAlert = (e as Error).message ?? String(e);
            this.showErrorDialog = true;
        }
        this.isThinking = false;
        this.thinkingRole = null;
    }
    private async handleReveal(philosopher: Philosopher): Promise<void> {
        if (!this.choice || !this.topic) {
            return;
        }
        this.stage = 'reveal';
        this.isGeneratingSummary = true;
        this.fullExplanation = '';
        const history = this.messages.map((m: PBMessage) => {
            let who = localeStore.L.user;
            if (m.role === 'judge') {
                who = localeStore.L.judge;
            }
            else if (m.role === 'philosopher') {
                who = philosopherDisplayName(philosopher, localeStore.L.prefersEnglish);
            }
            return `${who}：${m.content}`;
        }).join('\n');
        const summaryQuery = `[ROLE]\nCA-Echo-LLM\n\n[TASK]\n根据辩论历史生成完整总结解释。\n\n[RETURN_FORMAT]\njson\n\n[CONSTRAINTS]\n中文；仅返回 JSON；内容有层次\n\n[ACCEPTANCE_CRITERIA]\n返回 fullExplanation 字段\n\n辩题：${this.topic.question}\n哲学家：${philosopher.nameCN}\n用户立场：${this.choiceLabel(this.choice)}\n历史：\n${history}`;
        try {
            const resp = await ArenaAPI.runEcho(summaryQuery);
            const parsed = JsonPayload.parse<SummaryOnly>(resp.text);
            if (parsed?.fullExplanation && parsed.fullExplanation.length > 0) {
                this.fullExplanation = parsed.fullExplanation;
                if (AuthStore.bearerToken && this.topic) {
                    const choiceText = localeStore.L.choiceDisplay(this.choice);
                    ArenaAPI.saveBattleRecord('philosophy', this.topic.question, choiceText, parsed.fullExplanation, false, this.messages.map((m: PBMessage) => this.toRecordMessage(m))).catch(() => { });
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
