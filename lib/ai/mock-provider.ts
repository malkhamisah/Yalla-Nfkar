import type {
  AIProvider,
  AnalyzeResponseInput,
  AnalyzeResponseOutput,
  AiReactionKind,
  BehavioralSignal,
  ChallengeType,
  DevelopIdeaInput,
  DevelopIdeaOutput,
  FollowUpInput,
  FollowUpOutput,
} from "@/types";

// ─────────────────────────────────────────────────────────────
// MockAIProvider
// A hand-tuned facilitator voice. No network, no key required.
// Goal: feel like a curious friend who helps you *see*, not a teacher.
// It never grades correctness. It reflects, twists, and re-opens.
// ─────────────────────────────────────────────────────────────

function pick<T>(arr: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

// Light "keyword → hidden angle" map to manufacture the "أوه!" moment.
const LENSES: { match: RegExp; shift: string }[] = [
  {
    match: /وقت|ساعة|دقيقة|انتظار|طابور|بطيء|تأخر|زحمة/,
    shift: "وش لو المشكلة مو الوقت نفسه... بل إحساسنا إن الوقت راح على الفاضي؟",
  },
  {
    match: /فلوس|مال|سعر|غالي|رخيص|تكلفة|ميزانية/,
    shift: "وش لو السؤال مو «كيف نوفّر فلوس»... بل «وش القيمة اللي نحس إننا ما أخذناها»؟",
  },
  {
    match: /زحمة|سيارة|طريق|مواصلات|قيادة|شارع/,
    shift: "وش لو ما حاولنا نقلّل الزحمة... بل نخلي وقت الزحمة نفسه يسوّي لك شي؟",
  },
  {
    match: /جوال|تطبيق|شاشة|اشعار|نوتفكيشن|سوشال/,
    shift: "وش لو المشكلة مو التطبيق... بل اللحظة اللي نفتحه فيها بدون ما ننتبه؟",
  },
  {
    match: /نوم|صباح|استيقاظ|متأخر|تعب|كسل/,
    shift: "وش لو المشكلة مو الصباح... بل القرار اللي اتخذناه الليلة قبل؟",
  },
  {
    match: /شغل|عمل|وظيفة|مدير|اجتماع|دوام/,
    shift: "وش لو المشكلة مو كمية الشغل... بل إننا ما نشوف أثره؟",
  },
];

const REACTIONS: Record<AiReactionKind, string[]> = {
  reflection: [
    "حلو 👀 ما توقعت تروح لهالزاوية.",
    "interesting... خذتها لمكان ما كان ببالي.",
    "أها، واضح إنك شفت الصورة بطريقتك.",
  ],
  challenge: [
    "حلو... بس خلنا نقلبها شوي 👀",
    "طيب، لو افترضنا العكس تمامًا؟",
    "زين. بس خلنا نضغط عليها شوي.",
  ],
  observation: [
    "لاحظت إنك ركّزت على شي معين أكثر من غيره.",
    "أحسك تميل تشوف الأشياء من جهة الناس، مو الأدوات.",
    "واضح إنك تحب تبدأ من التفاصيل الصغيرة.",
  ],
  expansion: [
    "فيه زاوية ثانية هنا نقدر نكبّرها...",
    "خذ الفكرة ذي وكبّرها خطوة.",
    "هني بالضبط يبدأ الشي الحلو.",
  ],
  question: [
    "وش اللي خلاك تختار هالحل بالذات؟",
    "ليه حسيت إن هذي هي المشكلة؟",
    "لو رجعنا خطوة... وش أول شي لاحظته؟",
  ],
  surprise: [
    "الغريب إن أضعف جزء في فكرتك يمكن يكون أقواها 👀",
    "أوه... من جد ما كنت شايفها كذا.",
    "خذها هدية: أحيانًا الجواب يختبئ في السؤال نفسه.",
  ],
};

const REWARDS = [
  "خلاص، مخك أخذ لفة اليوم 😄",
  "حلوة هذي. خلّيناها في جيبك 🎒",
  "لفّة نظيفة. عندي لك أغرب المرة الجاية 👀",
  "زين. الشي اللي سويته الحين اسمه: تقلّب زوايا.",
];

const NEXT_BY_TYPE: Record<ChallengeType, ChallengeType> = {
  perspective_shift: "problem_reframing",
  observation: "rapid_ideation",
  rapid_ideation: "worst_idea",
  reverse_thinking: "idea_development",
  worst_idea: "perspective_shift",
  role_switching: "problem_reframing",
  problem_reframing: "rapid_ideation",
  idea_development: "reverse_thinking",
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export class MockAIProvider implements AIProvider {
  async analyzeResponse(
    input: AnalyzeResponseInput
  ): Promise<AnalyzeResponseOutput> {
    await sleep(650 + Math.random() * 500); // feel a touch of "thinking"
    const { challenge, response } = input;
    const text = response.trim();

    // Choose a reaction kind that fits the challenge type.
    const kindByType: Record<ChallengeType, AiReactionKind> = {
      perspective_shift: "challenge",
      observation: "observation",
      rapid_ideation: "expansion",
      reverse_thinking: "surprise",
      worst_idea: "surprise",
      role_switching: "observation",
      problem_reframing: "question",
      idea_development: "expansion",
    };
    const kind = kindByType[challenge.type];

    // Find a hidden lens from the user's own words → the "oh!" shift.
    const lens = LENSES.find((l) => l.match.test(text));
    const perspectiveShift =
      lens?.shift ??
      challenge.followUp?.prompt ??
      "طيب... لو المشكلة مو هني أصلًا؟ وين ممكن تكون؟";

    const signals = deriveSignals(challenge.type, text);

    return {
      reaction: pick(REACTIONS[kind], text || challenge.id),
      kind,
      observation: pick(REACTIONS.observation, text + challenge.id),
      perspectiveShift,
      followUpQuestion:
        challenge.followUp?.prompt ?? "وش أول خطوة صغيرة ممكن نجربها؟",
      suggestedTraitSignals: signals,
      nextChallengeType: NEXT_BY_TYPE[challenge.type],
    };
  }

  async generateFollowUp(input: FollowUpInput): Promise<FollowUpOutput> {
    await sleep(500 + Math.random() * 400);
    return {
      reaction: pick(REACTIONS.surprise, input.followUpResponse || input.challenge.id),
      reward: input.challenge.reward ?? pick(REWARDS, input.challenge.id),
    };
  }

  async developIdea(input: DevelopIdeaInput): Promise<DevelopIdeaOutput> {
    await sleep(550 + Math.random() * 400);
    const flow: Record<
      DevelopIdeaInput["step"],
      { reaction: string; next?: string }
    > = {
      idea: {
        reaction: "تمام، هذي بداية. خلنا نفهمها أكثر.",
        next: "وش اللي خلاك تفكر فيها أصلًا؟",
      },
      why: {
        reaction: "حلو، فيه سبب حقيقي وراها.",
        next: "مين أكثر واحد ممكن يستفيد منها؟",
      },
      target: {
        reaction: "زين، صار عندنا وجه واضح.",
        next: "وش المشكلة اللي تحاول تحلها له بالضبط؟",
      },
      problem: {
        reaction: "أها، هني بيت القصيد.",
        next: "لو بنجربها بكرة، وش أبسط نسخة ممكن نسويها؟",
      },
      experiment: {
        reaction: "ممتاز، صرنا قريبين من تجربة حقيقية.",
        next: "وش الشي اللي لازم نتأكد منه قبل ما نبنيها؟",
      },
      assumption: {
        reaction: "تمام. عرفنا أكبر افتراض لازم نختبره. صارت فكرة تمشي 🚀",
      },
    };
    const step = flow[input.step];
    return { reaction: step.reaction, nextQuestion: step.next };
  }
}

function deriveSignals(type: ChallengeType, text: string): BehavioralSignal[] {
  const base: Record<ChallengeType, BehavioralSignal[]> = {
    perspective_shift: ["perspective_shift"],
    observation: ["observation"],
    rapid_ideation: ["idea_generation"],
    reverse_thinking: ["risk_taking", "problem_reframing"],
    worst_idea: ["risk_taking"],
    role_switching: ["perspective_shift", "observation"],
    problem_reframing: ["problem_reframing"],
    idea_development: ["idea_development"],
  };
  const signals = [...base[type]];
  // Reward length/effort lightly as "exploration".
  if (text.length > 60 && !signals.includes("exploration")) {
    signals.push("exploration");
  }
  // Multiple ideas (commas / "و" / newlines) → idea generation.
  if (/[,،\n]|(^|\s)و/.test(text) && !signals.includes("idea_generation")) {
    signals.push("idea_generation");
  }
  return signals;
}
