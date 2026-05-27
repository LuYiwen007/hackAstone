import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Clock, Globe2, Swords } from "lucide-react";
import { ArenaHeader } from "../components/ArenaHeader";
import { PhilosopherAvatar } from "../components/PhilosopherAvatar";
import { PhilosopherCard } from "../components/PhilosopherCard";
import type { Philosopher } from "../data/philosophers";
import worldLand from "../data/ne_110m_land.json";
import {
  getPhilosophersByPeriodAndRegion,
  type CatalogTimePeriodMeta,
} from "../data/catalogMeta";
import { useArenaCatalog } from "../context/ArenaCatalogContext";
import { philosopherDisplayName, useArenaLocale } from "../context/ArenaLocaleContext";
import { philosopherForLocale } from "../data/philosopherLocale";
import { formatMessage } from "../../shared/i18n/format";

const MAP_VIEWBOX = { width: 1000, height: 520 };
const MAP_LAT_RANGE = { min: -85, max: 85 };

const regionGeoLayout: Record<
  string,
  {
    lon: number;
    lat: number;
    cardOffsetX?: number;
    cardOffsetY?: number;
  }
> = {
  Americas: { lon: -99, lat: 38, cardOffsetX: -18, cardOffsetY: -4 },
  Europe: { lon: 14, lat: 50, cardOffsetX: -28, cardOffsetY: 12 },
  "Middle East": { lon: 45, lat: 31, cardOffsetX: 18, cardOffsetY: 4 },
  "South Asia": { lon: 79, lat: 22, cardOffsetX: 24, cardOffsetY: 8 },
  "East Asia": { lon: 116, lat: 36, cardOffsetX: 22, cardOffsetY: -2 },
};

const oceanLabels = [
  { id: "pacific-west", x: 118, y: 250, text: "PACIFIC" },
  { id: "atlantic", x: 405, y: 262, text: "ATLANTIC" },
  { id: "indian", x: 671, y: 345, text: "INDIAN" },
  { id: "pacific-east", x: 936, y: 286, text: "PACIFIC" },
];

function projectLongitude(lon: number) {
  return ((lon + 180) / 360) * MAP_VIEWBOX.width;
}

function projectLatitude(lat: number) {
  return (
    ((MAP_LAT_RANGE.max - lat) / (MAP_LAT_RANGE.max - MAP_LAT_RANGE.min)) * MAP_VIEWBOX.height
  );
}

function projectPoint([lon, lat]: [number, number]) {
  return [projectLongitude(lon), projectLatitude(lat)] as const;
}

function ringToSvgPath(ring: [number, number][]) {
  return ring
    .map((point, index) => {
      const [x, y] = projectPoint(point);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function geometryToSvgPath(
  geometry:
    | { type: "Polygon"; coordinates: [number, number][][] }
    | { type: "MultiPolygon"; coordinates: [number, number][][][] }
) {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => `${ringToSvgPath(ring)} Z`).join(" ");
  }

  return geometry.coordinates
    .map((polygon) => polygon.map((ring) => `${ringToSvgPath(ring)} Z`).join(" "))
    .join(" ");
}

function toMapPercent(value: number, dimension: number) {
  return `${(value / dimension) * 100}%`;
}

export function Home() {
  const navigate = useNavigate();
  const { t, locale } = useArenaLocale();
  const { philosophers, regions, timePeriods } = useArenaCatalog();

  const describePeriod = (period: CatalogTimePeriodMeta) => {
    if (period.showAll) {
      return t("home.period.allPhilosophers");
    }
    return formatMessage(t("home.period.range"), {
      start: String(period.startYear),
      end: String(period.endYear),
    });
  };
  const [selectedPeriodId, setSelectedPeriodId] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<Philosopher | null>(null);

  useEffect(() => {
    if (!timePeriods.some((period) => period.id === selectedPeriodId) && timePeriods[0]) {
      setSelectedPeriodId(timePeriods[0].id);
    }
  }, [selectedPeriodId]);

  const currentPeriod = timePeriods.find((period) => period.id === selectedPeriodId) ?? timePeriods[0];

  const regionPhilosophers = useMemo(() => {
    if (!selectedRegion || !currentPeriod) {
      return [];
    }

    return getPhilosophersByPeriodAndRegion(currentPeriod, selectedRegion, philosophers);
  }, [currentPeriod, philosophers, selectedRegion]);

  const worldLandPath = useMemo(
    () =>
      worldLand.features
        .map((feature) =>
          geometryToSvgPath(
            feature.geometry as
              | { type: "Polygon"; coordinates: [number, number][][] }
              | { type: "MultiPolygon"; coordinates: [number, number][][][] }
          )
        )
        .join(" "),
    []
  );

  const handleStartDebate = () => {
    if (!selectedPhilosopher) {
      return;
    }

    navigate(`/philosophy-battle/${selectedPhilosopher.id}?year=${selectedPhilosopher.period}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <ArenaHeader
        currentPage="home"
        theme={{
          iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
          activeButton: "bg-cyan-600 border-cyan-500",
          activeHover: "hover:bg-cyan-500",
        }}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">
            {t("home.hero.title")}
          </h2>
          <p className="text-zinc-400">{t("home.hero.subtitle")}</p>
        </div>

        <section className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xl font-bold">{t("home.timeline")}</h3>
          </div>

          {currentPeriod && (
            <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-300">{currentPeriod.label}</div>
                <div className="mt-1 text-xs text-zinc-500">{currentPeriod.era}</div>
                <div className="mt-2 text-sm text-zinc-400">{describePeriod(currentPeriod)}</div>
              </div>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between text-sm text-zinc-500">
            <span>{timePeriods[0]?.label}</span>
            <span>{timePeriods[timePeriods.length - 1]?.label}</span>
          </div>

          <input
            type="range"
            min="0"
            max={Math.max(timePeriods.length - 1, 0)}
            value={Math.max(0, timePeriods.findIndex((period) => period.id === selectedPeriodId))}
            onChange={(event) => {
              const index = Number.parseInt(event.target.value, 10);
              const nextPeriod = timePeriods[index];
              if (!nextPeriod) {
                return;
              }

              setSelectedPeriodId(nextPeriod.id);
              setSelectedRegion(null);
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
          />

          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs text-zinc-600 md:grid-cols-7">
            <span>{t("home.timeline.ancient")}</span>
            <span>{t("home.timeline.lateAntiquity")}</span>
            <span>{t("home.timeline.medieval")}</span>
            <span>{t("home.timeline.earlyModern")}</span>
            <span>{t("home.timeline.modern")}</span>
            <span>{t("home.timeline.crossEra")}</span>
            <span>{t("home.timeline.all")}</span>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Globe2 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xl font-bold">{t("home.map.title")}</h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.15),_transparent_42%),linear-gradient(180deg,rgba(9,9,11,0.98),rgba(24,24,27,0.94))] p-4 md:p-6">
            <div className="relative aspect-[1000/520] min-h-[340px] w-full">
              <div className="pointer-events-none absolute inset-0">
                <svg
                  viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="oceanGlow" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#082f49" stopOpacity="0.55" />
                      <stop offset="55%" stopColor="#0f172a" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="continentFill" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#164e63" stopOpacity="0.7" />
                      <stop offset="55%" stopColor="#0f3c50" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#082f49" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="coastGlow" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="url(#oceanGlow)" />

                  <g stroke="rgba(148,163,184,0.14)" strokeWidth="1">
                    <path d="M40 126H960" />
                    <path d="M40 198H960" />
                    <path d="M40 260H960" />
                    <path d="M40 322H960" />
                    <path d="M40 394H960" />
                    <path d="M180 48V472" />
                    <path d="M340 48V472" />
                    <path d="M500 48V472" />
                    <path d="M660 48V472" />
                    <path d="M820 48V472" />
                  </g>

                  <g filter="url(#coastGlow)">
                    <path
                      d={worldLandPath}
                      fill="url(#continentFill)"
                      fillRule="evenodd"
                      stroke="rgba(165,243,252,0.92)"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>

                  <g>
                    <path
                      d={worldLandPath}
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="0.55"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>

                  <g fontSize="13" letterSpacing="4" fill="rgba(186,230,253,0.22)">
                    {oceanLabels.map((label) => (
                      <text key={label.id} x={label.x} y={label.y}>
                        {label.text}
                      </text>
                    ))}
                  </g>

                  {regions.map((region) => {
                    const layout = regionGeoLayout[region.id];
                    const anchorX = layout
                      ? projectLongitude(layout.lon)
                      : (region.x / 100) * MAP_VIEWBOX.width;
                    const anchorY = layout
                      ? projectLatitude(layout.lat)
                      : (region.y / 100) * MAP_VIEWBOX.height;
                    const active = selectedRegion === region.id;

                    return (
                      <g key={`${region.id}-anchor`}>
                        <circle
                          cx={anchorX}
                          cy={anchorY}
                          r={active ? 24 : 16}
                          fill={active ? "rgba(34,211,238,0.24)" : "rgba(34,211,238,0.12)"}
                        />
                        <circle
                          cx={anchorX}
                          cy={anchorY}
                          r={active ? 7 : 5}
                          fill={active ? "#67e8f9" : "#22d3ee"}
                          stroke="rgba(8,47,73,0.95)"
                          strokeWidth="2.5"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="relative h-full w-full">
                {regions.map((region) => {
                  const regionItems = currentPeriod
                    ? getPhilosophersByPeriodAndRegion(currentPeriod, region.id, philosophers)
                    : [];
                  const previewPhilosophers = regionItems.slice(0, 6);
                  const active = selectedRegion === region.id;
                  const layout = regionGeoLayout[region.id];
                  const anchorX = layout
                    ? projectLongitude(layout.lon)
                    : (region.x / 100) * MAP_VIEWBOX.width;
                  const anchorY = layout
                    ? projectLatitude(layout.lat)
                    : (region.y / 100) * MAP_VIEWBOX.height;
                  const cardOffsetX = layout?.cardOffsetX ?? 0;
                  const cardOffsetY = layout?.cardOffsetY ?? 0;

                  return (
                    <div
                      key={region.id}
                      className="absolute -translate-x-1/2 -translate-y-full"
                      style={{
                        left: toMapPercent(anchorX, MAP_VIEWBOX.width),
                        top: toMapPercent(anchorY, MAP_VIEWBOX.height),
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedRegion(region.id)}
                        className={`group flex flex-col items-center transition-transform ${
                          active ? "scale-105" : "hover:scale-[1.03]"
                        }`}
                      >
                        <div
                          className="mb-2"
                          style={{
                            transform: `translate(${cardOffsetX}px, ${cardOffsetY}px)`,
                          }}
                        >
                          <div
                            className={`rounded-2xl border px-3 py-3 text-center shadow-[0_18px_45px_rgba(2,6,23,0.42)] backdrop-blur-md md:px-4 ${
                              active
                                ? "border-cyan-300 bg-cyan-500/18"
                                : "border-zinc-700/90 bg-zinc-950/78 group-hover:border-zinc-500"
                            }`}
                          >
                            <div className="text-sm font-bold md:text-base">{region.name}</div>
                            <div className="mt-1 text-[11px] text-zinc-400 md:text-xs">
                              {regionItems.length > 0
                                ? formatMessage(t("home.map.philosophersCount"), {
                                    count: regionItems.length,
                                  })
                                : t("home.map.noFigures")}
                            </div>

                            {previewPhilosophers.length > 0 && (
                              <div className="mx-auto mt-2 flex max-w-[124px] flex-wrap justify-center gap-1 md:max-w-[144px]">
                                {previewPhilosophers.map((philosopher) => (
                                  <PhilosopherAvatar
                                    key={philosopher.id}
                                    philosopher={philosopher}
                                    className={`h-6 w-6 border text-xs ${
                                      active ? "border-cyan-200" : "border-zinc-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <span
                          className={`block w-px rounded-full ${
                            active ? "h-8 bg-cyan-300/90" : "h-6 bg-cyan-500/60"
                          }`}
                        />
                        <span
                          className={`block h-3.5 w-3.5 rounded-full border-2 border-zinc-950 ${
                            active ? "bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.6)]" : "bg-cyan-500"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {selectedRegion && regionPhilosophers.length > 0 && (
          <section className="rounded-xl border border-cyan-500/30 bg-zinc-900 p-6">
            <h3 className="mb-4 text-xl font-bold">
              {regions.find((region) => region.id === selectedRegion)?.name} · {currentPeriod?.label}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regionPhilosophers.map((philosopher) => {
                const p = philosopherForLocale(philosopher, locale);
                return (
                <button
                  key={philosopher.id}
                  type="button"
                  onClick={() => setSelectedPhilosopher(philosopher)}
                  className="group rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-left transition-all hover:border-cyan-500"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <PhilosopherAvatar philosopher={philosopher} className="h-12 w-12 flex-shrink-0 text-lg" />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-bold transition-colors group-hover:text-cyan-300">
                        {philosopherDisplayName(philosopher, locale)}
                      </h4>
                      <p className="mt-1 text-xs text-zinc-600">
                        {p.school}
                        {locale === "en" ? ` · ${philosopher.period > 0 ? philosopher.period : `${Math.abs(philosopher.period)} BCE`}` : ` · ${philosopher.period}`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-500">
                    {p.keyIdeas.slice(0, 2).map((idea) => (
                      <div key={idea} className="truncate">
                        • {idea}
                      </div>
                    ))}
                  </div>
                </button>
              );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSelectedRegion(null)}
              className="mt-6 w-full rounded-lg border border-zinc-700 py-3 transition-colors hover:border-zinc-500"
            >
              {t("home.backToMap")}
            </button>
          </section>
        )}

        {selectedRegion && regionPhilosophers.length === 0 && (
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="mb-4 text-zinc-400">
              {formatMessage(t("home.noPhilosophersInRegion"), {
                period: currentPeriod?.label ?? "",
                region: regions.find((region) => region.id === selectedRegion)?.name ?? "",
              })}
            </p>
            <button
              type="button"
              onClick={() => setSelectedRegion(null)}
              className="rounded-lg border border-zinc-700 px-6 py-3 transition-colors hover:border-zinc-500"
            >
              {t("home.backToMap")}
            </button>
          </section>
        )}

        {selectedPhilosopher && (
          <PhilosopherCard
            philosopher={selectedPhilosopher}
            onClose={() => setSelectedPhilosopher(null)}
            onStartDebate={handleStartDebate}
          />
        )}
      </main>

      <footer className="mt-20 border-t border-zinc-800 py-8 text-center text-sm text-zinc-600">
        <p>{t("home.footer")}</p>
      </footer>
    </div>
  );
}
