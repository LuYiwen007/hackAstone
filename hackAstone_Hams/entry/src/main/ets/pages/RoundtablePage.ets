import { ArenaTheme } from '../common/ArenaTheme';
import { Philosopher } from '../common/ArenaModels';
import { philosopherDisplayName } from '../l10n/ArenaL10n';
import { JsonPayload } from '../common/JsonPayload';
import { ArenaAPI } from '../api/ArenaAPI';
import { catalogStore, arenaL10n, arenaNavPush, arenaNavPop, arenaNavClear } from '../route/GlobalStores';
import { playArenaInteractionSound } from '../common/ArenaPreferences';
import { RoundtablePhilosopherPicker } from './RoundtablePhilosopherPicker';

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

@Component
export struct RoundtablePage {
  @State stage: RTStage = 'setup';
  @State selected: Philosopher[] = [];
  @State debateTopic: string = '';
  @State customTopic: string = '';
  @State messages: RTMessage[] = [];
  @State userInput: string = '';
  @State isThinking: boolean = false;
  @State errorAlert: string = '';
  @State showErrorDialog: boolean = false;
  @State showPicker: boolean = false;
  @State activeSpeakerId: string = '';

  private readonly presetTopicIds: string[] = ['ai-free-will', 'utopia', 'truth', 'education'];

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

  build() {
    Column() {
      Scroll() {
        Column({ space: 20 }) {
          this.header();
          if (this.stage === 'setup') {
            this.setup();
          } else {
            this.debate();
          }
        }
        .padding({ left: 16, right: 16, bottom: 28, top: 16 })
        .width('100%')
      }
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
    .bindContentCover(this.showErrorDialog, this.errorDialog(), {
      onDisappear: () => { this.showErrorDialog = false; }
    })
    .bindContentCover(this.showPicker, this.pickerCover(), {
      onDisappear: () => { this.showPicker = false; }
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
  pickerCover() {
    Column() {
      RoundtablePhilosopherPicker({ selected: $selected })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(ArenaTheme.background)
  }

  @Builder
  header() {
    Row() {
      Button({ type: ButtonType.Normal }) {
        Row({ space: 4 }) {
          Text('‹').fontColor(ArenaTheme.textMuted)
          Text(arenaL10n().backToHome).fontColor(ArenaTheme.textMuted)
        }
      }
      .backgroundColor(Color.Transparent)
      .onClick(() => arenaNavClear())
      Blank()
      Row({ space: 8 }) {
        Text('👥').fontColor(ArenaTheme.orangeAccent)
        Text(arenaL10n().roundtableHeadline).fontSize(16).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
      }
    }
    .width('100%')
    .padding({ top: 4, bottom: 4 })
  }

  @Builder
  setup() {
    Column({ space: 24 }) {
      Column({ space: 10 }) {
        Row() {
          Text('1.').fontSize(22).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.orangeAccent)
          Text(arenaL10n().pickThinkers).fontSize(22).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
          Text(arenaL10n().pickThinkersHint).fontSize(14).fontColor(ArenaTheme.textMuted).margin({ left: 6 })
          Blank()
          Button(arenaL10n().viewAllPhilosophers)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor(ArenaTheme.orangeAccent)
            .backgroundColor(Color.Transparent)
            .border({ width: 1, color: '#F9731680', radius: 8 })
            .padding({ left: 12, right: 12, top: 6, bottom: 6 })
            .onClick(() => { this.showPicker = true; })
        }
        .width('100%')
        .alignItems(VerticalAlign.Top)

        if (this.selected.length > 0) {
          Column({ space: 8 }) {
            Text(arenaL10n().selectedCount(this.selected.length))
              .fontSize(12)
              .fontWeight(FontWeight.Medium)
              .fontColor(ArenaTheme.orangeAccent)
            Flex({ wrap: FlexWrap.Wrap }) {
              ForEach(this.selected, (p: Philosopher) => {
                this.selectedChip(p);
              }, (p: Philosopher) => p.id)
            }
          }
          .padding(12)
          .width('100%')
          .alignItems(HorizontalAlign.Start)
          .backgroundColor(ArenaTheme.surface)
          .border({ width: 1, color: '#F9731659', radius: 10 })
        }

        Flex({ wrap: FlexWrap.Wrap }) {
          ForEach(catalogStore.philosophers.filter((p: Philosopher) => p.majorWorks != null), (p: Philosopher) => {
            this.quickPickTile(p);
          }, (p: Philosopher) => p.id)
        }
        .width('100%')
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')

      Column({ space: 12 }) {
        Row({ space: 6 }) {
          Text('2.').fontSize(22).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.orangeAccent)
          Text(arenaL10n().pickTopic).fontSize(22).fontWeight(FontWeight.Bold).fontColor(ArenaTheme.textPrimary)
        }
        Flex({ wrap: FlexWrap.Wrap }) {
          ForEach(this.presetTopicIds, (id: string) => {
            this.presetTopicTile(id);
          }, (id: string) => id)
        }
        .width('100%')
        Column({ space: 6 }) {
          Text(arenaL10n().customTopicLabel).fontSize(12).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textMuted)
          TextInput({ placeholder: arenaL10n().customTopicPlaceholder, text: this.customTopic })
            .fontColor(ArenaTheme.textPrimary)
            .backgroundColor(ArenaTheme.background)
            .border({ width: 1, color: ArenaTheme.border, radius: 8 })
            .onChange((v: string) => {
              this.customTopic = v;
              this.debateTopic = v;
            })
        }
        .padding(12)
        .width('100%')
        .alignItems(HorizontalAlign.Start)
        .backgroundColor(ArenaTheme.surface)
        .border({ width: 1, color: ArenaTheme.border, radius: 10, style: BorderStyle.Dashed })
      }
      .alignItems(HorizontalAlign.Start)
      .width('100%')

      Column({ space: 8 }) {
        Button(`✨ ${arenaL10n().startRoundtable}`)
          .width('100%')
          .height(48)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
          .backgroundColor(ArenaTheme.orangeAccent)
          .borderRadius(12)
          .enabled(this.selected.length >= 2 && this.debateTopic.trim().length > 0)
          .onClick(() => this.startDebate())
        if (this.selected.length < 2 || this.debateTopic.trim().length === 0) {
          Text(arenaL10n().roundtableSetupError).fontSize(12).fontColor(ArenaTheme.textMuted)
        }
      }
      .width('100%')
    }
    .width('100%')
  }

  @Builder
  selectedChip(p: Philosopher) {
    Row() {
      Column({ space: 2 }) {
        Text(philosopherDisplayName(p, arenaL10n().prefersEnglish)).fontSize(12).fontWeight(FontWeight.Medium)
        Text(p.school).fontSize(11).fontColor(ArenaTheme.textMuted)
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)
      Text('✕')
        .fontSize(14)
        .fontColor(ArenaTheme.textMuted)
        .onClick(() => {
          this.selected = this.selected.filter((x: Philosopher) => x.id !== p.id);
        })
    }
    .padding(8)
    .width('48%')
    .margin({ right: 8, bottom: 8 })
    .backgroundColor(ArenaTheme.background)
    .border({ width: 1, color: ArenaTheme.border, radius: 8 })
  }

  @Builder
  quickPickTile(p: Philosopher) {
    Column({ space: 4 }) {
      Text(philosopherDisplayName(p, arenaL10n().prefersEnglish))
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(ArenaTheme.textPrimary)
      Text(p.school).fontSize(11).fontColor(ArenaTheme.textMuted)
      if (this.isPhilosopherPicked(p)) {
        Text(arenaL10n().picked).fontSize(11).fontColor(ArenaTheme.orangeAccent)
      }
    }
    .padding(10)
    .width('31%')
    .margin({ right: 8, bottom: 8 })
    .alignItems(HorizontalAlign.Start)
    .opacity(this.isQuickPickFull(p) ? 0.35 : 1)
    .backgroundColor(ArenaTheme.surface)
    .border({
      width: 1,
      color: this.isPhilosopherPicked(p) ? '#F9731699' : ArenaTheme.border,
      radius: 10
    })
    .enabled(!this.isPhilosopherPicked(p) && !this.isQuickPickFull(p))
    .onClick(() => this.addPhilosopher(p))
  }

  @Builder
  presetTopicTile(id: string) {
    Column({ space: 6 }) {
      Text(arenaL10n().presetTopic(id).title).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
      Text(arenaL10n().presetTopic(id).description).fontSize(12).fontColor(ArenaTheme.textMuted)
    }
    .padding(12)
    .width('48%')
    .margin({ right: 10, bottom: 10 })
    .alignItems(HorizontalAlign.Start)
    .backgroundColor(this.debateTopic === arenaL10n().presetTopic(id).title ? '#F9731626' : ArenaTheme.surface)
    .border({
      width: 1,
      color: this.debateTopic === arenaL10n().presetTopic(id).title ? '#F97316A6' : ArenaTheme.border,
      radius: 10
    })
    .onClick(() => {
      this.debateTopic = arenaL10n().presetTopic(id).title;
      this.customTopic = '';
    })
  }

  @Builder
  debate() {
    Column({ space: 16 }) {
      Column({ space: 8 }) {
        Text(this.debateTopic)
          .fontSize(22)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.orangeAccent)
          .textAlign(TextAlign.Center)
        Row({ space: 8 }) {
          Text(arenaL10n().participants).fontSize(12).fontColor(ArenaTheme.textMuted)
          Text(this.selected.map((p: Philosopher) => philosopherDisplayName(p, arenaL10n().prefersEnglish))
            .join(arenaL10n().prefersEnglish ? ', ' : '、'))
            .fontSize(12)
            .fontWeight(FontWeight.Medium)
            .fontColor(ArenaTheme.textPrimary)
        }
      }
      .padding(16)
      .width('100%')
      .linearGradient({
        angle: 90,
        colors: [['#F973161F', 0], ['#EF444414', 1]]
      })
      .border({ width: 1, color: '#F973164D', radius: 12 })

      Scroll() {
        Column({ space: 16 }) {
          ForEach(this.messages, (msg: RTMessage) => {
            this.messageRow(msg);
          }, (msg: RTMessage) => msg.id)
          if (this.isThinking) {
            Row({ space: 10 }) {
              Column().width(40).height(40).borderRadius(20).backgroundColor(ArenaTheme.border)
              Text(arenaL10n().thinkersThinking).fontSize(12).fontColor(ArenaTheme.textMuted)
            }
          }
        }
        .padding({ top: 8, bottom: 8 })
        .width('100%')
      }
      .constraintSize({ minHeight: 320 })
      .padding(12)
      .width('100%')
      .backgroundColor(ArenaTheme.surface)
      .border({ width: 1, color: ArenaTheme.border, radius: 12 })

      Row({ space: 10 }) {
        TextInput({ placeholder: arenaL10n().roundtableInputPlaceholder, text: this.userInput })
          .layoutWeight(1)
          .fontColor(ArenaTheme.textPrimary)
          .enabled(!this.isThinking)
          .onChange((v: string) => { this.userInput = v; })
        Button(arenaL10n().send)
          .backgroundColor(ArenaTheme.orangeAccent)
          .fontColor(Color.White)
          .enabled(this.userInput.trim().length > 0 && !this.isThinking)
          .onClick(() => this.sendUser())
      }
      .padding(12)
      .width('100%')
      .backgroundColor(ArenaTheme.surface)
      .border({ width: 1, color: ArenaTheme.border, radius: 10 })
    }
    .width('100%')
  }

  @Builder
  messageRow(msg: RTMessage) {
    Row({ space: 10 }) {
      if (!this.isUserMessage(msg) && this.messagePhilosopher(msg)) {
        Stack() {
          Column()
            .width(40)
            .height(40)
            .borderRadius(20)
            .linearGradient({ angle: 135, colors: [[ArenaTheme.orangeAccent, 0], ['#EF4444D9', 1]] })
          Text(philosopherDisplayName(this.messagePhilosopher(msg)!, arenaL10n().prefersEnglish).substring(0, 1))
            .fontSize(12)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.White)
        }
      }
      if (this.isUserMessage(msg)) {
        Blank().constraintSize({ minWidth: 48 })
      }
      Column({ space: 4 }) {
        if (this.isUserMessage(msg)) {
          Text(arenaL10n().you).fontSize(12).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.orangeAccent)
        } else if (this.messagePhilosopher(msg)) {
          Row() {
            Text(philosopherDisplayName(this.messagePhilosopher(msg)!, arenaL10n().prefersEnglish)).fontSize(12).fontWeight(FontWeight.Medium)
            Text(this.messagePhilosopher(msg)!.school).fontSize(11).fontColor(ArenaTheme.textMuted).margin({ left: 6 })
          }
        }
        if (!this.isUserMessage(msg) && msg.content.length === 0 && this.activeSpeakerId === msg.speaker && this.isThinking && this.messagePhilosopher(msg)) {
          Text(arenaL10n().roundtablePhilosopherThinking(philosopherDisplayName(this.messagePhilosopher(msg)!, arenaL10n().prefersEnglish)))
            .fontSize(14)
            .fontStyle(FontStyle.Italic)
            .fontColor(ArenaTheme.textMuted)
        } else {
          Text(msg.content).fontSize(14).fontColor('#D1D5DB')
        }
      }
      .padding(12)
      .constraintSize(this.isUserMessage(msg) ? { maxWidth: 280 } : { minWidth: 0 })
      .alignItems(this.isUserMessage(msg) ? HorizontalAlign.End : HorizontalAlign.Start)
      .backgroundColor(this.isUserMessage(msg) ? '#F973162E' : ArenaTheme.background)
      .border({
        width: 1,
        color: this.isUserMessage(msg) ? '#F9731673' : ArenaTheme.border,
        radius: 10
      })
      if (this.isUserMessage(msg)) {
        Stack() {
          Column().width(40).height(40).borderRadius(20).backgroundColor(ArenaTheme.orangeAccent)
          Text('👤').fontColor(Color.White)
        }
      }
    }
    .width('100%')
    .justifyContent(this.isUserMessage(msg) ? FlexAlign.End : FlexAlign.Start)
    .alignItems(VerticalAlign.Top)
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
        who = arenaL10n().user;
      } else {
        const p = catalogStore.philosophers.find((x: Philosopher) => x.id === m.speaker);
        if (p) {
          who = philosopherDisplayName(p, arenaL10n().prefersEnglish);
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
    const locale = arenaL10n().prefersEnglish ? 'en' : 'zh';
    const keyIdeas = philosopher.keyIdeas.join('。');
    const summary = philosopher.summary ?? '';
    const hist = this.historyText(prior);
    const onDelta = (_d: string, acc: string) => {
      row = new RTMessage(msgId, philosopher.id, rtStreamDisplay(acc));
      this.messages = prior.concat([row]);
    };
    const resp = mode === 'opening'
      ? await ArenaAPI.streamRoundtablePhilosopherOpening(
        this.debateTopic, philosopher.id,
        philosopherDisplayName(philosopher, arenaL10n().prefersEnglish),
        philosopher.school, keyIdeas, summary, hist, locale, onDelta)
      : await ArenaAPI.streamRoundtablePhilosopherReply(
        this.debateTopic, userText ?? '',
        philosopher.id, philosopherDisplayName(philosopher, arenaL10n().prefersEnglish),
        philosopher.school, keyIdeas, summary, hist, locale, onDelta);
    const final = rtStreamDisplay(resp.text);
    if (!final) {
      throw new Error('empty');
    }
    const done = new RTMessage(msgId, philosopher.id, final);
    this.messages = prior.concat([done]);
    playArenaInteractionSound();
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
    } catch (_e) {
      this.stage = 'setup';
      this.messages = [];
      this.errorAlert = arenaL10n().roundtableOpeningFailed;
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
    } catch (_e) {
      this.messages = this.messages.filter((m: RTMessage) => m.id !== userRowId);
      this.userInput = text;
      this.errorAlert = arenaL10n().roundtableReplyFailed;
      this.showErrorDialog = true;
    }
    this.isThinking = false;
    this.activeSpeakerId = '';
  }
}
