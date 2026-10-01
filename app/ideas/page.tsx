"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { getIdeas } from "@/services/store";
import type { Idea, IdeaStatus } from "@/types";

const STATUS_LABEL: Record<IdeaStatus, { label: string; cls: string }> = {
  spark: { label: "شرارة", cls: "bg-warm-soft text-warm-deep" },
  shaping: { label: "قيد التشكيل", cls: "bg-brand-soft text-brand-deep" },
  ready_to_test: { label: "جاهزة للتجربة", cls: "bg-sky-soft text-sky-deep" },
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    setIdeas(getIdeas());
  }, []);

  return (
    <AppShell>
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">اللي طلع من اللعب</p>
            <h1 className="text-3xl font-extrabold tracking-tight">أفكاري</h1>
          </div>
          <Link href="/ideas/new">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white shadow-lift">
              <Plus className="h-5 w-5" strokeWidth={2.6} />
            </span>
          </Link>
        </div>
      </Reveal>

      {ideas.length === 0 ? (
        <Reveal delay={0.08}>
          <div className="surface mt-8 p-7 text-center">
            <div className="text-5xl">🌱</div>
            <p className="mt-4 text-lg font-bold">ما عندك أفكار للحين</p>
            <p className="mt-1 text-muted">
              وهذا ممتاز. يلا نبدأ بواحدة صغيرة.
            </p>
            <Link href="/play" className="mt-5 block">
              <Button className="w-full">
                <Sparkles className="h-4 w-4" />
                خلنا نلعب أول
              </Button>
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {ideas.map((idea, i) => {
            const st = STATUS_LABEL[idea.status];
            return (
              <Reveal key={idea.id} delay={i * 0.05}>
                <Link href={`/ideas/${idea.id}`}>
                  <div className="surface p-5 transition-transform active:scale-[0.99]">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-extrabold leading-snug">
                        {idea.title}
                      </h3>
                      <span className={`pill shrink-0 ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    {idea.problem && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {idea.problem}
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
