import { i18n } from '@kit.LocalizationKit';
import { preferences } from '@kit.ArkData';
import { ArenaL10n } from '../l10n/ArenaL10n';

const PREF_FILE = 'arena_locale_store';
const LOCALE_KEY = 'arena_locale_v3';
const LOCALE_USER_SET_KEY = 'arena_locale_user_set';

let appContext: Context | null = null;

/** 界面语言：支持手动切换并持久化（对齐 Web ArenaLocaleContext）。 */
export class AppLocaleStore {
  languageCode: string = 'en';

  l10n(): ArenaL10n {
    return new ArenaL10n(this.languageCode);
  }

  get L(): ArenaL10n {
    return this.l10n();
  }

  get catalogLocale(): string {
    return this.prefersEnglish ? 'en' : 'zh';
  }

  get prefersEnglish(): boolean {
    return !this.languageCode.toLowerCase().startsWith('zh');
  }

  constructor() {
    this.languageCode = AppLocaleStore.readStoredLanguageCode();
  }

  static bindContext(ctx: Context): void {
    appContext = ctx;
  }

  private static prefs(): preferences.Preferences {
    if (appContext === null) {
      throw new Error('AppLocaleStore: context not bound');
    }
    return preferences.getPreferencesSync(appContext, { name: PREF_FILE });
  }

  private static readStoredLanguageCode(): string {
    try {
      if (appContext !== null) {
        const userSet = AppLocaleStore.prefs().getSync(LOCALE_USER_SET_KEY, false) as boolean;
        if (userSet) {
          const stored = AppLocaleStore.prefs().getSync(LOCALE_KEY, '') as string;
          if (stored.length > 0) {
            return stored.startsWith('zh') ? 'zh-Hans' : 'en';
          }
        }
      }
    } catch (_e) {
      // fall through
    }
    return AppLocaleStore.resolveSystemLanguageCode();
  }

  refreshFromSystem(): void {
    if (AppLocaleStore.hasUserChosenLocale()) {
      return;
    }
    const next = AppLocaleStore.resolveSystemLanguageCode();
    if (this.languageCode !== next) {
      this.languageCode = next;
    }
  }

  setLocale(code: 'zh' | 'en'): void {
    this.languageCode = code === 'zh' ? 'zh-Hans' : 'en';
    try {
      if (appContext !== null) {
        AppLocaleStore.prefs().putSync(LOCALE_KEY, code);
        AppLocaleStore.prefs().putSync(LOCALE_USER_SET_KEY, true);
        AppLocaleStore.prefs().flushSync();
      }
    } catch (_e) {
      // ignore
    }
  }

  static hasUserChosenLocale(): boolean {
    try {
      if (appContext === null) {
        return false;
      }
      return AppLocaleStore.prefs().getSync(LOCALE_USER_SET_KEY, false) as boolean;
    } catch (_e) {
      return false;
    }
  }

  static resolveSystemLanguageCode(): string {
    const preferred = i18n.System.getSystemLanguage();
    const lower = preferred.toLowerCase();
    if (lower.startsWith('zh')) {
      return 'zh-Hans';
    }
    return 'en';
  }
}
