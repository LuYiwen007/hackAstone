import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, Link } from "react-router";
import { ArrowLeft, AlertCircle, MessageSquare } from "lucide-react";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import type { DebateTopicContent } from "../data/debateTopicTypes";
import { DebateSummary } from "../components/DebateSummary";
import { generateTopic, runEchoQuery } from "../../shared/api/arena";
import { parseJsonPayload } from "../../shared/jsonPayload";

type Stage = "topic" | "choose" | "debate" | "reveal";
type Choice = "agree" | "disagree" | "uncertain" | null;
type MessageRole = "user" | "philosopher" | "judge";

type DebateMessage = {
  id: string;
  role: MessageRole;
  content: string;
};

type TurnResult = {
  philosopherReply: string;
  judgeQuestion: string;
  continueDebate: boolean;
};

type SummaryResult = {
  fullExplanation: string;
};

export function PhilosophyBattleLive() {
  const { id } = useParams();
  const { philosophers } = useArenaCatalog();
  const philosopher = philosophers.find((p) => p.id === id);

  const [stage, setStage] = useState<Stage>("topic");
  const [choice, setChoice] = useState<Choice>(null);
  const [topic, setTopic] = useState<DebateTopicContent | null>(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicLoadError, setTopicLoadError] = useState<string | null>(null);
  const [topicReloadToken, setTopicReloadToken] = useState(0);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [canReveal, setCanReveal] = useState(false);
  const [fullExplanation, setFullExplanation] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (!philosopher) return;
    let cancelled = false;
    setTopicLoading(true);
    setTopicLoadError(null);
    generateTopic(philosopher.nameCN, philosopher.school, philosopher.keyIdeas)
      .then((resp) => {
        if (cancelled) return;
        const parsed = parseJsonPayload<DebateTopicContent>(resp.text);
        if (parsed?.question && parsed?.philosopherView && parsed?.oppositeView) {
          setTopic(parsed);
          setFullExplanation(parsed.fullExplanation || "");
        } else {
          throw new Error("模型未返回有效的辩题 JSON");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "辩题生成失败";
        setTopic(null);
        setTopicLoadError(msg);
        toast.error(msg);
      })
      .finally(() => {
        if (!cancelled) setTopicLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [philosopher?.id, topicReloadToken]);

  if (!philosopher) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">思想家不存在</h2>
          <Link to="/" className="text-purple-500 hover:underline">
            返回哲学辩论
          </Link>
        </div>
      </div>
    );
  }

  const handleChoose = (selected: Exclude<Choice, null>) => {
    if (!topic) return;
    setChoice(selected);
    setStage("debate");
    setCanReveal(false);
    setMessages([
      {
        id: `judge-opening-${Date.now()}`,
        role: "judge",
        content: `你选择了「${selected === "agree" ? "同意" : selected === "disagree" ? "不同意" : "不确定"}」。请先陈述你的第一轮理由。`,
      },
    ]);
  };

  const handleUserTurn = async () => {
    const content = userInput.trim();
    if (!content || !choice || !topic || isThinking) return;

    const userMsgId = `user-${Date.now()}`;
    setUserInput("");
    setIsThinking(true);

    const nextMessages = [
      ...messages,
      { id: userMsgId, role: "user" as const, content },
    ];
    setMessages(nextMessages);

    const historyText = nextMessages
      .map((m) => `${m.role === "user" ? "用户" : m.role === "judge" ? "裁判" : philosopher.nameCN}：${m.content}`)
      .join("\n");

    const turnQuery = [
      "[ROLE]",
      "CA-Echo-LLM",
      "",
      "[TASK]",
      "继续一轮哲学辩论：先给哲学家回应，再给裁判追问，并判断是否继续辩论。",
      "",
      "[REPO_CONTEXT]",
      "project=hackAstone",
      "",
      "[TARGET_FILES]",
      "NONE",
      "",
      "[API_CONTRACT]",
      "NONE",
      "",
      "[ACCEPTANCE_CRITERIA]",
      "返回 philosopherReply/judgeQuestion/continueDebate 三个字段",
      "",
      "[CONSTRAINTS]",
      "中文；仅返回 JSON；continueDebate 为布尔值",
      "",
      "[RETURN_FORMAT]",
      "json",
      "",
      `辩题：${topic.question}`,
      `哲学家：${philosopher.nameCN}（${philosopher.school}）`,
      `用户立场：${choice}`,
      "历史：",
      historyText,
    ].join("\n");

    try {
      const resp = await runEchoQuery(turnQuery);
      const parsed = parseJsonPayload<TurnResult>(resp.text);
      if (!parsed?.philosopherReply || !parsed?.judgeQuestion) {
        throw new Error("模型未返回有效的辩论轮次 JSON");
      }
      const turn = parsed;
      setMessages((prev) => [
        ...prev,
        { id: `philosopher-${Date.now()}`, role: "philosopher", content: turn.philosopherReply },
        { id: `judge-${Date.now()}`, role: "judge", content: turn.judgeQuestion },
      ]);
      setCanReveal(turn.continueDebate === false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "辩论生成失败";
      toast.error(msg);
      setMessages((prev) => prev.filter((m) => m.id !== userMsgId));
      setUserInput(content);
    } finally {
      setIsThinking(false);
    }
  };

  const handleReveal = async () => {
    if (!choice || !topic) return;
    setStage("reveal");
    setIsGeneratingSummary(true);
    setFullExplanation("");

    const history = messages
      .map((m) => `${m.role === "user" ? "用户" : m.role === "judge" ? "裁判" : philosopher.nameCN}：${m.content}`)
      .join("\n");

    const summaryQuery = [
      "[ROLE]",
      "CA-Echo-LLM",
      "",
      "[TASK]",
      "根据辩论历史生成完整总结解释。",
      "",
      "[REPO_CONTEXT]",
      "project=hackAstone",
      "",
      "[TARGET_FILES]",
      "NONE",
      "",
      "[API_CONTRACT]",
      "NONE",
      "",
      "[ACCEPTANCE_CRITERIA]",
      "返回 fullExplanation 字段",
      "",
      "[CONSTRAINTS]",
      "中文；仅返回 JSON；内容有层次",
      "",
      "[RETURN_FORMAT]",
      "json",
      "",
      `辩题：${topic.question}`,
      `哲学家：${philosopher.nameCN}`,
      `用户立场：${choice}`,
      "历史：",
      history,
    ].join("\n");

    try {
      const resp = await runEchoQuery(summaryQuery);
      const parsed = parseJsonPayload<SummaryResult>(resp.text);
      if (parsed?.fullExplanation) {
        setFullExplanation(parsed.fullExplanation);
      } else {
        throw new Error("模型未返回 fullExplanation");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "总结生成失败";
      toast.error(msg);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>返回地图</span>
            </Link>
            <div className="text-sm">
              <div className="font-bold">{philosopher.nameCN}</div>
              <div className="text-zinc-500">{philosopher.school}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {stage === "topic" && (
          <div className="max-w-4xl mx-auto">
            {topicLoading && (
              <div className="text-center py-20 text-zinc-400">正在通过后端生成辩题…</div>
            )}
            {!topicLoading && topicLoadError && (
              <div className="text-center py-16 space-y-4">
                <p className="text-red-400">{topicLoadError}</p>
                <button
                  type="button"
                  onClick={() => setTopicReloadToken((t) => t + 1)}
                  className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold"
                >
                  重试
                </button>
              </div>
            )}
            {!topicLoading && !topicLoadError && topic && (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold mb-6">{topic.question}</h1>
                  <p className="text-zinc-400">辩题与观点由后端大模型生成</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl border-2 border-purple-600/30 bg-zinc-900">
                    <div className="font-bold mb-3">{philosopher.nameCN} 立场</div>
                    <p className="text-zinc-300 leading-relaxed">{topic.philosopherView}</p>
                  </div>
                  <div className="p-6 rounded-xl border-2 border-zinc-700 bg-zinc-900">
                    <div className="font-bold mb-3">反方立场</div>
                    <p className="text-zinc-300 leading-relaxed">{topic.oppositeView}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStage("choose")}
                  className="w-full mt-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-bold text-lg"
                >
                  开始辩论
                </button>
              </>
            )}
          </div>
        )}

        {stage === "choose" && topic && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">你的立场？</h2>
              <p className="text-zinc-400">接下来会进入多轮辩论，可连续输入观点</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => handleChoose("agree")} className="p-8 rounded-xl border-2 border-purple-600 bg-purple-950/30">同意</button>
              <button onClick={() => handleChoose("disagree")} className="p-8 rounded-xl border-2 border-zinc-700 bg-zinc-900">不同意</button>
              <button onClick={() => handleChoose("uncertain")} className="p-8 rounded-xl border-2 border-zinc-700 bg-zinc-900">不确定</button>
            </div>
          </div>
        )}

        {stage === "debate" && topic && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-zinc-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>每轮将由哲学家回应 + 裁判追问；是否结束由 Agent 决定</span>
            </div>
            <div className="space-y-4 mb-6">
              {messages.map((m) => (
                <div key={m.id} className={`p-4 rounded-lg border ${m.role === "user" ? "bg-purple-950/30 border-purple-800" : m.role === "philosopher" ? "bg-zinc-900 border-zinc-700" : "bg-yellow-950/20 border-yellow-700/40"}`}>
                  <div className="text-xs mb-2 text-zinc-500">
                    {m.role === "user" ? "你" : m.role === "philosopher" ? philosopher.nameCN : "Judge"}
                  </div>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
              {isThinking && <div className="text-zinc-500 italic">Agent 思考中...</div>}
            </div>

            <div className="flex gap-3">
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleUserTurn()}
                placeholder="继续输入你的观点..."
                className="flex-1 p-3 bg-zinc-950 border border-zinc-700 rounded-lg"
              />
              <button onClick={() => void handleUserTurn()} disabled={!userInput.trim() || isThinking} className="px-6 py-3 bg-purple-600 rounded-lg disabled:opacity-50">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => void handleReveal()}
              disabled={!canReveal && messages.length < 4}
              className="w-full mt-6 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700"
            >
              进入总结
            </button>
          </div>
        )}

        {stage === "reveal" && topic && (
          <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">完整分析</h3>
            <p className="text-zinc-300 whitespace-pre-line">
              {isGeneratingSummary
                ? "Agent 正在生成总结..."
                : fullExplanation || "模型未能生成总结，请检查后端服务后重试。"}
            </p>
            <DebateSummary
              philosopher={philosopher}
              question={topic.question}
              userChoice={choice}
              userReason={messages.filter((m) => m.role === "user").map((m) => m.content).join("\n")}
            />
            <div className="mt-6 flex gap-4">
              <Link to="/" className="flex-1 py-3 rounded-lg border border-zinc-700 text-center">返回地图</Link>
              <Link to="/profile" className="flex-1 py-3 rounded-lg bg-purple-600 text-center">查看思维画像</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
