import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import type { FollowUpInput } from "@/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FollowUpInput;
    if (!body?.challenge) {
      return NextResponse.json({ error: "bad input" }, { status: 400 });
    }
    const provider = getAIProvider();
    const out = await provider.generateFollowUp(body);
    return NextResponse.json(out);
  } catch {
    return NextResponse.json({ error: "ai_failed" }, { status: 500 });
  }
}
