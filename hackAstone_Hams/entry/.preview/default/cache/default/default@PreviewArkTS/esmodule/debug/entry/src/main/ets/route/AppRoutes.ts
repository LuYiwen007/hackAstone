/** 与 iOS `AppRoute` 对齐的路由名称 */
export enum AppRouteName {
    LOGIN = "login",
    DISCIPLINES = "disciplines",
    PROFILE = "profile",
    ROUNDTABLE = "roundtable",
    DILEMMA = "dilemma",
    BATTLE = "battle",
    PHILOSOPHY_BATTLE = "philosophyBattle"
}
export interface BattleRouteParams {
    id: string;
}
export interface PhilosophyBattleRouteParams {
    id: string;
}
export class AppRoutes {
    static login(): string {
        return AppRouteName.LOGIN;
    }
    static disciplines(): string {
        return AppRouteName.DISCIPLINES;
    }
    static profile(): string {
        return AppRouteName.PROFILE;
    }
    static roundtable(): string {
        return AppRouteName.ROUNDTABLE;
    }
    static dilemma(): string {
        return AppRouteName.DILEMMA;
    }
    static battle(id: string): string {
        return `${AppRouteName.BATTLE}/${id}`;
    }
    static philosophyBattle(id: string): string {
        return `${AppRouteName.PHILOSOPHY_BATTLE}/${id}`;
    }
    static parseBattleId(path: string): string | null {
        const prefix = `${AppRouteName.BATTLE}/`;
        if (path.startsWith(prefix)) {
            return path.substring(prefix.length);
        }
        return null;
    }
    static parsePhilosophyBattleId(path: string): string | null {
        const prefix = `${AppRouteName.PHILOSOPHY_BATTLE}/`;
        if (path.startsWith(prefix)) {
            return path.substring(prefix.length);
        }
        return null;
    }
}
