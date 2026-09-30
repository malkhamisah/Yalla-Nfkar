import type {
  AIProvider,
  AnalyzeResponseInput,
  AnalyzeResponseOutput,
  DevelopIdeaInput,
  DevelopIdeaOutput,
  FollowUpInput,
  FollowUpOutput,
} from "@/types";
import { MockAIProvider } from "./mock-provider";
import { AnalyzeResponseSchema } from "./schema";

// Server-side only. The API key never reaches the client.
// Uses the OpenAI Responses API. On any failure it falls back to the Mock
// provider so the product keeps working — the experience must never break.

const FACILITATOR_SYSTEM = `أنت ميسّر تفكير إبداعي داخل لعبة اسمها "يلا نفكر".
شخصيتك: فضولي، ذكي، خفيف، مرح، محترم، غير متعالٍ، غير أكاديمي.
تتكلم بلهجة سعودية خفيفة وطبيعية (وش، خلنا، طيب، لحظة، جرب، لو، تخيل).
لا تقيّم الإجابة كصح أو خطأ. لا تعطي محاضرة. لا تشرح أكثر من اللازم.
مهمتك تساعد الشخص يشوف الأشياء من زاوية ما كان شايفها.
لا تدفع المستخدم لإجابة معينة؛ أسئلتك تفتح التفكير لا تغلقه.`;

export class OpenAIProvider implements AIProvider {
  private fallback = new MockAIProvider();
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async call(instructions: string, userInput: string): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        instructions: `${FACILITATOR_SYSTEM}\n\n${instructions}`,
        input: userInput,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const data = await res.json();
    // Responses API convenience field.
    const text: string =
      data.output_text ??
      data.output?.[0]?.content?.[0]?.text ??
      "";
    if (!text) throw new Error("empty AI output");
    return text;
  }

  async analyzeResponse(
    input: AnalyzeResponseInput
  ): Promise<AnalyzeResponseOutput> {
    try {
      const instructions = `حلّل رد المستخدم على التحدي التالي وأعد JSON فقط بالمفاتيح:
reaction, kind, observation, perspectiveShift, followUpQuestion, suggestedTraitSignals (مصفوفة), nextChallengeType.
kind من: reflection|challenge|observation|expansion|question|surprise.
التحدي: "${input.challenge.prompt}"`;
      const raw = await this.call(instructions, input.response);
      const json = JSON.parse(extractJson(raw));
      return AnalyzeResponseSchema.parse(json, input.challenge.type);
    } catch {
      return this.fallback.analyzeResponse(input);
    }
  }

  async generateFollowUp(input: FollowUpInput): Promise<FollowUpOutput> {
    // Keep follow-up light; fall back freely.
    return this.fallback.generateFollowUp(input);
  }

  async developIdea(input: DevelopIdeaInput): Promise<DevelopIdeaOutput> {
    return this.fallback.developIdea(input);
  }
}

function extractJson(s: string): string {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no json");
  return s.slice(start, end + 1);
}
