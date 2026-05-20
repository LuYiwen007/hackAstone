import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, Link } from "react-router";
import { ArrowLeft, AlertCircle, MessageSquare } from "lucide-react";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { philosopherDisplayName, useArenaLocale } from "../context/ArenaLocaleContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import type { DebateTopicContent } from "../data/debateTopicTypes";
import { DebateSummary } from "../components/DebateSummary";
import { generateTopic, runEchoQuery, saveBattleRecord } from "../../shared/api/arena";
import { isLoggedIn } from "../../shared/api/client";
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
  const { t, locale } = useArenaLocale();
  const { philosophers } = useArenaCatalog();
  const philosopher = philosophers.find((p) => p.id === id);
  const displayName = philosopher ? philosopherDisplayName(philosopher, locale) : "";

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
    generateTopic(displayName, philosopher.school, philosopher.keyIdeas)
      .then((resp) => {
        if (cancelled) return;
        const parsed = parseJsonPayload<DebateTopicContent>(resp.text);
        if (parsed?.question && parsed?.philosopherView && parsed?.oppositeView) {
          setTopic(parsed);
          setFullExplanation(parsed.fullExplanation || "");
        } else {
          throw new Error(t("error.topicJson"));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : t("error.topicFailed");
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
  }, [philosopher?.id, topicReloadToken, displayName, t]);

  if (!philosopher) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t("battle.notFound")}</h2>
          <Link to="/" className="text-purple-500 hover:underline">
            {t("battle.notFoundBack")}
          </Link>
        </div>
      </div>
    );
  }

  const choiceLabel = (c: Exclude<Choice, null>) => {
    if (c === "agree") return t("battle.agree");
    if (c === "disagree") return t("battle.disagree");
    return t("battle.uncertain");
  };

  const formatHistory = (msgs: DebateMessage[]) =>
    msgs
      .map((m) => {
        const roleLabel =
          m.role === "user"
            ? t("battle.history.user")
            : m.role === "judge"
              ? t("battle.history.judge")
              : displayName;
        return `${roleLabel}: ${m.content}`;
      })
      .join("\n");

  const handleChoose = (selected: Exclude<Choice, null>) => {
    if (!topic) return;
    setChoice(selected);
    setStage("debate");
    setCanReveal(false);
    setMessages([
      {
        id: `judge-opening-${Date.now()}`,
        role: "judge",
        content: t("battle.choiceOpening", { choice: choiceLabel(selected) }),
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

    const historyText = formatHistory(nextMessages);

    const turnQuery = [
      "[ROLE]",
      "CA-Echo-LLM",
      "",
      "[TASK]",
      t("battle.prompt.turnTask"),
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
      t("battle.prompt.turnCriteria"),
      "",
      "[CONSTRAINTS]",
      t("battle.prompt.constraints"),
      "",
      "[RETURN_FORMAT]",
      "json",
      "",
      t("battle.prompt.topic", { question: topic.question }),
      t("battle.prompt.philosopher", { name: displayName, school: philosopher.school }),
      t("battle.prompt.stance", { choice: choiceLabel(choice) }),
      t("battle.prompt.history"),
      historyText,
    ].join("\n");

    try {
      const resp = await runEchoQuery(turnQuery);
      const parsed = parseJsonPayload<TurnResult>(resp.text);
      if (!parsed?.philosopherReply || !parsed?.judgeQuestion) {
        throw new Error(t("error.turnJson"));
      }
      const turn = parsed;
      setMessages((prev) => [
        ...prev,
        { id: `philosopher-${Date.now()}`, role: "philosopher", content: turn.philosopherReply },
        { id: `judge-${Date.now()}`, role: "judge", content: turn.judgeQuestion },
      ]);
      setCanReveal(turn.continueDebate === false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("error.turnFailed");
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

    const history = formatHistory(messages);

    const summaryQuery = [
      "[ROLE]",
      "CA-Echo-LLM",
      "",
      "[TASK]",
      t("battle.prompt.summaryTask"),
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
      t("battle.prompt.summaryCriteria"),
      "",
      "[CONSTRAINTS]",
      t("battle.prompt.summaryConstraints"),
      "",
      "[RETURN_FORMAT]",
      "json",
      "",
      t("battle.prompt.topic", { question: topic.question }),
      t("battle.prompt.philosopherShort", { name: displayName }),
      t("battle.prompt.stance", { choice: choiceLabel(choice) }),
      t("battle.prompt.history"),
      history,
    ].join("\n");

    try {
      const resp = await runEchoQuery(summaryQuery);
      const parsed = parseJsonPayload<SummaryResult>(resp.text);
      if (parsed?.fullExplanation) {
        setFullExplanation(parsed.fullExplanation);
        if (isLoggedIn()) {
          saveBattleRecord({
            battleType: "philosophy",
            topic: topic.question,
            userChoice: choiceLabel(choice),
            judgeSummary: parsed.fullExplanation,
            changedStance: false,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          }).catch(() => {
            // 保存失败静默处理
          });
        }
      } else {
        throw new Error(t("error.summaryField"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("error.summaryFailed");
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
              <span>{t("battle.backToMap")}</span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <div className="text-sm text-right">
                <div className="font-bold">{displayName}</div>
                <div className="text-zinc-500">{philosopher.school}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {stage === "topic" && (
          <div className="max-w-4xl mx-auto">
            {topicLoading && (
              <div className="text-center py-20 text-zinc-400">{t("battle.generatingTopic")}</div>
            )}
            {!topicLoading && topicLoadError && (
              <div className="text-center py-16 space-y-4">
                <p className="text-red-400">{topicLoadError}</p>
                <button
                  type="button"
                  onClick={() => setTopicReloadToken((t) => t + 1)}
                  className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 font-semibold"
                >
                  {t("battle.retry")}
                </button>
              </div>
            )}
            {!topicLoading && !topicLoadError && topic && (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold mb-6">{topic.question}</h1>
                  <p className="text-zinc-400">{t("battle.topicAiNote")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl border-2 border-purple-600/30 bg-zinc-900">
                    <div className="font-bold mb-3">{t("battle.philosopherStance", { name: displayName })}</div>
                    <p className="text-zinc-300 leading-relaxed">{topic.philosopherView}</p>
                  </div>
                  <div className="p-6 rounded-xl border-2 border-zinc-700 bg-zinc-900">
                    <div className="font-bold mb-3">{t("battle.oppositeStance")}</div>
                    <p className="text-zinc-300 leading-relaxed">{topic.oppositeView}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStage("choose")}
                  className="w-full mt-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-bold text-lg"
                >
                  {t("battle.startDebate")}
                </button>
              </>
            )}
          </div>
        )}

        {stage === "choose" && topic && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("battle.yourStance")}</h2>
              <p className="text-zinc-400">{t("battle.stanceHint")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => handleChoose("agree")} className="p-8 rounded-xl border-2 border-purple-600 bg-purple-950/30">{t("battle.agree")}</button>
              <button onClick={() => handleChoose("disagree")} className="p-8 rounded-xl border-2 border-zinc-700 bg-zinc-900">{t("battle.disagree")}</button>
              <button onClick={() => handleChoose("uncertain")} className="p-8 rounded-xl border-2 border-zinc-700 bg-zinc-900">{t("battle.uncertain")}</button>
            </div>
          </div>
        )}

        {stage === "debate" && topic && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-zinc-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{t("battle.roundHint")}</span>
            </div>
            <div className="space-y-4 mb-6">
              {messages.map((m) => (
                <div key={m.id} className={`p-4 rounded-lg border ${m.role === "user" ? "bg-purple-950/30 border-purple-800" : m.role === "philosopher" ? "bg-zinc-900 border-zinc-700" : "bg-yellow-950/20 border-yellow-700/40"}`}>
                  <div className="text-xs mb-2 text-zinc-500">
                    {m.role === "user" ? t("battle.you") : m.role === "philosopher" ? displayName : t("battle.judge")}
                  </div>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
              {isThinking && <div className="text-zinc-500 italic">{t("battle.agentThinking")}</div>}
            </div>

            <div className="flex gap-3">
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleUserTurn()}
                placeholder={t("battle.inputPlaceholder")}
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
              {t("battle.enterSummary")}
            </button>
          </div>
        )}

        {stage === "reveal" && topic && (
          <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">{t("battle.fullAnalysis")}</h3>
            <p className="text-zinc-300 whitespace-pre-line">
              {isGeneratingSummary
                ? t("battle.summaryGenerating")
                : fullExplanation || t("battle.summaryFailed")}
            </p>
            <DebateSummary
              philosopher={philosopher}
              question={topic.question}
              userChoice={choice}
              userReason={messages.filter((m) => m.role === "user").map((m) => m.content).join("\n")}
            />
            <div className="mt-6 flex gap-4">
              <Link to="/" className="flex-1 py-3 rounded-lg border border-zinc-700 text-center">{t("battle.backHome")}</Link>
              <Link to="/profile" className="flex-1 py-3 rounded-lg bg-purple-600 text-center">{t("battle.viewProfile")}</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
