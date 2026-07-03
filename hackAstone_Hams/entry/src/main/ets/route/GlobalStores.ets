import { ArenaConfiguration } from '../common/ArenaConfiguration';
import { AuthStore } from '../store/AuthStore';
import { AppLocaleStore } from '../store/AppLocaleStore';
import { ArenaCatalogStore } from '../store/ArenaCatalogStore';
import { ArenaL10n } from '../l10n/ArenaL10n';

export const authStore: AuthStore = new AuthStore();
export const appLocaleStore: AppLocaleStore = new AppLocaleStore();
export const arenaCatalogStore: ArenaCatalogStore = new ArenaCatalogStore();

/** 与页面直接 import 对齐的别名 */
export const localeStore: AppLocaleStore = appLocaleStore;
export const catalogStore: ArenaCatalogStore = arenaCatalogStore;

/** @Builder / build() 内取文案，避免 getter 在渲染上下文失效。 */
export function arenaL10n(): ArenaL10n {
  return appLocaleStore.l10n();
}

/** 在 EntryAbility.onCreate 中调用，绑定 Preferences 与 rawfile 所需的 Context。 */
export function bindGlobalStores(context: Context): void {
  ArenaConfiguration.bindContext(context);
  AuthStore.bindContext(context);
  ArenaCatalogStore.bindContext(context);
  authStore.load();
  appLocaleStore.refreshFromSystem();
  arenaCatalogStore.bootstrap();
}

export { AuthStore, AppLocaleStore, ArenaCatalogStore };
