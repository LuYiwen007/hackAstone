import { ArenaTheme } from '../common/ArenaTheme';
import { Philosopher } from '../common/ArenaModels';
import { PhilosophyChoice, philosopherDisplayName } from '../l10n/ArenaL10n';
import { JsonPayload } from '../common/JsonPayload';
import { ArenaAPI } from '../api/ArenaAPI';
import { AppRoutes } from '../route/AppRoutes';
import { catalogStore, arenaL10n } from '../route/GlobalStores';
import { AuthStore } from '../store/AuthStore';
import { MoralDilemmaCatalog, MoralDilemma, MoralDilemmaOption } from '../data/DilemmaData';
import { PhilosopherAvatar } from '../components/PhilosopherAvatar';
import { DebateSummarySection } from '../components/DebateSummarySection';

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

  constructor(
    judgeSpeaks: boolean,
    judgeMessage: string,
    addressTo: string | null,
    continueDebate: boolean
  ) {
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
  } else if (s.startsWith('META:')) {
    s = '';
  }
  s = s.trim();
  if (s === '[NO_JUDGE]' || s.startsWith('[NO_JUDGE]')) {
    return '';
  }
  return s;
}

@Component
export struct DilemmaPage {
  @Prop pageStack: NavPathStack = new NavPathStack();

  @State selectedDilemmaId: string = MoralDilemmaCatalog.all[0].id;
  @State selectedOptionId: string = '';
  @State selectedPhilosopherId: string = '';
  @State stage: DilemmaStage = 'setup';
  @State messages: DMMessage[] = [];
  @State userInput: string = '';
  @State isThinking: boolean = false;
  @State thinkingRole: DMThinkingRole | null = null;
  @State canReveal: boolean = false;
  @State fullExplanation: string = '';
  @State isGeneratingSummary: boolean = false;
  @State errorAlert: string = '';
  @State showErrorDialog: boolean = false;
  @State otherPhilosophersVisible: number = 2;

  private static readonly OTHER_PEEK = 2;
  private static readonly OTHER_PAGE = 5;

  private get en(): boolean {
    return arenaL10n().prefersEnglish;
  }

  private get currentDilemma(): MoralDilemma {
    return MoralDilemmaCatalog.dilemma(this.selectedDilemmaId);
  }

  private get selectedOption(): MoralDilemmaOption | undefined {
    if (!this.selectedOptionId) {
      return undefined;
    }
    return this.currentDilemma.options.find((o: MoralDilemmaOption) => o.id === this.selectedOptionId);
  }

  private get selectedPhilosopher(): Philosopher | undefined {
    if (!this.selectedPhilosopherId) {
      return undefined;
    }
    return catalogStore.philosophers.find((p: Philosopher) => p.id === this.selectedPhilosopherId);
  }

  private get recommendedPhilosophers(): Philosopher[] {
    const preferred = new Set(this.currentDilemma.recommendedPhilosopherIds);
    return catalogStore.philosophers.filter((p: Philosopher) => preferred.has(p.id));
  }

  private get otherPhilosophers(): Philosopher[] {
    const preferred = new Set(this.currentDilemma.recommendedPhilosopherIds);
    const list = catalogStore.philosophers.filter((p: Philosopher) => !preferred.has(p.id));
    list.sort((a: Philosopher, b: Philosopher) => a.period - b.period);
    return list;
  }

  private get visibleOtherPhilosophers(): Philosopher[] {
    return this.otherPhilosophers.slice(0, this.otherPhilosophersVisible);
  }

  build() {
    Scroll() {
      Column({ space: 20 }) {
        this.backToHomeBar();
        if (this.stage === 'setup') {
          this.setupContent();
        } else if (this.stage === 'debate' && this.selectedOption && this.selectedPhilosopher) {
          this.debateContent(this.currentDilemma, this.selectedOption, this.selectedPhilosopher);
        } else if (this.stage === 'reveal' && this.selectedOption && this.selectedPhilosopher) {
          this.revealContent(this.currentDilemma, this.selectedOption, this.selectedPhilosopher);
        }
      }
      .padding({ left: 16, right: 16, bottom: 32, top: 16 })
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
    .bindContentCover(this.showErrorDialog, this.errorDialog(), {
      onDisappear: () => { this.showErrorDialog = false; }
    })
  }

  @Builder
  errorDialog() {
    Column({ space: 16 }) {
      Text(arenaL10n().apiRequestFailedTitle).fontSize(18).fontWeight(FontWeight.Bold)
      Text(this.errorAlert)
      Button(arenaL10n().alertConfirm).onClick(() => {
        this.showErrorDialog = false;
        this.errorAlert = '';
      })
    }
    .padding(24)
    .backgroundColor(ArenaTheme.surface)
    .borderRadius(16)
  }

  @Builder
  backToHomeBar() {
    Row() {
      Button({ type: ButtonType.Normal }) {
        Row({ space: 4 }) {
          Text('‹').fontColor(ArenaTheme.textMuted)
          Text(arenaL10n().backToHome).fontColor(ArenaTheme.textMuted)
        }
      }
      .backgroundColor(Color.Transparent)
      .onClick(() => this.pageStack.clear())
      Blank()
    }
    .width('100%')
    .padding({ top: 4, bottom: 4 })
  }

  @Builder
  setupContent() {
    Column({ space: 20 }) {
      Column({ space: 8 }) {
        Text(arenaL10n().dilemmaHeroKicker)
          .fontSize(12)
          .fontColor(ArenaTheme.cyanAccent)
          .letterSpacing(3)
        Text(arenaL10n().moralDilemma)
          .fontSize(32)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        Text(arenaL10n().dilemmaHeroSubtitle)
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
      }
      .width('100%')
      .alignItems(HorizontalAlign.Center)

      Scroll() {
        Row({ space: 10 }) {
          ForEach(MoralDilemmaCatalog.all, (d: MoralDilemma) => {
            Text(d.title(this.en))
              .fontSize(14)
              .fontWeight(d.id === this.currentDilemma.id ? FontWeight.Bold : FontWeight.Normal)
              .padding({ left: 16, right: 16, top: 10, bottom: 10 })
              .fontColor(d.id === this.currentDilemma.id ? '#06B6D4F2' : ArenaTheme.textMuted)
              .backgroundColor(d.id === this.currentDilemma.id ? '#06B6D426' : ArenaTheme.surface)
              .borderRadius(20)
              .border({
                width: 1,
                color: d.id === this.currentDilemma.id ? '#22D3EE99' : ArenaTheme.border
              })
              .onClick(() => this.changeDilemma(d.id))
          }, (d: MoralDilemma) => d.id)
        }
      }
      .scrollable(ScrollDirection.Horizontal)
      .scrollBar(BarState.Off)

      this.dilemmaHeroCard(this.currentDilemma)

      Column({ space: 16 }) {
        Text(this.currentDilemma.title(this.en))
          .fontSize(22)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
        Text(this.currentDilemma.subtitle(this.en))
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)

        Column({ space: 8 }) {
          Text(arenaL10n().dilemmaCoreQuestionLabel).fontSize(12).fontColor(ArenaTheme.cyanAccent)
          Text(this.currentDilemma.question(this.en))
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
            .fontColor(ArenaTheme.textPrimary)
        }
        .padding(14)
        .width('100%')
        .alignItems(HorizontalAlign.Start)
        .backgroundColor('#06B6D40F')
        .border({ width: 1, color: '#06B6D440', radius: 12 })

        Flex({ wrap: FlexWrap.Wrap }) {
          ForEach(this.currentDilemma.options, (opt: MoralDilemmaOption) => {
            this.optionCard(opt);
          }, (opt: MoralDilemmaOption) => opt.id)
        }
        .width('100%')

        if (this.selectedOption) {
          Column({ space: 12 }) {
            Text(arenaL10n().dilemmaYourStanceSection).fontSize(12).fontColor('#F97316D9')
            Text(this.selectedOption.label(this.en)).fontSize(16).fontWeight(FontWeight.Bold)
            Text(this.selectedOption.summary(this.en)).fontSize(12).fontColor(ArenaTheme.textMuted)
          }
          .padding(14)
          .width('100%')
          .alignItems(HorizontalAlign.Start)
          .backgroundColor('#F9731614')
          .border({ width: 1, color: '#F973164D', radius: 12 })

          Text(arenaL10n().dilemmaChoosePhilosopherTitle)
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor(ArenaTheme.textPrimary)
          Text(arenaL10n().dilemmaChoosePhilosopherHint).fontSize(12).fontColor(ArenaTheme.textMuted)

          if (this.recommendedPhilosophers.length > 0) {
            Text(arenaL10n().dilemmaRecommended).fontSize(12).fontColor(ArenaTheme.cyanAccent)
            Column({ space: 12 }) {
              ForEach(this.recommendedPhilosophers, (p: Philosopher) => {
                this.philosopherChoiceCard(p, true);
              }, (p: Philosopher) => p.id)
            }
          }

          Text(arenaL10n().dilemmaAllPhilosophers).fontSize(12).fontColor(ArenaTheme.textMuted)
          Column({ space: 12 }) {
            ForEach(this.visibleOtherPhilosophers, (p: Philosopher) => {
              this.philosopherChoiceCard(p, false);
            }, (p: Philosopher) => p.id)
          }

          if (this.otherPhilosophers.length > DilemmaPage.OTHER_PEEK) {
            Button(this.otherPhilosophersVisible >= this.otherPhilosophers.length
              ? arenaL10n().dilemmaCollapsePhilosophers
              : arenaL10n().dilemmaExpandPhilosophers)
              .width('100%')
              .onClick(() => {
                if (this.otherPhilosophersVisible >= this.otherPhilosophers.length) {
                  this.otherPhilosophersVisible = DilemmaPage.OTHER_PEEK;
                } else {
                  this.otherPhilosophersVisible = Math.min(
                    this.otherPhilosophersVisible + DilemmaPage.OTHER_PAGE,
                    this.otherPhilosophers.length
                  );
                }
              })
          }
        }
      }
      .padding(16)
      .width('100%')
      .backgroundColor(ArenaTheme.surface)
      .borderRadius(16)
      .border({ width: 1, color: ArenaTheme.border })
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  dilemmaHeroCard(dilemma: MoralDilemma) {
    Column({ space: 0 }) {
      Stack() {
        Column()
          .width('100%')
          .height(200)
          .linearGradient({
            angle: 135,
            colors: [['#06B6D459', 0], [ArenaTheme.background, 1]]
          })
        Text(this.heroSymbol(dilemma.id))
          .fontSize(80)
          .fontColor('#FFFFFF40')
      }
      Text(dilemma.imageCaption(this.en))
        .fontSize(12)
        .fontColor(ArenaTheme.textMuted)
        .padding(12)
        .width('100%')
        .backgroundColor('#0A0A0BE6')
    }
    .width('100%')
    .borderRadius(16)
    .clip(true)
    .border({ width: 1, color: ArenaTheme.border })
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

  @Builder
  optionCard(opt: MoralDilemmaOption) {
    Column({ space: 8 }) {
      Text(opt.label(this.en)).fontSize(16).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
      Text(opt.summary(this.en)).fontSize(12).fontColor(ArenaTheme.textMuted)
    }
    .padding(14)
    .width('31%')
    .margin({ right: 8, bottom: 12 })
    .alignItems(HorizontalAlign.Start)
    .backgroundColor(this.selectedOptionId === opt.id ? '#06B6D41F' : ArenaTheme.background)
    .border({
      width: 1,
      color: this.selectedOptionId === opt.id ? '#22D3EE8C' : ArenaTheme.border,
      radius: 12
    })
    .onClick(() => this.selectOption(opt.id))
  }

  @Builder
  philosopherChoiceCard(p: Philosopher, featured: boolean) {
    Column({ space: 10 }) {
      Row({ space: 10 }) {
        PhilosopherAvatar({ philosopher: p, avatarSize: 48 })
        Column({ space: 4 }) {
          Row() {
            Text(philosopherDisplayName(p, this.en))
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor(ArenaTheme.textPrimary)
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
            if (featured) {
              Text(arenaL10n().dilemmaFeaturedBadge)
                .fontSize(10)
                .fontWeight(FontWeight.Medium)
                .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                .margin({ left: 6 })
                .fontColor(ArenaTheme.cyanAccent)
                .backgroundColor('#06B6D433')
                .borderRadius(10)
            }
          }
          Text(p.name).fontSize(11).fontColor(ArenaTheme.textMuted).maxLines(1)
          Text(`${p.school} · ${this.formatPeriod(p.period)}`)
            .fontSize(11)
            .fontColor(ArenaTheme.textMuted)
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
      }
      .alignItems(VerticalAlign.Top)
      .width('100%')
      Text(p.keyIdeas.slice(0, 3).join(this.en ? ', ' : '、'))
        .fontSize(12)
        .fontColor(ArenaTheme.textMuted)
        .maxLines(2)
    }
    .padding(14)
    .width('100%')
    .alignItems(HorizontalAlign.Start)
    .backgroundColor(featured ? '#06B6D40F' : ArenaTheme.background)
    .border({
      width: 1,
      color: featured ? '#22D3EE59' : ArenaTheme.border,
      radius: 12
    })
    .onClick(() => this.choosePhilosopher(p))
  }

  @Builder
  debateContent(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher) {
    Column({ space: 16 }) {
      Row() {
        Column({ space: 4 }) {
          Text(dilemma.title(this.en)).fontSize(12).fontColor(ArenaTheme.cyanAccent)
          Text(`${philosopherDisplayName(philosopher, this.en)} — ${arenaL10n().dilemmaNavTitle}`)
            .fontSize(22)
            .fontWeight(FontWeight.Bold)
            .fontColor(ArenaTheme.textPrimary)
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
        Button(arenaL10n().dilemmaRechoosePhilosopher)
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
          .backgroundColor(Color.Transparent)
          .onClick(() => this.resetDiscussion())
      }
      .width('100%')

      Row({ space: 12 }) {
        Column({ space: 8 }) {
          Text(arenaL10n().dilemmaCurrentDilemmaLabel).fontSize(12).fontColor(ArenaTheme.textMuted)
          Text(dilemma.question(this.en)).fontSize(16).fontWeight(FontWeight.Bold)
          Text(dilemma.promptLead(this.en)).fontSize(12).fontColor(ArenaTheme.textMuted)
        }
        .padding(12)
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Start)
        .backgroundColor(ArenaTheme.surface)
        .border({ width: 1, color: ArenaTheme.border, radius: 10 })

        Column({ space: 8 }) {
          Text(arenaL10n().yourPick).fontSize(12).fontColor(ArenaTheme.textMuted)
          Text(option.label(this.en)).fontSize(16).fontWeight(FontWeight.Bold)
          Text(option.summary(this.en)).fontSize(12).fontColor(ArenaTheme.textMuted)
        }
        .padding(12)
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Start)
        .backgroundColor(ArenaTheme.surface)
        .border({ width: 1, color: ArenaTheme.border, radius: 10 })
      }
      .alignItems(VerticalAlign.Top)
      .width('100%')

      Row({ space: 6 }) {
        Text('⚠').fontSize(12)
        Text(arenaL10n().dilemmaDiscussionNote).fontSize(12).fontColor(ArenaTheme.textMuted)
      }

      ForEach(this.messages, (m: DMMessage) => {
        this.dmBubble(m, philosopher);
      }, (m: DMMessage) => m.id)

      if (this.isThinking && this.thinkingRole) {
        Text(this.thinkingRole === 'philosopher'
          ? arenaL10n().philosopherThinking(philosopherDisplayName(philosopher, this.en))
          : arenaL10n().judgeThinking)
          .fontSize(12)
          .fontColor(ArenaTheme.textMuted)
      }

      Row({ space: 10 }) {
        TextInput({
          placeholder: arenaL10n().dilemmaInputPlaceholder(philosopherDisplayName(philosopher, this.en)),
          text: this.userInput
        })
          .layoutWeight(1)
          .fontColor(ArenaTheme.textPrimary)
          .enabled(!this.isThinking)
          .onChange((v: string) => { this.userInput = v; })
        Button('💬')
          .enabled(this.userInput.trim().length > 0 && !this.isThinking)
          .onClick(() => { this.handleUserTurn(dilemma, option, philosopher); })
      }

      Button(arenaL10n().goToSummary)
        .width('100%')
        .height(44)
        .fontColor(Color.Black)
        .backgroundColor('#FACC15D9')
        .borderRadius(10)
        .enabled(this.canReveal || this.messages.length >= 4)
        .onClick(() => { this.handleReveal(dilemma, option, philosopher); })
    }
    .width('100%')
  }

  @Builder
  dmBubble(m: DMMessage, philosopher: Philosopher) {
    Column({ space: 6 }) {
      Text(m.role === 'user' ? arenaL10n().you
        : m.role === 'philosopher' ? philosopherDisplayName(philosopher, this.en)
          : arenaL10n().judge)
        .fontSize(11)
        .fontColor(ArenaTheme.textMuted)
      Text(m.content).fontSize(14).fontColor(ArenaTheme.textPrimary)
    }
    .padding(12)
    .width('100%')
    .alignItems(HorizontalAlign.Start)
    .backgroundColor(m.role === 'user' ? '#22D3EE1A' : m.role === 'judge' ? '#FACC1514' : ArenaTheme.surface)
    .border({
      width: 1,
      color: m.role === 'user' ? '#22D3EE8C' : m.role === 'judge' ? '#FACC1573' : ArenaTheme.border,
      radius: 10
    })
  }

  @Builder
  revealContent(dilemma: MoralDilemma, option: MoralDilemmaOption, philosopher: Philosopher) {
    Column({ space: 16 }) {
      Text(dilemma.title(this.en)).fontSize(12).fontColor(ArenaTheme.cyanAccent)
      Text(arenaL10n().fullAnalysis).fontSize(22).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
      Text(arenaL10n().dilemmaRevealLine(option.label(this.en), philosopherDisplayName(philosopher, this.en)))
        .fontSize(14)
        .fontColor(ArenaTheme.textMuted)
      Text(this.isGeneratingSummary ? arenaL10n().agentGeneratingSummary
        : (this.fullExplanation.length === 0 ? arenaL10n().summaryMissing : this.fullExplanation))
        .fontSize(16)
        .fontColor('#D1D5DB')
        .padding(16)
        .width('100%')
        .backgroundColor(ArenaTheme.background)
        .border({ width: 1, color: ArenaTheme.border, radius: 12 })

      DebateSummarySection({
        philosopher,
        question: `${dilemma.title(this.en)}：${dilemma.question(this.en)}`,
        userChoice: PhilosophyChoice.UNCERTAIN,
        userReason: this.messages.filter((m: DMMessage) => m.role === 'user').map((m: DMMessage) => m.content).join('\n'),
        sourceType: 'dilemma'
      })

      Row({ space: 12 }) {
        Button(arenaL10n().dilemmaContinueWithPhilosopher)
          .layoutWeight(1)
          .height(44)
          .border({ width: 1, color: ArenaTheme.border, radius: 10 })
          .onClick(() => this.resetDiscussion())
        Button(arenaL10n().viewMindProfile)
          .layoutWeight(1)
          .height(44)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.cyanAccent)
          .borderRadius(10)
          .onClick(() => {
            this.pageStack.clear();
            this.pageStack.pushPath({ name: AppRoutes.profile() });
          })
      }
      .width('100%')
    }
    .padding(18)
    .width('100%')
    .backgroundColor(ArenaTheme.surface)
    .border({ width: 1, color: ArenaTheme.border, radius: 14 })
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
      new DMMessage(`judge-open-${Date.now()}`, 'judge', arenaL10n().dilemmaJudgeOpening(opt.label(this.en)))
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
      let speaker = arenaL10n().user;
      if (m.role === 'judge') {
        speaker = arenaL10n().judge;
      } else if (m.role === 'philosopher') {
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
        ? await ArenaAPI.streamDilemmaPhilosopherToUser(
          dilemma.title(false), dilemma.title(true), dilemma.question(false), dilemma.promptLead(false),
          userStance, philosopher.id, displayName, philosopher.school, keyIdeas, summary, hist, localeCode, onDelta)
        : await ArenaAPI.streamDilemmaPhilosopherToJudge(
          dilemma.title(false), dilemma.title(true), dilemma.question(false), dilemma.promptLead(false),
          userStance, philosopher.id, displayName, philosopher.school, keyIdeas, summary, hist, localeCode, onDelta);
      const final = dmStreamDisplay(resp.text);
      if (!final) {
        throw new Error(arenaL10n().topicBadJson);
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
      const resp = await ArenaAPI.streamDilemmaJudgeStep(
        dilemma.title(false), dilemma.title(true), dilemma.question(false), dilemma.promptLead(false),
        userStance, displayName, philosopher.school, hist, localeCode, onDelta);
      if (!resp.philosophyJudge) {
        throw new Error(arenaL10n().topicBadJson);
      }
      const judge = new JudgeStepResult(
        resp.philosophyJudge.judgeSpeaks,
        resp.philosophyJudge.judgeMessage,
        resp.philosophyJudge.addressTo ?? null,
        resp.philosophyJudge.continueDebate
      );
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
    } catch (e) {
      this.messages = this.messages.filter((m: DMMessage) => m.id !== userMsgId);
      this.userInput = content;
      this.errorAlert = (e as Error).message ?? String(e);
      this.showErrorDialog = true;
    }
    this.isThinking = false;
    this.thinkingRole = null;
  }

  private buildDilemmaProfileI18n(
    dilemma: MoralDilemma,
    option: MoralDilemmaOption,
    summaryText: string,
    enSummary: string | undefined,
    zhSummary: string | undefined
  ): Record<string, Object> {
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
      let speaker = arenaL10n().user;
      if (m.role === 'judge') {
        speaker = arenaL10n().judge;
      } else if (m.role === 'philosopher') {
        speaker = philosopherDisplayName(philosopher, this.en);
      }
      return `${speaker}：${m.content}`;
    }).join('\n');

    try {
      const resp = await ArenaAPI.dilemmaSummary(
        dilemma.title(false),
        dilemma.question(false),
        option.stancePrompt(false),
        philosopher.nameCN,
        philosopher.school,
        history,
        (_d: string, acc: string) => { this.fullExplanation = acc; }
      );
      const summaryText = resp.dilemmaSummary?.pick(this.en)
        ?? JsonPayload.parse<DilemmaSummaryDTO>(resp.text)?.fullExplanation;
      if (summaryText && summaryText.length > 0) {
        this.fullExplanation = summaryText;
        if (AuthStore.bearerToken) {
          ArenaAPI.saveBattleRecord(
            'dilemma',
            dilemma.title(this.en),
            option.label(this.en),
            summaryText,
            false,
            undefined,
            this.buildDilemmaProfileI18n(
              dilemma,
              option,
              summaryText,
              resp.dilemmaSummary?.pick(true),
              resp.dilemmaSummary?.pick(false)
            )
          ).catch(() => {});
        }
      } else {
        this.errorAlert = arenaL10n().topicBadJson;
        this.showErrorDialog = true;
      }
    } catch (e) {
      this.errorAlert = (e as Error).message ?? String(e);
      this.showErrorDialog = true;
    }
    this.isGeneratingSummary = false;
  }
}
