"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Home as HomeIcon, ArrowLeft, Moon } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/button";
import { StageProgress } from "@/components/game/StageProgress";
import {
  ChallengeRunner,
  type ChallengeResult,
} from "@/components/challenge/ChallengeRunner";
import { ThinkingDots } from "@/components/challenge/ThinkingDots";
import {
  challenges,
  getChallengeById,
  OPENER_CHALLENGE_ID,
} from "@/data/challenges";
import { recommendNextChallenge } from "@/lib/recommendations";
import {
  awardForChallenge,
  completeSession,
  detectRecurringTheme,
  getProgress,
  getUser,
  recentChallengeIds,
  registerPlayDay,
  saveSession,
} from "@/services/store";
import { track } from "@/lib/analytics";
import { uid } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";
import type { Challenge } from "@/types";

const MAX_PER_SESSION = 3;

function PlayInner() {
  const search = useSearchParams();
  const isFirst = search.get("first") === "1";
  const { progress, refresh } = useProgress();

  const [current, setCurrent] = useState<Challenge | null>(null);
  const [phase, setPhase] = useState<"playing" | "wrap">("playing");
  const [completed, setCompleted] = useState(0);
  const [theme, setTheme] = useState<string | null>(null);

  const startedRef = useRef(0);
  const playedRef = useRef<string[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    registerPlayDay();
    track("session_started", { source: "play" });
    const first = isFirst
      ? getChallengeById(OPENER_CHALLENGE_ID)!
      : pickNext(0);
    startChallenge(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickNext(sessionLen: number): Challenge {
    const p = getProgress();
    const rec = recommendNextChallenge({
      recentChallengeIds: [...playedRef.current, ...recentChallengeIds()],
      completedChallengeIds: p.seenChallengeIds,
      signalTally: p.signalTally,
      difficulty: "easy",
      sessionLength: sessionLen,
    });
    return getChallengeById(rec.challengeId) ?? challenges[0];
  }

  function startChallenge(c: Challenge) {
    playedRef.current.push(c.id);
    startedRef.current += 1;
    track(
      startedRef.current === 2 ? "second_challenge_started" : "challenge_started",
      { challengeId: c.id, type: c.type }
    );
    setCurrent(c);
    setPhase("playing");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function handleComplete(r: ChallengeResult) {
    saveSession({
      id: uid("sess"),
      userId: getUser().id,
      challengeId: r.challenge.id,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      response: r.response,
      followUpResponse: r.followUpResponse,
      signals: r.signals,
    });
    awardForChallenge(r.challenge, r.signals);
    track("challenge_completed", {
      challengeId: r.challenge.id,
      type: r.challenge.type,
    });
    if (r.challenge.type === "observation") track("observation_shared");
    setCompleted((c) => c + 1);
    refresh();
  }

  function goNext() {
    startChallenge(pickNext(completed));
  }

  function wrapUp() {
    completeSession();
    track("session_completed", { challenges: completed });
    setTheme(detectRecurringTheme());
    setPhase("wrap");
    refresh();
  }

  if (!current) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center">
          <ThinkingDots />
        </div>
      </AppShell>
    );
  }

  if (phase === "wrap") {
    return (
      <AppShell>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col"
        >
          <div className="mt-4 text-center">
            <div className="text-6xl">😄</div>
            <h1 className="mt-4 text-3xl font-extrabold">
              خلاص، مخك أخذ لفة اليوم
            </h1>
            <p className="mt-2 text-muted">
              كمّلت {completed} {completed === 1 ? "تحدي" : "تحديات"} اليوم.
              عندي لك تحدي أغرب المرة الجاية 👀
            </p>
          </div>

          {progress && (
            <div className="mt-6">
              <StageProgress xp={progress.xp} />
            </div>
          )}

          {theme && (
            <Link href="/ideas/new" className="mt-4 block">
              <div className="surface border-dashed border-sky/50 bg-sky-soft/60 p-5">
                <p className="font-bold text-ink">لحظة...</p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink">
                  رجعت لموضوع «{theme}» أكثر من مرة. هذي تستاهل أكثر من مجرد
                  لعبة — نحوّلها فكرة؟
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-action">
                  يلا نحولها
                  <ArrowLeft className="h-4 w-4" />
                </span>
              </div>
            </Link>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Link href="/home">
              <Button variant="secondary" className="w-full">
                <HomeIcon className="h-4 w-4" />
                بكرة؟ نكمّل من الرئيسية
              </Button>
            </Link>
          </div>
        </motion.div>
      </AppShell>
    );
  }

  const canContinue = completed < MAX_PER_SESSION;

  return (
    <AppShell>
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/home"
          className="pill bg-white text-muted border border-line"
        >
          <HomeIcon className="h-4 w-4" />
          الرئيسية
        </Link>
        <span className="text-sm font-semibold text-muted">
          لفّة {completed + 1}
        </span>
      </div>

      <div className="mt-2">
        <ChallengeRunner
          key={current.id}
          challenge={current}
          onComplete={handleComplete}
          actions={
            <div className="flex flex-col gap-3">
              <p className="text-center text-lg font-bold">
                {canContinue ? "تبغى وحدة ثانية؟" : "كفاية إبداع لليوم 😌"}
              </p>
              {canContinue ? (
                <div className="flex gap-2">
                  <Button onClick={goNext} className="flex-1">
                    نعم، وحدة ثانية
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" onClick={wrapUp} className="px-5">
                    يكفي اليوم
                  </Button>
                </div>
              ) : (
                <Button onClick={wrapUp} className="w-full">
                  <Moon className="h-4 w-4" />
                  خلّها لبكرة
                </Button>
              )}
            </div>
          }
        />
      </div>
    </AppShell>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex flex-1 items-center justify-center">
            <ThinkingDots />
          </div>
        </AppShell>
      }
    >
      <PlayInner />
    </Suspense>
  );
}
