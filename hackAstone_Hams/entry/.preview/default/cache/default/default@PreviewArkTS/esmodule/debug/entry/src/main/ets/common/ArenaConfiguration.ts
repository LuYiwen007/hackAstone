import preferences from "@ohos:data.preferences";
const PREF_FILE = 'arena_configuration';
const API_KEY = 'arena_api_base_url';
const ASSETS_KEY = 'arena_assets_base_url';
const REMOTE_API_BASE = 'http://47.107.253.140/api';
let appContext: Context | null = null;
function trimSuffixSlash(value: string): string {
    let s = value;
    while (s.endsWith('/')) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}
function trimWhitespace(value: string): string {
    return value.trim();
}
/**
 * 与 Web `VITE_API_BASE_URL` + Spring `server.servlet.context-path=/api` 对齐。
 * 默认连云服务器公网；覆盖方式：Preferences 键 `arena_api_base_url`。
 */
export class ArenaConfiguration {
    static bindContext(ctx: Context): void {
        appContext = ctx;
    }
    private static prefs(): preferences.Preferences {
        if (appContext === null) {
            throw new Error('ArenaConfiguration: context not bound');
        }
        return preferences.getPreferencesSync(appContext, { name: PREF_FILE });
    }
    static get apiBaseURLString(): string {
        try {
            const raw = trimWhitespace(ArenaConfiguration.prefs().getSync(API_KEY, '') as string);
            if (raw.length > 0) {
                return trimSuffixSlash(raw);
            }
        }
        catch (_e) {
            // fall through to default
        }
        return REMOTE_API_BASE;
    }
    static set apiBaseURLString(value: string) {
        ArenaConfiguration.prefs().putSync(API_KEY, trimSuffixSlash(trimWhitespace(value)));
        ArenaConfiguration.prefs().flushSync();
    }
    static get assetsBaseURLString(): string | null {
        try {
            const raw = trimWhitespace(ArenaConfiguration.prefs().getSync(ASSETS_KEY, '') as string);
            if (raw.length === 0) {
                return null;
            }
            return trimSuffixSlash(raw);
        }
        catch (_e) {
            return null;
        }
    }
    static set assetsBaseURLString(value: string | null) {
        const prefs = ArenaConfiguration.prefs();
        if (value !== null && trimWhitespace(value).length > 0) {
            prefs.putSync(ASSETS_KEY, trimSuffixSlash(trimWhitespace(value)));
        }
        else {
            prefs.deleteSync(ASSETS_KEY);
        }
        prefs.flushSync();
    }
    static philosopherImageURL(id: string): string | null {
        const base = ArenaConfiguration.assetsBaseURLString;
        if (base === null) {
            return null;
        }
        return `${base}/philosophers/${id}.jpg`;
    }
}
