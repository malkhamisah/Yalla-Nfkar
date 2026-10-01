"use client";

import { motion } from "framer-motion";
import { stageForXp, nextStage, stageProgress } from "@/lib/progression";

// Light, discoverable progression — never a "creativity score".
export function StageProgress({ xp }: { xp: number }) {
  const cur = stageForXp(xp);
  const next = nextStage(xp);
  const pct = Math.round(stageProgress(xp) * 100);

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{cur.emoji}</span>
          <div>
            <p className="text-xs text-muted">مرحلتك الحين</p>
            <p className="text-lg font-extrabold leading-tight">{cur.title}</p>
          </div>
        </div>
        {next && (
          <div className="text-left">
            <p className="text-xs text-muted">اللي بعدها</p>
            <p className="text-sm font-bold opacity-50">
              {next.emoji} {next.title}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-brand-soft">
        <motion.div
          className="h-full rounded-full bg-warm"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {next ? (
        <p className="mt-2 text-xs text-muted">
          قربت... كمل شوي وتوصل {next.title}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">وصلت لأبعد مرحلة 🚀</p>
      )}
    </div>
  );
}
