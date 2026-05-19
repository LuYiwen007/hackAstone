import { Languages } from "lucide-react";
import { useArenaLocale } from "../context/ArenaLocaleContext";
import type { ArenaLocale } from "../../shared/i18n/format";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useArenaLocale();

  const toggle = () => {
    const next: ArenaLocale = locale === "en" ? "zh" : "en";
    setLocale(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
      title={t("lang.switch")}
      aria-label={t("lang.switch")}
    >
      <Languages className="h-4 w-4 shrink-0" />
      <span className="font-medium">{locale === "en" ? t("lang.zh") : t("lang.en")}</span>
    </button>
  );
}
