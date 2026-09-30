"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// The facilitator's voice on screen — warm, a little playful.
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
      ? "bg-white border-brand/20"
      : tone === "reward"
        ? "bg-mint-soft border-mint/30"
        : "bg-brand-soft/60 border-transparent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-3xl border px-5 py-4 text-[17px] leading-relaxed ${toneClass}`}
    >
      {children}
    </motion.div>
  );
}
