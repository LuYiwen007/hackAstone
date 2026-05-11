import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { ArenaHeader } from "../components/ArenaHeader";
import { PhilosopherAvatar } from "../components/PhilosopherAvatar";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { dilemmas, getDilemma, type DilemmaOption } from "../data/dilemmas";
import type { Philosopher } from "../data/philosophers";
import { DebateSummary } from "../components/DebateSummary";
import { generateDilemmaSummary, generateDilemmaTurn } from "../../shared/api/arena";
import { parseJsonPayload } from "../../shared/jsonPayload";

type Stage = "setup" | "debate" | "reveal";
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

export function Dilemma() {
  const { philosophers } = useArenaCatalog();
  const [selectedDilemmaId, setSelectedDilemmaId] = useState(dilemmas[0].id);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedPhilosopherId, setSelectedPhilosopherId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("setup");
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [canReveal, setCanReveal] = useState(false);
  const [fullExplanation, setFullExplanation] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const currentDilemma = getDilemma(selectedDilemmaId);
  const selectedOption =
    currentDilemma.options.find((option) => option.id === selectedOptionId) ?? null;
  const selectedPhilosopher =
    philosophers.find((philosopher) => philosopher.id === selectedPhilosopherId) ?? null;

  const recommendedPhilosophers = useMemo(() => {
    const preferred = new Set(currentDilemma.recommendedPhilosophers);
    return philosophers.filter((philosopher) => preferred.has(philosopher.id));
  }, [currentDilemma.recommendedPhilosophers, philosophers]);

  const otherPhilosophers = useMemo(() => {
    const preferred = new Set(currentDilemma.recommendedPhilosophers);
    return philosophers
      .filter((philosopher) => !preferred.has(philosopher.id))
      .sort((left, right) => left.period - right.period);
  }, [currentDilemma.recommendedPhilosophers, philosophers]);

  const handleChangeDilemma = (dilemmaId: string) => {
    setSelectedDilemmaId(dilemmaId);
    setSelectedOptionId(null);
    setSelectedPhilosopherId(null);
    setStage("setup");
    setMessages([]);
    setUserInput("");
    setCanReveal(false);
    setFullExplanation("");
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    setSelectedPhilosopherId(null);
    setStage("setup");
    setMessages([]);
    setUserInput("");
    setCanReveal(false);
    setFullExplanation("");
  };

  const handleChoosePhilosopher = (philosopher: Philosopher) => {
    if (!selectedOption) {
      return;
    }

    setSelectedPhilosopherId(philosopher.id);
    setMessages([
      {
        id: `judge-opening-${Date.now()}`,
        role: "judge",
        content: `你当前选择了“${selectedOption.label}”。请先说明你的理由，并尝试回应这个困境最尖锐的反对意见。`,
      },
    ]);
    setUserInput("");
    setCanReveal(false);
    setFullExplanation("");
    setStage("debate");
  };

  const handleUserTurn = async () => {
    if (!selectedOption || !selectedPhilosopher) {
      return;
    }

    const content = userInput.trim();
    if (!content || isThinking) {
      return;
    }

    const userMsgId = `user-${Date.now()}`;
    setUserInput("");
    setIsThinking(true);

    const nextMessages = [
      ...messages,
      { id: userMsgId, role: "user" as const, content },
    ];
    setMessages(nextMessages);

    const historyText = nextMessages
      .map((message) => {
        const speaker =
          message.role === "user"
            ? "用户"
            : message.role === "judge"
              ? "Judge"
              : selectedPhilosopher.nameCN;
        return `${speaker}：${message.content}`;
      })
      .join("\n");

    try {
      const response = await generateDilemmaTurn({
        moralDilemmaTitle: currentDilemma.title,
        moralDilemmaEnglishTitle: currentDilemma.englishTitle,
        question: currentDilemma.question,
        promptLead: currentDilemma.promptLead,
        userStance: selectedOption.stancePrompt,
        philosopherName: selectedPhilosopher.nameCN,
        philosopherSchool: selectedPhilosopher.school,
        keyIdeas: selectedPhilosopher.keyIdeas.join("、"),
        history: historyText,
      });
      const parsed = parseJsonPayload<TurnResult>(response.text);
      if (!parsed?.philosopherReply || !parsed?.judgeQuestion) {
        throw new Error("模型未返回有效的哲学家回应 JSON");
      }
      const turn = parsed;

      setMessages((previous) => [
        ...previous,
        {
          id: `philosopher-${Date.now()}`,
          role: "philosopher",
          content: turn.philosopherReply,
        },
        {
          id: `judge-${Date.now()}`,
          role: "judge",
          content: turn.judgeQuestion,
        },
      ]);
      setCanReveal(turn.continueDebate === false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "困境讨论生成失败";
      toast.error(msg);
      setMessages((previous) => previous.filter((m) => m.id !== userMsgId));
      setUserInput(content);
    } finally {
      setIsThinking(false);
    }
  };

  const handleReveal = async () => {
    if (!selectedOption || !selectedPhilosopher) {
      return;
    }

    setStage("reveal");
    setIsGeneratingSummary(true);
    setFullExplanation("");

    const history = messages
      .map((message) => {
        const speaker =
          message.role === "user"
            ? "用户"
            : message.role === "judge"
              ? "Judge"
              : selectedPhilosopher.nameCN;
        return `${speaker}：${message.content}`;
      })
      .join("\n");

    try {
      const response = await generateDilemmaSummary({
        moralDilemmaTitle: currentDilemma.title,
        question: currentDilemma.question,
        userStance: selectedOption.stancePrompt,
        philosopherName: selectedPhilosopher.nameCN,
        philosopherSchool: selectedPhilosopher.school,
        history,
      });
      const parsed = parseJsonPayload<SummaryResult>(response.text);
      if (parsed?.fullExplanation) {
        setFullExplanation(parsed.fullExplanation);
      } else {
        throw new Error("模型未返回 fullExplanation 字段");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "总结生成失败";
      toast.error(msg);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const resetDiscussion = () => {
    setStage("setup");
    setSelectedPhilosopherId(null);
    setMessages([]);
    setUserInput("");
    setCanReveal(false);
    setFullExplanation("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <ArenaHeader
        currentPage="dilemma"
        theme={{
          iconBg: "bg-gradient-to-br from-cyan-500 to-sky-600",
          activeButton: "bg-cyan-600 border-cyan-500",
          activeHover: "hover:bg-cyan-500",
        }}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {stage === "setup" && (
          <>
            <section className="mb-10 text-center">
              <p className="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-400">Moral Dilemmas</p>
              <h2 className="mb-3 text-4xl font-bold text-white">道德困境</h2>
              <p className="text-zinc-400">和哲学家讨论道德困境</p>
            </section>

            <section className="mb-6 flex flex-wrap justify-center gap-3">
              {dilemmas.map((dilemma) => {
                const active = dilemma.id === currentDilemma.id;
                return (
                  <button
                    key={dilemma.id}
                    type="button"
                    onClick={() => handleChangeDilemma(dilemma.id)}
                    className={`rounded-full border px-5 py-3 text-sm transition-all ${
                      active
                        ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                        : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
                    }`}
                  >
                    {dilemma.title}
                  </button>
                );
              })}
            </section>

            <section className="mb-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
              <img
                src={currentDilemma.heroImage}
                alt={currentDilemma.imageAlt}
                className="h-[360px] w-full object-cover md:h-[460px]"
              />
              <div className="border-t border-zinc-800 bg-zinc-950/80 px-6 py-4">
                <div className="text-sm text-zinc-400">{currentDilemma.imageCaption}</div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 text-sm uppercase tracking-[0.2em] text-cyan-400">
                    {currentDilemma.englishTitle}
                  </div>
                  <h3 className="mb-3 text-3xl font-bold">{currentDilemma.title}</h3>
                  <p className="max-w-3xl text-zinc-400">{currentDilemma.subtitle}</p>
                </div>
                <Link
                  to="/"
                  className="hidden items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white md:flex"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>返回首页</span>
                </Link>
              </div>

              <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="mb-2 text-sm text-cyan-300">核心提问</div>
                <p className="text-xl font-semibold leading-relaxed">{currentDilemma.question}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {currentDilemma.options.map((option) => {
                  const active = option.id === selectedOption?.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectOption(option.id)}
                      className={`rounded-2xl border p-5 text-left transition-all ${
                        active
                          ? "border-cyan-400 bg-cyan-500/12 shadow-[0_18px_45px_rgba(8,145,178,0.18)]"
                          : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                      }`}
                    >
                      <div className="mb-3 font-bold text-white">{option.label}</div>
                      <p className="text-sm leading-6 text-zinc-400">{option.summary}</p>
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <div className="mt-8">
                  <div className="mb-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
                    <div className="mb-2 text-sm text-orange-300">你当前的立场</div>
                    <div className="font-semibold text-white">{selectedOption.label}</div>
                    <p className="mt-2 text-sm text-zinc-400">{selectedOption.summary}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-2xl font-bold">选择一位哲学家和你讨论</h4>
                    <p className="mt-2 text-zinc-400">
                      点击哲学家卡片后，会直接进入和他围绕当前困境的讨论窗口。
                    </p>
                  </div>

                  {recommendedPhilosophers.length > 0 && (
                    <div className="mb-8">
                      <div className="mb-3 text-sm text-cyan-300">推荐哲学家</div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {recommendedPhilosophers.map((philosopher) => (
                          <PhilosopherChoiceCard
                            key={philosopher.id}
                            philosopher={philosopher}
                            featured
                            onChoose={handleChoosePhilosopher}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-3 text-sm text-zinc-400">全部哲学家</div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {otherPhilosophers.map((philosopher) => (
                        <PhilosopherChoiceCard
                          key={philosopher.id}
                          philosopher={philosopher}
                          onChoose={handleChoosePhilosopher}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {stage === "debate" && selectedOption && selectedPhilosopher && (
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-cyan-300">{currentDilemma.title}</div>
                <h2 className="text-3xl font-bold">{selectedPhilosopher.nameCN} 的讨论窗口</h2>
              </div>
              <button
                type="button"
                onClick={resetDiscussion}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
              >
                重新选择哲学家
              </button>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-[1.3fr_0.9fr]">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-2 text-sm text-zinc-500">当前困境</div>
                <div className="mb-2 text-xl font-semibold">{currentDilemma.question}</div>
                <p className="text-sm leading-6 text-zinc-400">{currentDilemma.promptLead}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-2 text-sm text-zinc-500">你的选择</div>
                <div className="font-semibold text-white">{selectedOption.label}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{selectedOption.summary}</p>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3 text-zinc-400">
              <AlertCircle className="h-4 w-4" />
              <span>讨论会按“哲学家回应 + Judge 追问”的方式推进，和辩论窗口保持一致。</span>
            </div>

            <div className="mb-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-2xl border p-4 ${
                    message.role === "user"
                      ? "border-cyan-700 bg-cyan-950/20"
                      : message.role === "philosopher"
                        ? "border-zinc-700 bg-zinc-900"
                        : "border-yellow-700/40 bg-yellow-950/20"
                  }`}
                >
                  <div className="mb-2 text-xs text-zinc-500">
                    {message.role === "user"
                      ? "你"
                      : message.role === "philosopher"
                        ? selectedPhilosopher.nameCN
                        : "Judge"}
                  </div>
                  <p className="whitespace-pre-wrap leading-7 text-zinc-100">{message.content}</p>
                </div>
              ))}
              {isThinking && <div className="text-sm italic text-zinc-500">哲学家与 Judge 正在思考...</div>}
            </div>

            <div className="flex gap-3">
              <input
                value={userInput}
                onChange={(event) => setUserInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleUserTurn();
                  }
                }}
                placeholder={`继续追问 ${selectedPhilosopher.nameCN}，或者补充你的理由...`}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-zinc-100 outline-none transition-colors focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => void handleUserTurn()}
                disabled={!userInput.trim() || isThinking}
                className="rounded-xl bg-cyan-600 px-5 text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleReveal()}
              disabled={!canReveal && messages.length < 4}
              className="mt-6 w-full rounded-xl bg-yellow-600 py-3 font-bold text-zinc-950 transition-colors hover:bg-yellow-500 disabled:bg-zinc-700 disabled:text-zinc-300"
            >
              进入总结
            </button>
          </div>
        )}

        {stage === "reveal" && selectedOption && selectedPhilosopher && (
          <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="mb-6">
              <div className="mb-2 text-sm text-cyan-300">{currentDilemma.title}</div>
              <h3 className="text-3xl font-bold">完整分析</h3>
              <p className="mt-2 text-zinc-400">
                你选择的是“{selectedOption.label}”，讨论对象是 {selectedPhilosopher.nameCN}。
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="whitespace-pre-line leading-8 text-zinc-300">
                {isGeneratingSummary
                  ? "正在生成总结..."
                  : fullExplanation ||
                    "模型未能生成总结，请检查后端与百炼配置后重试。"}
              </p>
            </div>

            <DebateSummary
              philosopher={selectedPhilosopher}
              question={`${currentDilemma.title}：${currentDilemma.question}`}
              userChoice="uncertain"
              userReason={messages
                .filter((message) => message.role === "user")
                .map((message) => message.content)
                .join("\n")}
            />

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={resetDiscussion}
                className="flex-1 rounded-xl border border-zinc-700 py-3 text-center transition-colors hover:border-zinc-500"
              >
                继续换哲学家讨论
              </button>
              <Link
                to="/profile"
                className="flex-1 rounded-xl bg-cyan-600 py-3 text-center font-bold text-white transition-colors hover:bg-cyan-500"
              >
                查看思维画像
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PhilosopherChoiceCard({
  philosopher,
  onChoose,
  featured = false,
}: {
  philosopher: Philosopher;
  onChoose: (philosopher: Philosopher) => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChoose(philosopher)}
      className={`rounded-2xl border p-4 text-left transition-all ${
        featured
          ? "border-cyan-500/40 bg-cyan-500/8 hover:border-cyan-400"
          : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
      }`}
    >
      <div className="mb-4 flex items-start gap-3">
        <PhilosopherAvatar philosopher={philosopher} className="h-12 w-12 flex-shrink-0 text-lg" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h5 className="truncate font-bold text-white">{philosopher.nameCN}</h5>
            {featured && (
              <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] text-cyan-300">
                推荐
              </span>
            )}
          </div>
          <div className="truncate text-xs text-zinc-500">{philosopher.name}</div>
          <div className="mt-1 text-xs text-zinc-400">
            {philosopher.school} · {formatPeriod(philosopher.period)}
          </div>
        </div>
      </div>
      <div className="line-clamp-2 text-sm leading-6 text-zinc-400">
        {philosopher.keyIdeas.slice(0, 3).join("、")}
      </div>
    </button>
  );
}

function formatPeriod(period: number) {
  if (period < 0) {
    return `公元前 ${Math.abs(period)}`;
  }
  return `公元 ${period}`;
}
