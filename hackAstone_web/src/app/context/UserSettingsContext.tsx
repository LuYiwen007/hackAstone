import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCurrentUser,
  getAuth,
  isLoggedIn,
  normalizeUserSettings,
  patchAuthProfile,
  resolveMediaUrl,
  updateUserSettings,
  type UserSettings,
} from "../../shared/api/client";
import { DEFAULT_USER_SETTINGS } from "../../shared/api/userSettings";
import { markUserChosenLocale, resolveWebLocale } from "../../shared/i18n/format";
import { setArenaPreferencesSnapshot } from "../../shared/arenaPreferences";
import { applyUserSettingsToDocument } from "../../shared/userSettingsDom";
import { useArenaLocale } from "./ArenaLocaleContext";

function guestDefaultSettings(): UserSettings {
  return { ...DEFAULT_USER_SETTINGS, locale: "en" };
}

type UserSettingsContextValue = {
  settings: UserSettings;
  avatarUrl: string | null;
  displayName: string;
  ready: boolean;
  patchSettings: (patch: Partial<UserSettings>) => Promise<void>;
  refreshFromServer: () => Promise<void>;
};

const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const { setLocale } = useArenaLocale();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const applyLocal = useCallback(
    (next: UserSettings) => {
      const normalized = normalizeUserSettings(next);
      const locale = resolveWebLocale(normalized.locale);
      const merged = { ...normalized, locale };
      setSettings(merged);
      setArenaPreferencesSnapshot(merged.preferences);
      applyUserSettingsToDocument(merged);
      setLocale(locale);
    },
    [setLocale]
  );

  const refreshFromServer = useCallback(async () => {
    if (!isLoggedIn()) {
      applyLocal(guestDefaultSettings());
      setAvatarUrl(null);
      setReady(true);
      return;
    }
    try {
      const profile = await fetchCurrentUser();
      applyLocal(profile.settings ?? DEFAULT_USER_SETTINGS);
      setAvatarUrl(resolveMediaUrl(profile.avatarUrl));
      patchAuthProfile({
        nickname: profile.nickname,
        email: profile.email,
        avatarUrl: profile.avatarUrl ?? null,
      });
    } catch {
      const auth = getAuth();
      if (auth) {
        setAvatarUrl(resolveMediaUrl(auth.avatarUrl));
      }
    } finally {
      setReady(true);
    }
  }, [applyLocal]);

  useEffect(() => {
    setReady(false);
    void refreshFromServer();
  }, [refreshFromServer]);

  useEffect(() => {
    const onAuthChange = () => {
      void refreshFromServer();
    };
    window.addEventListener("hackastone-auth-changed", onAuthChange);
    return () => window.removeEventListener("hackastone-auth-changed", onAuthChange);
  }, [refreshFromServer]);

  const patchSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      if (!isLoggedIn()) return;
      if (patch.locale) markUserChosenLocale();
      const saved = await updateUserSettings(patch);
      applyLocal(saved);
    },
    [applyLocal]
  );

  const auth = getAuth();
  const displayName =
    auth?.nickname?.trim() || auth?.username?.trim() || (settings.locale === "zh" ? "认知竞技者" : "Arena Player");

  const value = useMemo(
    () => ({
      settings,
      avatarUrl,
      displayName,
      ready,
      patchSettings,
      refreshFromServer,
    }),
    [settings, avatarUrl, displayName, ready, patchSettings, refreshFromServer]
  );

  return (
    <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>
  );
}

export function useUserSettings(): UserSettingsContextValue {
  const ctx = useContext(UserSettingsContext);
  if (!ctx) {
    throw new Error("useUserSettings must be used within UserSettingsProvider");
  }
  return ctx;
}
