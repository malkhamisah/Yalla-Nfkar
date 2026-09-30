"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiBubble } from "@/components/challenge/AiBubble";
import { ThinkingDots } from "@/components/challenge/ThinkingDots";
import { developIdea } from "@/lib/ai/client";
import type { Idea, IdeaStep } from "@/types";
import { uid } from "@/lib/utils";
import { getUser } from "@/services/store";

const STEPS: IdeaStep[] = [
  "idea",
  "why",
  "target",
  "problem",
  "experiment",
  "assumption",
];

const FIRST_QUESTION = "وش الفكرة اللي في بالك؟";

type Msg =
  | { from: "ai"; text: string }
  | { from: "user"; text: string };

export function IdeaChat({
  seedTheme,
  onFinish,
}: {
  seedTheme?: string;
  onFinish: (idea: Idea) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "ai", text: FIRST_QUESTION },
  ]);
  const [stepIndex, setStepIndex] = useState(0);
  const [value, setValue] = useState("");
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(false);
  const draft = useRef<Partial<Idea>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function applyToDraft(step: IdeaStep, answer: string) {
    switch (step) {
      case "idea":
        draft.current.solution = answer;
        draft.current.title =
          answer.length > 42 ? answer.slice(0, 40).trim() + "…" : answer;
        break;
      case "why":
        draft.current.observation = answer;
        break;
      case "target":
        draft.current.targetUser = answer;
        break;
      case "problem":
        draft.current.problem = answer;
        break;
      case "experiment":
        draft.current.firstExperiment = answer;
        break;
      case "assumption":
        draft.current.assumptions = answer;
        break;
    }
  }

  async function submit() {
    const answer = value.trim();
    if (answer.length < 2 || thinking || done) return;
    const step = STEPS[stepIndex];
    applyToDraft(step, answer);
    setMessages((m) => [...m, { from: "user", text: answer }]);
    setValue("");
    setThinking(true);

    try {
      const out = await developIdea({ step, answer, draft: draft.current });
      const replies: Msg[] = [{ from: "ai", text: out.reaction }];
      if (out.nextQuestion) replies.push({ from: "ai", text: out.nextQuestion });
      setMessages((m) => [...m, ...replies]);

      if (stepIndex >= STEPS.length - 1) {
        setDone(true);
        finalize();
      } else {
        setStepIndex((i) => i + 1);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { from: "ai", text: "شكله مخي علّق شوي 😅 عيد آخر جواب؟" },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function finalize() {
    const d = draft.current;
    const idea: Idea = {
      id: uid("idea"),
      userId: getUser().id,
      title: d.title || "فكرة بدون اسم",
      observation: d.observation || "",
      problem: d.problem || "",
      targetUser: d.targetUser || "",
      solution: d.solution || "",
      value: d.problem
        ? `تحل مشكلة: ${d.problem}`
        : "قيمة قيد التوضيح",
      assumptions: d.assumptions || "",
      firstExperiment: d.firstExperiment || "",
      status: "shaping",
      createdAt: new Date().toISOString(),
      versions: [{ at: new Date().toISOString(), note: "أول نسخة من الفكرة" }],
    };
    onFinish(idea);
  }

  return (
    <div className="flex flex-1 flex-col">
      {seedTheme && (
        <div className="mb-3 rounded-2xl bg-brand-soft/60 px-4 py-2 text-sm text-brand-deep">
          خلنا نطوّر موضوع «{seedTheme}» اللي رجعت له كثير 👀
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) =>
            m.from === "ai" ? (
              <AiBubble key={i}>{m.text}</AiBubble>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] rounded-3xl rounded-tr-lg bg-ink px-5 py-3 text-[16px] leading-relaxed text-cream">
                  {m.text}
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
        {thinking && <ThinkingDots seed={stepIndex} />}
        <div ref={bottomRef} />
      </div>

      {!done && (
        <div className="sticky bottom-0 flex items-end gap-2 bg-gradient-to-t from-cream via-cream to-transparent pb-4 pt-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder="اكتب جوابك..."
            rows={1}
            className="field max-h-32 min-h-[52px] flex-1 resize-none py-3.5 text-base"
          />
          <Button
            onClick={submit}
            disabled={value.trim().length < 2 || thinking}
            className="h-[52px] px-4"
          >
            <Send className="h-5 w-5 -scale-x-100" />
          </Button>
        </div>
      )}
    </div>
  );
}
