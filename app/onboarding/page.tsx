"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { setOnboarded, getUser } from "@/services/store";
import { track } from "@/lib/analytics";

const screens = [
  {
    emoji: "👋",
    title: "يلا نفكر؟",
    body: "ما عندنا اختبار. ولا فيه إجابة صح. بس عندي لك كم لعبة صغيرة.",
    cta: "كمل",
  },
  {
    emoji: "🧠",
    title: "الفكرة بسيطة",
    body: "أعطيك تحدي صغير، تكتب أول شي يخطر ببالك، وأنا أقلبها لك من زاوية ثانية. دقيقتين بس.",
    cta: "يلا نبدأ",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const s = screens[i];

  function next() {
    if (i < screens.length - 1) {
      setI(i + 1);
    } else {
      getUser();
      setOnboarded();
      track("session_started", { source: "onboarding" });
      router.push("/play?first=1");
    }
  }

  return (
    <div className="app-bg flex min-h-[100dvh] flex-col">
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col px-6 py-10">
        {/* progress dots */}
        <div className="mb-10 flex justify-center gap-2">
          {screens.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === i ? "w-8 bg-brand" : "w-2 bg-brand/25"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="text-7xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {s.emoji}
              </motion.div>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight">
                {s.title}
              </h1>
              <p className="mt-4 max-w-xs text-lg leading-relaxed text-muted">
                {s.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8">
          <Button onClick={next} className="w-full text-lg">
            {s.cta}
          </Button>
          {i === 0 && (
            <button
              onClick={() => {
                getUser();
                setOnboarded();
                track("session_started", { source: "skip" });
                router.push("/play?first=1");
              }}
              className="mt-3 w-full py-2 text-sm font-semibold text-muted"
            >
              تخطّى — ودّني اللعب
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
