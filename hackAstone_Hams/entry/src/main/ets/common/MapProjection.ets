import { CatalogMeta } from '../data/CatalogMeta';

export class MapProjection {
  static readonly viewBox = CatalogMeta.mapViewBox;

  static lonToX(lon: number): number {
    return ((lon + 180) / 360) * MapProjection.viewBox.width;
  }

  static latToY(lat: number): number {
    const r = CatalogMeta.mapLatRange;
    return ((r.max - lat) / (r.max - r.min)) * MapProjection.viewBox.height;
  }

  private static addRing(ring: number[][], commands: string[]): void {
    if (ring.length === 0 || ring[0].length < 2) {
      return;
    }
    const first = ring[0];
    commands.push(`M ${MapProjection.lonToX(first[0])} ${MapProjection.latToY(first[1])}`);
    for (let i = 1; i < ring.length; i++) {
      const pt = ring[i];
      if (pt.length >= 2) {
        commands.push(`L ${MapProjection.lonToX(pt[0])} ${MapProjection.latToY(pt[1])}`);
      }
    }
    commands.push('Z');
  }

  private static addPolygonRings(rings: number[][][], commands: string[]): void {
    for (let i = 0; i < rings.length; i++) {
      MapProjection.addRing(rings[i], commands);
    }
  }

  /** 从 Natural Earth GeoJSON 生成 ArkUI Path commands 字符串。 */
  static buildPathCommandsFromGeoJson(jsonText: string): string {
    const commands: string[] = [];
    const root = JSON.parse(jsonText) as Record<string, Object>;
    const features = root['features'] as Object[];
    if (!features) {
      return '';
    }
    for (let fi = 0; fi < features.length; fi++) {
      const feature = features[fi] as Record<string, Object>;
      const geom = feature['geometry'] as Record<string, Object>;
      if (!geom) {
        continue;
      }
      const type = geom['type'] as string;
      const coords = geom['coordinates'];
      if (type === 'Polygon') {
        MapProjection.addPolygonRings(coords as number[][][], commands);
      } else if (type === 'MultiPolygon') {
        const polys = coords as number[][][][];
        for (let pi = 0; pi < polys.length; pi++) {
          MapProjection.addPolygonRings(polys[pi], commands);
        }
      }
    }
    return commands.join(' ');
  }
}
