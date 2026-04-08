const STORAGE_KEY = "commonones_search_history_v1";
const MAX_ITEMS = 20;

function readAll(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeAll(items: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function recordSearchQuery(query: string): void {
  const q = query.trim();
  if (!q) {
    return;
  }
  const prev = readAll().filter((x) => x.toLowerCase() !== q.toLowerCase());
  writeAll([q, ...prev].slice(0, MAX_ITEMS));
}

export function listSearchHistory(): string[] {
  return readAll();
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
