import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { ArenaHeader } from "../components/ArenaHeader";
import { PhilosopherAvatar } from "../components/PhilosopherAvatar";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { philosopherDisplayName, useArenaLocale } from "../context/ArenaLocaleContext";
import { dilemmas, getDilemma } from "../data/dilemmas";
import {
  dilemmaMessageContent,
  formatPhilosopherPeriod,
  localizeDilemma,
  parseDilemmaSummaryBilingual,
  summaryForLocale,
  type DilemmaStoredMessage,
  type DilemmaSummaryBilingual,
} from "../data/dilemmaLocale";
import {
  finalizeJudgeSpeech,
  judgeStreamDisplayText,
  parsePhilosophyJudgeStep,
} from "../data/philosophyJudgeLocale";
import {
  finalizeRoundtableSpeech,
  roundtableStreamDisplayText,
} from "../data/roundtableLocale";
import { philosopherForLocale } from "../data/philosopherLocale";
import type { Philosopher } from "../data/philosophers";
import { DebateSummary } from "../components/DebateSummary";
import {
  generateDilemmaSummary,
  maybeSaveBattleRecord,
  streamDilemmaJudgeStep,
  streamDilemmaPhilosopherToJudge,
  streamDilemmaPhilosopherToUser,
} from "../../shared/api/arena";
import { isLoggedIn } from "../../shared/api/client";
type Stage = "setup" | "debate" | "reveal";
type ThinkingRole = "philosopher" | "judge";

export function Dilemma() {
  const { t, locale } = useArenaLocale();
  const { philosophers } = useArenaCatalog();
  const [selectedDilemmaId, setSelectedDilemmaId] = useState(dilemmas[0].id);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedPhilosopherId, setSelectedPhilosopherId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("setup");
  const [messages, setMessages] = useState<DilemmaStoredMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingRole, setThinkingRole] = useState<ThinkingRole | null>(null);
  const [canReveal, setCanReveal] = useState(false);
  const [summaryLocales, setSummaryLocales] = useState<DilemmaSummaryBilingual | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [streamPreview, setStreamPreview] = useState("");

  const fullExplanation = summaryForLocale(summaryLocales, locale);

  const buildHistoryText = (msgs: DilemmaStoredMessage[]) =>
    msgs
      .map((message) => {
        const speaker =
          message.role === "user"
            ? t("dilemma.history.user")
            : message.role === "judge"
              ? t("dilemma.history.judge")
              : selectedPhilosopher
                ? philosopherDisplayName(selectedPhilosopher, locale)
                : "";
        const body = dilemmaMessageContent(message, locale, t, selectedOption?.label);
        return `${speaker}：${body}`;
      })
      .join("\n");

  const currentDilemma = useMemo(
    () => localizeDilemma(getDilemma(selectedDilemmaId), t),
    [selectedDilemmaId, t, locale]
  );
  const localizedDilemmaTabs = useMemo(
    () => dilemmas.map((d) => localizeDilemma(d, t)),
    [t, locale]
  );
  const selectedOption =
    currentDilemma.options.find((option) => option.id === selectedOptionId) ?? null;
  const selectedPhilosopher =
    philosophers.find((philosopher) => philosopher.id === selectedPhilosopherId) ?? null;
  const selectedPhilosopherDisplay = selectedPhilosopher
    ? philosopherForLocale(selectedPhilosopher, locale)
    : null;

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
    setSummaryLocales(null);
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    setSelectedPhilosopherId(null);
    setStage("setup");
    setMessages([]);
    setUserInput("");
    setCanReveal(false);
    setSummaryLocales(null);
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
        i18nKey: "dilemma.judge.opening",
        choiceOptionId: selectedOption.id,
      },
    ]);
    setUserInput("");
    setCanReveal(false);
    setSummaryLocales(null);
    setStage("debate");
  };

  const dilemmaStreamBody = (prior: DilemmaStoredMessage[]) => {
    const pLoc = philosopherForLocale(selectedPhilosopher!, locale);
    const ideasSep = locale === "zh" ? "、" : ", ";
    return {
      moralDilemmaTitle: currentDilemma.title,
      moralDilemmaEnglishTitle: currentDilemma.englishTitle,
      question: currentDilemma.question,
      promptLead: currentDilemma.promptLead,
      userStance: selectedOption!.stancePrompt,
      philosopherId: selectedPhilosopher!.id,
      philosopherName: philosopherDisplayName(selectedPhilosopher!, locale),
      philosopherSchool: pLoc.school,
      keyIdeas: pLoc.keyIdeas.join(ideasSep),
      summary: pLoc.summary ?? selectedPhilosopher!.summary ?? "",
      history: buildHistoryText(prior),
      locale,
    };
  };

  const streamPhilosopherMessage = async (
    mode: "to-user" | "to-judge",
    prior: DilemmaStoredMessage[]
  ): Promise<DilemmaStoredMessage> => {
    const msgId = `${mode}-${Date.now()}`;
    const placeholder: DilemmaStoredMessage = {
      id: msgId,
      role: "philosopher",
      content: "",
    };
    setThinkingRole("philosopher");
    setMessages([...prior, placeholder]);

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
        ? await streamDilemmaPhilosopherToUser(dilemmaStreamBody(prior), handlers)
        : await streamDilemmaPhilosopherToJudge(dilemmaStreamBody(prior), handlers);

    const finalText = finalizeRoundtableSpeech(resp.text);
    if (!finalText.trim()) throw new Error(t("dilemma.error.philosopherResponse"));

    const finished = { ...placeholder, content: finalText };
    setMessages((curr) => curr.map((m) => (m.id === msgId ? finished : m)));
    return finished;
  };

  const streamJudgeMessage = async (prior: DilemmaStoredMessage[]) => {
    const msgId = `judge-${Date.now()}`;
    const placeholder: DilemmaStoredMessage = {
      id: msgId,
      role: "judge",
      content: "",
    };
    setThinkingRole("judge");
    setMessages([...prior, placeholder]);

    const { philosopherId: _pid, keyIdeas: _k, summary: _s, ...judgeBody } = dilemmaStreamBody(prior);
    const resp = await streamDilemmaJudgeStep(judgeBody, {
      onDelta: (_d, acc) => {
        const preview = judgeStreamDisplayText(acc);
        setMessages((curr) =>
          curr.map((m) => (m.id === msgId ? { ...m, content: preview } : m))
        );
      },
    });

    const judge = parsePhilosophyJudgeStep(resp.philosophyJudge ?? null, resp.text);
    if (!judge) throw new Error(t("dilemma.error.turnFailed"));

    if (judge.judgeSpeaks && judge.judgeMessage) {
      const finished = {
        ...placeholder,
        content: finalizeJudgeSpeech(resp.text) || judge.judgeMessage,
      };
      setMessages([...prior, finished]);
      return { judge, judgeMsg: finished };
    }
    setMessages(prior);
    return { judge, judgeMsg: null as DilemmaStoredMessage | null };
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
    setStreamPreview("");

    const nextMessages = [
      ...messages,
      { id: userMsgId, role: "user" as const, content },
    ];
    setMessages(nextMessages);

    try {
      const philToUser = await streamPhilosopherMessage("to-user", nextMessages);
      const afterPhilosopher = [...nextMessages, philToUser];

      const { judge, judgeMsg } = await streamJudgeMessage(afterPhilosopher);
      let working = judgeMsg ? [...afterPhilosopher, judgeMsg] : afterPhilosopher;

      if (judge.judgeSpeaks && judge.addressTo === "philosopher") {
        const philToJudge = await streamPhilosopherMessage("to-judge", working);
        working = [...working, philToJudge];
        setMessages(working);
      }

      setCanReveal(judge.continueDebate === false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("dilemma.error.turnFailed");
      toast.error(msg);
      setMessages((previous) => previous.filter((m) => m.id !== userMsgId));
      setUserInput(content);
    } finally {
      setIsThinking(false);
      setThinkingRole(null);
      setStreamPreview("");
    }
  };

  const handleReveal = async () => {
    if (!selectedOption || !selectedPhilosopher) {
      return;
    }

    setStage("reveal");
    setIsGeneratingSummary(true);
    setSummaryLocales(null);
    setStreamPreview("");

    const history = buildHistoryText(messages);

    try {
      const response = await generateDilemmaSummary(
        {
          moralDilemmaTitle: currentDilemma.title,
          question: currentDilemma.question,
          userStance: selectedOption.stancePrompt,
          philosopherName: philosopherDisplayName(selectedPhilosopher, locale),
          philosopherSchool: philosopherForLocale(selectedPhilosopher, locale).school,
          history,
        },
        { onDelta: (_d, acc) => setStreamPreview(acc) }
      );
      const summary =
        parseDilemmaSummaryBilingual(response.dilemmaSummary) ??
        parseDilemmaSummaryBilingual(response.text);
      if (summary) {
        setSummaryLocales(summary);
        const summaryText = summaryForLocale(summary, locale);
        if (isLoggedIn()) {
          maybeSaveBattleRecord({
            battleType: "dilemma",
            topic: currentDilemma.title,
            userChoice: selectedOption.label,
            judgeSummary: summaryText,
            changedStance: false,
            messages: messages.map((m) => ({
              role: m.role,
              content: dilemmaMessageContent(m, locale, t, selectedOption.label),
            })),
          }).catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : "";
            toast.error(t("dilemma.saveFailed") + ": " + msg);
          });
        }
      } else {
        throw new Error(t("dilemma.error.summaryFailed"));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("dilemma.error.summaryFailed");
      toast.error(msg);
    } finally {
      setIsGeneratingSummary(false);
      setStreamPreview("");
    }
  };

  const resetDiscussion = () => {
    setStage("setup");
    setSelectedPhilosopherId(null);
    setMessages([]);
    setUserInput("");
    setCanReveal(false);
    setSummaryLocales(null);
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
              <p className="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-400">
                {t("dilemma.title")}
              </p>
              <h2 className="mb-3 text-4xl font-bold text-white">{t("dilemma.title")}</h2>
              <p className="text-zinc-400">{t("dilemma.subtitle")}</p>
            </section>

            <section className="mb-6 flex flex-wrap justify-center gap-3">
              {localizedDilemmaTabs.map((dilemma) => {
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
                  <span>{t("dilemma.backHome")}</span>
                </Link>
              </div>

              <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <div className="mb-2 text-sm text-cyan-300">{t("dilemma.coreQuestion")}</div>
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
                    <div className="mb-2 text-sm text-orange-300">{t("dilemma.yourStance")}</div>
                    <div className="font-semibold text-white">{selectedOption.label}</div>
                    <p className="mt-2 text-sm text-zinc-400">{selectedOption.summary}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-2xl font-bold">{t("dilemma.selectPhilosopher")}</h4>
                    <p className="mt-2 text-zinc-400">
                      {t("dilemma.selectPhilosopherHint")}
                    </p>
                  </div>

                  {recommendedPhilosophers.length > 0 && (
                    <div className="mb-8">
                      <div className="mb-3 text-sm text-cyan-300">{t("dilemma.recommended")}</div>
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
                    <div className="mb-3 text-sm text-zinc-400">{t("dilemma.allPhilosophers")}</div>
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

        {stage === "debate" && selectedOption && selectedPhilosopher && selectedPhilosopherDisplay && (
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-cyan-300">{currentDilemma.title}</div>
                <h2 className="text-3xl font-bold">
                  {t("dilemma.discussionWindow", {
                    name: philosopherDisplayName(selectedPhilosopher, locale),
                  })}
                </h2>
              </div>
              <button
                type="button"
                onClick={resetDiscussion}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
              >
                {t("dilemma.reselect")}
              </button>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-[1.3fr_0.9fr]">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-2 text-sm text-zinc-500">{t("dilemma.currentDilemma")}</div>
                <div className="mb-2 text-xl font-semibold">{currentDilemma.question}</div>
                <p className="text-sm leading-6 text-zinc-400">{currentDilemma.promptLead}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-2 text-sm text-zinc-500">{t("dilemma.yourChoice")}</div>
                <div className="font-semibold text-white">{selectedOption.label}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{selectedOption.summary}</p>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3 text-zinc-400">
              <AlertCircle className="h-4 w-4" />
              <span>{t("dilemma.discussionHint")}</span>
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
                      ? t("dilemma.you")
                      : message.role === "philosopher"
                        ? philosopherDisplayName(selectedPhilosopher, locale)
                        : t("dilemma.history.judge")}
                  </div>
                  <p className="whitespace-pre-wrap leading-7 text-zinc-100">
                    {dilemmaMessageContent(message, locale, t, selectedOption?.label)}
                  </p>
                </div>
              ))}
              {isThinking && thinkingRole && (
                <div className="text-sm italic text-zinc-500">
                  {thinkingRole === "philosopher"
                    ? t("battle.philosopherThinking", {
                        name: philosopherDisplayName(selectedPhilosopher, locale),
                      })
                    : t("battle.judgeThinking")}
                </div>
              )}
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
                placeholder={t("dilemma.inputPlaceholder", {
                  name: philosopherDisplayName(selectedPhilosopher, locale),
                })}
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
              {t("dilemma.enterSummary")}
            </button>
          </div>
        )}

        {stage === "reveal" && selectedOption && selectedPhilosopher && (
          <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="mb-6">
              <div className="mb-2 text-sm text-cyan-300">{currentDilemma.title}</div>
              <h3 className="text-3xl font-bold">{t("dilemma.summary.title")}</h3>
              <p className="mt-2 text-zinc-400">
                {t("dilemma.summary.yourChoice", {
                  choice: selectedOption.label,
                  name: philosopherDisplayName(selectedPhilosopher, locale),
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="whitespace-pre-line leading-8 text-zinc-300">
                {isGeneratingSummary ? (
                  streamPreview ? (
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-zinc-400">{streamPreview}</pre>
                  ) : (
                    t("dilemma.summary.generating")
                  )
                ) : fullExplanation ? (
                  fullExplanation
                ) : (
                  t("dilemma.summary.failed")
                )}
              </p>
            </div>

            <DebateSummary
              sourceType="dilemma"
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
                {t("dilemma.continue")}
              </button>
              <Link
                to="/profile"
                className="flex-1 rounded-xl bg-cyan-600 py-3 text-center font-bold text-white transition-colors hover:bg-cyan-500"
              >
                {t("dilemma.viewProfile")}
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
  const { t, locale } = useArenaLocale();
  const p = philosopherForLocale(philosopher, locale);
  const displayName = philosopherDisplayName(philosopher, locale);
  const ideasSep = locale === "zh" ? "、" : ", ";
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
            <h5 className="truncate font-bold text-white">{displayName}</h5>
            {featured && (
              <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] text-cyan-300">
                {t("dilemma.recommended")}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            {p.school} · {formatPhilosopherPeriod(philosopher.period, t)}
          </div>
        </div>
      </div>
      <div className="line-clamp-2 text-sm leading-6 text-zinc-400">
        {p.keyIdeas.slice(0, 3).join(ideasSep)}
      </div>
    </button>
  );
}
