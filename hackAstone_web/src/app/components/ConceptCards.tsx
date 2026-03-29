import { useState } from "react";
import {
  Brain,
  BookOpen,
  Download,
  Shuffle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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

// 模拟AI生成的概念卡片
const generateConceptCards = (
  topic: string,
  philosopher: string,
): ConceptCard[] => {
  // 这里应该根据辩论内容AI生成，现在用模拟数据
  return [
    {
      id: "1",
      term: "美德即知识",
      definition:
        "苏格拉底的核心主张：如果一个人真正理解什么是善，他就不可能选择恶。所有不道德的行为都源于无知。",
      example:
        "如果一个人真正理解吸烟对健康的危害（不仅是知道这句话，而是深刻理解后果），他就不会吸烟。",
      difficulty: "medium",
    },
    {
      id: "2",
      term: "产婆术（Maieutic Method）",
      definition:
        "苏格拉底的教学方法：不直接告诉答案，而是通过提问引导对方自己发现真理，就像助产士帮助孕妇分娩一样。",
      example:
        "老师不说'这样做是错的'，而是问'你觉得这样做会带来什么后果？''你会希望别人这样对待你吗？'",
      difficulty: "hard",
    },
    {
      id: "3",
      term: "未经审视的生活不值得过",
      definition:
        "人应该不断反思自己的行为、信念和价值观，而不是盲目地活着。只有经过深刻反思的生活才有意义。",
      example:
        "每天睡前问自己：今天我的时间花在了哪里？我做的事情符合我的价值观吗？我在成为更好的人吗？",
      difficulty: "easy",
    },
    {
      id: "4",
      term: "无知之知",
      definition:
        "苏格拉底说'我知道我一无所知'——真正的智慧在于意识到自己的无知，而不是假装什么都懂。",
      example:
        "专家知道某个领域有多复杂，承认'这个问题没有简单答案'；而外行往往觉得'这还不简单'。",
      difficulty: "medium",
    },
    {
      id: "5",
      term: "理性主义 vs 情感主义",
      definition:
        "苏格拉底是极端理性主义者，认为理性可以控制情绪；而现代心理学认为情绪和理性是相对独立的系统。",
      example:
        "辩论焦点：你可以'知道'应该冷静，但还是会因为愤怒而吼人——这是理性失败了，还是情绪本来就不受理性控制？",
      difficulty: "hard",
    },
  ];
};

// 模拟AI生成的测验题
const generateQuiz = (
  topic: string,
  philosopher: string,
): QuizQuestion[] => {
  return [
    {
      id: "q1",
      question:
        "根据苏格拉底的'美德即知识'理论，一个人会做坏事是因为：",
      options: [
        "A. 他意志薄弱，无法控制自己",
        "B. 他被欲望控制，明知故犯",
        "C. 他不真正理解这件事是坏的",
        "D. 他天生邪恶，无法改变",
      ],
      correctAnswer: 2,
      explanation:
        "苏格拉底认为，所有的恶行都源于无知。如果一个人真正理解某事是坏的（不是表面知道，而是深刻理解），他就不会去做。那些看似'明知故犯'的情况，实际上是因为当事人没有真正理解后果。",
    },
    {
      id: "q2",
      question: "苏格拉底的'产婆术'教学方法的核心是：",
      options: [
        "A. 直接告诉学生正确答案",
        "B. 让学生自己阅读书籍寻找答案",
        "C. 通过提问引导学生自己发现真理",
        "D. 让学生互相辩论得出结论",
      ],
      correctAnswer: 2,
      explanation:
        "苏格拉底的产婆术就像助产士帮助孕妇分娩一样，不是他生孩子，而是帮助孕妇把孩子生出来。同样，他不直接灌输知识，而是通过提问让学生自己'生出'真理。他相信知识本来就在人的灵魂深处，只需要被唤醒。",
    },
    {
      id: "q3",
      question: "'未经审视的生活不值得过'这句话的含义是：",
      options: [
        "A. 人应该每天写日记记录生活",
        "B. 人应该不断反思自己的行为和信念",
        "C. 人应该接受他人对自己生活的评价",
        "D. 人应该追求完美无缺的生活",
      ],
      correctAnswer: 1,
      explanation:
        "苏格拉底认为，人的价值在于理性思考能力。如果只是盲目地活着，不反思自己的行为、不质疑自己的信念，那就和动物没有区别。真正有意义的生活，是经过深刻反思和审视的生活。",
    },
    {
      id: "q4",
      question:
        "苏格拉底说'我知道我一无所知'，这体现了他的什么观点？",
      options: [
        "A. 他认为人类无法获得任何知识",
        "B. 他在谦虚地贬低自己的智慧",
        "C. 他认为承认无知是智慧的开始",
        "D. 他认为知识是不可能存在的",
      ],
      correctAnswer: 2,
      explanation:
        "这不是自谦，而是苏格拉底的核心洞察：大多数人以为自己知道很多，实际上只是'表面知道'。真正的智者会意识到自己的无知，保持谦逊和好奇。这种'知道自己不知道'的自我觉察，是智慧的第一步。",
    },
    {
      id: "q5",
      question:
        "现代心理学对苏格拉底'美德即知识'理论的挑战是：",
      options: [
        "A. 人们根本不需要道德知识",
        "B. 知识和行为之间存在'知行差距'",
        "C. 道德知识完全无法被学习",
        "D. 所有人天生就知道什么是对的",
      ],
      correctAnswer: 1,
      explanation:
        "现代心理学（如双系统理论）发现：知道≠做到。人可以'知道'吸烟有害、拖延不好，但还是会做。这说明理性知识和实际行为之间有鸿沟，受情绪、欲望、意志力等多种因素影响。苏格拉底过于乐观地认为'知道就会做到'。",
    },
  ];
};

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
    setIsGenerating(true);
    setTimeout(() => {
      const generated =
        concepts ||
        generateConceptCards(debateTopic, philosopherName);
      setCards(generated);
      setViewMode("flashcards");
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setIsGenerating(false);
    }, 1000);
  };

  const handleGenerateQuiz = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateQuiz(
        debateTopic,
        philosopherName,
      );
      setQuizQuestions(generated);
      setViewMode("quiz");
      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuizScore({ correct: 0, total: 0 });
      setIsGenerating(false);
    }, 1000);
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
            AI正在从辩论中提取关键概念...
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