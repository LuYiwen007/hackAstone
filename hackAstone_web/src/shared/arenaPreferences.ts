import { DEFAULT_USER_SETTINGS, type UserPreferences } from "./api/userSettings";

let preferences: UserPreferences = { ...DEFAULT_USER_SETTINGS.preferences };

export function setArenaPreferencesSnapshot(next: UserPreferences) {
  preferences = { ...next };
}

export function getArenaPreferences(): UserPreferences {
  return preferences;
}

/** 交互音效（设置中「声音效果」开启时） */
export function playArenaInteractionSound() {
  if (!preferences.sound) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 520;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
    osc.onended = () => void ctx.close();
  } catch {
    /* 浏览器可能阻止自动播放 */
  }
}
