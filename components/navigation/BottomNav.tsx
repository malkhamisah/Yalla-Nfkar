"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Lightbulb, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "الرئيسية", icon: Home },
  { href: "/play", label: "العب", icon: Sparkles, center: true },
  { href: "/ideas", label: "أفكاري", icon: Lightbulb },
  { href: "/profile", label: "أنا", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 mt-auto">
      <div className="mx-auto max-w-[440px] px-4 pb-4">
        <div className="surface flex items-center justify-around rounded-3xl px-2 py-2">
          {items.map(({ href, label, icon: Icon, center }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs font-semibold transition-colors",
                  center && "relative"
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
                    center
                      ? active
                        ? "bg-brand text-white shadow-lift -translate-y-3 scale-110"
                        : "bg-brand text-white shadow-lift -translate-y-3"
                      : active
                        ? "bg-brand-soft text-brand"
                        : "text-muted"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <span
                  className={cn(
                    active ? "text-ink" : "text-muted",
                    center && "sr-only"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
