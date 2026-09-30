import { challenges, getChallengeById } from "@/data/challenges";
import type {
  BehavioralSignal,
  Challenge,
  ChallengeType,
  RecommendContext,
  RecommendResult,
} from "@/types";

// Adaptive Challenge Engine.
// Picks the next challenge from behavior — but keeps the user exposed to
// variety so the product never feels like it pigeonholed them.
// The `reason` is internal; the UI never shows it.

// Which signals a challenge type tends to exercise.
const TYPE_SIGNALS: Record<ChallengeType, BehavioralSignal[]> = {
  perspective_shift: ["perspective_shift"],
  observation: ["observation"],
  rapid_ideation: ["idea_generation"],
  reverse_thinking: ["risk_taking", "problem_reframing"],
  worst_idea: ["risk_taking"],
  role_switching: ["perspective_shift", "observation"],
  problem_reframing: ["problem_reframing"],
  idea_development: ["idea_development"],
};

function topSignal(
  tally: Record<BehavioralSignal, number>
): BehavioralSignal | null {
  let best: BehavioralSignal | null = null;
  let max = 0;
  (Object.keys(tally) as BehavioralSignal[]).forEach((k) => {
    if (tally[k] > max) {
      max = tally[k];
      best = k;
    }
  });
  return best;
}

export function recommendNextChallenge(
  ctx: RecommendContext
): RecommendResult {
  const seen = new Set(ctx.recentChallengeIds);
  const pool = challenges.filter((c) => !seen.has(c.id));
  const candidates = pool.length ? pool : challenges;

  // Every ~3rd pick, deliberately explore a *new* type for variety.
  const exploreForVariety = ctx.sessionLength > 0 && ctx.sessionLength % 3 === 0;

  let chosen: Challenge;
  let reason: string;

  if (exploreForVariety) {
    const doneTypes = new Set(
      ctx.recentChallengeIds
        .map((id) => getChallengeById(id)?.type)
        .filter(Boolean) as ChallengeType[]
    );
    const fresh = candidates.filter((c) => !doneTypes.has(c.type));
    chosen = pickEasiestFirst(fresh.length ? fresh : candidates, ctx);
    reason = "variety: exposing a new challenge type";
  } else {
    const top = topSignal(ctx.signalTally);
    const aligned = top
      ? candidates.filter((c) => TYPE_SIGNALS[c.type].includes(top))
      : [];
    chosen = pickEasiestFirst(aligned.length ? aligned : candidates, ctx);
    reason = top
      ? `aligned with strongest signal: ${top}`
      : "no signal yet — gentle default";
  }

  return {
    challengeId: chosen.id,
    reason,
    difficulty: chosen.difficulty,
    expectedDuration: chosen.estimatedSeconds,
  };
}

// Early in a session prefer easy/quick; later allow harder.
function pickEasiestFirst(
  list: Challenge[],
  ctx: RecommendContext
): Challenge {
  const order: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
  const cap = ctx.sessionLength < 1 ? 0 : ctx.sessionLength < 3 ? 1 : 2;
  const capped = list.filter((c) => order[c.difficulty] <= cap);
  const use = capped.length ? capped : list;
  return [...use].sort(
    (a, b) => order[a.difficulty] - order[b.difficulty]
  )[0];
}
