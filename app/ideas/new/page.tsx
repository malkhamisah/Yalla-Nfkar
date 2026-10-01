"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { IdeaChat } from "@/components/idea/IdeaChat";
import { saveIdea } from "@/services/store";
import { track } from "@/lib/analytics";
import type { Idea } from "@/types";

function NewIdeaInner() {
  const router = useRouter();
  const search = useSearchParams();
  const theme = search.get("theme") ?? undefined;

  useEffect(() => {
    track("idea_started", { theme });
  }, [theme]);

  function handleFinish(idea: Idea) {
    saveIdea(idea);
    track("idea_completed", { ideaId: idea.id });
    router.push(`/ideas/${idea.id}`);
  }

  return (
    <AppShell nav={false}>
      <div className="flex items-center justify-between pb-3">
        <div>
          <p className="text-sm text-muted">وضع الفكرة</p>
          <h1 className="text-2xl font-extrabold">خلّنا نطوّرها سوا 🌱</h1>
        </div>
        <Link
          href="/home"
          aria-label="إغلاق"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-muted shadow-card"
        >
          <X className="h-5 w-5" />
        </Link>
      </div>
      <IdeaChat seedTheme={theme} onFinish={handleFinish} />
    </AppShell>
  );
}

export default function NewIdeaPage() {
  return (
    <Suspense fallback={<AppShell nav={false}>...</AppShell>}>
      <NewIdeaInner />
    </Suspense>
  );
}
