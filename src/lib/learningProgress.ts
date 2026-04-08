import type { LearningPathLevelId } from "@/content/learningPathConfig";

const STORAGE_KEY = "commonones_learning_progress_v1";

type ProgressMap = Record<string, boolean>;

function keyFor(level: LearningPathLevelId, type: string, id: number): string {
  return `${level}:${type}:${id}`;
}

function readMap(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function isPathItemCompleted(
  level: LearningPathLevelId,
  type: "term" | "tool" | "template",
  id: number
): boolean {
  const map = readMap();
  return Boolean(map[keyFor(level, type, id)]);
}

export function togglePathItemCompleted(
  level: LearningPathLevelId,
  type: "term" | "tool" | "template",
  id: number,
  completed: boolean
): void {
  const map = readMap();
  const k = keyFor(level, type, id);
  if (completed) {
    map[k] = true;
  } else {
    delete map[k];
  }
  writeMap(map);
}

export function countCompletedInLevel(
  level: LearningPathLevelId,
  items: { type: "term" | "tool" | "template"; id: number }[]
): number {
  const map = readMap();
  return items.filter((it) => map[keyFor(level, it.type, it.id)]).length;
}

/** 将账号云端进度合并进本机勾选状态（登录后拉取一次） */
export function mergeRemoteLearningRows(
  rows: { level: string; item_type: string; item_id: number; completed: boolean }[]
): void {
  if (!rows || 0 === rows.length) {
    return;
  }
  const map = readMap();
  for (const r of rows) {
    if (!r.completed) {
      continue;
    }
    const level = r.level;
    if ("beginner" !== level && "intermediate" !== level && "advanced" !== level) {
      continue;
    }
    const typ = r.item_type;
    if ("term" !== typ && "tool" !== typ && "template" !== typ) {
      continue;
    }
    const id = Number(r.item_id);
    if (Number.isNaN(id)) {
      continue;
    }
    map[keyFor(level, typ, id)] = true;
  }
  writeMap(map);
}
