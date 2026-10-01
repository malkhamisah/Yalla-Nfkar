"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, RotateCcw } from "lucide-react";
import type {
  AnalyzeResponseOutput,
  BehavioralSignal,
  Challenge,
} from "@/types";
import { analyzeResponse, generateFollowUp } from "@/lib/ai/client";
import { Button } from "@/components/ui/button";
import { AiBubble } from "./AiBubble";
import { ThinkingDots } from "./ThinkingDots";
import { ChallengeTypeBadge } from "./ChallengeTypeBadge";
import { cn } from "@/lib/utils";

export interface ChallengeResult {
  challenge: Challenge;
  response: string;
  followUpResponse: string;
  signals: BehavioralSignal[];
  ai: AnalyzeResponseOutput;
  reward: string;
}

type Phase = "prompt" | "reacting" | "shift" | "rewarding" | "reward" | "error";

export function ChallengeRunner({
  challenge,
  onComplete,
  actions,
}: {
  challenge: Challenge;
  onComplete?: (r: ChallengeResult) => void;
  actions?: React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [response, setResponse] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [ai, setAi] = useState<AnalyzeResponseOutput | null>(null);
  const [reward, setReward] = useState("");
  const completedRef = useRef(false);

  // Reset everything when the challenge changes.
  useEffect(() => {
    setPhase("prompt");
    setResponse("");
    setFollowUp("");
    setAi(null);
    setReward("");
    completedRef.current = false;
  }, [challenge.id]);

  async function submitResponse() {
    if (response.trim().length < 2) return;
    setPhase("reacting");
    try {
      const out = await analyzeResponse({ challenge, response });
      setAi(out);
      setPhase("shift");
    } catch {
      setPhase("error");
    }
  }

  async function submitFollowUp() {
    setPhase("rewarding");
    try {
      const fu = await generateFollowUp({
        challenge,
        response,
        followUpResponse: followUp,
      });
      setReward(fu.reward);
      setPhase("reward");
      if (!completedRef.current && ai) {
        completedRef.current = true;
        onComplete?.({
          challenge,
          response,
          followUpResponse: followUp,
          signals: ai.suggestedTraitSignals,
          ai,
          reward: fu.reward,
        });
      }
    } catch {
      setPhase("error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Challenge header */}
      <div className="flex items-center justify-between">
        <ChallengeTypeBadge type={challenge.type} title={challenge.title} />
        <span className="pill bg-white text-muted border border-line">
          ~{challenge.estimatedSeconds} ثانية
        </span>
      </div>

      {/* The prompt — big and focused */}
      <motion.h1
        key={challenge.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-[26px] font-extrabold leading-snug tracking-tight"
      >
        {challenge.prompt}
      </motion.h1>

      {/* Input for the first response */}
      {phase === "prompt" && (
        <div className="flex flex-col gap-3">
          <textarea
            autoFocus
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                submitResponse();
            }}
            placeholder="اكتب أول شي يخطر ببالك... لا تفكر كثير"
            rows={4}
            className="field resize-none"
          />
          <Button onClick={submitResponse} disabled={response.trim().length < 2}>
            خلنا نشوف
            <Send className="h-4 w-4 -scale-x-100" />
          </Button>
        </div>
      )}

      {/* Thinking */}
      <AnimatePresence>
        {phase === "reacting" && <ThinkingDots seed={challenge.prompt.length} />}
      </AnimatePresence>

      {/* Reaction + perspective shift + follow-up */}
      {(phase === "shift" || phase === "rewarding" || phase === "reward") &&
        ai && (
          <div className="flex flex-col gap-3">
            <UserEcho text={response} />
            <AiBubble>{ai.reaction}</AiBubble>
            {ai.observation && (
              <AiBubble delay={0.15} tone="default">
                <span className="text-muted">{ai.observation}</span>
              </AiBubble>
            )}
            <AiBubble delay={0.3} tone="shift">
              <span className="font-bold text-ink">{ai.perspectiveShift}</span>
            </AiBubble>

            {phase === "shift" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-3"
              >
                <textarea
                  autoFocus
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="كمل الفكرة من هنا..."
                  rows={3}
                  className="field resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={submitFollowUp}
                    disabled={followUp.trim().length < 2}
                    className="flex-1"
                  >
                    تمام، كمل
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={submitFollowUp}
                    className="px-4"
                    title="تخطّى"
                  >
                    مرّها
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}

      <AnimatePresence>
        {phase === "rewarding" && <ThinkingDots seed={followUp.length + 1} />}
      </AnimatePresence>

      {/* Reward */}
      {phase === "reward" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="flex flex-col gap-4"
        >
          <AiBubble tone="reward">
            <span className="font-bold">🎉 {reward}</span>
          </AiBubble>
          {actions}
        </motion.div>
      )}

      {/* Error */}
      {phase === "error" && (
        <div className="flex flex-col gap-3">
          <AiBubble>شكله مخي علّق شوي 😅 نجرب مرة ثانية؟</AiBubble>
          <Button
            variant="secondary"
            onClick={() =>
              setPhase(ai ? "shift" : "prompt")
            }
          >
            <RotateCcw className="h-4 w-4" />
            نعيدها
          </Button>
        </div>
      )}
    </div>
  );
}

function UserEcho({ text }: { text: string }) {
  return (
    <div className={cn("flex justify-start")}>
      <div className="max-w-[85%] rounded-3xl rounded-tr-lg bg-navy px-5 py-3 text-[16px] leading-relaxed text-white">
        {text}
      </div>
    </div>
  );
}
