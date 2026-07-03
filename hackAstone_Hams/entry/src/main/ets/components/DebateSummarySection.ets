import { ArenaTheme } from '../common/ArenaTheme';
import { authStore, arenaL10n } from '../route/GlobalStores';
import { Philosopher, PhilosopherData, PhilosophyChoice, philosopherDisplayName } from '../common/ArenaModels';
import { ArenaBilingualParsing } from '../common/ArenaBilingualParsing';
import { JsonPayload } from '../common/JsonPayload';
import { ArenaAPI } from '../api/ArenaAPI';

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

/** 对齐 Web `DebateSummary`：Echo 智能总结 + 按用户 uid 保存笔记。 */
@Component
export struct DebateSummarySection {
  @Prop philosopher: Philosopher = new PhilosopherData();
  @Prop question: string = '';
  @Prop userChoice: PhilosophyChoice | null = null;
  @Prop userReason: string = '';
  @Prop sourceType: string = 'debate';

  @State insight: AiDebateInsight | null = null;
  @State isLoading: boolean = true;
  @State loadError: string = '';
  @State notes: string = '';
  @State showNotes: boolean = false;
  @State noteSaving: boolean = false;
  @State noteMessage: string = '';

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
        choiceLabel = arenaL10n().prefersEnglish ? 'Agree with philosopher' : '同意哲学家立场';
        break;
      case PhilosophyChoice.DISAGREE:
        choiceLabel = arenaL10n().prefersEnglish ? 'Oppose philosopher' : '反对哲学家立场';
        break;
      case PhilosophyChoice.UNCERTAIN:
        choiceLabel = arenaL10n().prefersEnglish ? 'Uncertain' : '不确定';
        break;
      default:
        choiceLabel = arenaL10n().prefersEnglish ? 'Not selected' : '未选择';
    }
    const ideas = this.philosopher.keyIdeas.join('、');
    const reason = this.userReason.length > 0
      ? this.userReason
      : (arenaL10n().prefersEnglish ? '(No user text)' : '（用户未留下文字）');
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
        throw new Error(arenaL10n().topicBadJson);
      }
      this.insight = parsed;
    } catch (e) {
      this.loadError = e instanceof Error ? e.message : String(e);
    } finally {
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
    } catch (_e) {
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
      this.noteMessage = arenaL10n().noteSaved;
    } catch (e) {
      this.noteMessage = e instanceof Error ? e.message : String(e);
    } finally {
      this.noteSaving = false;
    }
  }

  @Builder
  insightContent(s: AiDebateInsight, name: string) {
    Column({ space: 16 }) {
      Column({ space: 8 }) {
        Text(arenaL10n().corePoints)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        ForEach(s.corePoints, (p: string, idx: number) => {
          Text(`• ${p}`)
            .fontSize(14)
            .fontColor('#D1D5DB')
        }, (_p: string, idx: number) => `cp-${idx}`)
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')

      Column({ space: 10 }) {
        Text(arenaL10n().stanceCompare)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().philosopherStanceLabel(name))
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor(ArenaTheme.textPrimary)
        Text(s.comparison.philosopherStance)
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
        Text(arenaL10n().yourStanceLabel)
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor(ArenaTheme.textPrimary)
          .margin({ top: 4 })
        Text(s.comparison.userStance)
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
        Text(arenaL10n().alignmentLabel(s.comparison.alignment))
          .fontSize(14)
          .fontColor(ArenaTheme.cyanAccent)
          .margin({ top: 4 })
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')

      Column({ space: 8 }) {
        Text(arenaL10n().deepQuestions)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        ForEach(s.deepQuestions, (q: string, idx: number) => {
          Text(`${idx + 1}. ${q}`)
            .fontSize(14)
            .fontColor('#D1D5DB')
        }, (_q: string, idx: number) => `dq-${idx}`)
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  private displayPhilosopherName(): string {
    return philosopherDisplayName(this.philosopher, arenaL10n().prefersEnglish);
  }

  build() {
    Column({ space: 16 }) {
      Row({ space: 8 }) {
        Text('💡')
          .fontSize(18)
        Text(arenaL10n().debateSummaryTitle)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
      }

      if (this.isLoading) {
        Text(arenaL10n().topicGenerating)
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
      } else if (this.loadError.length > 0) {
        Text(this.loadError)
          .fontSize(12)
          .fontColor('#E57373')
      } else if (this.insight) {
        this.insightContent(this.insight, this.displayPhilosopherName());
      }

      Column({ space: 10 }) {
        Row() {
          Row({ space: 8 }) {
            Text('📝')
              .fontSize(16)
            Text(arenaL10n().personalNotes)
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .fontColor(ArenaTheme.textPrimary)
          }
          Blank()
          Text(this.showNotes ? '▼' : '▶')
            .fontSize(12)
            .fontColor(ArenaTheme.textMuted)
        }
        .width('100%')
        .onClick(() => {
          this.showNotes = !this.showNotes;
        })

        if (this.showNotes) {
          TextArea({ text: this.notes, placeholder: arenaL10n().notesPlaceholder })
            .fontColor(ArenaTheme.textPrimary)
            .backgroundColor(ArenaTheme.background)
            .height(120)
            .borderRadius(10)
            .border({ width: 1, color: ArenaTheme.border })
            .onChange((v: string) => {
              this.notes = v;
            })

          Button(this.noteSaving ? arenaL10n().savingNote : (authStore.isLoggedIn ? arenaL10n().saveNote : arenaL10n().loginToSaveNote))
            .width('100%')
            .height(44)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor(Color.White)
            .backgroundColor(ArenaTheme.purpleAccent)
            .borderRadius(10)
            .enabled(!this.noteSaving && authStore.isLoggedIn)
            .onClick(() => {
              this.saveNote();
            })

          if (this.noteMessage.length > 0) {
            Text(this.noteMessage)
              .fontSize(12)
              .fontColor(ArenaTheme.textMuted)
          }
        }
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')
    }
    .width('100%')
    .padding(16)
    .backgroundColor(ArenaTheme.surface)
    .borderRadius(14)
    .border({ width: 1, color: ArenaTheme.border })
    .margin({ top: 8 })
  }
}
