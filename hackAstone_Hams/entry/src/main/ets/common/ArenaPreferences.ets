import { vibrator } from '@kit.SensorServiceKit';

export interface ArenaPreferenceSnapshot {
  autoSave: boolean;
  sound: boolean;
  timer: boolean;
  compact: boolean;
  animations: boolean;
}

const DEFAULT_PREFS: ArenaPreferenceSnapshot = {
  autoSave: true,
  sound: false,
  timer: true,
  compact: false,
  animations: true,
};

let snapshot: ArenaPreferenceSnapshot = {
  autoSave: DEFAULT_PREFS.autoSave,
  sound: DEFAULT_PREFS.sound,
  timer: DEFAULT_PREFS.timer,
  compact: DEFAULT_PREFS.compact,
  animations: DEFAULT_PREFS.animations,
};

export function setArenaPreferencesSnapshot(next: ArenaPreferenceSnapshot): void {
  snapshot = {
    autoSave: next.autoSave,
    sound: next.sound,
    timer: next.timer,
    compact: next.compact,
    animations: next.animations,
  };
}

export function getArenaPreferences(): ArenaPreferenceSnapshot {
  return snapshot;
}

/** 对齐 Web 交互音效：HarmonyOS 上用短振动模拟轻触反馈。 */
export function playArenaInteractionSound(): void {
  if (!snapshot.sound) {
    return;
  }
  try {
    vibrator.startVibration({
      type: 'time',
      duration: 40,
    }, {
      id: 0,
      usage: 'touch'
    });
  } catch (_e) {
    // 模拟器可能不支持，忽略
  }
}
