import i18n from "@ohos:i18n";
import { ArenaL10n } from "@bundle:com.hackastone.arena/entry/ets/l10n/ArenaL10n";
/** 跟随系统语言（不持久化手动切换）；中文系统 → zh，其它 → en。 */
export class AppLocaleStore {
    languageCode: string = 'en';
    get L(): ArenaL10n {
        return new ArenaL10n(this.languageCode);
    }
    /** 传给后端 catalog 的 locale 参数 */
    get catalogLocale(): string {
        return this.prefersEnglish ? 'en' : 'zh';
    }
    get prefersEnglish(): boolean {
        return !this.languageCode.toLowerCase().startsWith('zh');
    }
    constructor() {
        this.languageCode = AppLocaleStore.resolveSystemLanguageCode();
    }
    refreshFromSystem(): void {
        const next = AppLocaleStore.resolveSystemLanguageCode();
        if (this.languageCode !== next) {
            this.languageCode = next;
        }
    }
    /** 根据系统语言判断界面语言 */
    static resolveSystemLanguageCode(): string {
        const preferred = i18n.System.getSystemLanguage();
        const lower = preferred.toLowerCase();
        if (lower.startsWith('zh')) {
            return 'zh-Hans';
        }
        return 'en';
    }
}
