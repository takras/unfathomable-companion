// Game state is kept in localStorage. When the native apps are added, mirror it into
// Capacitor Preferences here (the OS may clear a WebView's localStorage), as BSG Companion does.

export function loadRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveRaw(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode etc.): the app still works, just without persistence
  }
}
