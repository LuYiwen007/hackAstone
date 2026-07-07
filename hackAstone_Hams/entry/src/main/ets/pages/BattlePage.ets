import { ArenaTheme } from '../common/ArenaTheme';
import { Battle } from '../common/ArenaModels';
import { ArenaAPI } from '../api/ArenaAPI';
import { ArenaBilingualParsing } from '../common/ArenaBilingualParsing';
import { AppRoutes } from '../route/AppRoutes';
import { catalogStore, arenaL10n, appPageStack, arenaNavPush, arenaNavPop, arenaNavClear } from '../route/GlobalStores';
import { AuthStore } from '../store/AuthStore';
import { playArenaInteractionSound } from '../common/ArenaPreferences';
import { PerspectiveSummaryLoader } from '../components/PerspectiveSummaryLoader';

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

@Component
export struct BattlePage {
  @Prop battleId: string = '';

  @State stage: BattleStage = 'choose';
  @State choice: BattleChoice | null = null;
  @State messages: DisciplineChatMessage[] = [];
  @State userInput: string = '';
  @State isThinking: boolean = false;
  @State summaryText: string = '';
  @State isGeneratingSummary: boolean = false;
  @State errorMessage: string = '';

  private resolveBattle(): Battle | undefined {
    return catalogStore.battleForDisplay(this.battleId, arenaL10n().prefersEnglish)
      ?? catalogStore.allBattles(arenaL10n().prefersEnglish).find((b: Battle) => b.id === this.battleId);
  }

  private resolveDialogueRounds(): number {
    return this.messages.filter((m: DisciplineChatMessage) => m.speaker === 'user').length;
  }

  private resolveCanEndDebate(): boolean {
    return this.resolveDialogueRounds() >= 1 && !this.isThinking;
  }

  private popBattlePage(): void {
    if (appPageStack.size() > 0) {
      arenaNavPop();
    } else {
      arenaNavClear();
    }
  }

  @Builder
  battleBody(battle: Battle) {
    Scroll() {
      Column({ space: 24 }) {
        this.header(battle);
        this.questionBlock(battle);
        this.builderBreaker(battle);
        this.stageContent(battle);
      }
      .padding({ left: 12, right: 12, bottom: 32, top: 16 })
      .width('100%')
    }
    .layoutWeight(1)
  }

  build() {
    Column() {
      if (this.resolveBattle() !== undefined) {
        this.battleBody(this.resolveBattle()!);
      } else {
        this.missingBattle();
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
    .hitTestBehavior(HitTestMode.Default)
  }

  @Builder
  missingBattle() {
    Column({ space: 16 }) {
      Text(arenaL10n().battleMissing)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.textPrimary)
      Button(arenaL10n().backToDisciplines)
        .backgroundColor(ArenaTheme.orangeAccent)
        .fontColor(Color.White)
        .onClick(() => {
          this.popBattlePage();
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }

  @Builder
  header(battle: Battle) {
    Row() {
      Button({ type: ButtonType.Normal }) {
        Row({ space: 4 }) {
          Text('‹').fontColor(ArenaTheme.textMuted)
          Text(arenaL10n().backToDisciplines).fontColor(ArenaTheme.textMuted)
        }
      }
      .backgroundColor(Color.Transparent)
      .onClick(() => {
        this.popBattlePage();
      })
      Blank()
      Text(battle.category)
        .fontSize(12)
        .fontColor(ArenaTheme.textMuted)
    }
    .width('100%')
    .alignItems(VerticalAlign.Center)
  }

  @Builder
  questionBlock(battle: Battle) {
    Column({ space: 8 }) {
      Text(arenaL10n().currentDebateTopic)
        .fontSize(12)
        .fontWeight(FontWeight.Medium)
        .fontColor('#F97316E6')
      Text(battle.question)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(ArenaTheme.textPrimary)
      Row({ space: 6 }) {
        Column().width(6).height(6).borderRadius(3).backgroundColor(ArenaTheme.orangeAccent)
        Text(arenaL10n().battleInProgress).fontSize(12).fontColor(ArenaTheme.textMuted)
      }
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }

  @Builder
  builderBreaker(battle: Battle) {
    Column({ space: 14 }) {
      this.stanceCard('Builder', arenaL10n().builderSubtitle, 'B', battle.builderView, '#3B82F6',
        this.choice === 'builder')
      this.stanceCard('Breaker', arenaL10n().breakerSubtitle, 'B', battle.breakerView, '#EF4444',
        this.choice === 'breaker')
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
  }

  @Builder
  stanceCard(title: string, subtitle: string, letter: string, text: string, color: string, selected: boolean) {
    Column({ space: 12 }) {
      Row({ space: 10 }) {
        Stack() {
          Column()
            .width(40)
            .height(40)
            .borderRadius(20)
            .backgroundColor(`${color}D9`)
          Text(letter)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)
        }
        Column({ space: 2 }) {
          Text(title).fontSize(16).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
          Text(subtitle).fontSize(12).fontColor(ArenaTheme.textMuted)
        }
        .alignItems(HorizontalAlign.Start)
      }
      Text(text).fontSize(14).fontColor('#D1D5DB')
    }
    .padding(16)
    .width('100%')
    .alignItems(HorizontalAlign.Start)
    .backgroundColor(selected ? `${color}1F` : ArenaTheme.surface)
    .border({
      width: 2,
      color: selected ? color : ArenaTheme.border,
      radius: 14
    })
    .borderRadius(14)
  }

  @Builder
  stageContent(battle: Battle) {
    if (this.stage === 'choose') {
      this.choosePanel();
    } else if (this.stage === 'debate') {
      this.debatePanel(battle);
    } else {
      this.summaryPanel(battle);
    }
  }

  @Builder
  choosePanel() {
    Column({ space: 14 }) {
      Text(arenaL10n().yourStance)
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .width('100%')
        .textAlign(TextAlign.Center)
      this.choiceButton(arenaL10n().supportBuilderTitle('Builder'), arenaL10n().supportBuilderSubtitle('Builder'),
        'builder', () => { this.choice = 'builder'; })
      this.choiceButton(arenaL10n().supportBreakerTitle('Breaker'), arenaL10n().supportBreakerSubtitle('Breaker'),
        'breaker', () => { this.choice = 'breaker'; })
      this.choiceButton(arenaL10n().uncertainChoiceTitle, arenaL10n().uncertainChoiceSubtitle,
        'uncertain', () => { this.choice = 'uncertain'; })
      if (this.choice !== null) {
        Button(arenaL10n().startDialogue)
          .width('100%')
          .height(48)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.orangeAccent)
          .borderRadius(12)
          .onClick(() => {
            this.stage = 'debate';
            this.messages = [];
            this.userInput = '';
            this.summaryText = '';
            this.errorMessage = '';
          })
      }
    }
    .padding(20)
    .width('100%')
    .backgroundColor(ArenaTheme.surface)
    .border({ width: 1, color: ArenaTheme.border, radius: 14 })
  }

  @Builder
  choiceButton(title: string, subtitle: string, choiceId: BattleChoice, action: () => void) {
    Row({ space: 10 }) {
      Column({ space: 4 }) {
        Text(title).fontSize(16).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
        Text(subtitle).fontSize(12).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      if (this.choice === choiceId) {
        Text('✓')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.orangeAccent)
      }
    }
    .alignItems(VerticalAlign.Center)
    .width('100%')
    .padding(14)
    .backgroundColor(this.choice === choiceId ? '#F9731626' : ArenaTheme.background)
    .border({
      width: this.choice === choiceId ? 2 : 1,
      color: this.choice === choiceId ? ArenaTheme.orangeAccent : ArenaTheme.border,
      radius: 10
    })
    .onClick(action)
  }

  @Builder
  debatePanel(battle: Battle) {
    Column({ space: 14 }) {
      Text(arenaL10n().dialogueHint)
        .fontSize(12)
        .fontColor(ArenaTheme.textMuted)
        .width('100%')
        .textAlign(TextAlign.Center)

      Scroll() {
        Column({ space: 12 }) {
          if (this.messages.length === 0) {
            Text(arenaL10n().dialogueEmpty)
              .fontSize(12)
              .fontColor(ArenaTheme.textMuted)
              .width('100%')
              .textAlign(TextAlign.Center)
              .padding({ top: 24, bottom: 24 })
          }
          ForEach(this.messages, (msg: DisciplineChatMessage) => {
            this.chatBubble(msg);
          }, (msg: DisciplineChatMessage) => `${msg.id}-${msg.content.length}`)
        }
        .width('100%')
        .padding(14)
      }
      .width('100%')
      .height(280)
      .scrollBar(BarState.Auto)
      .backgroundColor(ArenaTheme.surface)
      .border({ width: 1, color: ArenaTheme.border, radius: 12 })
      .hitTestBehavior(HitTestMode.Default)

      Row({ space: 10 }) {
        TextInput({ placeholder: arenaL10n().dialoguePlaceholder, text: this.userInput })
          .layoutWeight(1)
          .fontColor(ArenaTheme.textPrimary)
          .enabled(!this.isThinking)
          .onChange((v: string) => { this.userInput = v; })
        Button(arenaL10n().send)
          .backgroundColor(ArenaTheme.orangeAccent)
          .fontColor(Color.White)
          .enabled(this.userInput.trim().length > 0 && !this.isThinking)
          .onClick(() => { this.sendUserTurn(battle); })
      }
      .alignItems(VerticalAlign.Bottom)
      .width('100%')

      if (this.errorMessage) {
        Text(this.errorMessage).fontSize(12).fontColor(Color.Red)
      }

      Row({ space: 12 }) {
        Button(arenaL10n().back)
          .layoutWeight(1)
          .onClick(() => {
            this.stage = 'choose';
            this.messages = [];
          })
        Button(arenaL10n().endDebate)
          .layoutWeight(1)
          .backgroundColor(ArenaTheme.orangeAccent)
          .fontColor(Color.White)
          .enabled(this.resolveCanEndDebate() && !this.isGeneratingSummary)
          .onClick(() => { this.endDebate(battle); })
      }
      .width('100%')

      if (!this.resolveCanEndDebate() && this.resolveDialogueRounds() === 0) {
        Text(arenaL10n().endDebateHint).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
    }
    .width('100%')
  }

  @Builder
  chatBubble(msg: DisciplineChatMessage) {
    Row() {
      if (msg.speaker === 'user') {
        Blank().constraintSize({ minWidth: 40 })
      }
      Column({ space: 4 }) {
        Text(this.speakerLabel(msg.speaker))
          .fontSize(11)
          .fontColor(ArenaTheme.textMuted)
        Text(msg.content.length === 0 && this.isThinking && msg.speaker !== 'user' ? '…' : msg.content)
          .fontSize(14)
          .fontColor('#D1D5DB')
          .textAlign(msg.speaker === 'user' ? TextAlign.End : TextAlign.Start)
      }
      .padding(12)
      .backgroundColor(this.bubbleBg(msg.speaker))
      .border({
        width: 1,
        color: this.bubbleBorder(msg.speaker),
        radius: 10
      })
      .alignItems(msg.speaker === 'user' ? HorizontalAlign.End : HorizontalAlign.Start)
      if (msg.speaker !== 'user') {
        Blank().constraintSize({ minWidth: 40 })
      }
    }
    .width('100%')
    .justifyContent(msg.speaker === 'user' ? FlexAlign.End : FlexAlign.Start)
  }

  @Builder
  summaryPanel(battle: Battle) {
    Column({ space: 20 }) {
      Text('💡').fontSize(44)
      Text(arenaL10n().fullPerspective)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor(ArenaTheme.textPrimary)
      Text(arenaL10n().fullPerspectiveSubtitle)
        .fontSize(14)
        .fontColor(ArenaTheme.textMuted)
      if (this.isGeneratingSummary) {
        PerspectiveSummaryLoader()
        Text(arenaL10n().summaryGenerating)
          .fontSize(14)
          .fontColor(ArenaTheme.textMuted)
      }
      Text(this.summaryText || battle.reveal)
        .fontSize(16)
        .fontColor('#D1D5DB')
        .width('100%')
      Row({ space: 12 }) {
        Button(arenaL10n().backHome)
          .layoutWeight(1)
          .height(48)
          .border({ width: 1, color: ArenaTheme.border, radius: 10 })
          .onClick(() => arenaNavClear())
        Button(arenaL10n().viewMindProfile)
          .layoutWeight(1)
          .height(48)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.orangeAccent)
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
    .border({ width: 2, color: '#F9731659', radius: 16 })
    .borderRadius(16)
  }

  private speakerLabel(speaker: DisciplineSpeaker): string {
    if (speaker === 'user') {
      return arenaL10n().you;
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
      let who = arenaL10n().prefersEnglish ? 'User' : '用户';
      if (msg.speaker === 'builder') {
        who = 'Builder';
      } else if (msg.speaker === 'breaker') {
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

  private patchStreamingMessage(messageId: string, content: string): void {
    const next = this.replaceMessageContent(this.messages, messageId, content);
    this.messages = next.slice();
  }

  private scheduleStreamingPatch(messageId: string, content: string): void {
    setTimeout(() => {
      this.patchStreamingMessage(messageId, content);
    }, 0);
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
    const locale = arenaL10n().prefersEnglish ? 'en' : 'zh';

    try {
      if (this.choice === 'uncertain') {
        const builderId = `builder-${Date.now()}`;
        this.messages = this.messages.concat([
          new DisciplineChatMessage(builderId, 'builder', '', Date.now())
        ]);

        const resp = await ArenaAPI.streamDisciplineDebateDual(
          battle.question,
          battle.builderView,
          battle.breakerView,
          content,
          history,
          locale,
          (_delta: string, acc: string) => {
            const preview = ArenaBilingualParsing.streamSpeechDisplay(acc);
            const dual = ArenaBilingualParsing.parseDisciplineDual(acc, null);
            this.scheduleStreamingPatch(builderId, dual?.builder ?? preview);
          }
        );
        const dual = resp.disciplineDual ?? ArenaBilingualParsing.parseDisciplineDual(resp.text, null);
        if (!dual) {
          throw new Error(arenaL10n().disciplineTurnFailed);
        }
        const ts = Date.now();
        this.messages = prior.concat([
          userMsg,
          new DisciplineChatMessage(builderId, 'builder', dual.builder, ts),
          new DisciplineChatMessage(`breaker-${ts}`, 'breaker', dual.breaker, ts + 1),
        ]);
        playArenaInteractionSound();
      } else {
        const role: DisciplineSpeaker = this.choice === 'builder' ? 'breaker' : 'builder';
        const oppId = `${role}-${Date.now()}`;
        this.messages = this.messages.concat([
          new DisciplineChatMessage(oppId, role, '', Date.now())
        ]);

        const resp = await ArenaAPI.streamDisciplineDebateOpponent(
          battle.question,
          battle.builderView,
          battle.breakerView,
          this.choice,
          content,
          history,
          locale,
          (_delta: string, acc: string) => {
            const preview = ArenaBilingualParsing.streamSpeechDisplay(acc);
            this.scheduleStreamingPatch(oppId, preview);
          }
        );
        const finalText = ArenaBilingualParsing.finalizeStreamSpeech(resp.text);
        if (!finalText) {
          throw new Error(arenaL10n().disciplineTurnFailed);
        }
        this.messages = prior.concat([
          userMsg,
          new DisciplineChatMessage(oppId, role, finalText, Date.now()),
        ]);
        playArenaInteractionSound();
      }
    } catch (e) {
      this.messages = prior;
      this.userInput = content;
      this.errorMessage = (e as Error).message ?? arenaL10n().disciplineTurnFailed;
    }
    this.isThinking = false;
  }

  private async endDebate(battle: Battle): Promise<void> {
    if (!this.choice || !this.resolveCanEndDebate()) {
      return;
    }
    this.stage = 'summary';
    this.isGeneratingSummary = true;
    this.summaryText = '';
    const history = this.buildHistory();

    try {
      const resp = await ArenaAPI.streamDisciplineDebateSummary(
        battle.question,
        battle.builderView,
        battle.breakerView,
        this.choice,
        history,
        (_delta: string, acc: string) => {
          const parsed = ArenaBilingualParsing.parseDisciplineSummary(acc, null);
          if (parsed) {
            this.summaryText = arenaL10n().prefersEnglish ? parsed.en : parsed.zh;
          } else {
            this.summaryText = ArenaBilingualParsing.streamSpeechDisplay(acc);
          }
        }
      );
      if (resp.disciplineSummary) {
        this.summaryText = arenaL10n().prefersEnglish ? resp.disciplineSummary.en : resp.disciplineSummary.zh;
      } else {
        const parsed = ArenaBilingualParsing.parseDisciplineSummary(resp.text, null);
        if (parsed) {
          this.summaryText = arenaL10n().prefersEnglish ? parsed.en : parsed.zh;
        } else {
          throw new Error(arenaL10n().disciplineSummaryFailed);
        }
      }
      if (AuthStore.bearerToken) {
        ArenaAPI.saveBattleRecord(
          'battle',
          battle.question,
          this.choice,
          this.summaryText || battle.reveal,
          false
        ).catch(() => {});
      }
    } catch (e) {
      this.errorMessage = (e as Error).message ?? arenaL10n().disciplineSummaryFailed;
      this.stage = 'debate';
    }
    this.isGeneratingSummary = false;
  }
}
