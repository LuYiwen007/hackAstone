import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Swords, Brain, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ArenaHeader } from "../components/ArenaHeader";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { useArenaLocale } from "../context/ArenaLocaleContext";
import {
  DISCIPLINE_CATEGORY_KEYS,
  DISCIPLINE_CATEGORY_LABELS,
  battleMatchesCategory,
  type DisciplineCategoryKey,
} from "../data/disciplineCategories";
import { battleForLocale, parseDisciplineBattleBilingual } from "../data/battleLocale";
import { generateDisciplineBattle } from "../../shared/api/arena";

export function Disciplines() {
  const navigate = useNavigate();
  const { allBattles, addGeneratedBattle } = useArenaCatalog();
  const { t, locale } = useArenaLocale();
  const [selectedCategory, setSelectedCategory] = useState<DisciplineCategoryKey>(
    "disciplines.category.all"
  );
  const [aiLoading, setAiLoading] = useState(false);

  const filteredBattles = useMemo(
    () => allBattles.filter((b) => battleMatchesCategory(selectedCategory, b)),
    [allBattles, selectedCategory]
  );

  const featured = filteredBattles[0];
  const featuredDisplay = featured ? battleForLocale(featured, locale) : undefined;

  const handleAiGenerate = async () => {
    const labels = DISCIPLINE_CATEGORY_LABELS[selectedCategory];
    setAiLoading(true);
    try {
      const resp = await generateDisciplineBattle(labels.en, labels.zh);
      const parsed =
        parseDisciplineBattleBilingual(resp.battle) ?? parseDisciplineBattleBilingual(resp.text);
      if (!parsed) {
        const hint = resp.text?.slice(0, 120) ?? "";
        throw new Error(
          hint.includes("role-mismatch") || hint.includes("Ledger")
            ? t("disciplines.aiEchoMisconfigured")
            : t("disciplines.aiInvalid")
        );
      }
      const id = addGeneratedBattle({
        en: {
          ...parsed.en,
          judgeQuestions: parsed.en.judgeQuestions.slice(0, 3),
        },
        zh: {
          ...parsed.zh,
          judgeQuestions: parsed.zh.judgeQuestions.slice(0, 3),
        },
      });
      navigate(`/battle/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("disciplines.aiFailed");
      toast.error(msg);
    } finally {
      setAiLoading(false);
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

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            {t("disciplines.hero.title")}
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t("disciplines.hero.subtitle")}</p>
        </div>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
            {DISCIPLINE_CATEGORY_KEYS.map((key) => {
              const active = selectedCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg border whitespace-nowrap text-sm transition-colors ${
                    active
                      ? "border-zinc-100 bg-zinc-100 text-zinc-900 font-semibold"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {t(key)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => void handleAiGenerate()}
            disabled={aiLoading}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-orange-500/50 bg-gradient-to-r from-orange-600 to-red-600 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:from-orange-500 hover:to-red-500 disabled:opacity-60 sm:min-w-[160px]"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {aiLoading ? t("disciplines.aiGenerating") : t("disciplines.aiGenerate")}
          </button>
        </div>

        {featured && featuredDisplay && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-bold">{t("disciplines.dailyPick")}</h3>
            </div>
            <Link to={`/battle/${featured.id}`}>
              <div className="p-6 rounded-xl bg-gradient-to-br from-red-950/50 to-orange-950/30 border-2 border-orange-600/30 hover:border-orange-500/50 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-orange-400 mb-2">{featuredDisplay.category}</div>
                    <h4 className="text-2xl font-bold mb-3 group-hover:text-orange-400 transition-colors">
                      {featuredDisplay.question}
                    </h4>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center">
                    <Swords className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>Builder vs Breaker</span>
                  <span className="text-orange-400 group-hover:translate-x-1 transition-transform inline-block">
                    {t("disciplines.startDebate")} →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div>
          <h3 className="text-xl font-bold mb-4">{t("disciplines.allDebates")}</h3>
          {filteredBattles.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">{t("disciplines.emptyCategory")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBattles.map((item) => {
                const display = battleForLocale(item, locale);
                return (
                <Link key={item.id} to={`/battle/${item.id}`}>
                  <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group h-full">
                    <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                      {display.category}
                    </div>
                    <h4 className="text-lg font-bold mb-3 group-hover:text-zinc-300 transition-colors">
                      {display.question}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Builder</span>
                      </div>
                      <span>vs</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Breaker</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 py-8 border-t border-zinc-800 text-center text-zinc-600 text-sm">
        <p>{t("home.footer")}</p>
      </footer>
    </div>
  );
}
