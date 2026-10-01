"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { hasOnboarded } from "@/services/store";

// A clear path back for people who already did onboarding.
// Additive and non-blocking: it never redirects (so the landing stays
// reachable and there are no loops), and it shows nothing for first-time
// visitors or when localStorage is unavailable (hasOnboarded → false).
export function ReturningBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Runs only on the client, after hydration → no SSR mismatch.
    setShow(hasOnboarded());
  }, []);

  if (!show) return null;

  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-3xl border border-line bg-white p-4 shadow-card">
      <div className="min-w-0">
        <p className="font-extrabold">رجعت 👋</p>
        <p className="text-sm text-muted">نكمّل من وين وقفت؟</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/play"
          className="pill bg-action-soft font-bold text-action-deep"
        >
          <Sparkles className="h-4 w-4" />
          العب
        </Link>
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 rounded-2xl bg-brand px-4 py-2.5 text-sm font-bold text-white"
        >
          تابع
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
