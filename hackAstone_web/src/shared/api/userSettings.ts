export type ThemeId = "dark" | "darker" | "midnight";

export type UserPreferences = {
  autoSave: boolean;
  sound: boolean;
  timer: boolean;
  compact: boolean;
  animations: boolean;
};

export type UserNotifications = {
  daily: boolean;
  weekly: boolean;
  updates: boolean;
};

export type UserAppearance = {
  theme: ThemeId;
};

export type UserSettings = {
  locale: "zh" | "en";
  preferences: UserPreferences;
  notifications: UserNotifications;
  appearance: UserAppearance;
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  locale: "en",
  preferences: {
    autoSave: true,
    sound: false,
    timer: true,
    compact: false,
    animations: true,
  },
  notifications: {
    daily: true,
    weekly: false,
    updates: true,
  },
  appearance: { theme: "dark" },
};

export function normalizeUserSettings(raw?: Partial<UserSettings> | null): UserSettings {
  const d = DEFAULT_USER_SETTINGS;
  const theme = raw?.appearance?.theme;
  const validTheme: ThemeId =
    theme === "darker" || theme === "midnight" || theme === "dark" ? theme : d.appearance.theme;
  return {
    locale: raw?.locale === "zh" ? "zh" : "en",
    preferences: {
      autoSave: raw?.preferences?.autoSave ?? d.preferences.autoSave,
      sound: raw?.preferences?.sound ?? d.preferences.sound,
      timer: raw?.preferences?.timer ?? d.preferences.timer,
      compact: raw?.preferences?.compact ?? d.preferences.compact,
      animations: raw?.preferences?.animations ?? d.preferences.animations,
    },
    notifications: {
      daily: raw?.notifications?.daily ?? d.notifications.daily,
      weekly: raw?.notifications?.weekly ?? d.notifications.weekly,
      updates: raw?.notifications?.updates ?? d.notifications.updates,
    },
    appearance: { theme: validTheme },
  };
}
