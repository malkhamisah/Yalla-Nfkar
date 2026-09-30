import type { ReactNode } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { cn } from "@/lib/utils";

// Keeps the real-app feel on every screen size. On desktop it stays a tall,
// centered app column — it never becomes a dashboard.
export function AppShell({
  children,
  nav = true,
  className,
}: {
  children: ReactNode;
  nav?: boolean;
  className?: string;
}) {
  return (
    <div className="app-bg flex min-h-[100dvh] flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[440px] flex-1 flex-col px-5 pt-6",
          nav ? "pb-2" : "pb-6",
          className
        )}
      >
        {children}
      </div>
      {nav && <BottomNav />}
    </div>
  );
}
