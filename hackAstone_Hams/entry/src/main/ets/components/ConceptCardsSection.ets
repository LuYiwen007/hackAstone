import { ArenaTheme } from '../common/ArenaTheme';
import { ArenaAPI } from '../api/ArenaAPI';
import { JsonPayload } from '../common/JsonPayload';
import { arenaL10n } from '../route/GlobalStores';
import { exportMarkdownFile } from '../common/ExportUtil';
import { common } from '@kit.AbilityKit';

class ConceptCardData {
  id: string = '';
  term: string = '';
  definition: string = '';
  example: string = '';
  difficulty: string = 'medium';
}

class QuizQuestionData {
  id: string = '';
  question: string = '';
  options: string[] = [];
  correctAnswer: number = 0;
  explanation: string = '';
}

interface CardsPayload {
  cards?: ConceptCardData[];
}

interface QuizPayload {
  questions?: QuizQuestionData[];
}

type ConceptViewMode = 'none' | 'flashcards' | 'quiz';

function flashcardsPrompt(debateTopic: string, philosopherName: string): string {
  return `[ROLE]
CA-Echo-LLM

[TASK]
根据辩题与哲学家，生成用于主动回忆的概念闪卡，仅返回 JSON。

[RETURN_FORMAT]
{"cards":[{"id":"1","term":"...","definition":"...","example":"...","difficulty":"easy"|"medium"|"hard"}]}

[CONSTRAINTS]
至少 5 张卡片；与辩题及该哲学家思想直接相关；不要 markdown 围栏；仅返回 JSON 对象。

辩题：${debateTopic}
哲学家：${philosopherName}`;
}

function quizPrompt(debateTopic: string, philosopherName: string): string {
  return `[ROLE]
CA-Echo-LLM

[TASK]
根据辩题与哲学家生成单选题测验，仅返回 JSON。

[RETURN_FORMAT]
{"questions":[{"id":"q1","question":"...","options":["A...","B...","C...","D..."],"correctAnswer":0,"explanation":"..."}]}

[CONSTRAINTS]
至少 4 题；每题 4 个选项；correctAnswer 为正确选项在 options 数组中的 0-based 索引；中文；仅返回 JSON 对象。

辩题：${debateTopic}
哲学家：${philosopherName}`;
}

/** 对齐 Web `ConceptCards`：概念闪卡 + 测验。 */
@Component
export struct ConceptCardsSection {
  @Prop debateTopic: string = '';
  @Prop philosopherName: string = '';

  @State viewMode: ConceptViewMode = 'none';
  @State cards: ConceptCardData[] = [];
  @State quizQuestions: QuizQuestionData[] = [];
  @State currentCardIndex: number = 0;
  @State showAnswer: boolean = false;
  @State currentQuizIndex: number = 0;
  @State selectedAnswer: number = -1;
  @State showExplanation: boolean = false;
  @State quizCorrect: number = 0;
  @State quizTotal: number = 0;
  @State isGenerating: boolean = false;
  @State streamPreview: string = '';
  @State errorText: string = '';

  private normalizeCards(raw: ConceptCardData[]): ConceptCardData[] {
    const out: ConceptCardData[] = [];
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (!c.term || !c.definition) {
        continue;
      }
      const next = new ConceptCardData();
      next.id = String(c.id ?? i + 1);
      next.term = c.term;
      next.definition = c.definition;
      next.example = c.example && c.example.length > 0 ? c.example : '（无）';
      next.difficulty = c.difficulty ?? 'medium';
      out.push(next);
    }
    return out;
  }

  private normalizeQuiz(raw: QuizQuestionData[]): QuizQuestionData[] {
    const out: QuizQuestionData[] = [];
    for (let i = 0; i < raw.length; i++) {
      const q = raw[i];
      if (!q.question || !q.options || q.options.length < 2) {
        continue;
      }
      const next = new QuizQuestionData();
      next.id = String(q.id ?? `q${i + 1}`);
      next.question = q.question;
      next.options = q.options;
      next.correctAnswer = q.correctAnswer >= 0 && q.correctAnswer < q.options.length ? q.correctAnswer : 0;
      next.explanation = q.explanation ?? '';
      out.push(next);
    }
    return out;
  }

  private async generateFlashcards(): Promise<void> {
    this.isGenerating = true;
    this.streamPreview = '';
    this.errorText = '';
    try {
      const resp = await ArenaAPI.runEcho(flashcardsPrompt(this.debateTopic, this.philosopherName),
        (_d: string, acc: string) => { this.streamPreview = acc; });
      const parsed = JsonPayload.parse<CardsPayload>(resp.text);
      const list = this.normalizeCards(parsed?.cards ?? []);
      if (list.length === 0) {
        throw new Error(arenaL10n().conceptCardsBadJson);
      }
      this.cards = list;
      this.viewMode = 'flashcards';
      this.currentCardIndex = 0;
      this.showAnswer = false;
    } catch (e) {
      this.errorText = e instanceof Error ? e.message : String(e);
    } finally {
      this.isGenerating = false;
      this.streamPreview = '';
    }
  }

  private async generateQuiz(): Promise<void> {
    this.isGenerating = true;
    this.streamPreview = '';
    this.errorText = '';
    try {
      const resp = await ArenaAPI.runEcho(quizPrompt(this.debateTopic, this.philosopherName),
        (_d: string, acc: string) => { this.streamPreview = acc; });
      const parsed = JsonPayload.parse<QuizPayload>(resp.text);
      const list = this.normalizeQuiz(parsed?.questions ?? []);
      if (list.length === 0) {
        throw new Error(arenaL10n().conceptCardsBadJson);
      }
      this.quizQuestions = list;
      this.viewMode = 'quiz';
      this.currentQuizIndex = 0;
      this.selectedAnswer = -1;
      this.showExplanation = false;
      this.quizCorrect = 0;
      this.quizTotal = 0;
    } catch (e) {
      this.errorText = e instanceof Error ? e.message : String(e);
    } finally {
      this.isGenerating = false;
      this.streamPreview = '';
    }
  }

  private exportCards(): void {
    const lines: string[] = [];
    for (let i = 0; i < this.cards.length; i++) {
      const c = this.cards[i];
      lines.push(`${i + 1}. ${c.term}`);
      lines.push(`   ${c.definition}`);
      lines.push(`   例：${c.example}`);
      lines.push('');
    }
    const ctx = getContext(this) as common.UIAbilityContext;
    exportMarkdownFile(ctx, `${this.philosopherName}_概念卡片`, lines.join('\n'));
  }

  build() {
    Column({ space: 14 }) {
      Row({ space: 8 }) {
        Text('🧠').fontSize(18)
        Text(arenaL10n().conceptCardsTitle)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
      }

      if (this.errorText.length > 0) {
        Text(this.errorText).fontSize(12).fontColor('#E57373')
      }

      if (this.isGenerating) {
        Column({ space: 8 }) {
          Text(arenaL10n().conceptCardsGenerating).fontSize(14).fontColor(ArenaTheme.textMuted)
          if (this.streamPreview.length > 0) {
            Text(this.streamPreview).fontSize(12).fontColor(ArenaTheme.textMuted).maxLines(6)
          }
        }
      } else if (this.viewMode === 'flashcards' && this.cards.length > 0) {
        this.flashcardView();
      } else if (this.viewMode === 'quiz' && this.quizQuestions.length > 0) {
        this.quizView();
      } else {
        Row({ space: 10 }) {
          Button(arenaL10n().conceptCardsFlashcards)
            .layoutWeight(1)
            .backgroundColor(ArenaTheme.purpleAccent)
            .onClick(() => this.generateFlashcards())
          Button(arenaL10n().conceptCardsQuiz)
            .layoutWeight(1)
            .backgroundColor(ArenaTheme.cyanAccent)
            .onClick(() => this.generateQuiz())
        }
        .width('100%')
      }
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
    .padding({ top: 16 })
    .border({ width: { top: 1 }, color: ArenaTheme.border })
  }

  @Builder
  flashcardView() {
    Column({ space: 12 }) {
      Column({ space: 8 }) {
        Text(this.cards[this.currentCardIndex].term)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        if (this.showAnswer) {
          Text(this.cards[this.currentCardIndex].definition)
            .fontSize(14)
            .fontColor(ArenaTheme.textMuted)
          Text(this.cards[this.currentCardIndex].example)
            .fontSize(12)
            .fontColor(ArenaTheme.cyanAccent)
        } else {
          Text(arenaL10n().conceptCardsTapReveal).fontSize(12).fontColor(ArenaTheme.textMuted)
        }
      }
      .width('100%')
      .padding(20)
      .backgroundColor(ArenaTheme.background)
      .borderRadius(12)
      .onClick(() => { this.showAnswer = !this.showAnswer; })

      Row({ space: 8 }) {
        Button(arenaL10n().conceptCardsPrev)
          .enabled(this.currentCardIndex > 0)
          .onClick(() => {
            this.currentCardIndex--;
            this.showAnswer = false;
          })
        Text(`${this.currentCardIndex + 1}/${this.cards.length}`)
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
        Button(arenaL10n().conceptCardsNext)
          .enabled(this.currentCardIndex < this.cards.length - 1)
          .onClick(() => {
            this.currentCardIndex++;
            this.showAnswer = false;
          })
        Blank()
        Button(arenaL10n().conceptCardsExport)
          .fontSize(12)
          .onClick(() => this.exportCards())
      }
      .width('100%')
    }
  }

  @Builder
  quizView() {
    Column({ space: 10 }) {
      Text(this.quizQuestions[this.currentQuizIndex].question)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(ArenaTheme.textPrimary)
      ForEach(this.quizQuestions[this.currentQuizIndex].options, (opt: string, idx: number) => {
        Button(opt)
          .width('100%')
          .fontColor(ArenaTheme.textPrimary)
          .backgroundColor(
            this.selectedAnswer < 0 ? ArenaTheme.surface :
              (idx === this.quizQuestions[this.currentQuizIndex].correctAnswer ? '#22C55E33' :
                (idx === this.selectedAnswer ? '#EF444433' : ArenaTheme.surface))
          )
          .enabled(this.selectedAnswer < 0)
          .onClick(() => {
            this.selectedAnswer = idx;
            this.quizTotal++;
            if (idx === this.quizQuestions[this.currentQuizIndex].correctAnswer) {
              this.quizCorrect++;
            }
            this.showExplanation = true;
          })
      }, (opt: string, idx: number) => `quiz-opt-${idx}`)

      if (this.showExplanation) {
        Text(this.quizQuestions[this.currentQuizIndex].explanation)
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
        if (this.currentQuizIndex < this.quizQuestions.length - 1) {
          Button(arenaL10n().conceptCardsNext)
            .onClick(() => {
              this.currentQuizIndex++;
              this.selectedAnswer = -1;
              this.showExplanation = false;
            })
        } else {
          Text(arenaL10n().conceptCardsQuizScore(this.quizCorrect, this.quizTotal))
            .fontSize(14)
            .fontColor(ArenaTheme.cyanAccent)
        }
      }
    }
    .width('100%')
  }
}
