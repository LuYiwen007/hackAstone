import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { philosophers as fallbackPhilosophers, type Philosopher } from "../data/philosophers";
import { regions as fallbackRegions, timePeriods as fallbackTimePeriods } from "../data/catalogMeta";
import { battles as fallbackBattles, type Battle } from "../data/battles";
import type { BattleLocaleSlice } from "../data/battleLocale";
import { debateTopicsByPhilosopher } from "../data/debateTopics";
import type { DebateTopicContent } from "../data/debateTopicTypes";
import { fetchArenaCatalog, type RegionMeta, type TimePeriodMeta } from "../../shared/api/arena";
import { useArenaLocale } from "./ArenaLocaleContext";

const GENERATED_BATTLES_KEY = "arena-generated-discipline-battles-v2";

function loadGeneratedBattles(): Battle[] {
  try {
    const raw = sessionStorage.getItem(GENERATED_BATTLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Battle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistGeneratedBattles(battles: Battle[]) {
  try {
    sessionStorage.setItem(GENERATED_BATTLES_KEY, JSON.stringify(battles));
  } catch {
    /* ignore */
  }
}

export type ArenaCatalogContextValue = {
  philosophers: Philosopher[];
  regions: RegionMeta[];
  timePeriods: TimePeriodMeta[];
  battles: Battle[];
  generatedBattles: Battle[];
  allBattles: Battle[];
  debateTopics: Record<string, DebateTopicContent>;
  catalogFromServer: boolean;
  catalogError: string | null;
  reloadCatalog: () => void;
  addGeneratedBattle: (locales: { en: BattleLocaleSlice; zh: BattleLocaleSlice }) => string;
  getBattleById: (id: string) => Battle | undefined;
};

const ArenaCatalogContext = createContext<ArenaCatalogContextValue | null>(null);

const fallbackDebateTopics: Record<string, DebateTopicContent> = {
  ...debateTopicsByPhilosopher,
};

export function ArenaCatalogProvider({ children }: { children: ReactNode }) {
  const { locale } = useArenaLocale();
  const [philosophers, setPhilosophers] = useState<Philosopher[]>(fallbackPhilosophers);
  const [regions, setRegions] = useState<RegionMeta[]>(fallbackRegions);
  const [timePeriods, setTimePeriods] = useState<TimePeriodMeta[]>(fallbackTimePeriods);
  const [battles, setBattles] = useState<Battle[]>(fallbackBattles);
  const [generatedBattles, setGeneratedBattles] = useState<Battle[]>(() => loadGeneratedBattles());
  const [debateTopics, setDebateTopics] =
    useState<Record<string, DebateTopicContent>>(fallbackDebateTopics);
  const [catalogFromServer, setCatalogFromServer] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchArenaCatalog(locale)
      .then((data) => {
        setPhilosophers(data.philosophers);
        setRegions(data.regions);
        setTimePeriods(data.timePeriods);
        setBattles(data.battles);
        setDebateTopics({ ...fallbackDebateTopics, ...data.debateTopics });
        setCatalogFromServer(true);
        setCatalogError(null);
      })
      .catch((e: Error) => {
        setCatalogError(e.message);
        setCatalogFromServer(false);
      });
  }, [locale]);

  useEffect(() => {
    load();
  }, [load]);

  const allBattles = useMemo(
    () => [...battles, ...generatedBattles],
    [battles, generatedBattles]
  );

  const addGeneratedBattle = useCallback((locales: { en: BattleLocaleSlice; zh: BattleLocaleSlice }) => {
    const id = `ai-${Date.now()}`;
    const next: Battle = {
      id,
      locales,
      ...locales.en,
    };
    setGeneratedBattles((prev) => {
      const merged = [...prev, next];
      persistGeneratedBattles(merged);
      return merged;
    });
    return id;
  }, []);

  const getBattleById = useCallback(
    (id: string) => allBattles.find((b) => b.id === id),
    [allBattles]
  );

  const value = useMemo(
    () => ({
      philosophers,
      regions,
      timePeriods,
      battles,
      generatedBattles,
      allBattles,
      debateTopics,
      catalogFromServer,
      catalogError,
      reloadCatalog: load,
      addGeneratedBattle,
      getBattleById,
    }),
    [
      philosophers,
      regions,
      timePeriods,
      battles,
      generatedBattles,
      allBattles,
      debateTopics,
      catalogFromServer,
      catalogError,
      load,
      addGeneratedBattle,
      getBattleById,
    ]
  );

  return (
    <ArenaCatalogContext.Provider value={value}>{children}</ArenaCatalogContext.Provider>
  );
}

export function useArenaCatalog(): ArenaCatalogContextValue {
  const ctx = useContext(ArenaCatalogContext);
  if (!ctx) {
    throw new Error("useArenaCatalog must be used within ArenaCatalogProvider");
  }
  return ctx;
}
