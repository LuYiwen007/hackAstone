import type { Philosopher } from "./philosophers";

export type CatalogRegionMeta = {
  id: string;
  name: string;
  x: number;
  y: number;
};

export type CatalogTimePeriodMeta = {
  id: string;
  year: number;
  label: string;
  era: string;
  startYear?: number;
  endYear?: number;
  showAll?: boolean;
};

export const regions: CatalogRegionMeta[] = [
  { id: "Americas", name: "美洲", x: 20, y: 33 },
  { id: "Europe", name: "欧洲", x: 49, y: 22 },
  { id: "Middle East", name: "中东", x: 57, y: 33 },
  { id: "South Asia", name: "南亚", x: 66, y: 40 },
  { id: "East Asia", name: "东亚", x: 78, y: 30 },
];

export const timePeriods: CatalogTimePeriodMeta[] = [
  { id: "all", year: 0, label: "全部", era: "跨时代", showAll: true },
  { id: "bce-6", year: -550, label: "公元前6世纪", era: "古代", startYear: -600, endYear: -501 },
  { id: "bce-5", year: -450, label: "公元前5世纪", era: "古代", startYear: -500, endYear: -401 },
  { id: "bce-4", year: -350, label: "公元前4世纪", era: "古代", startYear: -400, endYear: -301 },
  { id: "bce-3", year: -250, label: "公元前3世纪", era: "古代", startYear: -300, endYear: -201 },
  { id: "2nd", year: 150, label: "2世纪", era: "古典晚期", startYear: 100, endYear: 199 },
  { id: "5th", year: 450, label: "5世纪", era: "中古", startYear: 400, endYear: 499 },
  { id: "11th", year: 1050, label: "11世纪", era: "中古", startYear: 1000, endYear: 1099 },
  { id: "12th", year: 1150, label: "12世纪", era: "中古", startYear: 1100, endYear: 1199 },
  { id: "13th", year: 1250, label: "13世纪", era: "中古", startYear: 1200, endYear: 1299 },
  { id: "17th", year: 1650, label: "17世纪", era: "近代", startYear: 1600, endYear: 1699 },
  { id: "18th", year: 1750, label: "18世纪", era: "近代", startYear: 1700, endYear: 1799 },
  { id: "19th", year: 1850, label: "19世纪", era: "现代", startYear: 1800, endYear: 1899 },
  { id: "20th", year: 1950, label: "20世纪", era: "现代", startYear: 1900, endYear: 1999 },
];

export function getPhilosophersByPeriodAndRegion(
  period: Pick<CatalogTimePeriodMeta, "startYear" | "endYear" | "showAll">,
  region: string,
  source: Philosopher[]
) {
  return source
    .filter((philosopher) => {
      if (philosopher.region !== region) {
        return false;
      }
      if (period.showAll) {
        return true;
      }

      const startYear = period.startYear ?? Number.NEGATIVE_INFINITY;
      const endYear = period.endYear ?? Number.POSITIVE_INFINITY;
      return philosopher.period >= startYear && philosopher.period <= endYear;
    })
    .sort((a, b) => a.period - b.period);
}
