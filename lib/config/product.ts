// ─────────────────────────────────────────────────────────────
// Product & audience configuration for يلا نفكر | Yalla Nfkar.
// Single source of truth for who we design for and the voice we use.
// Content/tuning references this; it does not change runtime behavior.
// ─────────────────────────────────────────────────────────────

export const PRIMARY_AUDIENCE = {
  ageRange: [18, 35] as const,
  gender: "all" as const,
  market: "SA",
  language: "ar",
  dialect: "najdi-lite",
  // The mindset we optimize the core experience for.
  mindset:
    "فضولي، يستخدم الجوال يوميًا، يحب التجارب القصيرة والتفاعلية، عنده ملاحظات وأفكار بس ما يمارس التفكير الإبداعي بانتظام.",
  // Why they actually open the app — curiosity first, not self-improvement.
  entryMotivations: [
    "فضول",
    "يبي يجرب شي مختلف",
    "يحب الأسئلة الغريبة",
    "يبي يكسر الروتين",
    "يحب الألعاب والتحديات القصيرة",
    "عنده مشكلة/ملاحظة وما يعرف كيف يحولها لفكرة",
  ],
  coreInsight:
    "المستخدم ما يبي يحس إنه دخل «تطبيق لتدريب الإبداع». يبي يحس: خلني أجرب... وش عندهم اليوم؟",
} as const;

// Designed-for-later, not optimized-for-now. Must feel welcome, never targeted.
export const SECONDARY_AUDIENCE = {
  ageRange: [36, 45] as const,
  gender: "all" as const,
  market: "SA",
  language: "ar",
  personas: ["موظف ذو خبرة", "قائد فريق", "رائد أعمال", "مهتم بحل المشكلات"],
  note: "لغة وتصميم ناضجان بما يكفي ليشعروا أن المنتج مناسب لهم، بدون أن تُبنى التجربة الأساسية على حسابهم.",
} as const;

// The product's spoken personality — smart without showing off, playful
// without trying too hard, Saudi without overdoing the dialect.
export const BRAND_VOICE = {
  pillars: ["ذكي بدون استعراض", "مرح بدون تصنّع", "سعودي بدون مبالغة"],
  samples: [
    "يلا؟",
    "خلنا نجرب.",
    "حلو... بس وش لو قلبناها؟",
    "لحظة 👀",
    "وش المشكلة من جد؟",
    "طيب، لو افترضنا العكس؟",
    "لو بنجربها بكرة، وش أبسط نسخة؟",
  ],
} as const;

// Personal CTA language — never generic. Reused by copy across screens.
export const CTA = {
  start: "يلا نبدأ",
  go: "يلا",
  next: "خلنا نكمل",
  retry: "نجرب مرة ثانية",
  createIdea: "يلا نحولها لفكرة",
} as const;
