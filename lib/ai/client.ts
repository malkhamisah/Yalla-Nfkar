import type {
  AnalyzeResponseInput,
  AnalyzeResponseOutput,
  DevelopIdeaInput,
  DevelopIdeaOutput,
  FollowUpInput,
  FollowUpOutput,
} from "@/types";

// Client-side helpers that talk to the server AI routes.
// The UI depends only on these — never on a concrete AI provider.

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  return (await res.json()) as T;
}

export function analyzeResponse(
  input: AnalyzeResponseInput
): Promise<AnalyzeResponseOutput> {
  return post("/api/ai/analyze", input);
}

export function generateFollowUp(
  input: FollowUpInput
): Promise<FollowUpOutput> {
  return post("/api/ai/follow-up", input);
}

export function developIdea(
  input: DevelopIdeaInput
): Promise<DevelopIdeaOutput> {
  return post("/api/ai/develop-idea", input);
}
