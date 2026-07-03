import preferences from "@ohos:data.preferences";
/** 与 Web `hackastone_auth` 对齐的登录会话。 */
export interface AuthSession {
    token: string;
    userId: string;
    nickname: string;
    email?: string;
}
export class AuthSessionData implements AuthSession {
    token: string = '';
    userId: string = '';
    nickname: string = '';
    email?: string;
}
export function authSessionDisplayName(session: AuthSession): string {
    if (session.email !== undefined && session.email.length > 0) {
        return session.nickname.length === 0 ? session.email : session.nickname;
    }
    return session.nickname;
}
const PREF_FILE = 'hackastone_auth_store';
let appContext: Context | null = null;
export class AuthStore {
    static readonly storageKey: string = 'hackastone_auth';
    session: AuthSession | null = null;
    get isLoggedIn(): boolean {
        return this.session !== null;
    }
    static bindContext(ctx: Context): void {
        appContext = ctx;
    }
    private static prefs(): preferences.Preferences {
        if (appContext === null) {
            throw new Error('AuthStore: context not bound');
        }
        return preferences.getPreferencesSync(appContext, { name: PREF_FILE });
    }
    static get bearerToken(): string | null {
        try {
            const raw = AuthStore.prefs().getSync(AuthStore.storageKey, '') as string;
            if (raw.length === 0) {
                return null;
            }
            const decoded = JSON.parse(raw) as AuthSession;
            return decoded.token;
        }
        catch (_e) {
            return null;
        }
    }
    load(): void {
        try {
            const raw = AuthStore.prefs().getSync(AuthStore.storageKey, '') as string;
            if (raw.length === 0) {
                this.session = null;
                return;
            }
            this.session = JSON.parse(raw) as AuthSession;
        }
        catch (_e) {
            this.session = null;
        }
    }
    save(newSession: AuthSession): void {
        this.session = newSession;
        AuthStore.prefs().putSync(AuthStore.storageKey, JSON.stringify(newSession));
        AuthStore.prefs().flushSync();
    }
    clear(): void {
        this.session = null;
        AuthStore.prefs().deleteSync(AuthStore.storageKey);
        AuthStore.prefs().flushSync();
    }
    refreshProfile(userId: string, nickname: string, email: string | null): void {
        if (this.session === null) {
            return;
        }
        const current = this.session;
        const next = new AuthSessionData();
        next.token = current.token;
        next.userId = userId;
        next.nickname = nickname;
        if (email !== null && email.length > 0) {
            next.email = email;
        }
        this.save(next);
    }
}
