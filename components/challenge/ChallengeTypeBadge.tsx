import type { ChallengeType } from "@/types";

const META: Record<ChallengeType, { emoji: string; label: string }> = {
  perspective_shift: { emoji: "🔄", label: "قلبها" },
  observation: { emoji: "🔎", label: "لاحظ" },
  rapid_ideation: { emoji: "⚡", label: "٣ أفكار بسرعة" },
  reverse_thinking: { emoji: "🙃", label: "اعكسها" },
  worst_idea: { emoji: "🗑️", label: "أسوأ فكرة" },
  role_switching: { emoji: "🎭", label: "بدّل الدور" },
  problem_reframing: { emoji: "🎯", label: "وش المشكلة؟" },
  idea_development: { emoji: "🧩", label: "طوّرها" },
};

export function typeMeta(type: ChallengeType) {
  return META[type];
}

export function ChallengeTypeBadge({
  type,
  title,
}: {
  type: ChallengeType;
  title?: string;
}) {
  const m = META[type];
  return (
    <span className="pill bg-brand-soft text-brand-deep">
      <span>{m.emoji}</span>
      <span>{title ?? m.label}</span>
    </span>
  );
}
