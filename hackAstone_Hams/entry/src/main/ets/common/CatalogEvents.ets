/** Catalog 加载完成后递增，供哲学辩论等页面重绘。 */
export const CATALOG_VERSION_KEY: string = 'arenaCatalogVersion';

export function initCatalogVersion(): void {
  if (AppStorage.get<number>(CATALOG_VERSION_KEY) === undefined) {
    AppStorage.setOrCreate(CATALOG_VERSION_KEY, 0);
  }
}

export function bumpCatalogVersion(): void {
  const current = AppStorage.get<number>(CATALOG_VERSION_KEY) ?? 0;
  AppStorage.setOrCreate(CATALOG_VERSION_KEY, current + 1);
}
