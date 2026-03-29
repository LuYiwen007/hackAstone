import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  philosophers as fallbackPhilosophers,
  regions as fallbackRegions,
  timePeriods as fallbackTimePeriods,
  type Philosopher,
} from "../data/philosophers";
import { battles as fallbackBattles, type Battle } from "../data/battles";
import { debateTopicsByPhilosopher } from "../data/debateTopics";
import type { DebateTopicContent } from "../data/debateTopicTypes";
import { fetchArenaCatalog, type RegionMeta, type TimePeriodMeta } from "../../shared/api/arena";

export type ArenaCatalogContextValue = {
  philosophers: Philosopher[];
  regions: RegionMeta[];
  timePeriods: TimePeriodMeta[];
  battles: Battle[];
  debateTopics: Record<string, DebateTopicContent>;
  catalogFromServer: boolean;
  catalogError: string | null;
  reloadCatalog: () => void;
};

const ArenaCatalogContext = createContext<ArenaCatalogContextValue | null>(null);

const fallbackDebateTopics: Record<string, DebateTopicContent> = {
  ...debateTopicsByPhilosopher,
};

export function ArenaCatalogProvider({ children }: { children: ReactNode }) {
  const [philosophers, setPhilosophers] = useState<Philosopher[]>(fallbackPhilosophers);
  const [regions, setRegions] = useState<RegionMeta[]>(fallbackRegions);
  const [timePeriods, setTimePeriods] = useState<TimePeriodMeta[]>(fallbackTimePeriods);
  const [battles, setBattles] = useState<Battle[]>(fallbackBattles);
  const [debateTopics, setDebateTopics] =
    useState<Record<string, DebateTopicContent>>(fallbackDebateTopics);
  const [catalogFromServer, setCatalogFromServer] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchArenaCatalog()
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({
      philosophers,
      regions,
      timePeriods,
      battles,
      debateTopics,
      catalogFromServer,
      catalogError,
      reloadCatalog: load,
    }),
    [
      philosophers,
      regions,
      timePeriods,
      battles,
      debateTopics,
      catalogFromServer,
      catalogError,
      load,
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
