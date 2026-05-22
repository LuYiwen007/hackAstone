import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { ArenaHeader } from "../components/ArenaHeader";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { useArenaLocale } from "../context/ArenaLocaleContext";
import { battleForLocale } from "../data/battleLocale";
import {
  buildDisciplineHistory,
  disciplineRoleLabel,
  disciplineStreamDisplayText,
  disciplineSummaryForLocale,
  finalizeDisciplineSpeech,
  parseDisciplineDualReply,
  parseDisciplineSummaryBilingual,
  type DisciplineChoice,
  type DisciplineStoredMessage,
  type DisciplineSummaryBilingual,
} from "../data/disciplineLocale";
import { isLoggedIn } from "../../shared/api/client";
import {
  saveBattleRecord,
  streamDisciplineDebateDual,
  streamDisciplineDebateOpponent,
  streamDisciplineDebateSummary,
} from "../../shared/api/arena";

type Stage = "choose" | "debate" | "summary";

export function Battle() {
  const { id } = useParams();
  const { getBattleById } = useArenaCatalog();
  const { t, locale } = useArenaLocale();
  const rawBattle = id ? getBattleById(id) : undefined;
  const battle = rawBattle ? battleForLocale(rawBattle, locale) : undefined;

  const [stage, setStage] = useState<Stage>("choose");
  const [choice, setChoice] = useState<DisciplineChoice | null>(null);
  const [messages, setMessages] = useState<DisciplineStoredMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [streamPreview, setStreamPreview] = useState("");
  const [summaryLocales, setSummaryLocales] = useState<DisciplineSummaryBilingual | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const dialogueRounds = messages.filter((m) => m.role === "user").length;
  const canEndDebate = dialogueRounds >= 1 && !isThinking;

  useEffect(() => {
    if (stage !== "debate") return;
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [stage, messages, isThinking, streamPreview]);

  useEffect(() => {
    if (stage !== "summary" || !battle || !choice || !isLoggedIn()) return;
    const summaryText = summaryLocales
      ? disciplineSummaryForLocale(summaryLocales, locale)
      : battle.reveal ?? "";
    saveBattleRecord({
      battleType: "battle",
      topic: battle.question,
      userChoice: choice,
      judgeSummary: summaryText,
      changedStance: false,
      messages,
    }).catch(() => {
      /* ignore */
    });
  }, [stage, battle, choice, summaryLocales, locale, messages]);

  if (!battle) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t("discipline.battle.notFound")}</h2>
          <Link to="/disciplines" className="text-orange-500 hover:underline">
            {t("discipline.battle.backToDisciplines")}
          </Link>
        </div>
      </div>
    );
  }

  const opponentRole = (): "builder" | "breaker" =>
    choice === "builder" ? "breaker" : "builder";

  const handleStartDebate = () => {
    if (!choice) return;
    setStage("debate");
    setMessages([]);
    setUserInput("");
    setSummaryLocales(null);
  };

  const handleUserTurn = async () => {
    if (!choice) return;
    const content = userInput.trim();
    if (!content || isThinking) return;

    const userMsg: DisciplineStoredMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setUserInput("");
    setIsThinking(true);
    setStreamPreview("");

    const history = buildDisciplineHistory(messages, t);
    const body = {
      question: battle.question,
      builderView: battle.builderView,
      breakerView: battle.breakerView,
      userChoice: choice,
      userMessage: content,
      history,
      locale,
    };

    try {
      if (choice === "uncertain") {
        const placeholderBuilder: DisciplineStoredMessage = {
          id: `builder-${Date.now()}`,
          role: "builder",
          content: "",
          timestamp: Date.now(),
        };
        setMessages([...nextMessages, placeholderBuilder]);

        const resp = await streamDisciplineDebateDual(body, {
          onDelta: (_d, acc) => {
            const preview = disciplineStreamDisplayText(acc);
            setStreamPreview(preview);
            const dual = parseDisciplineDualReply(acc);
            setMessages((curr) =>
              curr.map((m) =>
                m.id === placeholderBuilder.id
                  ? { ...m, content: dual?.builder ?? preview }
                  : m
              )
            );
          },
        });

        const dual =
          parseDisciplineDualReply(resp.text, resp.disciplineDual) ??
          parseDisciplineDualReply(resp.text);
        if (!dual) {
          throw new Error(t("discipline.battle.error.dualReply"));
        }
        const ts = Date.now();
        setMessages([
          ...nextMessages,
          { id: placeholderBuilder.id, role: "builder", content: dual.builder, timestamp: ts },
          { id: `breaker-${ts}`, role: "breaker", content: dual.breaker, timestamp: ts + 1 },
        ]);
      } else {
        const role = opponentRole();
        const placeholder: DisciplineStoredMessage = {
          id: `${role}-${Date.now()}`,
          role,
          content: "",
          timestamp: Date.now(),
        };
        setMessages([...nextMessages, placeholder]);

        const resp = await streamDisciplineDebateOpponent(body, {
          onDelta: (_d, acc) => {
            const preview = disciplineStreamDisplayText(acc);
            setStreamPreview(preview);
            setMessages((curr) =>
              curr.map((m) => (m.id === placeholder.id ? { ...m, content: preview } : m))
            );
          },
        });

        const finalText = finalizeDisciplineSpeech(resp.text);
        if (!finalText.trim()) {
          throw new Error(t("discipline.battle.error.opponentReply"));
        }
        setMessages((curr) =>
          curr.map((m) => (m.id === placeholder.id ? { ...m, content: finalText } : m))
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("discipline.battle.error.turnFailed");
      toast.error(msg);
      setMessages(messages);
      setUserInput(content);
    } finally {
      setIsThinking(false);
      setStreamPreview("");
    }
  };

  const handleEndDebate = async () => {
    if (!choice || !canEndDebate) return;
    setStage("summary");
    setIsGeneratingSummary(true);
    setSummaryLocales(null);
    setStreamPreview("");

    const history = buildDisciplineHistory(messages, t);
    try {
      const resp = await streamDisciplineDebateSummary(
        {
          question: battle.question,
          builderView: battle.builderView,
          breakerView: battle.breakerView,
          userChoice: choice,
          history,
        },
        { onDelta: (_d, acc) => setStreamPreview(acc) }
      );
      const summary =
        parseDisciplineSummaryBilingual(resp.disciplineSummary) ??
        parseDisciplineSummaryBilingual(resp.text);
      if (!summary) {
        throw new Error(t("discipline.battle.error.summaryFailed"));
      }
      setSummaryLocales(summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("discipline.battle.error.summaryFailed");
      toast.error(msg);
      setStage("debate");
    } finally {
      setIsGeneratingSummary(false);
      setStreamPreview("");
    }
  };

  const summaryDisplay =
    summaryLocales != null
      ? disciplineSummaryForLocale(summaryLocales, locale)
      : isGeneratingSummary
        ? streamPreview || t("discipline.battle.summaryGenerating")
        : battle.reveal;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <ArenaHeader
        currentPage="disciplines"
        theme={{
          iconBg: "bg-gradient-to-br from-red-500 to-orange-600",
          activeButton: "bg-orange-600 border-orange-500",
          activeHover: "hover:bg-orange-500",
        }}
      />

      <div className="border-b border-zinc-800 bg-zinc-950/80">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <Link
            to="/disciplines"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("discipline.battle.backToDisciplines")}</span>
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <div className="text-sm text-orange-400 mb-2">{battle.category}</div>
          <h1 className="text-4xl font-bold mb-4">{battle.question}</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>{t("discipline.battle.inProgress")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                <p className="text-xs text-zinc-500">{t("discipline.battle.builderSubtitle")}</p>
              </div>
            </div>
            <p className="text-zinc-300 leading-relaxed text-sm">{battle.builderView}</p>
          </div>

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
                <p className="text-xs text-zinc-500">{t("discipline.battle.breakerSubtitle")}</p>
              </div>
            </div>
            <p className="text-zinc-300 leading-relaxed text-sm">{battle.breakerView}</p>
          </div>
        </div>

        {stage === "choose" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 text-center">{t("discipline.battle.yourStance")}</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setChoice("builder")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    choice === "builder"
                      ? "border-blue-500 bg-blue-950/30"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="font-bold mb-1">{t("discipline.battle.supportBuilder")}</div>
                  <div className="text-sm text-zinc-500">{t("discipline.battle.supportBuilderHint")}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setChoice("breaker")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    choice === "breaker"
                      ? "border-red-500 bg-red-950/30"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="font-bold mb-1">{t("discipline.battle.supportBreaker")}</div>
                  <div className="text-sm text-zinc-500">{t("discipline.battle.supportBreakerHint")}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setChoice("uncertain")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    choice === "uncertain"
                      ? "border-orange-500 bg-orange-950/30"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="font-bold mb-1">{t("discipline.battle.uncertain")}</div>
                  <div className="text-sm text-zinc-500">{t("discipline.battle.uncertainHint")}</div>
                </button>
              </div>

              {choice && (
                <button
                  type="button"
                  onClick={handleStartDebate}
                  className="w-full mt-6 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
                >
                  {t("discipline.battle.startDialogue")}
                </button>
              )}
            </div>
          </div>
        )}

        {stage === "debate" && choice && (
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-center text-sm text-zinc-400">{t("discipline.battle.dialogueHint")}</p>

            <div
              ref={chatScrollRef}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-h-[280px] max-h-[420px] overflow-y-auto space-y-4"
            >
              {messages.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-8">{t("discipline.battle.dialogueEmpty")}</p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-orange-600/20 border border-orange-600/40"
                        : msg.role === "builder"
                          ? "bg-blue-950/40 border border-blue-800/50"
                          : "bg-red-950/40 border border-red-800/50"
                    }`}
                  >
                    <div className="text-xs text-zinc-500 mb-1">
                      {disciplineRoleLabel(msg.role, t)}
                    </div>
                    <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
                      {msg.content || (isThinking ? "…" : "")}
                    </p>
                  </div>
                </div>
              ))}
              {isThinking && streamPreview && messages.every((m) => !m.content) && (
                <p className="text-sm text-zinc-500 italic">{streamPreview}</p>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-3">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={t("discipline.battle.dialoguePlaceholder")}
                disabled={isThinking}
                className="flex-1 min-h-[72px] p-3 rounded-lg bg-zinc-950 border border-zinc-700 focus:border-orange-500 focus:outline-none resize-none disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleUserTurn();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => void handleUserTurn()}
                disabled={isThinking || !userInput.trim()}
                className="self-end px-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-40 transition-colors"
                aria-label={t("discipline.battle.send")}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setStage("choose");
                  setMessages([]);
                }}
                className="flex-1 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                {t("discipline.battle.back")}
              </button>
              <button
                type="button"
                onClick={() => void handleEndDebate()}
                disabled={!canEndDebate || isGeneratingSummary}
                className="flex-1 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-40 transition-colors font-bold"
              >
                {t("discipline.battle.endDebate")}
              </button>
            </div>
            {!canEndDebate && dialogueRounds === 0 && (
              <p className="text-xs text-zinc-500 text-center">{t("discipline.battle.endDebateHint")}</p>
            )}
          </div>
        )}

        {stage === "summary" && choice && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-orange-600/30 rounded-xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  💡
                </div>
                <h3 className="text-2xl font-bold mb-2">{t("discipline.battle.fullView")}</h3>
                <p className="text-zinc-400">{t("discipline.battle.fullViewHint")}</p>
              </div>

              <div className="text-lg leading-relaxed whitespace-pre-line text-zinc-300">
                {summaryDisplay}
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800 flex gap-4">
                <Link
                  to="/disciplines"
                  className="flex-1 py-4 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors text-center font-bold"
                >
                  {t("discipline.battle.backToDisciplines")}
                </Link>
                <Link
                  to="/profile"
                  className="flex-1 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors text-center font-bold"
                >
                  {t("discipline.battle.viewProfile")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
