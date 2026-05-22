import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, Check } from "lucide-react";
import type { Philosopher } from "../data/philosophers";
import { philosopherForLocale } from "../data/philosopherLocale";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { philosopherDisplayName, useArenaLocale } from "../context/ArenaLocaleContext";
import { ArenaHeader } from "../components/ArenaHeader";
import { PhilosopherAvatar } from "../components/PhilosopherAvatar";

type PickerLocationState = {
  selectedPhilosopherIds?: string[];
};

const MAX_PICK = 4;

export function RoundtablePhilosopherPicker() {
  const { philosophers } = useArenaCatalog();
  const { t, locale } = useArenaLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const initialIds =
    (location.state as PickerLocationState | null)?.selectedPhilosopherIds ?? [];

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () =>
      [...philosophers].sort((a, b) =>
        philosopherDisplayName(a, locale).localeCompare(
          philosopherDisplayName(b, locale),
          locale === "zh" ? "zh" : "en"
        )
      ),
    [philosophers, locale]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((p) => {
      const loc = philosopherForLocale(p, locale);
      const hay = `${philosopherDisplayName(p, locale)} ${p.name} ${p.nameCN} ${loc.school}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sorted, query, locale]);

  const toggle = (p: Philosopher) => {
    setSelectedIds((prev) => {
      if (prev.includes(p.id)) return prev.filter((id) => id !== p.id);
      if (prev.length >= MAX_PICK) return prev;
      return [...prev, p.id];
    });
  };

  const handleConfirm = () => {
    navigate("/roundtable", {
      state: { selectedPhilosopherIds: selectedIds } satisfies PickerLocationState,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <ArenaHeader
        currentPage="roundtable"
        theme={{
          iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
          activeButton: "bg-gradient-to-r from-orange-600 to-red-600",
          activeBorder: "border-orange-800",
          activeHover: "hover:from-orange-500 hover:to-red-500",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/roundtable"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("roundtable.backToSetup")}</span>
          </Link>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIds.length < 2}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:from-orange-500 hover:to-red-500 transition-colors"
          >
            {t("roundtable.pickerConfirm")}
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{t("roundtable.pickerTitle")}</h1>
          <p className="text-zinc-400 text-sm">{t("roundtable.pickerHint")}</p>
          <p className="text-orange-500 text-sm mt-2 font-medium">
            {t("roundtable.pickerCount", {
              total: philosophers.length,
              count: selectedIds.length,
            })}
          </p>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("roundtable.searchPlaceholder")}
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-700/50"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const loc = philosopherForLocale(p, locale);
            const picked = selectedIds.includes(p.id);
            const full = selectedIds.length >= MAX_PICK && !picked;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p)}
                disabled={full}
                className={`flex items-start gap-3 text-left p-4 border rounded-xl transition-all ${
                  picked
                    ? "bg-orange-900/30 border-orange-600"
                    : full
                      ? "bg-zinc-900 border-zinc-800 opacity-40 cursor-not-allowed"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800"
                }`}
              >
                <PhilosopherAvatar philosopher={p} className="h-12 w-12 shrink-0 text-lg" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white truncate">
                    {philosopherDisplayName(p, locale)}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">{loc.school}</div>
                  {p.period != null && (
                    <div className="text-xs text-zinc-600 mt-1">
                      {p.period < 0 ? `前${Math.abs(p.period)}` : p.period}
                    </div>
                  )}
                </div>
                {picked && <Check className="w-5 h-5 text-orange-400 shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
