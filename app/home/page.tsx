"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Flame, Lightbulb, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { StageProgress } from "@/components/game/StageProgress";
import { useProgress } from "@/hooks/useProgress";
import { touchUser, getIdeas, detectRecurringTheme } from "@/services/store";
import { track } from "@/lib/analytics";
import type { Idea } from "@/types";

export default function HomePage() {
  const { progress } = useProgress();
  const [lastIdea, setLastIdea] = useState<Idea | null>(null);
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const { returned } = touchUser();
    if (returned) track("user_returned");
    const ideas = getIdeas();
    setLastIdea(ideas[0] ?? null);
    setTheme(detectRecurringTheme());
  }, []);

  const streak = progress?.streak ?? 0;

  return (
    <AppShell>
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">هلا 👋</p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              وش رايك نفكر شوي؟
            </h1>
          </div>
          {streak > 0 && (
            <span className="pill bg-sun-soft text-sun">
              <Flame className="h-4 w-4" />
              {streak} أيام
            </span>
          )}
        </div>
      </Reveal>

      {/* Main play card */}
      <Reveal delay={0.06}>
        <Link href="/play" className="mt-6 block">
          <div className="surface relative overflow-hidden bg-brand p-6 text-white shadow-lift transition-transform active:scale-[0.99]">
            <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 left-10 h-24 w-24 rounded-full bg-white/5" />
            <div className="relative">
              <span className="pill bg-white/20 text-white">
                <Sparkles className="h-4 w-4" />
                تحدي اليوم
              </span>
              <p className="mt-4 text-2xl font-extrabold leading-snug">
                جاهز تاخذ لفة جديدة؟
              </p>
              <p className="mt-1 text-white/80">
                تحدي صغير... وزاوية ما كانت ببالك.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-brand">
                يلا
                <ArrowLeft className="h-5 w-5" />
              </div>
            </div>
          </div>
        </Link>
      </Reveal>

      {/* Idea transition nudge */}
      {theme && (
        <Reveal delay={0.1}>
          <Link href="/ideas/new" className="mt-4 block">
            <div className="surface border-dashed border-brand/40 bg-brand-soft/50 p-5">
              <p className="font-bold text-brand-deep">
                لحظة... 👀
              </p>
              <p className="mt-1 text-[15px] leading-relaxed">
                واضح إن عندك موضوع ترجع له كثير حول «{theme}». وش رايك نجرب
                نحوله لفكرة فعلية؟
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                يلا نحولها
                <ArrowLeft className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </Reveal>
      )}

      {/* Progress */}
      {progress && (
        <Reveal delay={0.14}>
          <div className="mt-4">
            <StageProgress xp={progress.xp} />
          </div>
        </Reveal>
      )}

      {/* Last idea */}
      <Reveal delay={0.18}>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold">آخر فكرة</h2>
            <Link href="/ideas" className="text-sm font-semibold text-brand">
              الكل
            </Link>
          </div>
          {lastIdea ? (
            <Link href={`/ideas/${lastIdea.id}`}>
              <div className="surface flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-soft text-xl">
                  💡
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{lastIdea.title}</p>
                  <p className="truncate text-sm text-muted">
                    {lastIdea.problem || "فكرة قيد التطوير"}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="surface p-5">
              <div className="flex items-center gap-2 text-muted">
                <Lightbulb className="h-5 w-5" />
                <p>
                  ما عندك أفكار للحين. وهذا ممتاز — يلا نبدأ بواحدة صغيرة من
                  اللعب.
                </p>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </AppShell>
  );
}
