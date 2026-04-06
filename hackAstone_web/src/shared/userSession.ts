const USER_STORAGE_KEY = "cognitive-arena-user-id";

function fallbackRandomId() {
  return Math.random().toString(36).slice(2, 10);
}

function generateUserId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `guest-${window.crypto.randomUUID().slice(0, 8)}`;
  }
  return `guest-${fallbackRandomId()}`;
}

export function getOrCreateUserId() {
  if (typeof window === "undefined") {
    return "guest";
  }

  try {
    const existing = window.localStorage.getItem(USER_STORAGE_KEY)?.trim();
    if (existing) {
      return existing;
    }

    const created = generateUserId();
    window.localStorage.setItem(USER_STORAGE_KEY, created);
    return created;
  } catch {
    return "guest";
  }
}
