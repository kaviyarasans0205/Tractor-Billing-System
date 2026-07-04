const KEY = "kps-settings";

export interface AppSettings {
  passwordHash?: string;
  passwordEnabled: boolean;
}

const DEFAULTS: AppSettings = { passwordEnabled: false };

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export async function hashPassword(pw: string): Promise<string> {
  const enc = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const UNLOCK_KEY = "kps-unlocked";
export function isUnlocked(): boolean {
  return sessionStorage.getItem(UNLOCK_KEY) === "1";
}
export function setUnlocked(v: boolean) {
  if (v) sessionStorage.setItem(UNLOCK_KEY, "1");
  else sessionStorage.removeItem(UNLOCK_KEY);
}
