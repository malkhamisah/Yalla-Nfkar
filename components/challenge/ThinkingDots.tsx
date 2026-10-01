"use client";

import { motion } from "framer-motion";

const LINES = [
  "لحظة... أقلبها لك 👀",
  "أفكر فيها من زاوية ثانية...",
  "خلني أشوفها شوي...",
];

export function ThinkingDots({ seed = 0 }: { seed?: number }) {
  const line = LINES[seed % LINES.length];
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-sky-soft px-5 py-4">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-sky-deep"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-sky-deep">{line}</span>
    </div>
  );
}
