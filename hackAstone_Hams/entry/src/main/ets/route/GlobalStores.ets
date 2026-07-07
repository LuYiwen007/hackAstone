import { ArenaConfiguration } from '../common/ArenaConfiguration';
import { ArenaTheme, ThemeId } from '../common/ArenaTheme';
import { setArenaPreferencesSnapshot } from '../common/ArenaPreferences';
import { AuthStore } from '../store/AuthStore';
import { AppLocaleStore } from '../store/AppLocaleStore';
import { ArenaCatalogStore } from '../store/ArenaCatalogStore';
import { ArenaL10n } from '../l10n/ArenaL10n';
import { initAuthVersion } from '../common/AuthEvents';
import { initCatalogVersion } from '../common/CatalogEvents';
import { initNavOverlay, setNavOverlay } from '../common/NavOverlayEvents';

export const authStore: AuthStore = new AuthStore();
export const appLocaleStore: AppLocaleStore = new AppLocaleStore();
export const arenaCatalogStore: ArenaCatalogStore = new ArenaCatalogStore();

/** 全局唯一导航栈，避免 @Prop/@Consume 传递 NavPathStack 导致 pushPath 空指针崩溃。 */
export const appPageStack: NavPathStack = new NavPathStack();

/** 与页面直接 import 对齐的别名 */
export const localeStore: AppLocaleStore = appLocaleStore;
export const catalogStore: ArenaCatalogStore = arenaCatalogStore;

/** @Builder / build() 内取文案，避免 getter 在渲染上下文失效。 */
export function arenaL10n(): ArenaL10n {
  return appLocaleStore.l10n();
}

export function arenaNavPush(path: NavPathInfo): void {
  appPageStack.pushPath(path);
  setNavOverlay(true);
}

export function arenaNavPop(): void {
  if (appPageStack.size() > 0) {
    appPageStack.pop();
  }
  setNavOverlay(appPageStack.size() > 0);
}

export function arenaNavClear(): void {
  appPageStack.clear();
  setNavOverlay(false);
}

/** 在 EntryAbility.onCreate 中调用，绑定 Preferences 与 rawfile 所需的 Context。 */
export function bindGlobalStores(context: Context): void {
  initAuthVersion();
  initCatalogVersion();
  initNavOverlay();
  ArenaConfiguration.bindContext(context);
  AuthStore.bindContext(context);
  AppLocaleStore.bindContext(context);
  ArenaCatalogStore.bindContext(context);
  authStore.load();
  appLocaleStore.refreshFromSystem();
  arenaCatalogStore.bootstrap();
}

export function applyUserSettingsTheme(themeId: string): void {
  const id = themeId as ThemeId;
  if (id === 'dark' || id === 'darker' || id === 'midnight') {
    ArenaTheme.applyTheme(id);
  }
}

export function applyUserPreferencesFromServer(prefs: Record<string, Object> | null | undefined): void {
  if (prefs === null || prefs === undefined) {
    return;
  }
  setArenaPreferencesSnapshot({
    autoSave: prefs['autoSave'] !== undefined ? prefs['autoSave'] as boolean : true,
    sound: prefs['sound'] !== undefined ? prefs['sound'] as boolean : false,
    timer: prefs['timer'] !== undefined ? prefs['timer'] as boolean : true,
    compact: prefs['compact'] !== undefined ? prefs['compact'] as boolean : false,
    animations: prefs['animations'] !== undefined ? prefs['animations'] as boolean : true,
  });
}

export { AuthStore, AppLocaleStore, ArenaCatalogStore };
