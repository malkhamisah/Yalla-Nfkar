import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86400000);
}

// ── Arabic counted-noun helpers ───────────────────────────────
// Natural agreement: 1 singular, 2 dual, 3–10 plural, 0 & 11+ singular.
// Keeps the Najdi-lite voice without broken forms like "1 أيام".

export function arabicDays(n: number): string {
  if (n === 1) return "يوم واحد";
  if (n === 2) return "يومين";
  if (n >= 3 && n <= 10) return `${n} أيام`;
  return `${n} يوم`; // 0 and 11+
}

export function arabicPoints(n: number): string {
  if (n === 1) return "نقطة فضول وحدة";
  if (n === 2) return "نقطتين فضول";
  if (n >= 3 && n <= 10) return `${n} نقاط فضول`;
  return `${n} نقطة فضول`; // 0 and 11+
}

export function arabicChallenges(n: number): string {
  if (n === 1) return "تحدي واحد";
  if (n === 2) return "تحديين";
  if (n >= 3 && n <= 10) return `${n} تحديات`;
  return `${n} تحدي`; // 0 and 11+
}
