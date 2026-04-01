import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, AlertCircle, MessageSquare, User } from "lucide-react";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { getDebateTopic } from "../data/debateTopics";
import type { DebateTopicContent } from "../data/debateTopicTypes";
import { DebateSummary } from "../components/DebateSummary";
import { runEchoQuery } from "../../shared/api/arena";

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
  const { philosophers, debateTopics } = useArenaCatalog();
  const philosopher = philosophers.find((p) => p.id === id);

  const [stage, setStage] = useState<Stage>("topic");
  const [choice, setChoice] = useState<Choice>(null);
  const [topic, setTopic] = useState<DebateTopicContent | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [canReveal, setCanReveal] = useState(false);
  const [fullExplanation, setFullExplanation] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const fallbackTopic = useMemo(() => {
    if (!philosopher) return getDebateTopic("unknown");
    return debateTopics[philosopher.id] ?? getDebateTopic(philosopher.id);
  }, [philosopher, debateTopics]);

  useEffect(() => {
    if (!philosopher) return;
    let cancelled = false;
    const query = [
      "[ROLE]",
      "CA-Echo-LLM",
      "",
      "[TASK]",
      "为指定哲学家生成一场辩论题，返回 JSON。",
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
      "返回字段 question/philosopherView/oppositeView/judgeQuestions/fullExplanation",
      "",
      "[CONSTRAINTS]",
      "中文输出；judgeQuestions 至少 3 条；仅返回 JSON",
      "",
      "[RETURN_FORMAT]",
      "json",
      "",
      `思想家：${philosopher.nameCN}；学派：${philosopher.school}；关键思想：${philosopher.keyIdeas.join("、")}`,
    ].join("\n");

    runEchoQuery(query)
      .then((resp) => {
        const parsed = parseJsonPayload<DebateTopicContent>(resp.text);
        if (!cancelled && parsed?.question && parsed?.philosopherView && parsed?.oppositeView) {
          setTopic(parsed);
          setFullExplanation(parsed.fullExplanation || "");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTopic(fallbackTopic);
          setFullExplanation(fallbackTopic.fullExplanation || "");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [philosopher?.id, fallbackTopic]);

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

  const currentTopic = topic ?? fallbackTopic;

  const handleChoose = (selected: Exclude<Choice, null>) => {
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
    if (!content || !choice || isThinking) return;
    setUserInput("");
    setIsThinking(true);

    const nextMessages = [
      ...messages,
      { id: `user-${Date.now()}`, role: "user" as const, content },
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
      `辩题：${currentTopic.question}`,
      `哲学家：${philosopher.nameCN}（${philosopher.school}）`,
      `用户立场：${choice}`,
      "历史：",
      historyText,
    ].join("\n");

    try {
      const resp = await runEchoQuery(turnQuery);
      const parsed = parseJsonPayload<TurnResult>(resp.text);
      const turn = parsed?.philosopherReply && parsed?.judgeQuestion
        ? parsed
        : localTurnFallback(philosopher.nameCN, content);
      setMessages((prev) => [
        ...prev,
        { id: `philosopher-${Date.now()}`, role: "philosopher", content: turn.philosopherReply },
        { id: `judge-${Date.now()}`, role: "judge", content: turn.judgeQuestion },
      ]);
      setCanReveal(turn.continueDebate === false);
    } catch {
      const turn = localTurnFallback(philosopher.nameCN, content);
      setMessages((prev) => [
        ...prev,
        { id: `philosopher-${Date.now()}`, role: "philosopher", content: turn.philosopherReply },
        { id: `judge-${Date.now()}`, role: "judge", content: turn.judgeQuestion },
      ]);
      setCanReveal(false);
    } finally {
      setIsThinking(false);
    }
  };

  const handleReveal = async () => {
    if (!choice) return;
    setStage("reveal");
    setIsGeneratingSummary(true);

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
      `辩题：${currentTopic.question}`,
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
      }
    } catch {
      // 回退保留当前 fullExplanation
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
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-6">{currentTopic.question}</h1>
              <p className="text-zinc-400">观点由 Agent 生成，失败时自动回退本地内容</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border-2 border-purple-600/30 bg-zinc-900">
                <div className="font-bold mb-3">{philosopher.nameCN} 立场</div>
                <p className="text-zinc-300 leading-relaxed">{currentTopic.philosopherView}</p>
              </div>
              <div className="p-6 rounded-xl border-2 border-zinc-700 bg-zinc-900">
                <div className="font-bold mb-3">反方立场</div>
                <p className="text-zinc-300 leading-relaxed">{currentTopic.oppositeView}</p>
              </div>
            </div>
            <button
              onClick={() => setStage("choose")}
              className="w-full mt-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-bold text-lg"
            >
              开始辩论
            </button>
          </div>
        )}

        {stage === "choose" && (
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

        {stage === "debate" && (
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
                onKeyDown={(e) => e.key === "Enter" && handleUserTurn()}
                placeholder="继续输入你的观点..."
                className="flex-1 p-3 bg-zinc-950 border border-zinc-700 rounded-lg"
              />
              <button onClick={handleUserTurn} disabled={!userInput.trim() || isThinking} className="px-6 py-3 bg-purple-600 rounded-lg disabled:opacity-50">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleReveal}
              disabled={!canReveal && messages.length < 4}
              className="w-full mt-6 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700"
            >
              进入总结
            </button>
          </div>
        )}

        {stage === "reveal" && (
          <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">完整分析</h3>
            <p className="text-zinc-300 whitespace-pre-line">{isGeneratingSummary ? "Agent 正在生成总结..." : fullExplanation || currentTopic.fullExplanation}</p>
            <DebateSummary
              philosopher={philosopher}
              question={currentTopic.question}
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

function parseJsonPayload<T>(raw: string): T | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const direct = tryParse<T>(trimmed);
  if (direct) return direct;
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i) || trimmed.match(/```\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return tryParse<T>(fenced[1].trim());
  const firstObj = trimmed.indexOf("{");
  const lastObj = trimmed.lastIndexOf("}");
  if (firstObj >= 0 && lastObj > firstObj) return tryParse<T>(trimmed.slice(firstObj, lastObj + 1));
  return null;
}

function tryParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function localTurnFallback(philosopherName: string, userInput: string): TurnResult {
  return {
    philosopherReply: `${philosopherName}：你的观点“${userInput.slice(0, 30)}...”很有启发，但我们要先界定核心概念，否则容易偷换前提。`,
    judgeQuestion: "Judge：你这轮论证里最关键的前提是什么？如果这个前提不成立，你会如何调整观点？",
    continueDebate: true,
  };
}
