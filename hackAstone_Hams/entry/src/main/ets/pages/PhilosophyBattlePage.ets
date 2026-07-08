import { ArenaTheme } from '../common/ArenaTheme';
import { DebateTopicContent, Philosopher } from '../common/ArenaModels';
import { PhilosophyChoice, philosopherDisplayName } from '../l10n/ArenaL10n';
import { JsonPayload } from '../common/JsonPayload';
import { ArenaAPI } from '../api/ArenaAPI';
import { AppRoutes } from '../route/AppRoutes';
import { catalogStore, arenaL10n, arenaNavClear, arenaNavPush } from '../route/GlobalStores';
import { CATALOG_VERSION_KEY } from '../common/CatalogEvents';
import { AuthStore } from '../store/AuthStore';
import { DebateSummarySection } from '../components/DebateSummarySection';
import { playArenaInteractionSound } from '../common/ArenaPreferences';
import { PerspectiveSummaryLoader } from '../components/PerspectiveSummaryLoader';

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
export struct PhilosophyBattlePage {
  @StorageLink(CATALOG_VERSION_KEY) @Watch('onCatalogVersionChange') catalogVersion: number = 0;
  @Prop philosopherId: string = '';

  @State stage: PBStage = 'topic';
  @State choice: PhilosophyChoice | null = null;
  @State topic: DebateTopicContent | null = null;
  @State topicLoadError: string = '';
  @State isTopicLoading: boolean = false;
  @State topicRetryNonce: number = 0;
  @State messages: PBMessage[] = [];
  @State userInput: string = '';
  @State isThinking: boolean = false;
  @State thinkingRole: PBThinkingRole | null = null;
  @State canReveal: boolean = false;
  @State fullExplanation: string = '';
  @State isGeneratingSummary: boolean = false;
  @State errorAlert: string = '';
  @State showErrorDialog: boolean = false;
  scroller: Scroller = new Scroller();
  chatScroller: Scroller = new Scroller();

  private readonly pagePadH: number = 16;
  private readonly pagePadTop: number = 12;
  private readonly pagePadBottom: number = 24;
  private readonly sectionGap: number = 16;
  private chatScrollTick: number = 0;

  private scheduleChatScroll(): void {
    this.chatScrollTick++;
    const tick = this.chatScrollTick;
    setTimeout(() => {
      if (tick === this.chatScrollTick) {
        this.chatScroller.scrollEdge(Edge.Bottom);
      }
    }, 60);
  }

  private resolvePhilosopher(): Philosopher | undefined {
    return catalogStore.philosophers.find((p: Philosopher) => p.id === this.philosopherId);
  }

  aboutToAppear(): void {
    this.tryLoadPhilosopherTopic();
  }

  private onCatalogVersionChange(): void {
    this.tryLoadPhilosopherTopic();
  }

  private tryLoadPhilosopherTopic(): void {
    const p = this.resolvePhilosopher();
    if (p && this.topic === null && !this.isTopicLoading) {
      this.loadTopic(p);
    }
  }

  build() {
    Column() {
      if (this.resolvePhilosopher() !== undefined) {
        this.pageBody(this.resolvePhilosopher()!);
      } else {
        this.missing();
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
    .hitTestBehavior(HitTestMode.Default)
    .bindContentCover(this.showErrorDialog, this.errorDialog(), {
      modalTransition: ModalTransition.DEFAULT,
      onDisappear: () => { this.showErrorDialog = false; }
    })
  }

  @Builder
  pageBody(philosopher: Philosopher) {
    Column({ space: this.sectionGap }) {
      this.battleHeader(philosopher)

      if (this.stage === 'choose') {
        Column() {
          this.chooseStage()
        }
        .layoutWeight(1)
        .width('100%')
        .justifyContent(FlexAlign.Start)
        .alignItems(HorizontalAlign.Start)
      } else if (this.stage === 'topic' && this.isTopicLoading) {
        Column({ space: 16 }) {
          PerspectiveSummaryLoader()
          Text(arenaL10n().tablePreparing)
            .fontSize(14)
            .fontColor(ArenaTheme.textMuted)
        }
        .layoutWeight(1)
        .width('100%')
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      } else if (this.stage === 'debate') {
        Column() {
          this.debateCard(philosopher)
        }
        .layoutWeight(1)
        .width('100%')
        .height('100%')
      } else {
        Scroll(this.scroller) {
          Column({ space: 20 }) {
            this.content(philosopher)
          }
          .width('100%')
          .alignItems(HorizontalAlign.Start)
        }
        .layoutWeight(1)
        .width('100%')
        .align(Alignment.Top)
        .scrollBar(BarState.Off)
      }
    }
    .width('100%')
    .height('100%')
    .padding({
      left: this.pagePadH,
      right: this.pagePadH,
      top: this.pagePadTop,
      bottom: this.pagePadBottom
    })
  }

  @Builder
  errorDialog() {
    Column({ space: 16 }) {
      Text(arenaL10n().apiRequestFailedTitle).fontSize(18).fontWeight(FontWeight.Bold)
      Text(this.errorAlert).fontSize(14)
      Button(arenaL10n().alertConfirm)
        .onClick(() => {
          this.showErrorDialog = false;
          this.errorAlert = '';
        })
    }
    .padding(24)
    .backgroundColor(ArenaTheme.surface)
    .borderRadius(16)
  }

  @Builder
  missing() {
    Column({ space: 16 }) {
      Text(arenaL10n().philosopherMissing).fontSize(22).fontWeight(FontWeight.Bold)
      Button(arenaL10n().backToPhilosophyHome)
        .backgroundColor(ArenaTheme.purpleAccent)
        .fontColor(Color.White)
        .onClick(() => arenaNavClear())
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  @Builder
  battleHeader(philosopher: Philosopher) {
    Row() {
      Button({ type: ButtonType.Normal }) {
        Row({ space: 4 }) {
          Text('‹').fontColor(ArenaTheme.textMuted)
          Text(arenaL10n().backToMap).fontColor(ArenaTheme.textMuted)
        }
      }
      .backgroundColor(Color.Transparent)
      .onClick(() => arenaNavClear())
      Blank()
      Column({ space: 2 }) {
        Text(philosopherDisplayName(philosopher, arenaL10n().prefersEnglish))
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor(ArenaTheme.textPrimary)
        Text(philosopher.school).fontSize(12).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.End)
    }
    .width('100%')
  }

  @Builder
  content(philosopher: Philosopher) {
    if (this.stage === 'topic') {
      this.topicStage(philosopher);
    } else {
      this.revealStage(philosopher);
    }
  }

  @Builder
  questionBlock() {
    if (this.topic) {
      Column({ space: 8 }) {
        Text(arenaL10n().currentDebateTopic)
          .fontSize(12)
          .fontWeight(FontWeight.Medium)
          .fontColor('#A855F7E6')
        Text(this.topic!.question)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor(ArenaTheme.textPrimary)
        Row({ space: 6 }) {
          Column().width(6).height(6).borderRadius(3).backgroundColor(ArenaTheme.purpleAccent)
          Text(arenaL10n().battleInProgress).fontSize(12).fontColor(ArenaTheme.textMuted)
        }
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')
    }
  }

  @Builder
  topicCardsSection(philosopher: Philosopher) {
    if (this.topic) {
      Column({ space: 14 }) {
        this.topicCard(
          philosopherDisplayName(philosopher, arenaL10n().prefersEnglish),
          philosopher.school,
          'P',
          this.topic!.philosopherView,
          '#7C5CBAD9',
          true
        )
        this.topicCard(
          arenaL10n().oppositeStance,
          arenaL10n().prefersEnglish ? 'Counter position' : '对立观点',
          'C',
          this.topic!.oppositeView,
          '#52525BD9',
          false
        )
      }
      .width('100%')
      .alignItems(HorizontalAlign.Start)
    }
  }

  @Builder
  topicStage(philosopher: Philosopher) {
    if (this.topicLoadError) {
      Column({ space: 16 }) {
        Text(this.topicLoadError).fontSize(14).fontColor('#EF4444E6').textAlign(TextAlign.Center)
        Button(arenaL10n().topicRetry)
          .backgroundColor(ArenaTheme.purpleAccent)
          .fontColor(Color.White)
          .onClick(() => {
            this.topicRetryNonce++;
            this.loadTopic(philosopher);
          })
      }
      .width('100%')
      .padding({ top: 24, bottom: 24 })
    } else if (this.topic) {
      Column({ space: 20 }) {
        this.questionBlock();
        Text(arenaL10n().agentDisclaimer).fontSize(12).fontColor(ArenaTheme.textMuted)
        this.topicCardsSection(philosopher);
        Button(arenaL10n().startDebate)
          .width('100%')
          .height(48)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.purpleAccent)
          .borderRadius(12)
          .onClick(() => { this.stage = 'choose'; })
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')
    }
  }

  @Builder
  topicCard(title: string, subtitle: string, letter: string, text: string, letterColor: string, accent: boolean) {
    Column({ space: 12 }) {
      Row({ space: 10 }) {
        Stack() {
          Column()
            .width(40)
            .height(40)
            .borderRadius(20)
            .backgroundColor(letterColor)
          Text(letter)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)
        }
        Column({ space: 2 }) {
          Text(title)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(ArenaTheme.textPrimary)
          Text(subtitle)
            .fontSize(12)
            .fontColor(ArenaTheme.textMuted)
            .maxLines(2)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
      }
      Text(text).fontSize(14).fontColor('#D1D5DB')
    }
    .padding(16)
    .width('100%')
    .alignItems(HorizontalAlign.Start)
    .border({
      width: 2,
      color: accent ? '#A855F773' : ArenaTheme.border,
      radius: 14
    })
    .borderRadius(14)
  }

  @Builder
  chooseStage() {
    Column({ space: 20 }) {
      Text(arenaL10n().yourStanceQuestion)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.textPrimary)
        .width('100%')
        .textAlign(TextAlign.Center)
      Text(arenaL10n().debateFlowHint)
        .fontSize(13)
        .fontColor(ArenaTheme.textMuted)
        .width('100%')
        .textAlign(TextAlign.Center)
      this.philosophyChoiceButton(arenaL10n().agree, PhilosophyChoice.AGREE)
      this.philosophyChoiceButton(arenaL10n().disagree, PhilosophyChoice.DISAGREE)
      this.philosophyChoiceButton(arenaL10n().uncertain, PhilosophyChoice.UNCERTAIN)
    }
    .width('100%')
  }

  @Builder
  philosophyChoiceButton(title: string, choice: PhilosophyChoice) {
    Text(title)
      .fontSize(17)
      .fontWeight(FontWeight.Bold)
      .fontColor(ArenaTheme.textPrimary)
      .width('100%')
      .textAlign(TextAlign.Center)
      .padding({ top: 22, bottom: 22 })
      .backgroundColor(Color.Transparent)
      .border({
        width: 2,
        color: ArenaTheme.border,
        radius: 14
      })
      .borderRadius(14)
      .onClick(() => { this.handleChoose(choice); })
  }

  @Builder
  debateCard(philosopher: Philosopher) {
    if (!this.topic) {
      Text(arenaL10n().topicGenerating).fontSize(12).fontColor(ArenaTheme.textMuted)
    } else {
      Column({ space: 0 }) {
        Column({ space: 4 }) {
          Text(arenaL10n().currentDebateTopic)
            .fontSize(11)
            .fontWeight(FontWeight.Medium)
            .fontColor('#A855F7E6')
          Text(this.topic!.question)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor(ArenaTheme.textPrimary)
        }
        .alignItems(HorizontalAlign.Start)
        .width('100%')
        .padding(12)
        .backgroundColor(ArenaTheme.background)
        .border({ width: { bottom: 1 }, color: ArenaTheme.border })

        Scroll(this.chatScroller) {
          Column({ space: 14 }) {
            Row({ space: 6 }) {
              Text('ⓘ').fontSize(12).fontColor(ArenaTheme.textMuted)
              Text(arenaL10n().debateRoundHint)
                .fontSize(12)
                .fontColor(ArenaTheme.textMuted)
            }
            .width('100%')
            .alignItems(VerticalAlign.Top)

            ForEach(this.messages, (m: PBMessage) => {
              this.messageBubble(m, philosopher);
            }, (m: PBMessage) => `${m.id}-${m.content.length}`)

            if (this.isThinking && this.thinkingRole === 'judge') {
              Text(arenaL10n().judgeThinking)
                .fontSize(12)
                .fontColor(ArenaTheme.textMuted)
                .width('100%')
            }

            Column()
              .width('100%')
              .height(1)
          }
          .width('100%')
          .justifyContent(FlexAlign.Start)
          .alignItems(HorizontalAlign.Start)
          .padding(12)
        }
        .layoutWeight(1)
        .width('100%')
        .align(Alignment.Top)
        .scrollBar(BarState.Auto)
        .hitTestBehavior(HitTestMode.Default)
        .onAppear(() => { this.scheduleChatScroll(); })

        Column({ space: 10 }) {
          Row({ space: 10 }) {
            TextInput({ placeholder: arenaL10n().continueYourThought, text: this.userInput })
              .layoutWeight(1)
              .fontColor(ArenaTheme.textPrimary)
              .enabled(!this.isThinking)
              .onChange((v: string) => { this.userInput = v; })
            Button(arenaL10n().send)
              .fontSize(14)
              .fontWeight(FontWeight.Medium)
              .backgroundColor(Color.Transparent)
              .fontColor(ArenaTheme.purpleAccent)
              .enabled(this.userInput.trim().length > 0 && !this.isThinking && this.choice !== null)
              .opacity(this.userInput.trim().length > 0 && !this.isThinking && this.choice !== null ? 1 : 0.4)
              .onClick(() => { this.handleUserTurn(philosopher); })
          }
          .alignItems(VerticalAlign.Bottom)
          .width('100%')

          Button(arenaL10n().goToSummary)
            .width('100%')
            .height(48)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.Black)
            .backgroundColor('#FACC15D9')
            .borderRadius(10)
            .enabled((this.canReveal || this.messages.length >= 4) && this.choice !== null && !this.isThinking)
            .onClick(() => { this.handleReveal(philosopher); })
        }
        .padding(12)
        .width('100%')
        .backgroundColor(ArenaTheme.surface)
        .border({ width: { top: 1 }, color: ArenaTheme.border })
      }
      .width('100%')
      .layoutWeight(1)
      .backgroundColor(ArenaTheme.surface)
      .borderRadius(12)
      .border({ width: 1, color: ArenaTheme.border })
    }
  }

  @Builder
  messageBubble(m: PBMessage, philosopher: Philosopher) {
    Column({ space: 6 }) {
      Text(this.messageLabel(m.role, philosopher))
        .fontSize(11)
        .fontColor(ArenaTheme.textMuted)
      if (this.isThinking && this.thinkingRole === 'philosopher' && m.role === 'philosopher'
        && m.id.startsWith('to-') && m.content.length === 0) {
        Text(arenaL10n().philosopherThinking(philosopherDisplayName(philosopher, arenaL10n().prefersEnglish)))
          .fontSize(14)
          .fontStyle(FontStyle.Italic)
          .fontColor(ArenaTheme.textMuted)
      } else {
        Text(m.content.length === 0 && this.isThinking && m.role !== 'user' ? '…' : m.content)
          .fontSize(14)
          .fontColor(ArenaTheme.textPrimary)
      }
    }
    .padding(12)
    .width('100%')
    .alignItems(HorizontalAlign.Start)
    .border({
      width: 1,
      color: this.messageBorder(m.role),
      radius: 10
    })
    .borderRadius(10)
  }

  @Builder
  revealStage(philosopher: Philosopher) {
    Column({ space: 20 }) {
      Text('💡').fontSize(44)
      Text(arenaL10n().fullAnalysis)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.textPrimary)
      Text(arenaL10n().fullPerspectiveSubtitle)
        .fontSize(14)
        .fontColor(ArenaTheme.textMuted)
      if (this.isGeneratingSummary) {
        PerspectiveSummaryLoader()
        Text(arenaL10n().agentGeneratingSummary)
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
      }
      Text(this.fullExplanation.length === 0 && !this.isGeneratingSummary
        ? arenaL10n().summaryMissing : this.fullExplanation)
        .fontSize(16)
        .fontColor('#D1D5DB')
        .width('100%')
      if (this.topic) {
        DebateSummarySection({
          philosopher,
          question: this.topic.question,
          userChoice: this.choice,
          userReason: this.messages.filter((m: PBMessage) => m.role === 'user').map((m: PBMessage) => m.content).join('\n')
        })
      }
      Row({ space: 12 }) {
        Button(arenaL10n().backToMap)
          .layoutWeight(1)
          .height(48)
          .border({ width: 1, color: ArenaTheme.border, radius: 10 })
          .onClick(() => arenaNavClear())
        Button(arenaL10n().viewMindProfile)
          .layoutWeight(1)
          .height(48)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.purpleAccent)
          .borderRadius(10)
          .onClick(() => {
            arenaNavClear();
            arenaNavPush({ name: AppRoutes.profile() });
          })
      }
      .width('100%')
    }
    .padding(22)
    .width('100%')
    .linearGradient({
      angle: 180,
      colors: [[ArenaTheme.surface, 0], [ArenaTheme.background, 1]]
    })
    .border({ width: 2, color: '#A855F759', radius: 16 })
    .borderRadius(16)
  }

  private messageLabel(role: PBMessageRole, philosopher: Philosopher): string {
    if (role === 'user') {
      return arenaL10n().you;
    }
    if (role === 'philosopher') {
      return philosopherDisplayName(philosopher, arenaL10n().prefersEnglish);
    }
    return arenaL10n().judge;
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
      new PBMessage(`${Date.now()}`, 'judge', arenaL10n().judgeOpeningAfterChoice(arenaL10n().choiceDisplay(c)))
    ];
    this.scheduleChatScroll();
  }

  private async loadTopic(philosopher: Philosopher): Promise<void> {
    this.isTopicLoading = true;
    this.topicLoadError = '';
    try {
      const resp = await ArenaAPI.generateTopic(
        philosopher.nameCN,
        philosopher.school,
        philosopher.keyIdeas,
        arenaL10n().prefersEnglish ? 'en' : 'zh'
      );
      const parsed = resp.debateTopic ?? JsonPayload.parse<DebateTopicContent>(resp.text);
      if (parsed && parsed.question && parsed.philosopherView && parsed.oppositeView) {
        this.topic = parsed;
        this.fullExplanation = parsed.fullExplanation ?? '';
        this.topicLoadError = '';
      } else {
        throw new Error(arenaL10n().topicBadJson);
      }
    } catch (e) {
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
      let who = arenaL10n().user;
      if (m.role === 'judge') {
        who = arenaL10n().judge;
      } else if (m.role === 'philosopher') {
        who = philosopherDisplayName(philosopher, arenaL10n().prefersEnglish);
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
    this.scheduleChatScroll();

    const localeCode = arenaL10n().prefersEnglish ? 'en' : 'zh';
    const keyIdeas = philosopher.keyIdeas.join('。');
    const summary = philosopher.summary ?? '';
    const userStance = this.choiceLabel(this.choice);

    const streamPhilosopher = async (mode: string, prior: PBMessage[]): Promise<PBMessage> => {
      const msgId = `${mode}-${Date.now()}`;
      let row = new PBMessage(msgId, 'philosopher', '');
      this.thinkingRole = 'philosopher';
      this.messages = prior.concat([row]);
      this.scheduleChatScroll();
      const hist = this.historyBlock(prior, philosopher);
      const onDelta = (_d: string, acc: string) => {
        row = new PBMessage(msgId, 'philosopher', streamDisplay(acc));
        this.messages = prior.concat([row]);
        this.scheduleChatScroll();
      };
      const resp = mode === 'to-user'
        ? await ArenaAPI.streamPhilosophyPhilosopherToUser(
          this.topic!.question, philosopher.id,
          philosopherDisplayName(philosopher, arenaL10n().prefersEnglish),
          philosopher.school, keyIdeas, summary, userStance, hist, localeCode, onDelta)
        : await ArenaAPI.streamPhilosophyPhilosopherToJudge(
          this.topic!.question, philosopher.id,
          philosopherDisplayName(philosopher, arenaL10n().prefersEnglish),
          philosopher.school, keyIdeas, summary, userStance, hist, localeCode, onDelta);
      const final = streamDisplay(resp.text);
      if (!final) {
        throw new Error('empty response');
      }
      const done = new PBMessage(msgId, 'philosopher', final);
      this.messages = prior.concat([done]);
      this.scheduleChatScroll();
      playArenaInteractionSound();
      return done;
    };

    const streamJudge = async (prior: PBMessage[]): Promise<JudgeStreamOutcome> => {
      const msgId = `judge-${Date.now()}`;
      let row = new PBMessage(msgId, 'judge', '');
      this.thinkingRole = 'judge';
      this.messages = prior.concat([row]);
      this.scheduleChatScroll();
      const hist = this.historyBlock(prior, philosopher);
      const onDelta = (_d: string, acc: string) => {
        row = new PBMessage(msgId, 'judge', judgeStreamDisplay(acc));
        this.messages = prior.concat([row]);
        this.scheduleChatScroll();
      };
      const resp = await ArenaAPI.streamPhilosophyJudgeStep(
        this.topic!.question,
        philosopherDisplayName(philosopher, arenaL10n().prefersEnglish),
        philosopher.school, userStance, hist, localeCode, onDelta);
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
        const final = judgeStreamDisplay(resp.text).length === 0 ? judge.judgeMessage : judgeStreamDisplay(resp.text);
        const done = new PBMessage(msgId, 'judge', final);
        this.messages = prior.concat([done]);
        this.scheduleChatScroll();
        playArenaInteractionSound();
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
        this.scheduleChatScroll();
      }
      this.canReveal = judgeResult.judge.continueDebate === false;
    } catch (e) {
      this.messages = this.messages.filter((m: PBMessage) => m.id !== userRowId);
      this.userInput = content;
      this.errorAlert = (e as Error).message ?? String(e);
      this.showErrorDialog = true;
    }
    this.isThinking = false;
    this.thinkingRole = null;
    this.scheduleChatScroll();
  }

  private async handleReveal(philosopher: Philosopher): Promise<void> {
    if (!this.choice || !this.topic) {
      return;
    }
    this.stage = 'reveal';
    this.isGeneratingSummary = true;
    this.fullExplanation = '';
    const history = this.messages.map((m: PBMessage) => {
      let who = arenaL10n().user;
      if (m.role === 'judge') {
        who = arenaL10n().judge;
      } else if (m.role === 'philosopher') {
        who = philosopherDisplayName(philosopher, arenaL10n().prefersEnglish);
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
          const choiceText = arenaL10n().choiceDisplay(this.choice);
          ArenaAPI.saveBattleRecord(
            'philosophy',
            this.topic.question,
            choiceText,
            parsed.fullExplanation,
            false,
            this.messages.map((m: PBMessage) => this.toRecordMessage(m))
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
