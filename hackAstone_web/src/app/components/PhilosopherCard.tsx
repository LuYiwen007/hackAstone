import { X, BookOpen, Quote, Users as UsersIcon, MapPin, Calendar, ExternalLink } from "lucide-react";
import type { Philosopher } from "../data/philosophers";
import { philosopherForLocale } from "../data/philosopherLocale";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { philosopherDisplayName, useArenaLocale } from "../context/ArenaLocaleContext";
import type { ArenaLocale } from "../../shared/i18n/format";
import { PhilosopherAvatar } from "./PhilosopherAvatar";

function wikipediaArticleUrl(displayTitle: string, locale: ArenaLocale): string {
  const title = displayTitle.trim();
  const path = title.replace(/\s+/g, "_");
  const encoded = encodeURIComponent(path).replace(/%20/g, "_");
  if (!title) {
    return locale === "zh"
      ? "https://zh.wikipedia.org/wiki/Wikipedia:首页"
      : "https://en.wikipedia.org/wiki/Main_Page";
  }
  return locale === "zh"
    ? `https://zh.wikipedia.org/wiki/${encoded}`
    : `https://en.wikipedia.org/wiki/${encoded}`;
}

interface PhilosopherCardProps {
  philosopher: Philosopher;
  onClose: () => void;
  onStartDebate: () => void;
}

export function PhilosopherCard({ philosopher, onClose, onStartDebate }: PhilosopherCardProps) {
  const { t, locale } = useArenaLocale();
  const { philosophers } = useArenaCatalog();
  const p = philosopherForLocale(philosopher, locale);
  const displayName = philosopherDisplayName(p, locale);
  const secondaryName = locale === "zh" ? p.name : p.nameCN;
  const influencedBy =
    p.influences?.influencedBy
      ?.map((id) => {
        const found = philosophers.find((x) => x.id === id);
        return found ? philosopherForLocale(found, locale) : undefined;
      })
      .filter(Boolean) || [];

  const influenced =
    p.influences?.influenced
      ?.map((id) => {
        const found = philosophers.find((x) => x.id === id);
        return found ? philosopherForLocale(found, locale) : undefined;
      })
      .filter(Boolean) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <PhilosopherAvatar philosopher={p} className="h-16 w-16 flex-shrink-0 text-2xl" />
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
              <p className="text-zinc-400">{secondaryName}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {p.lifespan && (
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    <span>{p.lifespan}</span>
                  </div>
                )}
                {p.birthPlace && (
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin className="w-3 h-3" />
                    <span>{p.birthPlace}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* School Badge */}
          <div className="inline-block px-4 py-2 rounded-full bg-purple-600/20 text-purple-400 text-sm font-bold">
            {p.school}
          </div>

          {/* Summary */}
          {p.summary && (
            <div>
              <h3 className="text-lg font-bold mb-3">{t("philosopher.coreThought")}</h3>
              <p className="text-zinc-300 leading-relaxed">{p.summary}</p>
            </div>
          )}

          {/* Key Ideas */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-purple-500" />
              {t("philosopher.keyConcepts")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {p.keyIdeas.map((idea, i) => (
                <span key={i} className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm">
                  {idea}
                </span>
              ))}
            </div>
          </div>

          {/* Major Works */}
          {p.majorWorks && p.majorWorks.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                {t("philosopher.majorWorks")}
              </h3>
              <ul className="space-y-2">
                {p.majorWorks.map((work, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{work}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Famous Quotes */}
          {p.famousQuotes && p.famousQuotes.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Quote className="w-5 h-5 text-purple-500" />
                {t("philosopher.quotes")}
              </h3>
              <div className="space-y-3">
                {p.famousQuotes.map((quote, i) => (
                  <div key={i} className="pl-4 border-l-2 border-purple-600/30 text-zinc-300 italic">
                    "{quote}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Influence Map */}
          {(influencedBy.length > 0 || influenced.length > 0) && (
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-purple-500" />
                {t("philosopher.influence")}
              </h3>
              
              <div className="space-y-4">
                {influencedBy.length > 0 && (
                  <div>
                    <h4 className="text-sm text-zinc-500 mb-2">{t("philosopher.influencedBy")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {influencedBy.map((p) => p && (
                        <div key={p.id} className="px-3 py-2 rounded-lg bg-blue-950/30 border border-blue-900/50 text-sm">
                          <span className="text-blue-400">{philosopherDisplayName(p, locale)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {influenced.length > 0 && (
                  <div>
                    <h4 className="text-sm text-zinc-500 mb-2">{t("philosopher.influenced")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {influenced.map((p) => p && (
                        <div key={p.id} className="px-3 py-2 rounded-lg bg-orange-950/30 border border-orange-900/50 text-sm">
                          <span className="text-orange-400">{philosopherDisplayName(p, locale)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deep Dive Button */}
          <div className="pt-4 border-t border-zinc-800">
            <a
              href={wikipediaArticleUrl(displayName, locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-lg bg-zinc-950 border border-zinc-700 hover:border-zinc-600 transition-colors flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-300 mb-3"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">{t("philosopher.wikipedia")}</span>
            </a>
            
            <button
              onClick={onStartDebate}
              className="w-full py-4 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-bold text-lg"
            >
              {t("philosopher.startDebate", { name: displayName })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
