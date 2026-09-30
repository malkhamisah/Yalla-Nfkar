import Link from "next/link";
import { Sparkles, Eye, Lightbulb, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { LandingDemo } from "@/components/landing/LandingDemo";

export default function LandingPage() {
  return (
    <div className="app-bg min-h-[100dvh]">
      <div className="mx-auto w-full max-w-[440px] px-5 py-8">
        {/* Hero */}
        <Reveal>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-brand shadow-card">
            <Sparkles className="h-4 w-4" />
            يلا نفكر
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="text-[40px] font-extrabold leading-[1.15] tracking-tight">
            مو لازم تكون
            <br />
            عندك فكرة.
            <br />
            <span className="text-brand">نبدأ سوا.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            ألعاب قصيرة تخليك تشوف الأشياء من زاوية ثانية. دقيقتين بس... وبتطلع
            بشي ما كنت شايفه.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/onboarding">
              <Button className="w-full text-lg">
                يلا نجرب
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/ideas/new">
              <Button variant="secondary" className="w-full">
                وش الفكرة؟
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* Live example */}
        <Reveal delay={0.24}>
          <div className="mt-10">
            <LandingDemo />
          </div>
        </Reveal>

        {/* How it works */}
        <Reveal delay={0.05}>
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-extrabold">كيف تمشي؟</h2>
            <div className="flex flex-col gap-3">
              <Step
                icon={<Sparkles className="h-5 w-5" />}
                title="تحدي صغير"
                body="سؤال خفيف ما له إجابة صح ولا غلط."
              />
              <Step
                icon={<Eye className="h-5 w-5" />}
                title="لحظة «أوه!»"
                body="نقلب السؤال ونوريك زاوية ما كانت ببالك."
              />
              <Step
                icon={<Lightbulb className="h-5 w-5" />}
                title="فكرة تكبر"
                body="لو طلع موضوع يستاهل... نحوّله فكرة فعلية."
              />
            </div>
          </div>
        </Reveal>

        {/* Why it feels different */}
        <Reveal delay={0.05}>
          <div className="surface mt-10 bg-brand p-6 text-white shadow-lift">
            <h2 className="text-2xl font-extrabold">ليه يحس مختلف؟</h2>
            <ul className="mt-3 space-y-2 text-[17px] leading-relaxed text-white/90">
              <li>• ما فيه اختبار، ولا درجات، ولا «نوع شخصيتك».</li>
              <li>• ما نحكم على إجابتك — نبني عليها.</li>
              <li>• الجلسة دقيقتين، وتطلع بابتسامة وفكرة.</li>
            </ul>
          </div>
        </Reveal>

        {/* Final CTA */}
        <Reveal delay={0.05}>
          <div className="mt-10 mb-6 text-center">
            <p className="text-xl font-bold">جاهز تاخذ لفة؟</p>
            <Link href="/onboarding" className="mt-3 block">
              <Button className="w-full text-lg">يلا نبدأ</Button>
            </Link>
            <p className="mt-4 text-sm text-muted">
              بدون تسجيل. بدون التزام. بس فضول.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function Step({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="surface flex items-start gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        {icon}
      </span>
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-muted">{body}</p>
      </div>
    </div>
  );
}
