import type {
  AiReactionKind,
  AnalyzeResponseOutput,
  BehavioralSignal,
  ChallengeType,
} from "@/types";

// Minimal, dependency-free structured-output validation.
// Never return unvalidated JSON from the model to the UI.

const KINDS: AiReactionKind[] = [
  "reflection",
  "challenge",
  "observation",
  "expansion",
  "question",
  "surprise",
];

const SIGNALS: BehavioralSignal[] = [
  "exploration",
  "perspective_shift",
  "idea_generation",
  "idea_development",
  "experimentation",
  "risk_taking",
  "building_on_others",
  "observation",
  "problem_reframing",
];

const TYPES: ChallengeType[] = [
  "perspective_shift",
  "observation",
  "rapid_ideation",
  "reverse_thinking",
  "worst_idea",
  "role_switching",
  "problem_reframing",
  "idea_development",
];

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

export const AnalyzeResponseSchema = {
  parse(raw: unknown, sourceType: ChallengeType): AnalyzeResponseOutput {
    const o = (raw ?? {}) as Record<string, unknown>;
    const kind = KINDS.includes(o.kind as AiReactionKind)
      ? (o.kind as AiReactionKind)
      : "reflection";
    const signals = Array.isArray(o.suggestedTraitSignals)
      ? (o.suggestedTraitSignals as unknown[])
          .filter((s): s is BehavioralSignal =>
            SIGNALS.includes(s as BehavioralSignal)
          )
      : [];
    const next = TYPES.includes(o.nextChallengeType as ChallengeType)
      ? (o.nextChallengeType as ChallengeType)
      : sourceType;

    return {
      reaction: str(o.reaction, "حلو 👀"),
      kind,
      observation: str(o.observation),
      perspectiveShift: str(o.perspectiveShift, "طيب... لو قلبناها؟"),
      followUpQuestion: str(o.followUpQuestion, "وش أول خطوة صغيرة نجربها؟"),
      suggestedTraitSignals: signals.length ? signals : ["exploration"],
      nextChallengeType: next,
    };
  },
};
