import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ArenaHeader } from "../components/ArenaHeader";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { useArenaLocale } from "../context/ArenaLocaleContext";
import { battleForLocale } from "../data/battleLocale";
import { formatMessage } from "../../shared/i18n/format";
import { saveBattleRecord } from "../../shared/api/arena";
import { isLoggedIn } from "../../shared/api/client";

type Stage = "choose" | "reason" | "judge" | "reveal";
type Choice = "builder" | "breaker" | "uncertain" | null;

export function Battle() {
  const { id } = useParams();
  const { getBattleById } = useArenaCatalog();
  const { t, locale } = useArenaLocale();
  const rawBattle = id ? getBattleById(id) : undefined;
  const battle = rawBattle ? battleForLocale(rawBattle, locale) : undefined;

  const [stage, setStage] = useState<Stage>("choose");
  const [choice, setChoice] = useState<Choice>(null);
  const [reason, setReason] = useState("");
  const [judgeIndex, setJudgeIndex] = useState(0);

  useEffect(() => {
    if (!battle || stage !== "reveal" || !isLoggedIn()) return;
    saveBattleRecord({
      battleType: "battle",
      topic: battle.question,
      userChoice: choice ?? "--",
      judgeSummary: battle.reveal ?? "",
      changedStance: false,
    }).catch(() => {
      /* ignore */
    });
  }, [stage, battle, choice]);

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

  const handleChoose = (selected: Choice) => {
    setChoice(selected);
  };

  const handleSubmitReason = () => {
    if (reason.trim().length < 10) {
      toast.error(t("discipline.battle.reasonMinLength"));
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
        <div className="mb-12 text-center">
          <div className="text-sm text-orange-400 mb-2">{battle.category}</div>
          <h1 className="text-4xl font-bold mb-4">{battle.question}</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>{t("discipline.battle.inProgress")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
            <p className="text-zinc-300 leading-relaxed">{battle.builderView}</p>
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
            <p className="text-zinc-300 leading-relaxed">{battle.breakerView}</p>
          </div>
        </div>

        {stage === "choose" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 text-center">{t("discipline.battle.yourStance")}</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleChoose("builder")}
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
                  onClick={() => handleChoose("breaker")}
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
                  onClick={() => handleChoose("uncertain")}
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
                  onClick={() => setStage("reason")}
                  className="w-full mt-6 py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
                >
                  {t("discipline.battle.continueReason")}
                </button>
              )}
            </div>
          </div>
        )}

        {stage === "reason" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <div className="flex items-start gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("discipline.battle.explainReason")}</h3>
                  <p className="text-sm text-zinc-400">{t("discipline.battle.explainReasonHint")}</p>
                </div>
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("discipline.battle.reasonPlaceholder")}
                className="w-full h-40 p-4 rounded-lg bg-zinc-950 border border-zinc-700 focus:border-orange-500 focus:outline-none resize-none"
              />

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-zinc-500">
                  {formatMessage(t("discipline.battle.charCount"), { count: reason.length })}
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStage("choose")}
                    className="px-6 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors"
                  >
                    {t("discipline.battle.back")}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReason}
                    className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
                  >
                    {t("discipline.battle.submitReason")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "judge" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900 border-2 border-orange-600/30 rounded-xl p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center font-bold text-xl">
                  J
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{t("discipline.battle.judge")}</h3>
                  <p className="text-sm text-zinc-400">{t("discipline.battle.judgeSubtitle")}</p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-lg leading-relaxed">{battle.judgeQuestions[judgeIndex]}</p>
                </div>
              </div>

              <div className="text-sm text-zinc-500 mb-6 text-center">
                {formatMessage(t("discipline.battle.judgeProgress"), {
                  current: judgeIndex + 1,
                  total: battle.judgeQuestions.length,
                })}
              </div>

              <button
                type="button"
                onClick={handleNextJudgeQuestion}
                className="w-full py-4 rounded-lg bg-orange-600 hover:bg-orange-700 transition-colors font-bold"
              >
                {judgeIndex < battle.judgeQuestions.length - 1
                  ? t("discipline.battle.continueThinking")
                  : t("discipline.battle.viewAnalysis")}
              </button>
            </div>
          </div>
        )}

        {stage === "reveal" && (
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
                {battle.reveal}
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
