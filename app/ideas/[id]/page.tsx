"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, Check, Plus } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { getIdea, saveIdea } from "@/services/store";
import { track } from "@/lib/analytics";
import type { Idea } from "@/types";

const DEVELOP_PROMPTS = [
  "نقلبها مرة ثانية؟",
  "وش أكبر افتراض فيها؟",
  "كيف نجربها بدون ما نبني المنتج كامل؟",
];

const SHARE_ACTIONS = ["عندي إضافة", "عندي سؤال", "جرب تشوفها من هالزاوية"];

export default function IdeaDetailPage() {
  const params = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setIdea(getIdea(params.id) ?? null);
  }, [params.id]);

  function addVersion() {
    if (!idea || note.trim().length < 2) return;
    const updated: Idea = {
      ...idea,
      versions: [
        ...idea.versions,
        {
          at: new Date().toISOString(),
          note: `${activePrompt} — ${note.trim()}`,
        },
      ],
      status: activePrompt?.includes("نجربها") ? "ready_to_test" : idea.status,
    };
    saveIdea(updated);
    setIdea(updated);
    setNote("");
    setActivePrompt(null);
    track("idea_developed", { ideaId: idea.id });
    if (updated.status === "ready_to_test") {
      track("experiment_started", { ideaId: idea.id });
    }
  }

  function share() {
    if (!idea) return;
    setShared(true);
    track("idea_shared", { ideaId: idea.id });
  }

  if (!idea) {
    return (
      <AppShell>
        <div className="mt-10 text-center text-muted">
          <p>ما لقيت الفكرة.</p>
          <Link href="/ideas" className="mt-3 inline-block font-bold text-brand">
            رجوع لأفكاري
          </Link>
        </div>
      </AppShell>
    );
  }

  const timeline = [
    { label: "ملاحظة", value: idea.observation, emoji: "🔎" },
    { label: "مشكلة", value: idea.problem, emoji: "🎯" },
    { label: "فكرة", value: idea.solution, emoji: "💡" },
    { label: "أول تجربة", value: idea.firstExperiment, emoji: "🧪" },
  ].filter((t) => t.value);

  return (
    <AppShell>
      <Reveal>
        <Link
          href="/ideas"
          className="pill bg-white text-muted border border-line"
        >
          <ArrowRight className="h-4 w-4" />
          أفكاري
        </Link>
      </Reveal>

      {/* Idea card */}
      <Reveal delay={0.05}>
        <motion.div className="surface mt-4 overflow-hidden">
          <div className="bg-brand p-6 text-white">
            <p className="text-sm text-white/70">الفكرة</p>
            <h1 className="mt-1 text-2xl font-extrabold leading-snug">
              {idea.title}
            </h1>
          </div>
          <div className="space-y-4 p-6">
            <Field label="المشكلة" value={idea.problem} />
            <Field label="مين يستفيد؟" value={idea.targetUser} />
            <Field label="القيمة" value={idea.value} />
            <Field label="أول تجربة" value={idea.firstExperiment} />
            <Field label="أكبر افتراض لازم نتأكد منه" value={idea.assumptions} />
          </div>
        </motion.div>
      </Reveal>

      {/* Journey timeline */}
      {timeline.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold">رحلة الفكرة</h2>
            <div className="relative space-y-3 pr-4">
              {timeline.map((t, i) => (
                <div key={i} className="relative flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-card">
                    {t.emoji}
                  </span>
                  <div className="surface flex-1 p-3">
                    <p className="text-xs font-semibold text-muted">{t.label}</p>
                    <p className="text-[15px]">{t.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Develop more */}
      <Reveal delay={0.14}>
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold">طوّرها أكثر</h2>
          <div className="flex flex-wrap gap-2">
            {DEVELOP_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setActivePrompt(p);
                  setNote("");
                }}
                className={`pill border transition-colors ${
                  activePrompt === p
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-ink"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {activePrompt && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex flex-col gap-2"
            >
              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="اكتب اللي طلع لك..."
                rows={3}
                className="field resize-none text-base"
              />
              <Button onClick={addVersion} disabled={note.trim().length < 2}>
                <Plus className="h-4 w-4" />
                أضفها للفكرة
              </Button>
            </motion.div>
          )}
        </div>
      </Reveal>

      {/* Versions */}
      {idea.versions.length > 1 && (
        <Reveal delay={0.16}>
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-bold">التطويرات</h2>
            <div className="space-y-2">
              {idea.versions
                .slice(1)
                .reverse()
                .map((v, i) => (
                  <div key={i} className="surface p-3 text-sm">
                    {v.note}
                  </div>
                ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Sharing — build, don't judge */}
      <Reveal delay={0.18}>
        <div className="surface mt-6 mb-4 p-5">
          <p className="font-bold">نطوّر الأفكار، ما نحكم على أصحابها 🌿</p>
          <p className="mt-1 text-sm text-muted">
            لو شاركتها، الردود تكون بهالروح:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SHARE_ACTIONS.map((a) => (
              <span
                key={a}
                className="pill border border-line bg-white text-ink"
              >
                {a}
              </span>
            ))}
          </div>
          {shared ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-sky-soft px-4 py-3 font-semibold text-sky-deep">
              <Check className="h-4 w-4" />
              حفظناها وجاهزة تنشارك بهالروح.
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={share}
              className="mt-4 w-full"
            >
              <FlaskConical className="h-4 w-4" />
              خلّها جاهزة للمشاركة
            </Button>
          )}
        </div>
      </Reveal>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-0.5 text-[16px] leading-relaxed">{value}</p>
    </div>
  );
}
