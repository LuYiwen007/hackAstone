import { ArenaConfiguration } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaConfiguration";
import { AuthStore } from "@bundle:com.hackastone.arena/entry/ets/store/AuthStore";
import { AppLocaleStore } from "@bundle:com.hackastone.arena/entry/ets/store/AppLocaleStore";
import { ArenaCatalogStore } from "@bundle:com.hackastone.arena/entry/ets/store/ArenaCatalogStore";
export const authStore: AuthStore = new AuthStore();
export const appLocaleStore: AppLocaleStore = new AppLocaleStore();
export const arenaCatalogStore: ArenaCatalogStore = new ArenaCatalogStore();
/** 与页面直接 import 对齐的别名 */
export const localeStore: AppLocaleStore = appLocaleStore;
export const catalogStore: ArenaCatalogStore = arenaCatalogStore;
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
