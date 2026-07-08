export type ThemeId = 'dark' | 'darker' | 'midnight';

class ThemePalette {
  background: string = '#0A0A0D';
  surface: string = '#1C1C1F';
  border: string = '#29292E';
  textPrimary: string = '#F5F5F7';
  textMuted: string = '#8C8F94';

  constructor(
    background: string,
    surface: string,
    border: string,
    textPrimary: string,
    textMuted: string
  ) {
    this.background = background;
    this.surface = surface;
    this.border = border;
    this.textPrimary = textPrimary;
    this.textMuted = textMuted;
  }
}

const DARK_PALETTE = new ThemePalette('#0A0A0D', '#1C1C1F', '#29292E', '#F5F5F7', '#8C8F94');
const DARKER_PALETTE = new ThemePalette('#050507', '#121214', '#1F1F22', '#F0F0F2', '#7A7D82');
const MIDNIGHT_PALETTE = new ThemePalette('#030712', '#0F172A', '#1E293B', '#E2E8F0', '#94A3B8');

/**
 * 对齐 Web Tailwind 主色；`applyTheme` 后背景/表面色随设置变化。
 */
export class ArenaTheme {
  static background: string = DARK_PALETTE.background;
  static surface: string = DARK_PALETTE.surface;
  static border: string = DARK_PALETTE.border;
  static textPrimary: string = DARK_PALETTE.textPrimary;
  static textMuted: string = DARK_PALETTE.textMuted;
  static readonly cyanAccent: string = '#38D1E6';
  static readonly cyanMuted: string = '#94E8FA';
  static readonly orangeAccent: string = '#ED7321';
  static readonly purpleAccent: string = '#A654F5';
  static readonly avatarGradientStart: string = '#5B4580';
  static readonly avatarGradientEnd: string = '#7C5CBA';
  static readonly headerGradientStart: string = '#0FB8D4';
  static readonly headerGradientEnd: string = '#3B82F5';

  static applyTheme(themeId: ThemeId): void {
    let palette = DARK_PALETTE;
    if (themeId === 'darker') {
      palette = DARKER_PALETTE;
    } else if (themeId === 'midnight') {
      palette = MIDNIGHT_PALETTE;
    }
    ArenaTheme.background = palette.background;
    ArenaTheme.surface = palette.surface;
    ArenaTheme.border = palette.border;
    ArenaTheme.textPrimary = palette.textPrimary;
    ArenaTheme.textMuted = palette.textMuted;
  }

  static inputText(isDark: boolean): string {
    return isDark ? ArenaTheme.textPrimary : '#000000';
  }
}
