import type { Challenge } from "@/types";

// A small, hand-crafted library. Quality > quantity.
// Every challenge: understood in seconds, quick to answer, no right answer,
// makes room to think, and opens a door to a perspective shift.

export const challenges: Challenge[] = [
  // ── Perspective Shift ───────────────────────────────────────
  {
    id: "ps-change",
    type: "perspective_shift",
    title: "قلبها",
    prompt: "وش الشي اللي ودك يتغير في يومك العادي؟",
    difficulty: "easy",
    estimatedSeconds: 30,
    traitSignals: ["perspective_shift", "exploration"],
    followUp: { prompt: "طيب لو قلبناها تمامًا... وش يصير؟" },
    reward: "أول لفّة لمخك اليوم",
    tags: ["daily", "opener"],
  },
  {
    id: "ps-queue",
    type: "perspective_shift",
    title: "قلبها",
    prompt:
      "تخيل إنك كل يوم تنتظر في طابور 20 دقيقة. وش أول شي يخطر ببالك يخلي الانتظار أقل إزعاجًا؟",
    difficulty: "easy",
    estimatedSeconds: 40,
    traitSignals: ["perspective_shift", "problem_reframing"],
    followUp: { prompt: "وش لو المشكلة مو الانتظار... بل إحساسنا إن الوقت ضاع؟" },
    tags: ["waiting", "reframe"],
  },
  {
    id: "ps-designer",
    type: "perspective_shift",
    title: "قلبها",
    prompt:
      "وش لو الشخص اللي يعاني من المشكلة صار هو اللي يصمم الحل؟ اختر مشكلة تزعجك وقل وش بيسوي.",
    difficulty: "medium",
    estimatedSeconds: 45,
    traitSignals: ["perspective_shift", "observation"],
    followUp: { prompt: "وش الشي اللي شافه هو وما نشوفه احنا؟" },
    tags: ["empathy"],
  },

  // ── Observation ─────────────────────────────────────────────
  {
    id: "ob-phone",
    type: "observation",
    title: "لاحظ",
    prompt:
      "وأنت تستخدم جوالك اليوم... وش شيء صغير يزعجك وساكت عنه من زمان؟",
    difficulty: "easy",
    estimatedSeconds: 30,
    traitSignals: ["observation", "problem_reframing"],
    followUp: { prompt: "ليه تحملناه كل هالمدة بدون ما نغيره؟" },
    tags: ["noticing", "phone"],
  },
  {
    id: "ob-room",
    type: "observation",
    title: "لاحظ",
    prompt: "طالع حولك الحين. وش شي كنت تمر عليه كل يوم وما انتبهت له؟",
    difficulty: "easy",
    estimatedSeconds: 30,
    traitSignals: ["observation", "exploration"],
    followUp: { prompt: "ليه صار طبيعي لدرجة إنه اختفى من نظرك؟" },
    tags: ["noticing"],
  },

  // ── Rapid Ideation ──────────────────────────────────────────
  {
    id: "ri-time",
    type: "rapid_ideation",
    title: "٣ أفكار بسرعة",
    prompt:
      "عندك 30 ثانية. عطنا 3 طرق مختلفة نخلي فيها وقت الانتظار ممتع. لا تدوّر أفضل فكرة.",
    difficulty: "medium",
    estimatedSeconds: 30,
    traitSignals: ["idea_generation", "risk_taking"],
    followUp: { prompt: "أي وحدة فيهن أغرب شوي؟ خذها وكبّرها." },
    reward: "٣ أفكار في 30 ثانية 🔥",
    tags: ["speed"],
  },
  {
    id: "ri-morning",
    type: "rapid_ideation",
    title: "٣ أفكار بسرعة",
    prompt: "3 طرق نخلي فيها الصباح أسهل على شخص دايم متأخر. بسرعة.",
    difficulty: "medium",
    estimatedSeconds: 30,
    traitSignals: ["idea_generation"],
    followUp: { prompt: "وحدة منهن ممكن تجربها بكرة فعلًا؟" },
    tags: ["speed", "morning"],
  },

  // ── Reverse Thinking ────────────────────────────────────────
  {
    id: "rv-worse",
    type: "reverse_thinking",
    title: "اعكسها",
    prompt:
      "اختر مشكلة صغيرة تزعجك. كيف ممكن نخليها أسوأ بكثير؟ بالتفصيل.",
    difficulty: "medium",
    estimatedSeconds: 40,
    traitSignals: ["risk_taking", "problem_reframing"],
    followUp: { prompt: "طيب... وش تعلمنا من أسوأ نسخة عن الحل الصح؟" },
    tags: ["reverse"],
  },

  // ── Worst Idea ──────────────────────────────────────────────
  {
    id: "wi-solution",
    type: "worst_idea",
    title: "أسوأ فكرة",
    prompt: "عطنا أسوأ حل ممكن لمشكلة الزحمة الصباحية. الأسوأ، بلا خجل.",
    difficulty: "easy",
    estimatedSeconds: 35,
    traitSignals: ["risk_taking", "idea_generation"],
    followUp: { prompt: "فيه شي واحد بس من هالفكرة الخايبة ممكن نستفيد منه؟" },
    reward: "الأفكار الخايبة أحيانًا تفتح أبواب 👀",
    tags: ["worst"],
  },

  // ── Role Switching ──────────────────────────────────────────
  {
    id: "rs-first",
    type: "role_switching",
    title: "بدّل الدور",
    prompt:
      "تخيل إنك أول مرة تستخدم خدمة تستخدمها كل يوم. وش بتلاحظ إنه معقّد وأنت جديد؟",
    difficulty: "medium",
    estimatedSeconds: 40,
    traitSignals: ["perspective_shift", "observation"],
    followUp: { prompt: "ليه تعوّدنا عليه واحنا نعرف إنه مو منطقي؟" },
    tags: ["role", "empathy"],
  },

  // ── Problem Reframing ───────────────────────────────────────
  {
    id: "pr-real",
    type: "problem_reframing",
    title: "وش المشكلة من جد؟",
    prompt:
      "فكّر بشي يضايقك هالأيام. اكتبه... بعدين اسأل نفسك: هذي المشكلة، ولا عرَض لمشكلة أكبر؟",
    difficulty: "hard",
    estimatedSeconds: 50,
    traitSignals: ["problem_reframing", "perspective_shift"],
    followUp: { prompt: "وش الشي اللي قاعد نفترضه وممكن يطلع مو صحيح؟" },
    tags: ["reframe"],
  },

  // ── Idea Development ────────────────────────────────────────
  {
    id: "id-simpler",
    type: "idea_development",
    title: "طوّرها",
    prompt:
      "فكرة عندك (أي فكرة). كيف نخليها أبسط بمرّة؟ شيل منها كل شي مو ضروري.",
    difficulty: "medium",
    estimatedSeconds: 45,
    traitSignals: ["idea_development", "experimentation"],
    followUp: { prompt: "لو بنجربها بكرة، وش أبسط نسخة ممكن نسويها؟" },
    tags: ["develop"],
  },
];

export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id);
}

// A good, welcoming opener for the very first session and the Landing demo.
export const OPENER_CHALLENGE_ID = "ps-change";
export const LANDING_DEMO_CHALLENGE_ID = "ps-queue";
