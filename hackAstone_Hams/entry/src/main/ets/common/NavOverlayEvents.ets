/** 导航栈是否有子页覆盖首页；用于控制透明点击穿透。 */
export const NAV_OVERLAY_KEY: string = 'arenaNavHasOverlay';

export function initNavOverlay(): void {
  AppStorage.setOrCreate(NAV_OVERLAY_KEY, false);
}

export function setNavOverlay(active: boolean): void {
  AppStorage.setOrCreate(NAV_OVERLAY_KEY, active);
}
