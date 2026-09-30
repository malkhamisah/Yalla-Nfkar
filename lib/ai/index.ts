import "server-only";
import type { AIProvider } from "@/types";
import { MockAIProvider } from "./mock-provider";
import { OpenAIProvider } from "./openai-provider";

// Server-side factory. UI never imports a provider directly — it calls the
// /api/ai/* routes, which use this. Swapping providers needs no UI changes.
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "mock";
  const key = process.env.OPENAI_API_KEY;
  if (provider === "openai" && key) {
    return new OpenAIProvider(key, process.env.OPENAI_MODEL ?? "gpt-4o-mini");
  }
  return new MockAIProvider();
}
