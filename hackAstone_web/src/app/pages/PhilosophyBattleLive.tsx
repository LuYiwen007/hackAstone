import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useParams, Link } from "react-router";
import { ArrowLeft, AlertCircle, MessageSquare } from "lucide-react";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { philosopherDisplayName, useArenaLocale } from "../context/ArenaLocaleContext";
import type { DebateTopicContent } from "../data/debateTopicTypes";
import { DebateSummary } from "../components/DebateSummary";
import {
  buildProfileI18n,
  fetchArenaI18n,
  generateTopic,
  runEchoQuery,
  maybeSaveBattleRecord,
  streamPhilosophyJudgeStep,
  streamPhilosophyPhilosopherToJudge,
  streamPhilosophyPhilosopherToUser,
  tFromStrings,
} from "../../shared/api/arena";
import { isLoggedIn } from "../../shared/api/client";
import { playArenaInteractionSound } from "../../shared/arenaPreferences";
import { useUserSettings } from "../context/UserSettingsContext";
import { philosopherForLocale } from "../data/philosopherLocale";
import { parseJsonPayload } from "../../shared/jsonPayload";
import {
  finalizeJudgeSpeech,
  judgeStreamDisplayText,
  parsePhilosophyJudgeStep,
} from "../data/philosophyJudgeLocale";
import {
  finalizeRoundtableSpeech,
  roundtableStreamDisplayText,
} from "../data/roundtableLocale";

type Stage = "topic" | "choose" | "debate" | "reveal";
type Choice = "agree" | "disagree" | "uncertain" | null;
type MessageRole = "user" | "philosopher" | "judge";

type DebateMessage = {
  id: string;
  role: MessageRole;
  content: string;
};

type ThinkingRole = "philosopher" | "judge";

type SummaryResult = {
  fullExplanation: string;
};

export function PhilosophyBattleLive() {
  const { id } = useParams();
  const { t, locale } = useArenaLocale();
  const { settings } = useUserSettings();
  const showThinkingTimer = settings.preferences.timer;
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
  const [thinkingRole, setThinkingRole] = useState<ThinkingRole | null>(null);
  const [canReveal, setCanReveal] = useState(false);
  const [fullExplanation, setFullExplanation] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [thinkSeconds, setThinkSeconds] = useState(120);
  const prevMessageCount = useRef(0);

  const tablePreparingLabel = t("battle.tablePreparing");
  const philosopherThinkingLabel = t("battle.philosopherThinking", {
    name: displayName || philosopher?.nameCN || "",
  });
  const judgeThinkingLabel = t("battle.judgeThinking");

  useEffect(() => {
    if (stage !== "debate" || !showThinkingTimer || isThinking) return;
    setThinkSeconds(120);
    const timer = window.setInterval(() => {
      setThinkSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [stage, showThinkingTimer, isThinking, messages.length]);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      const last = messages[messages.length - 1];
      if (last && last.role !== "user") {
        playArenaInteractionSound();
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (stage !== "debate") return;
    const el = chatScrollRef.current;
    if (!el) return;
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToBottom();
    const id = requestAnimationFrame(scrollToBottom);
    return () => cancelAnimationFrame(id);
  }, [stage, messages, isThinking, thinkingRole]);

  useEffect(() => {
    if (!philosopher) return;
    let cancelled = false;
    setTopicLoading(true);
    setTopicLoadError(null);
    generateTopic(displayName, philosopher.school, philosopher.keyIdeas)
      .then((resp) => {
        if (cancelled) return;
        const parsed =
          resp.debateTopic ?? parseJsonPayload<DebateTopicContent>(resp.text);
        if (parsed?.question && parsed?.philosopherView && parsed?.oppositeView) {
          setTopic({
            question: parsed.question,
            philosopherView: parsed.philosopherView,
            oppositeView: parsed.oppositeView,
            judgeQuestions: parsed.judgeQuestions?.length
              ? parsed.judgeQuestions
              : ["请进一步阐述你的立场与理由。", "你的理由如何回应反方？", "你是否仍坚持原立场？"],
            fullExplanation: parsed.fullExplanation || "",
          });
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

  const philosopherStreamBody = (prior: DebateMessage[]) => {
    if (!philosopher || !choice) {
      return {
        debateQuestion: "",
        philosopherId: "",
        philosopherName: "",
        school: "",
        userStance: "",
        history: "",
        locale,
      };
    }
    const loc = philosopherForLocale(philosopher, locale);
    return {
      debateQuestion: topic?.question ?? "",
      philosopherId: philosopher.id,
      philosopherName: displayName,
      school: loc.school,
      keyIdeas: philosopher.keyIdeas?.join("。") ?? "",
      summary: loc.summary ?? philosopher.summary ?? "",
      userStance: choiceLabel(choice),
      history: formatHistory(prior),
      locale,
    };
  };

  const streamPhilosopherMessage = async (
    mode: "to-user" | "to-judge",
    prior: DebateMessage[]
  ): Promise<DebateMessage> => {
    if (!philosopher) throw new Error(t("error.turnFailed"));
    const msgId = `${mode}-${Date.now()}`;
    const placeholder: DebateMessage = {
      id: msgId,
      role: "philosopher",
      content: "",
    };
    setThinkingRole("philosopher");
    setMessages([...prior, placeholder]);

    const body = philosopherStreamBody(prior);
    const handlers = {
      onDelta: (_d: string, acc: string) => {
        const preview = roundtableStreamDisplayText(acc);
        setMessages((curr) =>
          curr.map((m) => (m.id === msgId ? { ...m, content: preview } : m))
        );
      },
    };

    const resp =
      mode === "to-user"
        ? await streamPhilosophyPhilosopherToUser(body, handlers)
        : await streamPhilosophyPhilosopherToJudge(body, handlers);

    const finalText = finalizeRoundtableSpeech(resp.text);
    if (!finalText.trim()) throw new Error(t("error.turnJson"));

    const finished: DebateMessage = { ...placeholder, content: finalText };
    setMessages((curr) => curr.map((m) => (m.id === msgId ? finished : m)));
    return finished;
  };

  const streamJudgeMessage = async (
    prior: DebateMessage[]
  ): Promise<{
    judge: {
      judgeSpeaks: boolean;
      judgeMessage: string;
      addressTo: "user" | "philosopher" | null;
      continueDebate: boolean;
    };
    judgeMsg: DebateMessage | null;
  }> => {
    if (!philosopher || !choice || !topic) throw new Error(t("error.turnFailed"));

    const msgId = `judge-${Date.now()}`;
    const placeholder: DebateMessage = {
      id: msgId,
      role: "judge",
      content: "",
    };
    setThinkingRole("judge");
    setMessages([...prior, placeholder]);

    const loc = philosopherForLocale(philosopher, locale);
    const body = {
      debateQuestion: topic.question,
      philosopherName: displayName,
      school: loc.school,
      userStance: choiceLabel(choice),
      history: formatHistory(prior),
      locale,
    };

    const resp = await streamPhilosophyJudgeStep(body, {
      onDelta: (_d, acc) => {
        const preview = judgeStreamDisplayText(acc);
        setMessages((curr) =>
          curr.map((m) => (m.id === msgId ? { ...m, content: preview } : m))
        );
      },
    });

    const judge = parsePhilosophyJudgeStep(resp.philosophyJudge ?? null, resp.text);
    if (!judge) throw new Error(t("error.turnJson"));

    if (judge.judgeSpeaks && judge.judgeMessage) {
      const finished: DebateMessage = {
        ...placeholder,
        content: finalizeJudgeSpeech(resp.text) || judge.judgeMessage,
      };
      setMessages([...prior, finished]);
      return { judge, judgeMsg: finished };
    }
    setMessages(prior);
    return { judge, judgeMsg: null };
  };

  const handleUserTurn = async () => {
    const content = userInput.trim();
    if (!content || !choice || !topic || !philosopher || isThinking) return;

    const userMsgId = `user-${Date.now()}`;
    setUserInput("");
    setIsThinking(true);

    const nextMessages: DebateMessage[] = [
      ...messages,
      { id: userMsgId, role: "user", content },
    ];
    setMessages(nextMessages);

    try {
      const philToUser = await streamPhilosopherMessage("to-user", nextMessages);
      const afterPhilosopher: DebateMessage[] = [...nextMessages, philToUser];

      const { judge, judgeMsg } = await streamJudgeMessage(afterPhilosopher);

      let working = judgeMsg ? [...afterPhilosopher, judgeMsg] : afterPhilosopher;

      if (judge.judgeSpeaks && judge.addressTo === "philosopher") {
        const philToJudge = await streamPhilosopherMessage("to-judge", working);
        setMessages([...working, philToJudge]);
      }

      setCanReveal(judge.continueDebate === false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("error.turnFailed");
      toast.error(msg);
      setMessages((prev) => prev.filter((m) => m.id !== userMsgId));
      setUserInput(content);
    } finally {
      setIsThinking(false);
      setThinkingRole(null);
    }
  };

  const handleReveal = async () => {
    if (!choice || !topic) return;
    setStage("reveal");
    setIsGeneratingSummary(true);
    setFullExplanation("");
    setThinkingRole("philosopher");

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
          void (async () => {
            try {
              const [enPack, zhPack] = await Promise.all([
                fetchArenaI18n("en"),
                fetchArenaI18n("zh"),
              ]);
              const tEn = tFromStrings(enPack.strings);
              const tZh = tFromStrings(zhPack.strings);
              const choiceText = (c: Exclude<Choice, null>, tr: typeof tEn) => {
                if (c === "agree") return tr("battle.agree");
                if (c === "disagree") return tr("battle.disagree");
                return tr("battle.uncertain");
              };
              const explanation = parsed.fullExplanation;
              await maybeSaveBattleRecord({
                battleType: "philosophy",
                topic: topic.question,
                userChoice: choiceLabel(choice),
                judgeSummary: explanation,
                changedStance: false,
                messages: messages.map((m) => ({ role: m.role, content: m.content })),
                profileI18n: buildProfileI18n(
                  {
                    topic: topic.question,
                    userChoice: choiceText(choice, tEn),
                    judgeSummary: explanation,
                  },
                  {
                    topic: topic.question,
                    userChoice: choiceText(choice, tZh),
                    judgeSummary: explanation,
                  }
                ),
              });
            } catch {
              /* 保存失败静默处理 */
            }
          })();
        }
      } else {
        throw new Error(t("error.summaryField"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("error.summaryFailed");
      toast.error(msg);
    } finally {
      setIsGeneratingSummary(false);
      setThinkingRole(null);
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
              <div className="py-12 text-center text-zinc-400">{tablePreparingLabel}</div>
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
            <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden max-h-[min(72vh,760px)]">
              <div className="shrink-0 px-4 py-3 border-b border-zinc-800 bg-zinc-950/95">
                <div className="text-xs text-purple-400/90 mb-1">{t("battle.currentTopic")}</div>
                <p className="text-base font-semibold text-zinc-100 leading-snug">{topic.question}</p>
              </div>

              <div ref={chatScrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                <div className="text-zinc-400 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{t("battle.roundHint")}</span>
                </div>
                {messages.map((m) => {
                  const isStreamingPhilosopher =
                    isThinking &&
                    thinkingRole === "philosopher" &&
                    m.role === "philosopher" &&
                    m.id.startsWith("to-");
                  const showThinkingInBubble =
                    isStreamingPhilosopher && !m.content.trim();
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-lg border ${
                        m.role === "user"
                          ? "bg-purple-950/30 border-purple-800"
                          : m.role === "philosopher"
                            ? "bg-zinc-950 border-zinc-700"
                            : "bg-yellow-950/20 border-yellow-700/40"
                      }`}
                    >
                      <div className="text-xs mb-2 text-zinc-500">
                        {m.role === "user"
                          ? t("battle.you")
                          : m.role === "philosopher"
                            ? displayName
                            : t("battle.judge")}
                      </div>
                      {showThinkingInBubble ? (
                        <p className="text-zinc-500 italic">{philosopherThinkingLabel}</p>
                      ) : (
                        <p className="whitespace-pre-wrap text-zinc-300 leading-relaxed">
                          {m.content}
                          {isStreamingPhilosopher && m.content.trim() ? (
                            <span className="inline-block w-0.5 h-4 ml-0.5 bg-purple-400 animate-pulse align-middle" />
                          ) : null}
                        </p>
                      )}
                    </div>
                  );
                })}
                {isThinking && thinkingRole === "judge" && (
                  <div className="text-zinc-500 italic">{judgeThinkingLabel}</div>
                )}
              </div>

              <div className="shrink-0 p-4 border-t border-zinc-800 bg-zinc-950/80 space-y-3">
                {showThinkingTimer && !isThinking ? (
                  <div
                    className={`text-xs font-medium tabular-nums ${
                      thinkSeconds <= 30 ? "text-orange-400" : "text-zinc-500"
                    }`}
                  >
                    {locale === "zh"
                      ? `作答倒计时 ${thinkSeconds}s`
                      : `Time to respond: ${thinkSeconds}s`}
                  </div>
                ) : null}
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
                  className="w-full py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700"
                >
                  {t("battle.enterSummary")}
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === "reveal" && topic && (
          <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">{t("battle.fullAnalysis")}</h3>
            <p className="text-zinc-300 whitespace-pre-line">
                {isGeneratingSummary
                ? philosopherThinkingLabel
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
