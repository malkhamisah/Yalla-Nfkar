import { todayKey, uid, daysBetween } from "@/lib/utils";
import type {
  BehavioralSignal,
  Challenge,
  ChallengeSession,
  Idea,
  UserProgress,
} from "@/types";
import { levelIndexForXp, STAGES } from "@/lib/progression";

// ─────────────────────────────────────────────────────────────
// Local persistence layer. Everything goes through these functions so the
// backend can later become Supabase without touching the UI.
// ─────────────────────────────────────────────────────────────

const KEYS = {
  user: "yn:user",
  progress: "yn:progress",
  sessions: "yn:sessions",
  ideas: "yn:ideas",
  onboarded: "yn:onboarded",
} as const;

const EMPTY_SIGNALS: Record<BehavioralSignal, number> = {
  exploration: 0,
  perspective_shift: 0,
  idea_generation: 0,
  idea_development: 0,
  experimentation: 0,
  risk_taking: 0,
  building_on_others: 0,
  observation: 0,
  problem_reframing: 0,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

// ── User ──────────────────────────────────────────────────────

export interface LocalUser {
  id: string;
  createdAt: string;
  lastActiveAt: string;
}

export function getUser(): LocalUser {
  let user = read<LocalUser | null>(KEYS.user, null);
  if (!user) {
    user = {
      id: uid("user"),
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    write(KEYS.user, user);
  }
  return user;
}

// Returns true if this counts as a *return* visit (a new day).
export function touchUser(): { user: LocalUser; returned: boolean } {
  const user = getUser();
  const last = user.lastActiveAt?.slice(0, 10);
  const returned = !!last && last !== todayKey();
  user.lastActiveAt = new Date().toISOString();
  write(KEYS.user, user);
  return { user, returned };
}

// ── Onboarding flag ───────────────────────────────────────────

export function hasOnboarded(): boolean {
  return read<boolean>(KEYS.onboarded, false);
}
export function setOnboarded() {
  write(KEYS.onboarded, true);
}

// ── Progress ──────────────────────────────────────────────────

export function getProgress(): UserProgress {
  const user = getUser();
  const existing = read<UserProgress | null>(KEYS.progress, null);
  if (existing) {
    // Backfill any missing signal keys defensively.
    existing.signalTally = { ...EMPTY_SIGNALS, ...existing.signalTally };
    return existing;
  }
  const fresh: UserProgress = {
    userId: user.id,
    xp: 0,
    level: 0,
    streak: 0,
    sessionsCompleted: 0,
    challengesCompleted: 0,
    signalTally: { ...EMPTY_SIGNALS },
    unlockedStages: ["curious"],
    seenChallengeIds: [],
  };
  write(KEYS.progress, fresh);
  return fresh;
}

function saveProgress(p: UserProgress) {
  write(KEYS.progress, p);
}

// Update the streak based on today's play vs. last played day.
export function registerPlayDay(): UserProgress {
  const p = getProgress();
  const today = todayKey();
  if (p.lastPlayedDate === today) return p;
  if (p.lastPlayedDate && daysBetween(p.lastPlayedDate, today) === 1) {
    p.streak += 1;
  } else {
    p.streak = 1;
  }
  p.lastPlayedDate = today;
  saveProgress(p);
  return p;
}

export function awardForChallenge(
  challenge: Challenge,
  signals: BehavioralSignal[]
): { progress: UserProgress; leveledUp: boolean } {
  const p = getProgress();
  const before = levelIndexForXp(p.xp);

  const xpByDifficulty = { easy: 10, medium: 16, hard: 24 } as const;
  p.xp += xpByDifficulty[challenge.difficulty];
  p.challengesCompleted += 1;

  signals.forEach((s) => {
    p.signalTally[s] = (p.signalTally[s] ?? 0) + 1;
  });

  if (!p.seenChallengeIds.includes(challenge.id)) {
    p.seenChallengeIds.push(challenge.id);
  }

  const after = levelIndexForXp(p.xp);
  p.level = after;

  // Unlock any newly reached stage.
  const stage = STAGES[after];
  if (stage && !p.unlockedStages.includes(stage.key)) {
    p.unlockedStages.push(stage.key);
  }

  saveProgress(p);
  return { progress: p, leveledUp: after > before };
}

export function completeSession(): UserProgress {
  const p = getProgress();
  p.sessionsCompleted += 1;
  saveProgress(p);
  return p;
}

// ── Challenge sessions ────────────────────────────────────────

export function getSessions(): ChallengeSession[] {
  return read<ChallengeSession[]>(KEYS.sessions, []);
}

export function saveSession(s: ChallengeSession) {
  const list = getSessions();
  const idx = list.findIndex((x) => x.id === s.id);
  if (idx >= 0) list[idx] = s;
  else list.push(s);
  write(KEYS.sessions, list.slice(-100));
}

export function recentChallengeIds(limit = 6): string[] {
  return getSessions()
    .slice(-limit)
    .map((s) => s.challengeId);
}

// ── Ideas ─────────────────────────────────────────────────────

export function getIdeas(): Idea[] {
  return read<Idea[]>(KEYS.ideas, []);
}

export function getIdea(id: string): Idea | undefined {
  return getIdeas().find((i) => i.id === id);
}

export function saveIdea(idea: Idea) {
  const list = getIdeas();
  const idx = list.findIndex((x) => x.id === idea.id);
  if (idx >= 0) list[idx] = idea;
  else list.unshift(idea);
  write(KEYS.ideas, list);
}

// Recurring-theme detector for the Game → Idea transition.
// Very light heuristic: same keyword appears across multiple responses.
export function detectRecurringTheme(): string | null {
  const sessions = getSessions().filter((s) => s.response);
  if (sessions.length < 3) return null;
  const words: Record<string, number> = {};
  const stop = new Set([
    "المشكلة","الشي","اللي","وش","على","من","في","إن","هذا","هذي","كذا",
    "طيب","لو","مو","بس","كل","يوم","عن","الى","إلى","مع","انا","أنا",
  ]);
  sessions.forEach((s) => {
    (s.response ?? "")
      .split(/\s+/)
      .map((w) => w.replace(/[^؀-ۿ]/g, ""))
      .filter((w) => w.length >= 4 && !stop.has(w))
      .forEach((w) => (words[w] = (words[w] ?? 0) + 1));
  });
  const top = Object.entries(words).sort((a, b) => b[1] - a[1])[0];
  return top && top[1] >= 2 ? top[0] : null;
}

export function resetAll() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  window.localStorage.removeItem("yn:analytics");
}
