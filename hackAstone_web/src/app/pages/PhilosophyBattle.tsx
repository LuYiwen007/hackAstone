import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, MessageSquare, AlertCircle, Swords, Users, User } from "lucide-react";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { getDebateTopic } from "../data/debateTopics";
import type { DebateTopicContent } from "../data/debateTopicTypes";
import { DebateSummary } from "../components/DebateSummary";
import { generateTopic } from "../../shared/api/arena";

type Stage = "topic" | "choose" | "reason" | "judge" | "reveal";
type Choice = "agree" | "disagree" | "uncertain" | null;

export function PhilosophyBattle() {
  const { id } = useParams();
  const { philosophers, debateTopics } = useArenaCatalog();
  const philosopher = philosophers.find((p) => p.id === id);
  
  const [stage, setStage] = useState<Stage>("topic");
  const [choice, setChoice] = useState<Choice>(null);
  const [reason, setReason] = useState("");
  const [judgeIndex, setJudgeIndex] = useState(0);
  const [aiTopic, setAiTopic] = useState<DebateTopicContent | null>(null);
  const [topicStreamPreview, setTopicStreamPreview] = useState("");

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

  const fallbackTopic = debateTopics[philosopher.id] ?? getDebateTopic(philosopher.id);
  const topic = aiTopic ?? fallbackTopic;

  useEffect(() => {
    let cancelled = false;
    setTopicStreamPreview("");
    generateTopic(philosopher.nameCN, philosopher.school, philosopher.keyIdeas, {
      onDelta: (_d, acc) => setTopicStreamPreview(acc),
    })
      .then((resp) => {
        const parsed = parseJsonPayload<DebateTopicContent>(resp.text);
        if (!cancelled && parsed?.question && parsed?.judgeQuestions?.length) {
          setAiTopic(parsed);
        }
      })
      .catch(() => {
        // 静默回退到本地数据，避免白屏或阻塞首屏
      })
      .finally(() => {
        if (!cancelled) setTopicStreamPreview("");
      });
    return () => {
      cancelled = true;
    };
  }, [philosopher.id]);

  const handleChoose = (selected: "agree" | "disagree" | "uncertain") => {
    setChoice(selected);
    setStage("reason");
  };

  const handleSubmitReason = () => {
    if (reason.trim().length < 10) {
      alert("请写下更详细的理由（至少10个字）");
      return;
    }
    setStage("judge");
  };

  const handleNextJudgeQuestion = () => {
    if (judgeIndex < topic.judgeQuestions.length - 1) {
      setJudgeIndex(judgeIndex + 1);
    } else {
      setStage("reveal");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回地图</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                {philosopher.nameCN[0]}
              </div>
              <div className="text-sm">
                <div className="font-bold">{philosopher.nameCN}</div>
                <div className="text-zinc-500">{philosopher.school}</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold"
            >
              哲学辩论
            </Link>
            <Link
              to="/disciplines"
              className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            >
              学科辩论
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Topic Stage */}
        {stage === "topic" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-6">{topic.question}</h1>
              <p className="text-zinc-400">
                你将与 {philosopher.nameCN} 进行一场思想辩论
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Philosopher View */}
              <div className="p-6 rounded-xl border-2 border-purple-600/30 bg-zinc-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                    {philosopher.nameCN[0]}
                  </div>
                  <div>
                    <div className="font-bold">{philosopher.nameCN}</div>
                    <div className="text-xs text-zinc-500">正方立场</div>
                  </div>
                </div>
                <p className="text-zinc-300 leading-relaxed">{topic.philosopherView}</p>
              </div>

              {/* Opposite View */}
              <div className="p-6 rounded-xl border-2 border-zinc-700 bg-zinc-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
                    反
                  </div>
                  <div>
                    <div className="font-bold">反方立场</div>
                    <div className="text-xs text-zinc-500">质疑观点</div>
                  </div>
                </div>
                <p className="text-zinc-300 leading-relaxed">{topic.oppositeView}</p>
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

        {/* Choose Stage */}
        {stage === "choose" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">你的立场？</h2>
              <p className="text-zinc-400">必须选择一方（即使你不确定）</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => handleChoose("agree")}
                className="p-8 rounded-xl border-2 border-purple-600 bg-purple-950/30 hover:bg-purple-950/50 transition-all group"
              >
                <div className="text-5xl mb-4">✓</div>
                <div className="font-bold text-xl mb-2">同意 {philosopher.nameCN}</div>
                <p className="text-sm text-zinc-400">支持正方观点</p>
              </button>

              <button
                onClick={() => handleChoose("disagree")}
                className="p-8 rounded-xl border-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-all group"
              >
                <div className="text-5xl mb-4">✗</div>
                <div className="font-bold text-xl mb-2">不同意</div>
                <p className="text-sm text-zinc-400">支持反方观点</p>
              </button>

              <button
                onClick={() => handleChoose("uncertain")}
                className="p-8 rounded-xl border-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-all group"
              >
                <div className="text-5xl mb-4">?</div>
                <div className="font-bold text-xl mb-2">不确定</div>
                <p className="text-sm text-zinc-400">两方都有道理</p>
              </button>
            </div>
          </div>
        )}

        {/* Reason Stage */}
        {stage === "reason" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">写下你的理由</h2>
              <p className="text-zinc-400">为什么你选择这个立场？</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <span className="font-bold">你选择了：</span>
                <span className="text-purple-400">
                  {choice === "agree" && `同意${philosopher.nameCN}`}
                  {choice === "disagree" && "不同意"}
                  {choice === "uncertain" && "不确定"}
                </span>
              </div>
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="写下你的思考过程和理由..."
              className="w-full h-64 p-6 rounded-xl bg-zinc-950 border-2 border-zinc-700 focus:border-purple-500 focus:outline-none resize-none text-zinc-100"
            />

            <button
              onClick={handleSubmitReason}
              className="w-full mt-6 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-bold text-lg"
            >
              提交理由
            </button>
          </div>
        )}

        {/* Judge Stage */}
        {stage === "judge" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-600/20 text-yellow-500 mb-6">
                <AlertCircle className="w-5 h-5" />
                <span>Judge 追问环节</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">等等，让我追问一下</h2>
              <p className="text-zinc-400">
                问题 {judgeIndex + 1} / {topic.judgeQuestions.length}
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-950/20 to-zinc-950 border-2 border-yellow-600/30 rounded-xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center font-bold flex-shrink-0">
                  J
                </div>
                <div className="flex-1">
                  <div className="font-bold mb-2 text-yellow-400">Judge 提问</div>
                  <p className="text-xl leading-relaxed">{topic.judgeQuestions[judgeIndex]}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <User className="w-5 h-5 text-zinc-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-zinc-500 mb-2">你之前的理由</div>
                  <p className="text-zinc-300">{reason}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextJudgeQuestion}
              className="w-full py-4 rounded-lg bg-yellow-600 hover:bg-yellow-700 transition-colors font-bold text-lg"
            >
              {judgeIndex < topic.judgeQuestions.length - 1 ? "继续下一个问题" : "揭示完整分析"}
            </button>
          </div>
        )}

        {/* Reveal Stage */}
        {stage === "reveal" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-purple-600/30 rounded-xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
                  {philosopher.nameCN[0]}
                </div>
                <h3 className="text-2xl font-bold mb-2">{philosopher.nameCN} 的完整思想</h3>
                <p className="text-zinc-400">关于"{topic.question}"这个问题</p>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-base leading-relaxed whitespace-pre-line text-zinc-300">
                  {topic.fullExplanation}
                </div>
              </div>

              {/* Debate Summary */}
              <DebateSummary 
                philosopher={philosopher}
                question={topic.question}
                userChoice={choice}
                userReason={reason}
              />

              <div className="mt-8 pt-8 border-t border-zinc-800 flex gap-4">
                <Link 
                  to="/"
                  className="flex-1 py-4 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors text-center font-bold"
                >
                  返回地图
                </Link>
                <Link 
                  to="/profile"
                  className="flex-1 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-center font-bold"
                >
                  查看思维画像
                </Link>
              </div>
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
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return tryParse<T>(trimmed.slice(first, last + 1));
  return null;
}

function tryParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}