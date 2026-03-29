import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, MessageSquare, AlertCircle, Swords, Users, User } from "lucide-react";
import { useArenaCatalog } from "../context/ArenaCatalogContext";

type Stage = "choose" | "reason" | "judge" | "reveal";
type Choice = "builder" | "breaker" | "uncertain" | null;

export function Battle() {
  const { id } = useParams();
  const { battles } = useArenaCatalog();
  const battle = battles.find((b) => b.id === id);
  
  const [stage, setStage] = useState<Stage>("choose");
  const [choice, setChoice] = useState<Choice>(null);
  const [reason, setReason] = useState("");
  const [judgeIndex, setJudgeIndex] = useState(0);

  if (!battle) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">对局不存在</h2>
          <Link to="/disciplines" className="text-orange-500 hover:underline">
            返回学科辩论
          </Link>
        </div>
      </div>
    );
  }

  const handleChoose = (selected: Choice) => {
    setChoice(selected);
  };

  const handleSubmitReason = () => {
    if (reason.trim().length < 10) {
      alert("请写下更详细的理由（至少10个字）");
      return;
    }
    setStage("judge");
  };

  const handleNextJudgeQuestion = () => {
    if (judgeIndex < battle.judgeQuestions.length - 1) {
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
              to="/disciplines"
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回学科辩论</span>
            </Link>
            <div className="text-sm text-zinc-500">{battle.category}</div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            >
              哲学辩论
            </Link>
            <Link
              to="/disciplines"
              className="px-4 py-2 rounded-lg bg-orange-600 text-white font-bold"
            >
              学科辩论
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Question */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">{battle.question}</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span>对局进行中</span>
          </div>
        </div>

        {/* Builder vs Breaker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Builder */}
          <div 
            className={`p-6 rounded-xl border-2 transition-all ${
              choice === "builder" 
                ? "border-blue-500 bg-blue-950/30" 
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                B
              </div>
              <div>
                <h3 className="font-bold text-lg">Builder</h3>
                <p className="text-xs text-zinc-500">建构者</p>
              </div>
            </div>
            <p className="text-zinc-300 leading-relaxed">{battle.builderView}</p>
          </div>

          {/* Breaker */}
          <div 
            className={`p-6 rounded-xl border-2 transition-all ${
              choice === "breaker" 
                ? "border-red-500 bg-red-950/30" 
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
                B
              </div>
              <div>
                <h3 className="font-bold text-lg">Breaker</h3>
                <p className="text-xs text-zinc-500">破坏者</p>
              </div>
            </div>
            <p className="text-zinc-300 leading-relaxed">{battle.breakerView}</p>
          </div>
        </div>

        {/* Choice Stage */}
        {stage === "choose" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 text-center">你的立场</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleChoose("builder")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    choice === "builder"
                      ? "border-blue-500 bg-blue-950/30"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="font-bold mb-1">我支持 Builder</div>
                  <div className="text-sm text-zinc-500">建构者的观点更有说服力</div>
                </button>
                <button
                  onClick={() => handleChoose("breaker")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    choice === "breaker"
                      ? "border-red-500 bg-red-950/30"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="font-bold mb-1">我支持 Breaker</div>
                  <div className="text-sm text-zinc-500">破坏者的观点更有说服力</div>
                </button>
                <button
                  onClick={() => handleChoose("uncertain")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    choice === "uncertain"
                      ? "border-orange-500 bg-orange-950/30"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="font-bold mb-1">我不确定</div>
                  <div className="text-sm text-zinc-500">但我会解释我的困惑</div>
                </button>
              </div>
              
              {choice && (
                <button
                  onClick={() => setStage("reason")}
                  className="w-full mt-6 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
                >
                  继续：说明理由
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reason Stage */}
        {stage === "reason" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <div className="flex items-start gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">说明你的理由</h3>
                  <p className="text-sm text-zinc-400">
                    不是选答案，是解释你为什么这么选。这是思考的关键环节。
                  </p>
                </div>
              </div>
              
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="写下你的思考过程：为什么你支持这个观点？你的假设是什么？你考虑了哪些因素？"
                className="w-full h-40 p-4 rounded-lg bg-zinc-950 border border-zinc-700 focus:border-orange-500 focus:outline-none resize-none"
              />
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-zinc-500">
                  {reason.length} 字
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStage("choose")}
                    className="px-6 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
                  >
                    返回
                  </button>
                  <button
                    onClick={handleSubmitReason}
                    className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
                  >
                    提交理由
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Judge Stage */}
        {stage === "judge" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900 border-2 border-orange-600/30 rounded-xl p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center font-bold text-xl">
                  J
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Judge</h3>
                  <p className="text-sm text-zinc-400">冷静的考官</p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-lg leading-relaxed">
                    {battle.judgeQuestions[judgeIndex]}
                  </p>
                </div>
              </div>

              <div className="text-sm text-zinc-500 mb-6 text-center">
                Judge 追问 {judgeIndex + 1} / {battle.judgeQuestions.length}
              </div>

              <button
                onClick={handleNextJudgeQuestion}
                className="w-full py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
              >
                {judgeIndex < battle.judgeQuestions.length - 1 ? "继续思考" : "查看完整分析"}
              </button>
            </div>
          </div>
        )}

        {/* Reveal Stage */}
        {stage === "reveal" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-orange-600/30 rounded-xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  💡
                </div>
                <h3 className="text-2xl font-bold mb-2">完整视角</h3>
                <p className="text-zinc-400">经过思考后，这是一个更完整的分析</p>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-lg leading-relaxed whitespace-pre-line text-zinc-300">
                  {battle.reveal}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800 flex gap-4">
                <Link 
                  to="/"
                  className="flex-1 py-4 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors text-center font-bold"
                >
                  返回首页
                </Link>
                <Link 
                  to="/profile"
                  className="flex-1 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors text-center font-bold"
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