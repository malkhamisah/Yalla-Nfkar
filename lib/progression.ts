import type { LevelStage } from "@/types";

// Progression is discovered gradually — not shown all at once.
export const STAGES: LevelStage[] = [
  { key: "curious", emoji: "🌱", title: "الفضولي", minXp: 0 },
  { key: "observer", emoji: "🔎", title: "الملاحِظ", minXp: 40 },
  { key: "generator", emoji: "💡", title: "مولّد الأفكار", minXp: 110 },
  { key: "developer", emoji: "🧠", title: "مطوّر الأفكار", minXp: 220 },
  { key: "experimenter", emoji: "🧪", title: "المجرّب", minXp: 380 },
  { key: "maker", emoji: "🚀", title: "صانع الحلول", minXp: 600 },
];

export function stageForXp(xp: number): LevelStage {
  let current = STAGES[0];
  for (const s of STAGES) {
    if (xp >= s.minXp) current = s;
  }
  return current;
}

export function nextStage(xp: number): LevelStage | null {
  return STAGES.find((s) => s.minXp > xp) ?? null;
}

// Progress (0..1) toward the next stage.
export function stageProgress(xp: number): number {
  const cur = stageForXp(xp);
  const next = nextStage(xp);
  if (!next) return 1;
  const span = next.minXp - cur.minXp;
  return span <= 0 ? 1 : Math.min(1, (xp - cur.minXp) / span);
}

export function levelIndexForXp(xp: number): number {
  return STAGES.reduce((acc, s, i) => (xp >= s.minXp ? i : acc), 0);
}
