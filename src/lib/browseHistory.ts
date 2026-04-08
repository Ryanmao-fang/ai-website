export type BrowseHistoryItem = {
  type: "term" | "tool" | "template";
  id: number;
  title: string;
  category: string;
  at: string;
};

const STORAGE_KEY = "commonones_browse_history_v1";
const MAX_ITEMS = 40;

function readAll(): BrowseHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as BrowseHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: BrowseHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* 隐私模式或配额满时忽略 */
  }
}

export function recordBrowseEntry(entry: Omit<BrowseHistoryItem, "at">): void {
  const items = readAll();
  const at = new Date().toISOString();
  const next: BrowseHistoryItem = { ...entry, at };
  const withoutDup = items.filter(
    (it) => !(it.type === entry.type && it.id === entry.id)
  );
  const merged = [next, ...withoutDup].slice(0, MAX_ITEMS);
  writeAll(merged);
}

export function listBrowseHistory(): BrowseHistoryItem[] {
  return readAll();
}

export function clearBrowseHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function formatBrowseTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const now = new Date();
  const dayMs = 86400000;
  if (now.getTime() - d.getTime() < dayMs && now.getDate() === d.getDate()) {
    return "今天";
  }
  if (now.getTime() - d.getTime() < 2 * dayMs) {
    return "昨天";
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
