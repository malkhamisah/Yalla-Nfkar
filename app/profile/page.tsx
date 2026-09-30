"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { useProgress } from "@/hooks/useProgress";
import { STAGES, stageForXp } from "@/lib/progression";
import { resetAll } from "@/services/store";
import type { BehavioralSignal } from "@/types";

// Gentle behavioral notes — never a personality test, never a score.
const SIGNAL_NOTE: Record<BehavioralSignal, string> = {
  exploration: "تحب تجرب وتتنقل بين الزوايا بدون ما تستعجل 👀",
  perspective_shift: "هالفترة كنت كثير تقلب الأشياء من زاوية ثانية 👀",
  idea_generation: "عندك سيل أفكار — تطلع كم فكرة بسرعة وبدون توتر.",
  idea_development: "تحب تاخذ الفكرة وتشتغل عليها لين تكبر.",
  experimentation: "تميل تسأل «طيب كيف نجربها؟» — روح مجرّب.",
  risk_taking: "ما تخاف من الأفكار الغريبة، وهذا اللي يفتح أبواب.",
  building_on_others: "تبني على اللي قبله بدل ما تبدأ من الصفر.",
  observation: "عينك تمسك التفاصيل الصغيرة اللي الناس تعديها.",
  problem_reframing: "تحب تتأكد إننا نحل المشكلة الصح، مو أي مشكلة.",
};

export default function ProfilePage() {
  const { progress } = useProgress();
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (!progress) return;
    const entries = Object.entries(progress.signalTally) as [
      BehavioralSignal,
      number,
    ][];
    const top = entries.sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] > 0) setNote(SIGNAL_NOTE[top[0]]);
  }, [progress]);

  if (!progress) {
    return (
      <AppShell>
        <div className="mt-10 text-center text-muted">لحظة...</div>
      </AppShell>
    );
  }

  const stage = stageForXp(progress.xp);
  const unlockedCount = progress.unlockedStages.length;

  return (
    <AppShell>
      <Reveal>
        <div className="flex flex-col items-center pt-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-soft text-5xl shadow-card">
            {stage.emoji}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">{stage.title}</h1>
          <p className="text-muted">{progress.xp} نقطة فضول</p>
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal delay={0.06}>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat value={progress.sessionsCompleted} label="جلسة" />
          <Stat value={progress.streak} label="أيام متتالية" />
          <Stat value={progress.challengesCompleted} label="تحدي" />
        </div>
      </Reveal>

      {/* Gentle note */}
      {note && (
        <Reveal delay={0.1}>
          <div className="surface mt-4 bg-brand-soft/60 p-5">
            <p className="text-sm font-semibold text-brand">لاحظت عنك...</p>
            <p className="mt-1 text-[16px] font-bold leading-relaxed">{note}</p>
          </div>
        </Reveal>
      )}

      {/* Stages / unlocks */}
      <Reveal delay={0.14}>
        <div className="mt-4">
          <h2 className="mb-3 text-lg font-bold">
            مراحلك ({unlockedCount}/{STAGES.length})
          </h2>
          <div className="flex flex-col gap-2">
            {STAGES.map((s) => {
              const unlocked = progress.unlockedStages.includes(s.key);
              return (
                <div
                  key={s.key}
                  className={`surface flex items-center gap-3 p-4 ${
                    unlocked ? "" : "opacity-45"
                  }`}
                >
                  <span className="text-2xl">{unlocked ? s.emoji : "🔒"}</span>
                  <div className="flex-1">
                    <p className="font-bold">{s.title}</p>
                    {!unlocked && (
                      <p className="text-xs text-muted">
                        تنفتح عند {s.minXp} نقطة فضول
                      </p>
                    )}
                  </div>
                  {stage.key === s.key && (
                    <span className="pill bg-brand text-white">الحين</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Reset */}
      <Reveal delay={0.18}>
        <div className="mt-6 mb-4">
          <Button
            variant="ghost"
            className="w-full text-muted"
            onClick={() => {
              if (confirm("تبي تبدأ من جديد؟ بينحذف كل شي محلي.")) {
                resetAll();
                window.location.href = "/";
              }
            }}
          >
            <RotateCcw className="h-4 w-4" />
            ابدأ من جديد
          </Button>
        </div>
      </Reveal>
    </AppShell>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="surface p-4 text-center">
      <p className="text-3xl font-extrabold text-brand">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
