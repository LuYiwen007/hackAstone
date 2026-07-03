import { i18n } from '@kit.LocalizationKit';
import { ArenaL10n } from '../l10n/ArenaL10n';

/** 跟随系统语言（不持久化手动切换）；中文系统 → zh，其它 → en。 */
export class AppLocaleStore {
  languageCode: string = 'en';

  /** UI 文案；用方法而非 getter，避免 ArkUI @Builder 中 getter 失效。 */
  l10n(): ArenaL10n {
    return new ArenaL10n(this.languageCode);
  }

  /** @deprecated 非 UI 代码可用；@Builder / build() 内请用 l10n() */
  get L(): ArenaL10n {
    return this.l10n();
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
