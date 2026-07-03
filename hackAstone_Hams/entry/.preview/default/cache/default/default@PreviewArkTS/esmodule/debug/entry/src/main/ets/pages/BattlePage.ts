if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BattlePage_Params {
    pageStack?: NavPathStack;
    battleId?: string;
    stage?: BattleStage;
    choice?: BattleChoice | null;
    messages?: DisciplineChatMessage[];
    userInput?: string;
    isThinking?: boolean;
    summaryText?: string;
    isGeneratingSummary?: boolean;
    errorMessage?: string;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import type { Battle } from '../common/ArenaModels';
import { ArenaAPI } from "@bundle:com.hackastone.arena/entry/ets/api/ArenaAPI";
import { ArenaBilingualParsing } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaBilingualParsing";
import { AppRoutes } from "@bundle:com.hackastone.arena/entry/ets/route/AppRoutes";
import { catalogStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { AuthStore } from "@bundle:com.hackastone.arena/entry/ets/store/AuthStore";
type BattleChoice = 'builder' | 'breaker' | 'uncertain';
type BattleStage = 'choose' | 'debate' | 'summary';
type DisciplineSpeaker = 'user' | 'builder' | 'breaker';
class DisciplineChatMessage {
    id: string = '';
    speaker: DisciplineSpeaker = 'user';
    content: string = '';
    timestamp: number = 0;
    constructor(id: string, speaker: DisciplineSpeaker, content: string, timestamp: number) {
        this.id = id;
        this.speaker = speaker;
        this.content = content;
        this.timestamp = timestamp;
    }
    withContent(nextContent: string): DisciplineChatMessage {
        return new DisciplineChatMessage(this.id, this.speaker, nextContent, this.timestamp);
    }
}
export class BattlePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__pageStack = new SynchedPropertyObjectOneWayPU(params.pageStack, this, "pageStack");
        this.__battleId = new SynchedPropertySimpleOneWayPU(params.battleId, this, "battleId");
        this.__stage = new ObservedPropertySimplePU('choose', this, "stage");
        this.__choice = new ObservedPropertySimplePU(null, this, "choice");
        this.__messages = new ObservedPropertyObjectPU([], this, "messages");
        this.__userInput = new ObservedPropertySimplePU('', this, "userInput");
        this.__isThinking = new ObservedPropertySimplePU(false, this, "isThinking");
        this.__summaryText = new ObservedPropertySimplePU('', this, "summaryText");
        this.__isGeneratingSummary = new ObservedPropertySimplePU(false, this, "isGeneratingSummary");
        this.__errorMessage = new ObservedPropertySimplePU('', this, "errorMessage");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BattlePage_Params) {
        if (params.pageStack === undefined) {
            this.__pageStack.set(new NavPathStack());
        }
        if (params.battleId === undefined) {
            this.__battleId.set('');
        }
        if (params.stage !== undefined) {
            this.stage = params.stage;
        }
        if (params.choice !== undefined) {
            this.choice = params.choice;
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
        if (params.summaryText !== undefined) {
            this.summaryText = params.summaryText;
        }
        if (params.isGeneratingSummary !== undefined) {
            this.isGeneratingSummary = params.isGeneratingSummary;
        }
        if (params.errorMessage !== undefined) {
            this.errorMessage = params.errorMessage;
        }
    }
    updateStateVars(params: BattlePage_Params) {
        this.__pageStack.reset(params.pageStack);
        this.__battleId.reset(params.battleId);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__pageStack.purgeDependencyOnElmtId(rmElmtId);
        this.__battleId.purgeDependencyOnElmtId(rmElmtId);
        this.__stage.purgeDependencyOnElmtId(rmElmtId);
        this.__choice.purgeDependencyOnElmtId(rmElmtId);
        this.__messages.purgeDependencyOnElmtId(rmElmtId);
        this.__userInput.purgeDependencyOnElmtId(rmElmtId);
        this.__isThinking.purgeDependencyOnElmtId(rmElmtId);
        this.__summaryText.purgeDependencyOnElmtId(rmElmtId);
        this.__isGeneratingSummary.purgeDependencyOnElmtId(rmElmtId);
        this.__errorMessage.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__pageStack.aboutToBeDeleted();
        this.__battleId.aboutToBeDeleted();
        this.__stage.aboutToBeDeleted();
        this.__choice.aboutToBeDeleted();
        this.__messages.aboutToBeDeleted();
        this.__userInput.aboutToBeDeleted();
        this.__isThinking.aboutToBeDeleted();
        this.__summaryText.aboutToBeDeleted();
        this.__isGeneratingSummary.aboutToBeDeleted();
        this.__errorMessage.aboutToBeDeleted();
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
    private __battleId: SynchedPropertySimpleOneWayPU<string>;
    get battleId() {
        return this.__battleId.get();
    }
    set battleId(newValue: string) {
        this.__battleId.set(newValue);
    }
    private __stage: ObservedPropertySimplePU<BattleStage>;
    get stage() {
        return this.__stage.get();
    }
    set stage(newValue: BattleStage) {
        this.__stage.set(newValue);
    }
    private __choice: ObservedPropertySimplePU<BattleChoice | null>;
    get choice() {
        return this.__choice.get();
    }
    set choice(newValue: BattleChoice | null) {
        this.__choice.set(newValue);
    }
    private __messages: ObservedPropertyObjectPU<DisciplineChatMessage[]>;
    get messages() {
        return this.__messages.get();
    }
    set messages(newValue: DisciplineChatMessage[]) {
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
    private __summaryText: ObservedPropertySimplePU<string>;
    get summaryText() {
        return this.__summaryText.get();
    }
    set summaryText(newValue: string) {
        this.__summaryText.set(newValue);
    }
    private __isGeneratingSummary: ObservedPropertySimplePU<boolean>;
    get isGeneratingSummary() {
        return this.__isGeneratingSummary.get();
    }
    set isGeneratingSummary(newValue: boolean) {
        this.__isGeneratingSummary.set(newValue);
    }
    private __errorMessage: ObservedPropertySimplePU<string>;
    get errorMessage() {
        return this.__errorMessage.get();
    }
    set errorMessage(newValue: string) {
        this.__errorMessage.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(59:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor(ArenaTheme.background);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.battle) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.debugLine("entry/src/main/ets/pages/BattlePage.ets(61:9)", "entry");
                        Scroll.layoutWeight(1);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 24 });
                        Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(62:11)", "entry");
                        Column.padding({ left: 16, right: 16, bottom: 32, top: 16 });
                        Column.width('100%');
                    }, Column);
                    this.header.bind(this)(this.battle);
                    this.questionBlock.bind(this)(this.battle);
                    this.builderBreaker.bind(this)(this.battle);
                    this.stageContent.bind(this)(this.battle);
                    Column.pop();
                    Scroll.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.missingBattle.bind(this)();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    missingBattle(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(83:5)", "entry");
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.battleMissing);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(84:7)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.backToDisciplines);
            Button.debugLine("entry/src/main/ets/pages/BattlePage.ets(88:7)", "entry");
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.fontColor(Color.White);
            Button.onClick(() => {
                this.pageStack.clear();
                this.pageStack.pushPath({ name: AppRoutes.disciplines() });
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    header(battle: Battle, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/BattlePage.ets(103:5)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild({ type: ButtonType.Normal });
            Button.debugLine("entry/src/main/ets/pages/BattlePage.ets(104:7)", "entry");
            Button.backgroundColor(Color.Transparent);
            Button.onClick(() => {
                this.pageStack.clear();
                this.pageStack.pushPath({ name: AppRoutes.disciplines() });
            });
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 4 });
            Row.debugLine("entry/src/main/ets/pages/BattlePage.ets(105:9)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('‹');
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(106:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.backToDisciplines);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(107:11)", "entry");
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/pages/BattlePage.ets(115:7)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(battle.category);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(116:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
    }
    questionBlock(battle: Battle, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(126:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.currentDebateTopic);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(127:7)", "entry");
            Text.fontSize(12);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#F97316E6');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(battle.question);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(131:7)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 6 });
            Row.debugLine("entry/src/main/ets/pages/BattlePage.ets(135:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(136:9)", "entry");
            Column.width(6);
            Column.height(6);
            Column.borderRadius(3);
            Column.backgroundColor(ArenaTheme.orangeAccent);
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.battleInProgress);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(137:9)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    builderBreaker(battle: Battle, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 14 });
            Row.debugLine("entry/src/main/ets/pages/BattlePage.ets(146:5)", "entry");
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.stanceCard.bind(this)('Builder', localeStore.L.builderSubtitle, 'B', battle.builderView, '#3B82F6', this.choice === 'builder');
        this.stanceCard.bind(this)('Breaker', localeStore.L.breakerSubtitle, 'B', battle.breakerView, '#EF4444', this.choice === 'breaker');
        Row.pop();
    }
    stanceCard(title: string, subtitle: string, letter: string, text: string, color: string, selected: boolean, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(158:5)", "entry");
            Column.padding(16);
            Column.layoutWeight(1);
            Column.alignItems(HorizontalAlign.Start);
            Column.backgroundColor(selected ? `${color}1F` : ArenaTheme.surface);
            Column.border({
                width: 2,
                color: selected ? color : ArenaTheme.border,
                radius: 14
            });
            Column.borderRadius(14);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/BattlePage.ets(159:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.debugLine("entry/src/main/ets/pages/BattlePage.ets(160:9)", "entry");
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(161:11)", "entry");
            Column.width(40);
            Column.height(40);
            Column.borderRadius(20);
            Column.backgroundColor(`${color}D9`);
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(letter);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(166:11)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(Color.White);
        }, Text);
        Text.pop();
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 2 });
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(171:9)", "entry");
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(172:11)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(subtitle);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(173:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(text);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(177:7)", "entry");
            Text.fontSize(14);
            Text.fontColor('#D1D5DB');
        }, Text);
        Text.pop();
        Column.pop();
    }
    stageContent(battle: Battle, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.stage === 'choose') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.choosePanel.bind(this)();
                });
            }
            else if (this.stage === 'debate') {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.debatePanel.bind(this)(battle);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.summaryPanel.bind(this)(battle);
                });
            }
        }, If);
        If.pop();
    }
    choosePanel(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 14 });
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(204:5)", "entry");
            Column.padding(20);
            Column.width('100%');
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: 1, color: ArenaTheme.border, radius: 14 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.yourStance);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(205:7)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.width('100%');
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.choiceButton.bind(this)(localeStore.L.supportBuilderTitle('Builder'), localeStore.L.supportBuilderSubtitle('Builder'), this.choice === 'builder', () => { this.choice = 'builder'; });
        this.choiceButton.bind(this)(localeStore.L.supportBreakerTitle('Breaker'), localeStore.L.supportBreakerSubtitle('Breaker'), this.choice === 'breaker', () => { this.choice = 'breaker'; });
        this.choiceButton.bind(this)(localeStore.L.uncertainChoiceTitle, localeStore.L.uncertainChoiceSubtitle, this.choice === 'uncertain', () => { this.choice = 'uncertain'; });
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.choice !== null) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(localeStore.L.startDialogue);
                        Button.debugLine("entry/src/main/ets/pages/BattlePage.ets(217:9)", "entry");
                        Button.width('100%');
                        Button.height(48);
                        Button.fontSize(16);
                        Button.fontWeight(FontWeight.Bold);
                        Button.fontColor(Color.White);
                        Button.backgroundColor(ArenaTheme.orangeAccent);
                        Button.borderRadius(12);
                        Button.onClick(() => {
                            this.stage = 'debate';
                            this.messages = [];
                            this.userInput = '';
                            this.summaryText = '';
                            this.errorMessage = '';
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
        Column.pop();
    }
    choiceButton(title: string, subtitle: string, picked: boolean, action: () => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 4 });
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(242:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
            Column.padding(14);
            Column.backgroundColor(picked ? '#F973161F' : ArenaTheme.background);
            Column.border({
                width: 2,
                color: picked ? ArenaTheme.orangeAccent : ArenaTheme.border,
                radius: 10
            });
            Column.onClick(action);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(243:7)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(subtitle);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(244:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Column.pop();
    }
    debatePanel(battle: Battle, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 14 });
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(260:5)", "entry");
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.dialogueHint);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(261:7)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
            Text.width('100%');
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(267:7)", "entry");
            Column.padding(14);
            Column.width('100%');
            Column.constraintSize({ minHeight: 240 });
            Column.backgroundColor(ArenaTheme.surface);
            Column.border({ width: 1, color: ArenaTheme.border, radius: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.messages.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.dialogueEmpty);
                        Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(269:11)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                        Text.width('100%');
                        Text.textAlign(TextAlign.Center);
                        Text.padding({ top: 24, bottom: 24 });
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
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const msg = _item;
                this.chatBubble.bind(this)(msg);
            };
            this.forEachUpdateFunction(elmtId, this.messages, forEachItemGenFunction, (msg: DisciplineChatMessage) => msg.id, false, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
            Row.debugLine("entry/src/main/ets/pages/BattlePage.ets(286:7)", "entry");
            Row.alignItems(VerticalAlign.Bottom);
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: localeStore.L.dialoguePlaceholder, text: this.userInput });
            TextInput.debugLine("entry/src/main/ets/pages/BattlePage.ets(287:9)", "entry");
            TextInput.layoutWeight(1);
            TextInput.fontColor(ArenaTheme.textPrimary);
            TextInput.enabled(!this.isThinking);
            TextInput.onChange((v: string) => { this.userInput = v; });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.send);
            Button.debugLine("entry/src/main/ets/pages/BattlePage.ets(292:9)", "entry");
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.fontColor(Color.White);
            Button.enabled(this.userInput.trim().length > 0 && !this.isThinking);
            Button.onClick(() => { this.sendUserTurn(battle); });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.errorMessage) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.errorMessage);
                        Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(302:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(Color.Red);
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
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/pages/BattlePage.ets(305:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.back);
            Button.debugLine("entry/src/main/ets/pages/BattlePage.ets(306:9)", "entry");
            Button.layoutWeight(1);
            Button.onClick(() => {
                this.stage = 'choose';
                this.messages = [];
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.endDebate);
            Button.debugLine("entry/src/main/ets/pages/BattlePage.ets(312:9)", "entry");
            Button.layoutWeight(1);
            Button.backgroundColor(ArenaTheme.orangeAccent);
            Button.fontColor(Color.White);
            Button.enabled(this.canEndDebate && !this.isGeneratingSummary);
            Button.onClick(() => { this.endDebate(battle); });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (!this.canEndDebate && this.dialogueRounds === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.endDebateHint);
                        Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(322:9)", "entry");
                        Text.fontSize(11);
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
    }
    chatBubble(msg: DisciplineChatMessage, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/pages/BattlePage.ets(330:5)", "entry");
            Row.width('100%');
            Row.justifyContent(msg.speaker === 'user' ? FlexAlign.End : FlexAlign.Start);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (msg.speaker === 'user') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                        Blank.debugLine("entry/src/main/ets/pages/BattlePage.ets(332:9)", "entry");
                        Blank.constraintSize({ minWidth: 40 });
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
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(334:7)", "entry");
            Column.padding(12);
            Column.backgroundColor(this.bubbleBg(msg.speaker));
            Column.border({
                width: 1,
                color: this.bubbleBorder(msg.speaker),
                radius: 10
            });
            Column.alignItems(msg.speaker === 'user' ? HorizontalAlign.End : HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.speakerLabel(msg.speaker));
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(335:9)", "entry");
            Text.fontSize(11);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(msg.content.length === 0 && this.isThinking ? '…' : msg.content);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(338:9)", "entry");
            Text.fontSize(14);
            Text.fontColor('#D1D5DB');
            Text.textAlign(msg.speaker === 'user' ? TextAlign.End : TextAlign.Start);
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (msg.speaker !== 'user') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Blank.create();
                        Blank.debugLine("entry/src/main/ets/pages/BattlePage.ets(352:9)", "entry");
                        Blank.constraintSize({ minWidth: 40 });
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
        Row.pop();
    }
    summaryPanel(battle: Battle, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.debugLine("entry/src/main/ets/pages/BattlePage.ets(361:5)", "entry");
            Column.padding(22);
            Column.width('100%');
            Column.linearGradient({
                angle: 180,
                colors: [[ArenaTheme.surface, 0], [ArenaTheme.background, 1]]
            });
            Column.border({ width: 2, color: '#F9731659', radius: 16 });
            Column.borderRadius(16);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('💡');
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(362:7)", "entry");
            Text.fontSize(44);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.fullPerspective);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(363:7)", "entry");
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.fullPerspectiveSubtitle);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(367:7)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isGeneratingSummary) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.debugLine("entry/src/main/ets/pages/BattlePage.ets(371:9)", "entry");
                        LoadingProgress.color(ArenaTheme.orangeAccent);
                    }, LoadingProgress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.summaryGenerating);
                        Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(372:9)", "entry");
                        Text.fontSize(14);
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
            Text.create(this.summaryText || battle.reveal);
            Text.debugLine("entry/src/main/ets/pages/BattlePage.ets(374:7)", "entry");
            Text.fontSize(16);
            Text.fontColor('#D1D5DB');
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 12 });
            Row.debugLine("entry/src/main/ets/pages/BattlePage.ets(378:7)", "entry");
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.backHome);
            Button.debugLine("entry/src/main/ets/pages/BattlePage.ets(379:9)", "entry");
            Button.layoutWeight(1);
            Button.height(48);
            Button.border({ width: 1, color: ArenaTheme.border, radius: 10 });
            Button.onClick(() => this.pageStack.clear());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(localeStore.L.viewMindProfile);
            Button.debugLine("entry/src/main/ets/pages/BattlePage.ets(384:9)", "entry");
            Button.layoutWeight(1);
            Button.height(48);
            Button.fontColor(Color.White);
            Button.backgroundColor(ArenaTheme.orangeAccent);
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
    private speakerLabel(speaker: DisciplineSpeaker): string {
        if (speaker === 'user') {
            return localeStore.L.you;
        }
        return speaker === 'builder' ? 'Builder' : 'Breaker';
    }
    private bubbleBg(speaker: DisciplineSpeaker): ResourceColor {
        if (speaker === 'user') {
            return '#F9731626';
        }
        return speaker === 'builder' ? '#3B82F61F' : '#EF44441F';
    }
    private bubbleBorder(speaker: DisciplineSpeaker): ResourceColor {
        if (speaker === 'user') {
            return '#F9731666';
        }
        return speaker === 'builder' ? '#3B82F659' : '#EF444459';
    }
    private buildHistory(): string {
        return this.messages.map((msg: DisciplineChatMessage) => {
            let who = localeStore.L.prefersEnglish ? 'User' : '用户';
            if (msg.speaker === 'builder') {
                who = 'Builder';
            }
            else if (msg.speaker === 'breaker') {
                who = 'Breaker';
            }
            return `${who}: ${msg.content}`;
        }).join('\n');
    }
    private replaceMessageContent(msgs: DisciplineChatMessage[], id: string, content: string): DisciplineChatMessage[] {
        const next = msgs.slice();
        const idx = next.findIndex((m: DisciplineChatMessage) => m.id === id);
        if (idx >= 0) {
            next[idx] = next[idx].withContent(content);
        }
        return next;
    }
    private async sendUserTurn(battle: Battle): Promise<void> {
        if (!this.choice) {
            return;
        }
        const content = this.userInput.trim();
        if (!content || this.isThinking) {
            return;
        }
        const userMsg = new DisciplineChatMessage(`user-${Date.now()}`, 'user', content, Date.now());
        const prior = this.messages.slice();
        this.messages = prior.concat([userMsg]);
        this.userInput = '';
        this.isThinking = true;
        this.errorMessage = '';
        const history = this.buildHistory();
        const locale = localeStore.L.prefersEnglish ? 'en' : 'zh';
        try {
            if (this.choice === 'uncertain') {
                const builderId = `builder-${Date.now()}`;
                this.messages = this.messages.concat([
                    new DisciplineChatMessage(builderId, 'builder', '', Date.now())
                ]);
                const resp = await ArenaAPI.streamDisciplineDebateDual(battle.question, battle.builderView, battle.breakerView, content, history, locale, (_delta: string, acc: string) => {
                    const preview = ArenaBilingualParsing.finalizeStreamSpeech(acc);
                    const dual = ArenaBilingualParsing.parseDisciplineDual(acc, null);
                    this.messages = this.replaceMessageContent(this.messages, builderId, dual?.builder ?? preview);
                });
                const dual = resp.disciplineDual ?? ArenaBilingualParsing.parseDisciplineDual(resp.text, null);
                if (!dual) {
                    throw new Error(localeStore.L.disciplineTurnFailed);
                }
                const ts = Date.now();
                this.messages = prior.concat([
                    userMsg,
                    new DisciplineChatMessage(builderId, 'builder', dual.builder, ts),
                    new DisciplineChatMessage(`breaker-${ts}`, 'breaker', dual.breaker, ts + 1),
                ]);
            }
            else {
                const role: DisciplineSpeaker = this.choice === 'builder' ? 'breaker' : 'builder';
                const oppId = `${role}-${Date.now()}`;
                this.messages = this.messages.concat([
                    new DisciplineChatMessage(oppId, role, '', Date.now())
                ]);
                const resp = await ArenaAPI.streamDisciplineDebateOpponent(battle.question, battle.builderView, battle.breakerView, this.choice, content, history, locale, (_delta: string, acc: string) => {
                    const preview = ArenaBilingualParsing.finalizeStreamSpeech(acc);
                    this.messages = this.replaceMessageContent(this.messages, oppId, preview);
                });
                const finalText = ArenaBilingualParsing.finalizeStreamSpeech(resp.text);
                if (!finalText) {
                    throw new Error(localeStore.L.disciplineTurnFailed);
                }
                this.messages = prior.concat([
                    userMsg,
                    new DisciplineChatMessage(oppId, role, finalText, Date.now()),
                ]);
            }
        }
        catch (e) {
            this.messages = prior;
            this.userInput = content;
            this.errorMessage = (e as Error).message ?? localeStore.L.disciplineTurnFailed;
        }
        this.isThinking = false;
    }
    private async endDebate(battle: Battle): Promise<void> {
        if (!this.choice || !this.canEndDebate) {
            return;
        }
        this.stage = 'summary';
        this.isGeneratingSummary = true;
        this.summaryText = '';
        const history = this.buildHistory();
        try {
            const resp = await ArenaAPI.streamDisciplineDebateSummary(battle.question, battle.builderView, battle.breakerView, this.choice, history);
            if (resp.disciplineSummary) {
                this.summaryText = localeStore.L.prefersEnglish ? resp.disciplineSummary.en : resp.disciplineSummary.zh;
            }
            else {
                const parsed = ArenaBilingualParsing.parseDisciplineSummary(resp.text, null);
                if (parsed) {
                    this.summaryText = localeStore.L.prefersEnglish ? parsed.en : parsed.zh;
                }
                else {
                    throw new Error(localeStore.L.disciplineSummaryFailed);
                }
            }
            if (AuthStore.bearerToken) {
                ArenaAPI.saveBattleRecord('battle', battle.question, this.choice, this.summaryText || battle.reveal, false).catch(() => { });
            }
        }
        catch (e) {
            this.errorMessage = (e as Error).message ?? localeStore.L.disciplineSummaryFailed;
            this.stage = 'debate';
        }
        this.isGeneratingSummary = false;
    }
    rerender() {
        this.updateDirtyElements();
    }
}
