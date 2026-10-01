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
// It never grades correctness, never labels personality, never scores.
// Output is deterministic (seeded) so behavior is reproducible.
// Variety comes from (a) wide phrase pools, (b) seeds mixed from the
// answer + challenge, and (c) light features read from the answer itself.
// ─────────────────────────────────────────────────────────────

// Deterministic, stable hash → index. Same inputs ⇒ same choice.
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: string): T {
  return arr[hash(seed) % arr.length];
}

// Keyword lens: when the user's own words hit a theme, we mirror it in the
// reaction + observation and twist it in the shift → the "أوه!" moment.
interface Lens {
  match: RegExp;
  reaction: string;
  observation: string;
  shift: string;
}

const LENSES: Lens[] = [
  {
    match: /وقت|ساعة|دقيقة|انتظار|طابور|بطيء|تأخر|تأخير/,
    reaction: "آها، حسّيت إن الوقت هو اللي يضايق فعلًا 👀",
    observation: "لاحظت إنك ركّزت على الوقت أكثر من المكان نفسه.",
    shift: "وش لو المشكلة مو الوقت نفسه... بل إحساسنا إن الوقت راح على الفاضي؟",
  },
  {
    match: /زحمة|سيارة|طريق|مواصلات|قيادة|شارع|مرور/,
    reaction: "زين، أمسكت شي كلنا نعاني منه.",
    observation: "واضح إنك تشوف المشكلة في الطريق نفسه، مو في طريقة استخدامه.",
    shift: "وش لو ما حاولنا نقلّل الزحمة... بل نخلي وقتها نفسه يسوّي لك شي؟",
  },
  {
    match: /فلوس|مال|سعر|غالي|رخيص|تكلفة|ميزانية|مصروف/,
    reaction: "حلو، جبت زاوية الفلوس — وهذي يحبها الناس.",
    observation: "حسّيتك تقيس الأشياء بالتكلفة، وهذا مدخل قوي.",
    shift: "وش لو السؤال مو «كيف نوفّر»... بل «وش القيمة اللي نحس إننا ما أخذناها»؟",
  },
  {
    match: /جوال|تطبيق|شاشة|اشعار|إشعار|نوتفكيشن|سوشال|تواصل/,
    reaction: "آها، رحت للجوال على طول — وهذا واقعنا.",
    observation: "تركيزك على الأداة نفسها، مو على اللحظة اللي نستخدمها فيها.",
    shift: "وش لو المشكلة مو التطبيق... بل اللحظة اللي نفتحه فيها بدون ما ننتبه؟",
  },
  {
    match: /نوم|صباح|استيقاظ|متأخر|تعب|كسل|نشاط/,
    reaction: "تمام، الصباح معركة للكل 😅",
    observation: "لاحظت إنك ربطتها بالصباح، بس يمكن الجذر أبعد.",
    shift: "وش لو المشكلة مو الصباح... بل القرار اللي اتخذناه الليلة قبل؟",
  },
  {
    match: /شغل|عمل|وظيفة|مدير|اجتماع|دوام|مهمة|مهام/,
    reaction: "زين، نقلتها لجو الشغل — فيه كنز مشاكل هناك.",
    observation: "حسّيتك تقيس الشغل بالكمية، مو بالأثر.",
    shift: "وش لو المشكلة مو كمية الشغل... بل إننا ما نشوف أثره؟",
  },
  {
    match: /دراسة|مذاكرة|اختبار|جامعة|مدرسة|محاضرة|درجات/,
    reaction: "آها، جو الدراسة — كلنا مرينا فيه.",
    observation: "تركيزك على النتيجة، بس يمكن الحكاية في الطريقة.",
    shift: "وش لو المشكلة مو المذاكرة... بل إننا نحفظ بدل ما نفهم ليش؟",
  },
  {
    match: /أكل|طعام|مطعم|طبخ|وجبة|قهوة|كافيه/,
    reaction: "حلو، أخذتها لجو الأكل — جو قريب للقلب 😋",
    observation: "لاحظت إنك بدأت من التجربة نفسها، مو من الطلب.",
    shift: "وش لو ما غيّرنا الأكل... بل غيّرنا اللحظة اللي ناكل فيها؟",
  },
];

// ── Perspective-shift builder ─────────────────────────────────
// Makes the "change your angle" move concrete and tied to the user's own
// answer: reflect what they said, explain that we change the ASSUMPTION /
// the path (not reverse their words), show a short example, then hand it back.
// Deterministic. No trait claims.

function shorten(s: string, n: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1).trim() + "…" : t;
}

const PS_OPENERS = ["حلو 👀", "تمام 👌", "زين،", "حلوة،"];

// The ask that returns agency to the user (easy to answer).
const PERSPECTIVE_ASK = "وش ممكن تضيف للفكرة؟";

// Generic move — used when no theme matches. Explicitly not "reverse words".
const GENERIC_PS_SHIFT =
  "قلب المنظور مو إننا نعكس كلامك حرفيًا... بل نغيّر الافتراض نفسه. بدل ما نسأل «كيف نوصل لها بالطريقة المعتادة»، وش لو سألنا «وش أهم نتيجة نبيها، ونقدر نوصل لها بطريق ثاني»؟";
const GENERIC_PS_EXAMPLE =
  "مثلاً: لو الفكرة تحتاج شي كبير، فكّر بأصغر نسخة تعطيك نفس النتيجة.";

interface PsLens {
  match: RegExp;
  shift: string;
  example: string;
}

const PS_LENSES: PsLens[] = [
  {
    match: /حديقة|نبات|أخضر|خضرة|خضرا|زرع|شجر|ورد|بلكون|طبيعة/,
    shift:
      "خلنا نغيّر طريقة الوصول: بدل ما نفكر كيف نضيف حديقة كبيرة... وش لو خلّينا المكان يعطيك إحساس الحديقة حتى بمساحة صغيرة؟",
    example: "مثلاً: زاوية خضرا صغيرة، أو نباتات معلّقة، أو ركن تقعد فيه الصبح.",
  },
  {
    match: /انتظار|طابور|دور|ننتظر|استنى|استنّى/,
    shift:
      "بدل ما نحاول نقصّر الانتظار... وش لو غيّرنا تجربة الانتظار نفسها؟",
    example: "مثلاً: شي يشغل بالك، أو إحساس واضح إن دورك قرّب.",
  },
  {
    match: /وقت|زحمة|سيارة|طريق|مرور|تأخر|ساعة|دقيقة|بطيء/,
    shift:
      "بدل ما نحاول نقلّل الوقت أو الزحمة نفسها... وش لو غيّرنا إحساسنا بالوقت وهو يمر؟",
    example: "مثلاً: نخلي وقت الطريق نفسه يسوّي لك شي تستمتع فيه.",
  },
  {
    match: /فلوس|مال|سعر|غالي|رخيص|تكلفة|مصروف|ميزانية/,
    shift:
      "بدل ما نسأل كيف نوفّر أو نصرف أقل... وش لو سألنا وش القيمة اللي نبي نحس فيها فعلًا؟",
    example: "مثلاً: تجربة وحدة تستاهل، بدل كم شي صغير ما نحس فيه.",
  },
  {
    match: /جوال|تطبيق|شاشة|اشعار|إشعار|نوتفكيشن|سوشال/,
    shift:
      "بدل ما نغيّر التطبيق نفسه... وش لو غيّرنا اللحظة اللي نفتحه فيها؟",
    example: "مثلاً: نخلي فتحه يحتاج خطوة بسيطة زيادة، فننتبه.",
  },
  {
    match: /نوم|صباح|استيقاظ|متأخر|تعب|كسل|نشاط/,
    shift:
      "بدل ما نصلّح الصباح نفسه... وش لو بدينا من قرار الليلة اللي قبله؟",
    example: "مثلاً: شي صغير نجهّزه بالليل يخلي الصباح أسهل.",
  },
  {
    match: /شغل|عمل|وظيفة|مدير|دوام|مهمة|مهام|دراسة|مذاكرة|اختبار|جامعة/,
    shift:
      "بدل ما نسأل كيف ننجز أكثر... وش لو سألنا كيف نشوف أثر اللي ننجزه؟",
    example: "مثلاً: نهاية كل يوم، نكتب شي واحد تحرّك للأمام.",
  },
  {
    match: /أكل|طعام|مطعم|طبخ|وجبة|قهوة|كافيه/,
    shift:
      "بدل ما نغيّر الأكل نفسه... وش لو غيّرنا اللحظة اللي ناكل فيها؟",
    example: "مثلاً: نخلي وجبة وحدة باليوم لها طقس هادئ خاص.",
  },
];

function buildPerspective(text: string): {
  reaction: string;
  shift: string;
  example: string;
} {
  const snip = shorten(text, 40) || "فكرتك";
  const lens = PS_LENSES.find((l) => l.match.test(text));
  const opener = pick(PS_OPENERS, "po|" + text);
  return {
    reaction: `${opener} «${snip}» — خلنا نشوفها من زاوية ثانية.`,
    shift: lens?.shift ?? GENERIC_PS_SHIFT,
    example: lens?.example ?? GENERIC_PS_EXAMPLE,
  };
}

// Reaction pools by tone. Kept wide so repeats are rare across a session.
const REACTIONS: Record<AiReactionKind, string[]> = {
  reflection: [
    "حلو 👀 ما توقعت تروح لهالزاوية.",
    "interesting... خذتها لمكان ما كان ببالي.",
    "أها، واضح إنك شفت الصورة بطريقتك.",
    "طيب، هذي بداية فيها شي.",
    "زين، فتحت لي باب ما كان مفتوح.",
  ],
  challenge: [
    "حلو... بس خلنا نقلبها شوي 👀",
    "طيب، لو افترضنا العكس تمامًا؟",
    "زين. بس خلنا نضغط عليها شوي.",
    "تمام، الحين خلنا نكسرها شوي.",
    "حلوة، بس عندي لها لفة ثانية.",
  ],
  observation: [
    "لاحظت شي بطريقة جوابك...",
    "حسّيت إن فيه نمط صغير هنا.",
    "واضح إن لك أسلوب في اللف.",
    "فيه تفصيلة في كلامك شدّتني.",
    "خلّني أقول لك شي لاحظته...",
  ],
  expansion: [
    "فيه زاوية ثانية هنا نقدر نكبّرها...",
    "خذ الفكرة ذي وكبّرها خطوة.",
    "هني بالضبط يبدأ الشي الحلو.",
    "طيب، نشدّها شوي لفوق؟",
    "حلو، فيها بذرة تستاهل نكبّرها.",
  ],
  question: [
    "وش اللي خلاك تختار هالحل بالذات؟",
    "ليه حسيت إن هذي هي المشكلة؟",
    "لو رجعنا خطوة... وش أول شي لاحظته؟",
    "وش الشي اللي افترضناه بدون ما ننتبه؟",
    "طيب، ومن وين جتك الفكرة أصلًا؟",
  ],
  surprise: [
    "الغريب إن أضعف جزء في فكرتك يمكن يكون أقواها 👀",
    "أوه... من جد ما كنت شايفها كذا.",
    "خذها هدية: أحيانًا الجواب يختبئ في السؤال نفسه.",
    "الطريف إن عكس فكرتك فيه حل ثاني.",
    "لحظة... هني طلع شي ما توقعناه.",
  ],
};

// Per-type observation pools (used when no lens/feature applies).
const OBSERVATIONS_BY_TYPE: Record<ChallengeType, string[]> = {
  perspective_shift: [
    "حسّيتك تحب تقلب الأشياء بدل ما تاخذها كما هي.",
    "واضح إنك ما تكتفي بأول زاوية.",
  ],
  observation: [
    "عينك تمسك التفاصيل الصغيرة اللي الناس تعديها.",
    "لاحظت إنك تبدأ من اللي حولك مباشرة.",
  ],
  rapid_ideation: [
    "فتحت أكثر من باب بسرعة، وهذا بحد ذاته مهارة.",
    "حسّيتك ما توقفت عند أول فكرة.",
  ],
  reverse_thinking: [
    "جرّبت تمشي عكس السير، وهذا اللي يطلع أشياء جديدة.",
    "ما خفت تاخذها لأسوأ اتجاه، وهني الفايدة.",
  ],
  worst_idea: [
    "رميت فكرة جريئة بدون فلترة، وهذا مطلوب هنا.",
    "حسّيتك استمتعت تطلّع الأسوأ 😄",
  ],
  role_switching: [
    "لبست دور ثاني وشفت من عيونه، حلو.",
    "لاحظت إنك قدرت تطلع من نظرتك أنت.",
  ],
  problem_reframing: [
    "حسّيتك تبي تتأكد إننا نحل المشكلة الصح.",
    "ما أخذت المشكلة كما وصلتك، وهذا ذكي.",
  ],
  idea_development: [
    "حسّيتك تحب تاخذ الفكرة وتشتغل عليها لين تكبر.",
    "لاحظت إنك تفكر كيف تبسّطها، مو بس تكبّرها.",
  ],
};

// Fallback angle prompts if a challenge has no written follow-up.
const GENERIC_SHIFTS = [
  "طيب... لو المشكلة مو هني أصلًا؟ وين ممكن تكون؟",
  "وش لو قلبناها رأسًا على عقب؟",
  "لو شخص ما يعرف شي عن الموضوع، وش بيسأل؟",
];

const FOLLOWUP_REACTIONS = [
  "حلوة، كمّلتها صح 👌",
  "زين، صارت أوضح الحين.",
  "تمام، هني بدت الفكرة تاخذ شكل.",
  "آها، هذي الإضافة غيّرت الصورة.",
  "ممتاز، بنيت فوق اللي قبله.",
];

const SHORT_FOLLOWUP_REACTIONS = [
  "ولو بكلمة... وصلت الفكرة 👌",
  "مختصرة بس فيها معنى.",
  "تمام، فهمت قصدك.",
];

const REWARDS = [
  "خلاص، مخك أخذ لفة اليوم 😄",
  "حلوة هذي. خلّيناها في جيبك 🎒",
  "لفّة نظيفة. عندي لك أغرب المرة الجاية 👀",
  "زين. الشي اللي سويته الحين اسمه: تقلّب زوايا.",
  "تمام، سجّلنا لك نقطة فضول 🌱",
  "حلو، هذا النوع من التفكير يكبر مع التكرار.",
];

// After a given challenge type, which type tends to pair well next.
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

const KIND_BY_TYPE: Record<ChallengeType, AiReactionKind> = {
  perspective_shift: "challenge",
  observation: "observation",
  rapid_ideation: "expansion",
  reverse_thinking: "surprise",
  worst_idea: "surprise",
  role_switching: "observation",
  problem_reframing: "question",
  idea_development: "expansion",
};

// Challenges whose twist is intrinsic → keep the shift tied to the challenge,
// not to a keyword lens (so it never derails the exercise).
const INTRINSIC_TWIST = new Set<ChallengeType>([
  "worst_idea",
  "reverse_thinking",
  "idea_development",
  "rapid_ideation",
]);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface Features {
  wordCount: number;
  isShort: boolean;
  hasMultiple: boolean;
  isQuestion: boolean;
}

function readFeatures(text: string): Features {
  const words = text.split(/\s+/).filter(Boolean);
  return {
    wordCount: words.length,
    isShort: words.length > 0 && words.length <= 3,
    hasMultiple:
      /[,،\n]/.test(text) || /(^|\s)(و|ثم|بعدين|أو|كمان)\s/.test(text) ||
      words.length >= 9,
    isQuestion: /[؟?]/.test(text),
  };
}

export class MockAIProvider implements AIProvider {
  async analyzeResponse(
    input: AnalyzeResponseInput
  ): Promise<AnalyzeResponseOutput> {
    await sleep(600 + Math.random() * 450); // a touch of "thinking" (timing only)
    const { challenge, response } = input;
    const text = response.trim();

    const kind = KIND_BY_TYPE[challenge.type];
    const f = readFeatures(text);

    // Guided, grounded flow for the perspective-shift challenge: make the move
    // concrete and tied to the user's own words, clarify that we change the
    // assumption (not reverse words), show one example, then hand it back.
    // No personality/trait claims here.
    if (challenge.type === "perspective_shift") {
      const p = buildPerspective(text);
      return {
        reaction: p.reaction,
        kind,
        observation: "",
        perspectiveShift: p.shift,
        shiftExample: p.example,
        followUpQuestion: PERSPECTIVE_ASK,
        suggestedTraitSignals: deriveSignals(challenge.type, text, f),
        nextChallengeType: NEXT_BY_TYPE[challenge.type],
      };
    }

    const lens = LENSES.find((l) => l.match.test(text));

    // Distinct seeds per field so reaction/observation never echo each other,
    // and so consecutive challenges (different id) diverge.
    const base = `${challenge.id}|${text}`;

    // Reaction: mirror the theme when a lens matched, else a varied in-voice line.
    const reaction = lens
      ? lens.reaction
      : pick(REACTIONS[kind], "r|" + base);

    // Observation: connected to the answer where possible — never a label/score.
    let observation: string;
    if (lens) {
      observation = lens.observation;
    } else if (f.hasMultiple) {
      observation = "لاحظت إنك فتحت أكثر من باب بسرعة.";
    } else if (f.isShort) {
      observation = "وصلتها بأقل كلام، وهذا بحد ذاته مهارة.";
    } else if (f.isQuestion) {
      observation = "حلو إنك رجّعتها سؤال بدل ما تسكّرها بجواب.";
    } else {
      observation = pick(OBSERVATIONS_BY_TYPE[challenge.type], "o|" + base);
    }

    // Perspective shift: stay relevant to the challenge; use the lens only for
    // "angle" challenges, never for ones with an intrinsic twist.
    let perspectiveShift: string;
    if (INTRINSIC_TWIST.has(challenge.type)) {
      perspectiveShift =
        challenge.followUp?.prompt ?? pick(GENERIC_SHIFTS, "s|" + base);
    } else {
      perspectiveShift =
        lens?.shift ??
        challenge.followUp?.prompt ??
        pick(GENERIC_SHIFTS, "s|" + base);
    }

    return {
      reaction,
      kind,
      observation,
      perspectiveShift,
      followUpQuestion:
        challenge.followUp?.prompt ?? "وش أول خطوة صغيرة ممكن نجربها؟",
      suggestedTraitSignals: deriveSignals(challenge.type, text, f),
      nextChallengeType: NEXT_BY_TYPE[challenge.type],
    };
  }

  async generateFollowUp(input: FollowUpInput): Promise<FollowUpOutput> {
    await sleep(450 + Math.random() * 350);
    const fu = input.followUpResponse.trim();
    const seed = `${input.challenge.id}|${fu}`;
    const reaction =
      fu.split(/\s+/).filter(Boolean).length <= 3
        ? pick(SHORT_FOLLOWUP_REACTIONS, "fs|" + seed)
        : pick(FOLLOWUP_REACTIONS, "f|" + seed);
    return {
      reaction,
      reward: input.challenge.reward ?? pick(REWARDS, "rw|" + seed),
    };
  }

  async developIdea(input: DevelopIdeaInput): Promise<DevelopIdeaOutput> {
    await sleep(500 + Math.random() * 350);
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

function deriveSignals(
  type: ChallengeType,
  text: string,
  f: Features
): BehavioralSignal[] {
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
  if (text.length > 60 && !signals.includes("exploration")) {
    signals.push("exploration");
  }
  if (f.hasMultiple && !signals.includes("idea_generation")) {
    signals.push("idea_generation");
  }
  return signals;
}
