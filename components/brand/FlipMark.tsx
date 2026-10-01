"use client";

import { motion } from "framer-motion";

// Abstract "perspective flip" motif — a shape that turns its point of view.
// Smart + playful + mature. Not a mascot. Serves the "قلبها" idea.
export function FlipMark({ className }: { className?: string }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 88 88"
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* soft base disc */}
      <circle cx="44" cy="44" r="40" fill="#E9EDF7" />
      {/* the circle that flips — gentle, continuous */}
      <motion.g
        style={{ transformOrigin: "44px 44px" }}
        animate={{ rotateY: [0, 180, 360] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="44" cy="44" r="22" fill="#0E1F64" />
        <circle cx="44" cy="44" r="8" fill="#50C7E7" />
      </motion.g>
      {/* curving arrow — changing direction */}
      <path
        d="M22 58 A 26 26 0 0 0 66 34"
        fill="none"
        stroke="#EE5800"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M66 34 l-8 -2 M66 34 l-1 8"
        fill="none"
        stroke="#EE5800"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
