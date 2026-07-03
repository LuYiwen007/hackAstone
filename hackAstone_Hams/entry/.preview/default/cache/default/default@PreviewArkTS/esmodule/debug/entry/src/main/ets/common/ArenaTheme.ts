/**
 * 对齐 Web Tailwind `zinc-950` / `cyan` / `orange` 等主色。
 */
export class ArenaTheme {
    static readonly background: string = '#0A0A0D';
    static readonly surface: string = '#1C1C1F';
    static readonly border: string = '#29292E';
    static readonly textPrimary: string = '#F5F5F7';
    static readonly textMuted: string = '#8C8F94';
    static readonly cyanAccent: string = '#38D1E6';
    static readonly cyanMuted: string = '#94E8FA';
    static readonly orangeAccent: string = '#ED7321';
    static readonly purpleAccent: string = '#A654F5';
    static readonly headerGradientStart: string = '#0FB8D4';
    static readonly headerGradientEnd: string = '#3B82F5';
    /** 用户输入文字：深色模式白字，浅色模式黑字 */
    static inputText(isDark: boolean): string {
        return isDark ? ArenaTheme.textPrimary : '#000000';
    }
}
