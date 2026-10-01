"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

// The facilitator's voice on screen — warm, a little playful.
// tone "shift" is the insight moment → Sky accent + a gentle flip.
// tone "reward" is the energy moment → Action accent.
export function AiBubble({
  children,
  tone = "default",
  delay = 0,
}: {
  children: ReactNode;
  tone?: "default" | "shift" | "reward";
  delay?: number;
}) {
  const toneClass =
    tone === "shift"
      ? "bg-sky-soft border-sky/40"
      : tone === "reward"
        ? "bg-action-soft border-action/30"
        : "bg-brand-soft/60 border-transparent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl border px-5 py-4 text-[17px] leading-relaxed text-ink ${toneClass}`}
    >
      {tone === "shift" ? (
        <div className="flex items-start gap-2.5">
          <motion.span
            aria-hidden
            initial={{ rotate: 0, opacity: 0 }}
            animate={{ rotate: 180, opacity: 1 }}
            transition={{ delay: delay + 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1 shrink-0 text-sky-deep"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2.6} />
          </motion.span>
          <div>{children}</div>
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}
