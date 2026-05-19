import { Link } from "react-router";
import { Swords, Brain } from "lucide-react";
import { ArenaHeader } from "../components/ArenaHeader";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { useArenaLocale } from "../context/ArenaLocaleContext";

const CATEGORY_KEYS = [
  "disciplines.category.all",
  "disciplines.category.business",
  "disciplines.category.psychology",
  "disciplines.category.learning",
  "disciplines.category.hot",
] as const;

export function Disciplines() {
  const { battles } = useArenaCatalog();
  const { t } = useArenaLocale();

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

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800 whitespace-nowrap text-sm"
            >
              {t(key)}
            </button>
          ))}
        </div>

        {battles[0] && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-bold">{t("disciplines.dailyPick")}</h3>
            </div>
            <Link to={`/battle/${battles[0].id}`}>
              <div className="p-6 rounded-xl bg-gradient-to-br from-red-950/50 to-orange-950/30 border-2 border-orange-600/30 hover:border-orange-500/50 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-orange-400 mb-2">{battles[0].category}</div>
                    <h4 className="text-2xl font-bold mb-3 group-hover:text-orange-400 transition-colors">
                      {battles[0].question}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {battles.map((battle) => (
              <Link key={battle.id} to={`/battle/${battle.id}`}>
                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group h-full">
                  <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">
                    {battle.category}
                  </div>
                  <h4 className="text-lg font-bold mb-3 group-hover:text-zinc-300 transition-colors">
                    {battle.question}
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
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-20 py-8 border-t border-zinc-800 text-center text-zinc-600 text-sm">
        <p>{t("home.footer")}</p>
      </footer>
    </div>
  );
}
