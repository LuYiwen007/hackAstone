if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DebateSummarySection_Params {
    philosopher?: Philosopher;
    question?: string;
    userChoice?: PhilosophyChoice | null;
    userReason?: string;
    sourceType?: string;
    insight?: AiDebateInsight | null;
    isLoading?: boolean;
    loadError?: string;
    notes?: string;
    showNotes?: boolean;
    noteSaving?: boolean;
    noteMessage?: string;
}
import { ArenaTheme } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaTheme";
import { authStore, localeStore } from "@bundle:com.hackastone.arena/entry/ets/route/GlobalStores";
import { PhilosopherData, PhilosophyChoice, philosopherDisplayName } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaModels";
import type { Philosopher } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaModels";
import { ArenaBilingualParsing } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaBilingualParsing";
import { JsonPayload } from "@bundle:com.hackastone.arena/entry/ets/common/JsonPayload";
import { ArenaAPI } from "@bundle:com.hackastone.arena/entry/ets/api/ArenaAPI";
interface InsightComparison {
    philosopherStance: string;
    userStance: string;
    alignment: string;
}
interface AiDebateInsight {
    corePoints: string[];
    comparison: InsightComparison;
    deepQuestions: string[];
}
export class DebateSummarySection extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__philosopher = new SynchedPropertyObjectOneWayPU(params.philosopher, this, "philosopher");
        this.__question = new SynchedPropertySimpleOneWayPU(params.question, this, "question");
        this.__userChoice = new SynchedPropertySimpleOneWayPU(params.userChoice, this, "userChoice");
        this.__userReason = new SynchedPropertySimpleOneWayPU(params.userReason, this, "userReason");
        this.__sourceType = new SynchedPropertySimpleOneWayPU(params.sourceType, this, "sourceType");
        this.__insight = new ObservedPropertyObjectPU(null, this, "insight");
        this.__isLoading = new ObservedPropertySimplePU(true, this, "isLoading");
        this.__loadError = new ObservedPropertySimplePU('', this, "loadError");
        this.__notes = new ObservedPropertySimplePU('', this, "notes");
        this.__showNotes = new ObservedPropertySimplePU(false, this, "showNotes");
        this.__noteSaving = new ObservedPropertySimplePU(false, this, "noteSaving");
        this.__noteMessage = new ObservedPropertySimplePU('', this, "noteMessage");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DebateSummarySection_Params) {
        if (params.philosopher === undefined) {
            this.__philosopher.set(new PhilosopherData());
        }
        if (params.question === undefined) {
            this.__question.set('');
        }
        if (params.userChoice === undefined) {
            this.__userChoice.set(null);
        }
        if (params.userReason === undefined) {
            this.__userReason.set('');
        }
        if (params.sourceType === undefined) {
            this.__sourceType.set('debate');
        }
        if (params.insight !== undefined) {
            this.insight = params.insight;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.loadError !== undefined) {
            this.loadError = params.loadError;
        }
        if (params.notes !== undefined) {
            this.notes = params.notes;
        }
        if (params.showNotes !== undefined) {
            this.showNotes = params.showNotes;
        }
        if (params.noteSaving !== undefined) {
            this.noteSaving = params.noteSaving;
        }
        if (params.noteMessage !== undefined) {
            this.noteMessage = params.noteMessage;
        }
    }
    updateStateVars(params: DebateSummarySection_Params) {
        this.__philosopher.reset(params.philosopher);
        this.__question.reset(params.question);
        this.__userChoice.reset(params.userChoice);
        this.__userReason.reset(params.userReason);
        this.__sourceType.reset(params.sourceType);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__philosopher.purgeDependencyOnElmtId(rmElmtId);
        this.__question.purgeDependencyOnElmtId(rmElmtId);
        this.__userChoice.purgeDependencyOnElmtId(rmElmtId);
        this.__userReason.purgeDependencyOnElmtId(rmElmtId);
        this.__sourceType.purgeDependencyOnElmtId(rmElmtId);
        this.__insight.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__loadError.purgeDependencyOnElmtId(rmElmtId);
        this.__notes.purgeDependencyOnElmtId(rmElmtId);
        this.__showNotes.purgeDependencyOnElmtId(rmElmtId);
        this.__noteSaving.purgeDependencyOnElmtId(rmElmtId);
        this.__noteMessage.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__philosopher.aboutToBeDeleted();
        this.__question.aboutToBeDeleted();
        this.__userChoice.aboutToBeDeleted();
        this.__userReason.aboutToBeDeleted();
        this.__sourceType.aboutToBeDeleted();
        this.__insight.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__loadError.aboutToBeDeleted();
        this.__notes.aboutToBeDeleted();
        this.__showNotes.aboutToBeDeleted();
        this.__noteSaving.aboutToBeDeleted();
        this.__noteMessage.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __philosopher: SynchedPropertySimpleOneWayPU<Philosopher>;
    get philosopher() {
        return this.__philosopher.get();
    }
    set philosopher(newValue: Philosopher) {
        this.__philosopher.set(newValue);
    }
    private __question: SynchedPropertySimpleOneWayPU<string>;
    get question() {
        return this.__question.get();
    }
    set question(newValue: string) {
        this.__question.set(newValue);
    }
    private __userChoice: SynchedPropertySimpleOneWayPU<PhilosophyChoice | null>;
    get userChoice() {
        return this.__userChoice.get();
    }
    set userChoice(newValue: PhilosophyChoice | null) {
        this.__userChoice.set(newValue);
    }
    private __userReason: SynchedPropertySimpleOneWayPU<string>;
    get userReason() {
        return this.__userReason.get();
    }
    set userReason(newValue: string) {
        this.__userReason.set(newValue);
    }
    private __sourceType: SynchedPropertySimpleOneWayPU<string>;
    get sourceType() {
        return this.__sourceType.get();
    }
    set sourceType(newValue: string) {
        this.__sourceType.set(newValue);
    }
    private __insight: ObservedPropertyObjectPU<AiDebateInsight | null>;
    get insight() {
        return this.__insight.get();
    }
    set insight(newValue: AiDebateInsight | null) {
        this.__insight.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __loadError: ObservedPropertySimplePU<string>;
    get loadError() {
        return this.__loadError.get();
    }
    set loadError(newValue: string) {
        this.__loadError.set(newValue);
    }
    private __notes: ObservedPropertySimplePU<string>;
    get notes() {
        return this.__notes.get();
    }
    set notes(newValue: string) {
        this.__notes.set(newValue);
    }
    private __showNotes: ObservedPropertySimplePU<boolean>;
    get showNotes() {
        return this.__showNotes.get();
    }
    set showNotes(newValue: boolean) {
        this.__showNotes.set(newValue);
    }
    private __noteSaving: ObservedPropertySimplePU<boolean>;
    get noteSaving() {
        return this.__noteSaving.get();
    }
    set noteSaving(newValue: boolean) {
        this.__noteSaving.set(newValue);
    }
    private __noteMessage: ObservedPropertySimplePU<string>;
    get noteMessage() {
        return this.__noteMessage.get();
    }
    set noteMessage(newValue: string) {
        this.__noteMessage.set(newValue);
    }
    private sourceKey(): string {
        return ArenaBilingualParsing.buildDebateNoteKey(this.philosopher.id, this.question);
    }
    aboutToAppear(): void {
        this.loadInsight();
        this.loadNote();
    }
    private buildInsightPrompt(): string {
        let choiceLabel = '';
        switch (this.userChoice) {
            case PhilosophyChoice.AGREE:
                choiceLabel = localeStore.L.prefersEnglish ? 'Agree with philosopher' : '同意哲学家立场';
                break;
            case PhilosophyChoice.DISAGREE:
                choiceLabel = localeStore.L.prefersEnglish ? 'Oppose philosopher' : '反对哲学家立场';
                break;
            case PhilosophyChoice.UNCERTAIN:
                choiceLabel = localeStore.L.prefersEnglish ? 'Uncertain' : '不确定';
                break;
            default:
                choiceLabel = localeStore.L.prefersEnglish ? 'Not selected' : '未选择';
        }
        const ideas = this.philosopher.keyIdeas.join('、');
        const reason = this.userReason.length > 0
            ? this.userReason
            : (localeStore.L.prefersEnglish ? '(No user text)' : '（用户未留下文字）');
        return `[ROLE]
CA-Echo-LLM

[TASK]
根据一场哲学辩论的信息，生成结构化「智能总结」，仅返回 JSON。

[RETURN_FORMAT]
{"corePoints":["..."],"comparison":{"philosopherStance":"...","userStance":"...","alignment":"..."},"deepQuestions":["..."]}

[CONSTRAINTS]
中文；corePoints 至少 3 条；deepQuestions 至少 3 条；comparison.userStance 应概括用户理由；仅返回 JSON。

哲学家：${this.philosopher.nameCN}；学派：${this.philosopher.school}；关键思想：${ideas}
辩题：${this.question}
用户立场标签：${choiceLabel}
用户陈述与理由：${reason}`;
    }
    private async loadInsight(): Promise<void> {
        this.isLoading = true;
        this.loadError = '';
        this.insight = null;
        try {
            const resp = await ArenaAPI.runEcho(this.buildInsightPrompt());
            const parsed = JsonPayload.parse<AiDebateInsight>(resp.text);
            if (!parsed || !parsed.corePoints || parsed.corePoints.length === 0 ||
                !parsed.deepQuestions || parsed.deepQuestions.length === 0) {
                throw new Error(localeStore.L.topicBadJson);
            }
            this.insight = parsed;
        }
        catch (e) {
            this.loadError = e instanceof Error ? e.message : String(e);
        }
        finally {
            this.isLoading = false;
        }
    }
    private async loadNote(): Promise<void> {
        if (!authStore.isLoggedIn) {
            this.notes = '';
            return;
        }
        try {
            const content = await ArenaAPI.fetchDebateNote(this.sourceType, this.sourceKey());
            if (content) {
                this.notes = content;
            }
        }
        catch (_e) {
            // 无笔记时忽略
        }
    }
    private async saveNote(): Promise<void> {
        if (!authStore.isLoggedIn) {
            return;
        }
        this.noteSaving = true;
        this.noteMessage = '';
        try {
            await ArenaAPI.saveDebateNote(this.sourceType, this.sourceKey(), this.question, this.notes);
            this.noteMessage = localeStore.L.noteSaved;
        }
        catch (e) {
            this.noteMessage = e instanceof Error ? e.message : String(e);
        }
        finally {
            this.noteSaving = false;
        }
    }
    insightContent(s: AiDebateInsight, name: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(135:5)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(136:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.corePoints);
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(137:9)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, idx: number) => {
                const p = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`• ${p}`);
                    Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(142:11)", "entry");
                    Text.fontSize(14);
                    Text.fontColor('#D1D5DB');
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, s.corePoints, forEachItemGenFunction, (_p: string, idx: number) => `cp-${idx}`, true, true);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(150:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.stanceCompare);
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(151:9)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.philosopherStanceLabel(name));
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(155:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(s.comparison.philosopherStance);
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(159:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.yourStanceLabel);
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(162:9)", "entry");
            Text.fontSize(14);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(s.comparison.userStance);
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(167:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.alignmentLabel(s.comparison.alignment));
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(170:9)", "entry");
            Text.fontSize(14);
            Text.fontColor(ArenaTheme.cyanAccent);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(178:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.deepQuestions);
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(179:9)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = (_item, idx: number) => {
                const q = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(`${idx + 1}. ${q}`);
                    Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(184:11)", "entry");
                    Text.fontSize(14);
                    Text.fontColor('#D1D5DB');
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, s.deepQuestions, forEachItemGenFunction, (_q: string, idx: number) => `dq-${idx}`, true, true);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        Column.pop();
    }
    private displayPhilosopherName(): string {
        return philosopherDisplayName(this.philosopher, localeStore.L.prefersEnglish);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 16 });
            Column.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(201:5)", "entry");
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor(ArenaTheme.surface);
            Column.borderRadius(14);
            Column.border({ width: 1, color: ArenaTheme.border });
            Column.margin({ top: 8 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(202:7)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('💡');
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(203:9)", "entry");
            Text.fontSize(18);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.debateSummaryTitle);
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(205:9)", "entry");
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(localeStore.L.topicGenerating);
                        Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(212:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor(ArenaTheme.textMuted);
                    }, Text);
                    Text.pop();
                });
            }
            else if (this.loadError.length > 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.loadError);
                        Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(216:9)", "entry");
                        Text.fontSize(12);
                        Text.fontColor('#E57373');
                    }, Text);
                    Text.pop();
                });
            }
            else if (this.insight) {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.insightContent.bind(this)(ObservedObject.GetRawObject(this.insight), this.displayPhilosopherName());
                });
            }
            else {
                this.ifElseBranchUpdateFunction(3, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(223:7)", "entry");
            Column.alignItems(HorizontalAlign.Start);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(224:9)", "entry");
            Row.width('100%');
            Row.onClick(() => {
                this.showNotes = !this.showNotes;
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 8 });
            Row.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(225:11)", "entry");
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('📝');
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(226:13)", "entry");
            Text.fontSize(16);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(localeStore.L.personalNotes);
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(228:13)", "entry");
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor(ArenaTheme.textPrimary);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
            Blank.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(233:11)", "entry");
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.showNotes ? '▼' : '▶');
            Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(234:11)", "entry");
            Text.fontSize(12);
            Text.fontColor(ArenaTheme.textMuted);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showNotes) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        TextArea.create({ text: this.notes, placeholder: localeStore.L.notesPlaceholder });
                        TextArea.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(244:11)", "entry");
                        TextArea.fontColor(ArenaTheme.textPrimary);
                        TextArea.backgroundColor(ArenaTheme.background);
                        TextArea.height(120);
                        TextArea.borderRadius(10);
                        TextArea.border({ width: 1, color: ArenaTheme.border });
                        TextArea.onChange((v: string) => {
                            this.notes = v;
                        });
                    }, TextArea);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel(this.noteSaving ? localeStore.L.savingNote : (authStore.isLoggedIn ? localeStore.L.saveNote : localeStore.L.loginToSaveNote));
                        Button.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(254:11)", "entry");
                        Button.width('100%');
                        Button.height(44);
                        Button.fontSize(14);
                        Button.fontWeight(FontWeight.Medium);
                        Button.fontColor(Color.White);
                        Button.backgroundColor(ArenaTheme.purpleAccent);
                        Button.borderRadius(10);
                        Button.enabled(!this.noteSaving && authStore.isLoggedIn);
                        Button.onClick(() => {
                            this.saveNote();
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.noteMessage.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.noteMessage);
                                    Text.debugLine("entry/src/main/ets/components/DebateSummarySection.ets(268:13)", "entry");
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
    rerender() {
        this.updateDirtyElements();
    }
}
