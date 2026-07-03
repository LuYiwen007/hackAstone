import { RegionMeta } from './ArenaModels';
import { MapProjection } from './MapProjection';

/** 地图区域锚点与卡片偏移（独立函数，避免 @Builder 内 this 方法调用失效）。 */
export function regionAnchorX(region: RegionMeta, layout: ESObject | undefined, mapW: number): number {
  if (layout) {
    return MapProjection.lonToX(layout['lon'] as number);
  }
  return (region.x / 100) * mapW;
}

export function regionAnchorY(region: RegionMeta, layout: ESObject | undefined, mapH: number): number {
  if (layout) {
    return MapProjection.latToY(layout['lat'] as number);
  }
  return (region.y / 100) * mapH;
}

export function regionCardOffsetX(layout: ESObject | undefined): number {
  if (layout) {
    const value = layout['cardOffsetX'] as number;
    return value ?? 0;
  }
  return 0;
}

export function regionCardOffsetY(layout: ESObject | undefined): number {
  if (layout) {
    const value = layout['cardOffsetY'] as number;
    return value ?? 0;
  }
  return 0;
}
