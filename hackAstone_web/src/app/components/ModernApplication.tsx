import { useState } from "react";
import { toast } from "sonner";
import { Lightbulb, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { runEchoQuery } from "../../shared/api/arena";

interface ModernApplicationProps {
  philosopherName: string;
  philosopherId: string;
  coreIdeas: string[];
}

const modernScenarios = [
  {
    id: "climate",
    title: "气候变化与环境危机",
    description: "全球变暖、碳排放、可持续发展",
    icon: "🌍",
  },
  {
    id: "ai",
    title: "AI与人类自由意志",
    description: "人工智能是否会取代人类决策和创造力",
    icon: "🤖",
  },
  {
    id: "social-media",
    title: "社交媒体成瘾",
    description: "数字时代的注意力经济与心理健康",
    icon: "📱",
  },
  {
    id: "inequality",
    title: "贫富差距加剧",
    description: "全球化时代的财富分配与社会公平",
    icon: "⚖️",
  },
  {
    id: "education",
    title: "教育体制改革",
    description: "应试教育vs素质教育，知识vs能力",
    icon: "📚",
  },
  {
    id: "work-life",
    title: "996与工作生活平衡",
    description: "现代职场文化与个人幸福感",
    icon: "⏰",
  },
];

function buildModernScenarioPrompt(
  philosopherName: string,
  philosopherId: string,
  coreIdeas: string[],
  scenarioTitle: string,
  scenarioDescription: string
): string {
  return [
    "[ROLE]",
    "CA-Echo-LLM",
    "",
    "[TASK]",
    "以该哲学家的思想风格与方法，分析下列当代社会议题。输出 Markdown（可用 ## 小标题）。",
    "包含：核心诊断、具体分析或建议、对当代的启示、该视角的局限性。",
    "",
    "[CONSTRAINTS]",
    "中文；不要声称调用了外部检索工具；阐释观点时保持哲学严谨。",
    "",
    `[CONTEXT] 哲学家中文名=${philosopherName}；id=${philosopherId}；核心思想=${coreIdeas.join("、")}`,
    `[议题] ${scenarioTitle}`,
    `[说明] ${scenarioDescription}`,
  ].join("\n");
}

function buildCustomScenarioPrompt(
  philosopherName: string,
  philosopherId: string,
  coreIdeas: string[],
  userTopic: string
): string {
  return [
    "[ROLE]",
    "CA-Echo-LLM",
    "",
    "[TASK]",
    "用户提出一个自定义当代议题。请以该哲学家的思想风格给出系统分析，输出 Markdown。",
    "包含：问题界定、核心论证、可操作建议、反思与局限。",
    "",
    "[CONSTRAINTS]",
    "中文；不要声称调用了外部检索工具。",
    "",
    `[CONTEXT] 哲学家中文名=${philosopherName}；id=${philosopherId}；核心思想=${coreIdeas.join("、")}`,
    `[用户议题] ${userTopic}`,
  ].join("\n");
}

export function ModernApplication({ philosopherName, philosopherId, coreIdeas }: ModernApplicationProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [customScenario, setCustomScenario] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamPreview, setStreamPreview] = useState("");

  const handleScenarioClick = (scenarioId: string) => {
    const scenario = modernScenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    setSelectedScenario(scenarioId);
    setIsAnalyzing(true);
    setAnalysis("");
    setStreamPreview("");
    const prompt = buildModernScenarioPrompt(
      philosopherName,
      philosopherId,
      coreIdeas,
      scenario.title,
      scenario.description
    );
    runEchoQuery(prompt, { onDelta: (_d, acc) => setStreamPreview(acc) })
      .then((resp) => {
        const text = resp.text?.trim();
        if (!text) throw new Error("模型返回为空");
        setAnalysis(text);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "分析生成失败";
        toast.error(msg);
        setSelectedScenario(null);
      })
      .finally(() => {
        setIsAnalyzing(false);
        setStreamPreview("");
      });
  };

  const handleCustomSubmit = () => {
    const trimmed = customScenario.trim();
    if (!trimmed) return;
    setIsAnalyzing(true);
    setAnalysis("");
    setStreamPreview("");
    const prompt = buildCustomScenarioPrompt(philosopherName, philosopherId, coreIdeas, trimmed);
    runEchoQuery(prompt, { onDelta: (_d, acc) => setStreamPreview(acc) })
      .then((resp) => {
        const text = resp.text?.trim();
        if (!text) throw new Error("模型返回为空");
        setAnalysis(text);
        setShowCustomInput(false);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "分析生成失败";
        toast.error(msg);
      })
      .finally(() => {
        setIsAnalyzing(false);
        setStreamPreview("");
      });
  };

  return (
    <div className="mt-8 border-t border-orange-900/30 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-orange-500" />
        <h3 className="text-xl font-bold text-white">
          现代应用场景挑战
        </h3>
        <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
          把思想应用到2026年的真实问题
        </span>
      </div>

      {!selectedScenario && !showCustomInput && (
        <div>
          <p className="text-zinc-400 mb-6">
            选择一个当代议题，看看{philosopherName}会如何分析：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modernScenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioClick(scenario.id)}
                disabled={isAnalyzing}
                className="group text-left p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-900/50 rounded-lg transition-all disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{scenario.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1 group-hover:text-orange-500 transition-colors">
                      {scenario.title}
                    </h4>
                    <p className="text-sm text-zinc-500">
                      {scenario.description}
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-zinc-600 group-hover:text-orange-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            disabled={isAnalyzing}
            className="mt-4 w-full p-4 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 hover:border-orange-900/50 rounded-lg transition-all text-zinc-400 hover:text-orange-500 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            <span>或者，输入你自己的议题</span>
          </button>
        </div>
      )}

      {showCustomInput && !selectedScenario && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <label className="block text-white mb-3">
            输入你想探讨的2026年现实问题：
          </label>
          <input
            type="text"
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            placeholder="例如：元宇宙对人际关系的影响..."
            className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-orange-900/50 mb-4"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCustomSubmit}
              disabled={!customScenario.trim() || isAnalyzing}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              生成分析
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-zinc-400">
            {philosopherName}正在思考中...
          </p>
          {streamPreview ? (
            <pre className="max-h-48 overflow-auto text-left text-sm whitespace-pre-wrap text-zinc-500">{streamPreview}</pre>
          ) : null}
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="bg-zinc-900 border border-orange-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-orange-500">
              {philosopherName}的2026视角
            </h4>
            <button
              type="button"
              onClick={() => {
                setSelectedScenario(null);
                setAnalysis("");
                setCustomScenario("");
                setShowCustomInput(false);
              }}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              换个场景
            </button>
          </div>
          <div className="prose prose-invert prose-orange max-w-none">
            <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {analysis}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
