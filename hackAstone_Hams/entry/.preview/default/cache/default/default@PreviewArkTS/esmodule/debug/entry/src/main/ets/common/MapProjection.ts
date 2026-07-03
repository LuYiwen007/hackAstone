import { CatalogMeta } from "@bundle:com.hackastone.arena/entry/ets/data/CatalogMeta";
export class MapProjection {
    static readonly viewBox = CatalogMeta.mapViewBox;
    static lonToX(lon: number): number {
        return ((lon + 180) / 360) * MapProjection.viewBox.width;
    }
    static latToY(lat: number): number {
        const r = CatalogMeta.mapLatRange;
        return ((r.max - lat) / (r.max - r.min)) * MapProjection.viewBox.height;
    }
}
