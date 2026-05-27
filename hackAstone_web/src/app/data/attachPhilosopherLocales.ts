import type { Philosopher } from "./philosophers";
import type { PhilosopherLocaleSlice, PhilosopherWithLocales } from "./philosopherLocale";
import enOverlayById from "./philosophers-en-overlay.json";

function toSlice(philosopher: Philosopher): PhilosopherLocaleSlice {
  return {
    school: philosopher.school,
    summary: philosopher.summary,
    birthPlace: philosopher.birthPlace,
    lifespan: philosopher.lifespan,
    keyIdeas: [...philosopher.keyIdeas],
    majorWorks: philosopher.majorWorks ? [...philosopher.majorWorks] : undefined,
    famousQuotes: philosopher.famousQuotes ? [...philosopher.famousQuotes] : undefined,
  };
}

function mergeOverlay(zh: PhilosopherLocaleSlice, overlay: Record<string, unknown>): PhilosopherLocaleSlice {
  const keyIdeas = Array.isArray(overlay.keyIdeas)
    ? overlay.keyIdeas.map((x) => String(x).trim()).filter(Boolean)
    : zh.keyIdeas;
  return {
    school: String(overlay.school ?? zh.school),
    summary: overlay.summary != null ? String(overlay.summary) : zh.summary,
    birthPlace: overlay.birthPlace != null ? String(overlay.birthPlace) : zh.birthPlace,
    lifespan: overlay.lifespan != null ? String(overlay.lifespan) : zh.lifespan,
    keyIdeas,
    majorWorks: Array.isArray(overlay.majorWorks)
      ? overlay.majorWorks.map((x) => String(x).trim()).filter(Boolean)
      : zh.majorWorks,
    famousQuotes: Array.isArray(overlay.famousQuotes)
      ? overlay.famousQuotes.map((x) => String(x).trim()).filter(Boolean)
      : zh.famousQuotes,
  };
}

/** 为静态 fallback 哲学家附加 zh/en locales */
export function attachPhilosopherLocales(philosophers: Philosopher[]): PhilosopherWithLocales[] {
  return philosophers.map((philosopher) => {
    const zh = toSlice(philosopher);
    const overlay = enOverlayById[philosopher.id as keyof typeof enOverlayById] as
      | Record<string, unknown>
      | undefined;
    const en = overlay ? mergeOverlay(zh, overlay) : zh;
    return { ...philosopher, locales: { zh, en } };
  });
}
