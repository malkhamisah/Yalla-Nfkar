"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import { getChallengeById, LANDING_DEMO_CHALLENGE_ID } from "@/data/challenges";
import { analyzeResponse } from "@/lib/ai/client";
import { track } from "@/lib/analytics";
import type { AnalyzeResponseOutput } from "@/types";
import { Button } from "@/components/ui/button";
import { AiBubble } from "@/components/challenge/AiBubble";
import { ThinkingDots } from "@/components/challenge/ThinkingDots";

const challenge = getChallengeById(LANDING_DEMO_CHALLENGE_ID)!;

export function LandingDemo() {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [ai, setAi] = useState<AnalyzeResponseOutput | null>(null);

  async function run() {
    if (value.trim().length < 2) return;
    setState("loading");
    track("landing_demo_started");
    try {
      const out = await analyzeResponse({ challenge, response: value });
      setAi(out);
      setState("done");
      track("landing_demo_completed");
    } catch {
      setState("idle");
    }
  }

  return (
    <div className="surface p-5">
      <p className="mb-1 text-xs font-semibold text-brand">جرّبها الحين 👇</p>
      <h3 className="mb-4 text-xl font-extrabold leading-snug">
        {challenge.prompt}
      </h3>

      {state === "idle" && (
        <div className="flex flex-col gap-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="اكتب أي شي..."
            className="field text-base"
          />
          <Button onClick={run} disabled={value.trim().length < 2}>
            شوف وش بيصير
            <Send className="h-4 w-4 -scale-x-100" />
          </Button>
        </div>
      )}

      {state === "loading" && <ThinkingDots />}

      <AnimatePresence>
        {state === "done" && ai && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3"
          >
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-3xl rounded-tr-lg bg-navy px-4 py-2.5 text-[15px] text-white">
                {value}
              </div>
            </div>
            <AiBubble>{ai.reaction}</AiBubble>
            <AiBubble tone="shift" delay={0.2}>
              <span className="font-bold text-ink">{ai.perspectiveShift}</span>
            </AiBubble>
            <Link href="/onboarding" className="mt-1">
              <Button className="w-full">
                حلو... نكمل 👀
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
