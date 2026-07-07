import { ArenaTheme } from '../common/ArenaTheme';
import { ArenaAPI } from '../api/ArenaAPI';
import { arenaL10n } from '../route/GlobalStores';

class ModernScenarioDef {
  id: string = '';
  title: string = '';
  description: string = '';
  icon: string = '';

  constructor(id: string, title: string, description: string, icon: string) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.icon = icon;
  }
}

const MODERN_SCENARIOS: ModernScenarioDef[] = [
  new ModernScenarioDef('climate', '气候变化与环境危机', '全球变暖、碳排放、可持续发展', '🌍'),
  new ModernScenarioDef('ai', 'AI与人类自由意志', '人工智能是否会取代人类决策和创造力', '🤖'),
  new ModernScenarioDef('social-media', '社交媒体成瘾', '数字时代的注意力经济与心理健康', '📱'),
  new ModernScenarioDef('inequality', '贫富差距加剧', '全球化时代的财富分配与社会公平', '⚖️'),
  new ModernScenarioDef('education', '教育体制改革', '应试教育vs素质教育，知识vs能力', '📚'),
  new ModernScenarioDef('work-life', '996与工作生活平衡', '现代职场文化与个人幸福感', '⏰'),
];

function buildModernScenarioPrompt(
  philosopherName: string,
  philosopherId: string,
  coreIdeas: string[],
  scenarioTitle: string,
  scenarioDescription: string
): string {
  return `[ROLE]
CA-Echo-LLM

[TASK]
以该哲学家的思想风格与方法，分析下列当代社会议题。输出 Markdown（可用 ## 小标题）。
包含：核心诊断、具体分析或建议、对当代的启示、该视角的局限性。

[CONSTRAINTS]
中文；不要声称调用了外部检索工具；阐释观点时保持哲学严谨。

[CONTEXT] 哲学家中文名=${philosopherName}；id=${philosopherId}；核心思想=${coreIdeas.join('、')}
[议题] ${scenarioTitle}
[说明] ${scenarioDescription}`;
}

function buildCustomScenarioPrompt(
  philosopherName: string,
  philosopherId: string,
  coreIdeas: string[],
  userTopic: string
): string {
  return `[ROLE]
CA-Echo-LLM

[TASK]
用户提出一个自定义当代议题。请以该哲学家的思想风格给出系统分析，输出 Markdown。
包含：问题界定、核心论证、可操作建议、反思与局限。

[CONSTRAINTS]
中文；不要声称调用了外部检索工具。

[CONTEXT] 哲学家中文名=${philosopherName}；id=${philosopherId}；核心思想=${coreIdeas.join('、')}
[用户议题] ${userTopic}`;
}

/** 对齐 Web `ModernApplication`：当代议题延伸分析。 */
@Component
export struct ModernApplicationSection {
  @Prop philosopherName: string = '';
  @Prop philosopherId: string = '';
  @Prop coreIdeas: string[] = [];

  @State selectedScenario: string = '';
  @State customScenario: string = '';
  @State showCustomInput: boolean = false;
  @State analysis: string = '';
  @State isAnalyzing: boolean = false;
  @State streamPreview: string = '';
  @State errorText: string = '';

  private async runAnalysis(prompt: string): Promise<void> {
    this.isAnalyzing = true;
    this.analysis = '';
    this.streamPreview = '';
    this.errorText = '';
    try {
      const resp = await ArenaAPI.runEcho(prompt, (_d: string, acc: string) => {
        this.streamPreview = acc;
      });
      const text = resp.text?.trim() ?? '';
      if (text.length === 0) {
        throw new Error(arenaL10n().topicBadJson);
      }
      this.analysis = text;
    } catch (e) {
      this.errorText = e instanceof Error ? e.message : String(e);
      this.selectedScenario = '';
    } finally {
      this.isAnalyzing = false;
      this.streamPreview = '';
    }
  }

  private handleScenarioClick(scenarioId: string): void {
    const scenario = MODERN_SCENARIOS.find((s: ModernScenarioDef) => s.id === scenarioId);
    if (!scenario) {
      return;
    }
    this.selectedScenario = scenarioId;
    const prompt = buildModernScenarioPrompt(
      this.philosopherName, this.philosopherId, this.coreIdeas, scenario.title, scenario.description
    );
    this.runAnalysis(prompt);
  }

  private handleCustomSubmit(): void {
    const trimmed = this.customScenario.trim();
    if (trimmed.length === 0) {
      return;
    }
    this.selectedScenario = 'custom';
    const prompt = buildCustomScenarioPrompt(this.philosopherName, this.philosopherId, this.coreIdeas, trimmed);
    this.runAnalysis(prompt).then(() => {
      if (this.analysis.length > 0) {
        this.showCustomInput = false;
      }
    });
  }

  private resetView(): void {
    this.selectedScenario = '';
    this.analysis = '';
    this.customScenario = '';
    this.showCustomInput = false;
    this.errorText = '';
  }

  build() {
    Column({ space: 16 }) {
      Row({ space: 8 }) {
        Text('💡').fontSize(18)
        Text(arenaL10n().modernApplicationTitle)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(ArenaTheme.textPrimary)
      }
      Text(arenaL10n().modernApplicationSubtitle(this.philosopherName))
        .fontSize(12)
        .fontColor(ArenaTheme.textMuted)

      if (this.errorText.length > 0) {
        Text(this.errorText).fontSize(12).fontColor('#E57373')
      }

      if (this.isAnalyzing) {
        Column({ space: 8 }) {
          Text(arenaL10n().modernApplicationThinking(this.philosopherName))
            .fontSize(14)
            .fontColor(ArenaTheme.textMuted)
          if (this.streamPreview.length > 0) {
            Text(this.streamPreview)
              .fontSize(12)
              .fontColor(ArenaTheme.textMuted)
              .maxLines(8)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
          }
        }
        .width('100%')
        .padding(16)
        .backgroundColor(ArenaTheme.background)
        .borderRadius(12)
      } else if (this.analysis.length > 0) {
        Column({ space: 10 }) {
          Row() {
            Text(arenaL10n().modernApplicationPerspective(this.philosopherName))
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor(ArenaTheme.orangeAccent)
            Blank()
            Text(arenaL10n().modernApplicationChangeScene)
              .fontSize(12)
              .fontColor(ArenaTheme.textMuted)
              .onClick(() => this.resetView())
          }
          .width('100%')
          Text(this.analysis)
            .fontSize(14)
            .fontColor('#D1D5DB')
            .lineHeight(22)
        }
        .width('100%')
        .padding(16)
        .backgroundColor(ArenaTheme.background)
        .borderRadius(12)
        .border({ width: 1, color: '#F9731640' })
      } else if (this.showCustomInput) {
        Column({ space: 10 }) {
          Text(arenaL10n().modernApplicationCustomLabel).fontSize(14).fontColor(ArenaTheme.textPrimary)
          TextInput({ text: this.customScenario, placeholder: arenaL10n().modernApplicationCustomPlaceholder })
            .fontColor(ArenaTheme.textPrimary)
            .backgroundColor(ArenaTheme.background)
            .onChange((v: string) => { this.customScenario = v; })
          Row({ space: 10 }) {
            Button(arenaL10n().modernApplicationGenerate)
              .layoutWeight(1)
              .backgroundColor(ArenaTheme.orangeAccent)
              .onClick(() => this.handleCustomSubmit())
            Button(arenaL10n().cancel)
              .backgroundColor(ArenaTheme.surface)
              .onClick(() => { this.showCustomInput = false; })
          }
        }
        .width('100%')
        .padding(16)
        .backgroundColor(ArenaTheme.background)
        .borderRadius(12)
      } else {
        Column({ space: 10 }) {
          ForEach(MODERN_SCENARIOS, (scenario: ModernScenarioDef) => {
            Row({ space: 10 }) {
              Text(scenario.icon).fontSize(24)
              Column({ space: 4 }) {
                Text(scenario.title).fontSize(14).fontWeight(FontWeight.Medium).fontColor(ArenaTheme.textPrimary)
                Text(scenario.description).fontSize(12).fontColor(ArenaTheme.textMuted)
              }
              .alignItems(HorizontalAlign.Start)
              .layoutWeight(1)
            }
            .width('100%')
            .padding(12)
            .backgroundColor(ArenaTheme.background)
            .borderRadius(10)
            .border({ width: 1, color: ArenaTheme.border })
            .onClick(() => this.handleScenarioClick(scenario.id))
          }, (scenario: ModernScenarioDef) => scenario.id)

          Button(arenaL10n().modernApplicationCustomCta)
            .width('100%')
            .fontColor(ArenaTheme.orangeAccent)
            .backgroundColor(ArenaTheme.background)
            .border({ width: 1, color: '#F9731660', radius: 10, style: BorderStyle.Dashed })
            .onClick(() => { this.showCustomInput = true; })
        }
      }
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
    .padding({ top: 16 })
    .border({ width: { top: 1 }, color: '#F9731640' })
  }
}
