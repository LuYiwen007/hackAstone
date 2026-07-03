import { CatalogTimePeriodMeta, Philosopher, RegionMeta } from '../common/ArenaModels';

export { RegionMeta };

export class RegionGeoLayout {
  lon: number = 0;
  lat: number = 0;
  cardOffsetX: number = 0;
  cardOffsetY: number = 0;

  constructor(lon: number, lat: number, cardOffsetX: number = 0, cardOffsetY: number = 0) {
    this.lon = lon;
    this.lat = lat;
    this.cardOffsetX = cardOffsetX;
    this.cardOffsetY = cardOffsetY;
  }
}

export interface OceanLabel {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface MapViewBox {
  width: number;
  height: number;
}

export interface LatRange {
  min: number;
  max: number;
}

/** 与 Web `catalogMeta.ts` 一致：首页时间轴与地区锚点使用本地元数据；思想家列表来自服务端目录合并。 */
export class CatalogMeta {
  static readonly regions: RegionMeta[] = [
    { id: 'Americas', name: '美洲', x: 20, y: 33 },
    { id: 'Europe', name: '欧洲', x: 49, y: 22 },
    { id: 'Middle East', name: '中东', x: 57, y: 33 },
    { id: 'South Asia', name: '南亚', x: 66, y: 40 },
    { id: 'East Asia', name: '东亚', x: 78, y: 30 },
  ];

  static readonly timePeriods: CatalogTimePeriodMeta[] = [
    { id: 'all', year: 0, label: '全部', era: '跨时代', startYear: undefined, endYear: undefined, showAll: true },
    { id: 'bce-6', year: -550, label: '公元前6世纪', era: '古代', startYear: -600, endYear: -501, showAll: undefined },
    { id: 'bce-5', year: -450, label: '公元前5世纪', era: '古代', startYear: -500, endYear: -401, showAll: undefined },
    { id: 'bce-4', year: -350, label: '公元前4世纪', era: '古代', startYear: -400, endYear: -301, showAll: undefined },
    { id: 'bce-3', year: -250, label: '公元前3世纪', era: '古代', startYear: -300, endYear: -201, showAll: undefined },
    { id: '2nd', year: 150, label: '2世纪', era: '古典晚期', startYear: 100, endYear: 199, showAll: undefined },
    { id: '5th', year: 450, label: '5世纪', era: '中古', startYear: 400, endYear: 499, showAll: undefined },
    { id: '11th', year: 1050, label: '11世纪', era: '中古', startYear: 1000, endYear: 1099, showAll: undefined },
    { id: '12th', year: 1150, label: '12世纪', era: '中古', startYear: 1100, endYear: 1199, showAll: undefined },
    { id: '13th', year: 1250, label: '13世纪', era: '中古', startYear: 1200, endYear: 1299, showAll: undefined },
    { id: '17th', year: 1650, label: '17世纪', era: '近代', startYear: 1600, endYear: 1699, showAll: undefined },
    { id: '18th', year: 1750, label: '18世纪', era: '近代', startYear: 1700, endYear: 1799, showAll: undefined },
    { id: '19th', year: 1850, label: '19世纪', era: '现代', startYear: 1800, endYear: 1899, showAll: undefined },
    { id: '20th', year: 1950, label: '20世纪', era: '现代', startYear: 1900, endYear: 1999, showAll: undefined },
  ];

  static readonly regionGeoLayout: Record<string, RegionGeoLayout> = {
    'Americas': new RegionGeoLayout(-99, 38, -18, -4),
    'Europe': new RegionGeoLayout(14, 50, -28, 12),
    'Middle East': new RegionGeoLayout(45, 31, 18, 4),
    'South Asia': new RegionGeoLayout(79, 22, 24, 8),
    'East Asia': new RegionGeoLayout(116, 36, 22, -2),
  };

  static readonly oceanLabels: OceanLabel[] = [
    { id: 'pacific-west', x: 118, y: 250, text: 'PACIFIC' },
    { id: 'atlantic', x: 405, y: 262, text: 'ATLANTIC' },
    { id: 'indian', x: 671, y: 345, text: 'INDIAN' },
    { id: 'pacific-east', x: 936, y: 286, text: 'PACIFIC' },
  ];

  static readonly mapViewBox: MapViewBox = { width: 1000, height: 520 };
  static readonly mapLatRange: LatRange = { min: -85.0, max: 85.0 };

  static getPhilosophersByPeriodAndRegion(
    period: CatalogTimePeriodMeta,
    region: string,
    source: Philosopher[]
  ): Philosopher[] {
    return source
      .filter((p) => {
        if (p.region !== region) {
          return false;
        }
        if (period.showAll === true) {
          return true;
        }
        const start = period.startYear ?? Number.MIN_SAFE_INTEGER;
        const end = period.endYear ?? Number.MAX_SAFE_INTEGER;
        return p.period >= start && p.period <= end;
      })
      .sort((a, b) => a.period - b.period);
  }

  static describePeriod(period: CatalogTimePeriodMeta): string {
    if (period.showAll === true) {
      return '显示全部时代的哲学家';
    }
    const s = period.startYear ?? 0;
    const e = period.endYear ?? 0;
    return `${s} 至 ${e}`;
  }
}
