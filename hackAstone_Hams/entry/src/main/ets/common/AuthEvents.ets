/** 登录态变更时递增，供首页等常驻页面通过 @StorageLink 触发重绘。 */
export const AUTH_VERSION_KEY: string = 'arenaAuthVersion';

export function initAuthVersion(): void {
  if (AppStorage.get<number>(AUTH_VERSION_KEY) === undefined) {
    AppStorage.setOrCreate(AUTH_VERSION_KEY, 0);
  }
}

export function bumpAuthVersion(): void {
  const current = AppStorage.get<number>(AUTH_VERSION_KEY) ?? 0;
  AppStorage.setOrCreate(AUTH_VERSION_KEY, current + 1);
}
