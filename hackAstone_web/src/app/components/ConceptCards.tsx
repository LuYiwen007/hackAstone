import { useState } from "react";
import { toast } from "sonner";
import {
  Brain,
  BookOpen,
  Download,
  Shuffle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { runEchoQuery } from "../../shared/api/arena";
import { parseJsonPayload } from "../../shared/jsonPayload";

interface ConceptCardsProps {
  debateTopic: string;
  philosopherName: string;
  concepts?: ConceptCard[];
}

interface ConceptCard {
  id: string;
  term: string;
  definition: string;
  example: string;
  difficulty: "easy" | "medium" | "hard";
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

function flashcardsPrompt(debateTopic: string, philosopherName: string): string {
  return [
    "[ROLE]",
    "CA-Echo-LLM",
    "",
    "[TASK]",
    "根据辩题与哲学家，生成用于主动回忆的概念闪卡，仅返回 JSON。",
    "",
    "[RETURN_FORMAT]",
    '{"cards":[{"id":"1","term":"...","definition":"...","example":"...","difficulty":"easy"|"medium"|"hard"}]}',
    "",
    "[CONSTRAINTS]",
    "至少 5 张卡片；与辩题及该哲学家思想直接相关；不要 markdown 围栏；仅返回 JSON 对象。",
    "",
    `辩题：${debateTopic}`,
    `哲学家：${philosopherName}`,
  ].join("\n");
}

function quizPrompt(debateTopic: string, philosopherName: string): string {
  return [
    "[ROLE]",
    "CA-Echo-LLM",
    "",
    "[TASK]",
    "根据辩题与哲学家生成单选题测验，仅返回 JSON。",
    "",
    "[RETURN_FORMAT]",
    '{"questions":[{"id":"q1","question":"...","options":["A...","B...","C...","D..."],"correctAnswer":0,"explanation":"..."}]}',
    "",
    "[CONSTRAINTS]",
    "至少 4 题；每题 4 个选项；correctAnswer 为正确选项在 options 数组中的 0-based 索引；中文；仅返回 JSON 对象。",
    "",
    `辩题：${debateTopic}`,
    `哲学家：${philosopherName}`,
  ].join("\n");
}

type CardsPayload = { cards?: ConceptCard[] };
type QuizPayload = { questions?: QuizQuestion[] };

function normalizeCards(raw: ConceptCard[]): ConceptCard[] {
  return raw
    .filter((c) => c.term && c.definition)
    .map((c, i) => ({
      id: String(c.id ?? i + 1),
      term: c.term,
      definition: c.definition,
      example: c.example || "（无）",
      difficulty: ["easy", "medium", "hard"].includes(c.difficulty) ? c.difficulty : "medium",
    }));
}

function normalizeQuiz(raw: QuizQuestion[]): QuizQuestion[] {
  return raw
    .filter((q) => q.question && Array.isArray(q.options) && q.options.length >= 2)
    .map((q, i) => ({
      id: String(q.id ?? `q${i + 1}`),
      question: q.question,
      options: q.options,
      correctAnswer:
        typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer < q.options.length
          ? q.correctAnswer
          : 0,
      explanation: q.explanation || "",
    }));
}

type ViewMode = "flashcards" | "quiz" | "none";

export function ConceptCards({
  debateTopic,
  philosopherName,
  concepts,
}: ConceptCardsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("none");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cards, setCards] = useState<ConceptCard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<
    QuizQuestion[]
  >([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<
    number | null
  >(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState({
    correct: 0,
    total: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateFlashcards = () => {
    if (concepts?.length) {
      setCards(concepts);
      setViewMode("flashcards");
      setCurrentCardIndex(0);
      setShowAnswer(false);
      return;
    }
    setIsGenerating(true);
    runEchoQuery(flashcardsPrompt(debateTopic, philosopherName))
      .then((resp) => {
        const parsed = parseJsonPayload<CardsPayload>(resp.text);
        const list = normalizeCards(parsed?.cards ?? []);
        if (list.length === 0) throw new Error("模型未返回有效闪卡数据");
        setCards(list);
        setViewMode("flashcards");
        setCurrentCardIndex(0);
        setShowAnswer(false);
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "闪卡生成失败");
      })
      .finally(() => setIsGenerating(false));
  };

  const handleGenerateQuiz = () => {
    setIsGenerating(true);
    runEchoQuery(quizPrompt(debateTopic, philosopherName))
      .then((resp) => {
        const parsed = parseJsonPayload<QuizPayload>(resp.text);
        const list = normalizeQuiz(parsed?.questions ?? []);
        if (list.length === 0) throw new Error("模型未返回有效测验数据");
        setQuizQuestions(list);
        setViewMode("quiz");
        setCurrentQuizIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setQuizScore({ correct: 0, total: 0 });
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "测验生成失败");
      })
      .finally(() => setIsGenerating(false));
  };

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleShuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // 已经回答过了

    setSelectedAnswer(answerIndex);
    const isCorrect =
      answerIndex ===
      quizQuestions[currentQuizIndex].correctAnswer;
    setQuizScore({
      correct: quizScore.correct + (isCorrect ? 1 : 0),
      total: quizScore.total + 1,
    });
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleExportCards = () => {
    const content = cards
      .map(
        (card) =>
          `【${card.term}】\n${card.definition}\n\n示例：${card.example}\n难度：${card.difficulty}\n\n---\n\n`,
      )
      .join("");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${philosopherName}_概念卡片_${new Date().toLocaleDateString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentCard = cards[currentCardIndex];
  const currentQuestion = quizQuestions[currentQuizIndex];

  return (
    <div className="mt-8 border-t border-orange-900/30 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-orange-500" />
        <h3 className="text-xl font-bold text-white">
          概念闪卡 & 测验生成器
        </h3>
        <span className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
          主动回忆，深度学习
        </span>
      </div>

      {viewMode === "none" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleGenerateFlashcards}
            disabled={isGenerating}
            className="group p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 border border-zinc-800 hover:border-orange-900/50 rounded-lg transition-all text-left disabled:opacity-50"
          >
            <BookOpen className="w-8 h-8 text-orange-500 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
              生成概念闪卡
            </h4>
            <p className="text-sm text-zinc-400 mb-3">
              从本次辩论中提取5-10个关键概念，制作成Anki式闪卡，支持主动回忆训练
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="bg-zinc-700/50 px-2 py-1 rounded">
                概念定义
              </span>
              <span className="bg-zinc-700/50 px-2 py-1 rounded">
                实例说明
              </span>
              <span className="bg-zinc-700/50 px-2 py-1 rounded">
                难度分级
              </span>
            </div>
          </button>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="group p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 border border-zinc-800 hover:border-orange-900/50 rounded-lg transition-all text-left disabled:opacity-50"
          >
            <CheckCircle2 className="w-8 h-8 text-orange-500 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
              生成知识测验
            </h4>
            <p className="text-sm text-zinc-400 mb-3">
              自动生成5道选择题，附详细答案解析，检验你的理解深度
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="bg-zinc-700/50 px-2 py-1 rounded">
                选择题
              </span>
              <span className="bg-zinc-700/50 px-2 py-1 rounded">
                即时反馈
              </span>
              <span className="bg-zinc-700/50 px-2 py-1 rounded">
                详细解析
              </span>
            </div>
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-zinc-400">
            正在通过后端生成学习内容…
          </p>
        </div>
      )}

      {/* 闪卡模式 */}
      {viewMode === "flashcards" && cards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">
                卡片 {currentCardIndex + 1} / {cards.length}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  currentCard.difficulty === "easy"
                    ? "bg-green-900/30 text-green-400"
                    : currentCard.difficulty === "medium"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-red-900/30 text-red-400"
                }`}
              >
                {currentCard.difficulty === "easy"
                  ? "简单"
                  : currentCard.difficulty === "medium"
                    ? "中等"
                    : "困难"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffleCards}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
                title="随机打乱"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportCards}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white"
                title="导出卡片"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("none")}
                className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
              >
                返回
              </button>
            </div>
          </div>

          <div
            onClick={handleFlipCard}
            className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-orange-900/30 rounded-xl p-8 min-h-[300px] cursor-pointer hover:border-orange-900/50 transition-all group"
          >
            <div className="absolute top-4 right-4 text-xs text-zinc-500 bg-zinc-800/50 px-3 py-1 rounded-full">
              点击翻转
            </div>

            {!showAnswer ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
                <h3 className="text-3xl font-bold text-orange-500 mb-4 text-center">
                  {currentCard.term}
                </h3>
                <p className="text-zinc-500 text-center">
                  回忆这个概念的含义...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-orange-500 mb-2">
                    概念
                  </h4>
                  <p className="text-2xl font-bold text-white mb-4">
                    {currentCard.term}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-orange-500 mb-2">
                    定义
                  </h4>
                  <p className="text-zinc-300 leading-relaxed">
                    {currentCard.definition}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-orange-500 mb-2">
                    示例
                  </h4>
                  <p className="text-zinc-400 leading-relaxed italic">
                    {currentCard.example}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrevCard}
              disabled={currentCardIndex === 0}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-700 text-white rounded-lg transition-colors"
            >
              上一张
            </button>
            <button
              onClick={handleFlipCard}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              {showAnswer ? "隐藏答案" : "显示答案"}
            </button>
            <button
              onClick={handleNextCard}
              disabled={currentCardIndex === cards.length - 1}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-700 text-white rounded-lg transition-colors"
            >
              下一张
            </button>
          </div>
        </div>
      )}

      {/* 测验模式 */}
      {viewMode === "quiz" && quizQuestions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">
                题目 {currentQuizIndex + 1} /{" "}
                {quizQuestions.length}
              </span>
              {quizScore.total > 0 && (
                <span className="text-sm text-orange-500 bg-orange-900/20 px-3 py-1 rounded-full">
                  正确率:{" "}
                  {Math.round(
                    (quizScore.correct / quizScore.total) * 100,
                  )}
                  %
                </span>
              )}
            </div>
            <button
              onClick={() => setViewMode("none")}
              className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
            >
              返回
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-6">
              {currentQuestion.question}
            </h4>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isCorrect =
                  index === currentQuestion.correctAnswer;
                const isSelected = selectedAnswer === index;

                let bgColor = "bg-zinc-800 hover:bg-zinc-700";
                let borderColor = "border-zinc-700";
                let textColor = "text-white";

                if (showExplanation) {
                  if (isCorrect) {
                    bgColor = "bg-green-900/30";
                    borderColor = "border-green-700";
                    textColor = "text-green-400";
                  } else if (isSelected) {
                    bgColor = "bg-red-900/30";
                    borderColor = "border-red-700";
                    textColor = "text-red-400";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left p-4 border rounded-lg transition-all ${bgColor} ${borderColor} ${textColor} disabled:cursor-not-allowed flex items-center gap-3`}
                  >
                    {showExplanation && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                    {showExplanation &&
                      isSelected &&
                      !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <h5 className="text-sm font-semibold text-orange-500 mb-2">
                  {selectedAnswer ===
                  currentQuestion.correctAnswer
                    ? "✅ 回答正确！"
                    : "❌ 回答错误"}
                </h5>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {showExplanation && (
            <div className="mt-6 text-center">
              {currentQuizIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  下一题
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500 mb-2">
                      测验完成！
                    </p>
                    <p className="text-zinc-400">
                      你答对了 {quizScore.correct} /{" "}
                      {quizScore.total} 题 （
                      {Math.round(
                        (quizScore.correct / quizScore.total) *
                          100,
                      )}
                      %）
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setViewMode("none");
                      setQuizScore({ correct: 0, total: 0 });
                    }}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    完成
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}