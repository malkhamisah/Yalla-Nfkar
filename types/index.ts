// ─────────────────────────────────────────────────────────────
// Core domain types for يلا نفكر | Yalla Nfkar
// Designed to map cleanly onto a future Supabase schema.
// ─────────────────────────────────────────────────────────────

export type ChallengeType =
  | "perspective_shift"
  | "observation"
  | "rapid_ideation"
  | "reverse_thinking"
  | "worst_idea"
  | "role_switching"
  | "problem_reframing"
  | "idea_development";

export type Difficulty = "easy" | "medium" | "hard";

// Behavioral signals we quietly learn from — never shown as a "score".
export type BehavioralSignal =
  | "exploration"
  | "perspective_shift"
  | "idea_generation"
  | "idea_development"
  | "experimentation"
  | "risk_taking"
  | "building_on_others"
  | "observation"
  | "problem_reframing";

export interface FollowUp {
  // Template hint the response layer can lean on.
  prompt: string;
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  estimatedSeconds: number;
  traitSignals: BehavioralSignal[];
  followUp?: FollowUp;
  reward?: string;
  tags: string[];
}

export interface ChallengeSession {
  id: string;
  userId: string;
  challengeId: string;
  startedAt: string;
  completedAt?: string;
  response?: string;
  followUpResponse?: string;
  signals: BehavioralSignal[];
}

export interface LevelStage {
  key: string;
  emoji: string;
  title: string;
  minXp: number;
}

export interface UserProgress {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate?: string; // YYYY-MM-DD
  sessionsCompleted: number;
  challengesCompleted: number;
  // Rolling tally of behavioral signals — internal, not a personality test.
  signalTally: Record<BehavioralSignal, number>;
  unlockedStages: string[];
  seenChallengeIds: string[];
}

export type IdeaStatus = "spark" | "shaping" | "ready_to_test";

export interface IdeaVersion {
  at: string;
  note: string;
}

export interface Idea {
  id: string;
  userId: string;
  title: string;
  observation: string;
  problem: string;
  targetUser: string;
  solution: string;
  value: string;
  assumptions: string;
  firstExperiment: string;
  status: IdeaStatus;
  createdAt: string;
  versions: IdeaVersion[];
}

// ── AI abstraction I/O ────────────────────────────────────────

export interface AnalyzeResponseInput {
  challenge: Challenge;
  response: string;
}

export type AiReactionKind =
  | "reflection"
  | "challenge"
  | "observation"
  | "expansion"
  | "question"
  | "surprise";

export interface AnalyzeResponseOutput {
  reaction: string;
  kind: AiReactionKind;
  observation: string;
  perspectiveShift: string;
  // Optional concrete, illustrative example of the shift — never a model answer.
  shiftExample?: string;
  followUpQuestion: string;
  suggestedTraitSignals: BehavioralSignal[];
  nextChallengeType: ChallengeType;
}

export interface FollowUpInput {
  challenge: Challenge;
  response: string;
  followUpResponse: string;
}

export interface FollowUpOutput {
  reaction: string;
  reward: string;
}

export interface DevelopIdeaInput {
  step: IdeaStep;
  answer: string;
  draft: Partial<Idea>;
}

export interface DevelopIdeaOutput {
  reaction: string;
  nextQuestion?: string;
}

export interface GenerateIdeaCardInput {
  draft: Partial<Idea>;
}

export type IdeaStep =
  | "idea"
  | "why"
  | "target"
  | "problem"
  | "experiment"
  | "assumption";

export interface AIProvider {
  analyzeResponse(input: AnalyzeResponseInput): Promise<AnalyzeResponseOutput>;
  generateFollowUp(input: FollowUpInput): Promise<FollowUpOutput>;
  developIdea(input: DevelopIdeaInput): Promise<DevelopIdeaOutput>;
}

// ── Recommendation engine I/O ─────────────────────────────────

export interface RecommendContext {
  recentChallengeIds: string[];
  completedChallengeIds: string[];
  signalTally: Record<BehavioralSignal, number>;
  difficulty: Difficulty;
  sessionLength: number; // how many challenges done this session
}

export interface RecommendResult {
  challengeId: string;
  reason: string; // internal only — never shown to the user
  difficulty: Difficulty;
  expectedDuration: number;
}
