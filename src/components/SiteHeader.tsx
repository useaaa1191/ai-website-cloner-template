"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRightIcon,
  CloseIcon,
  ForwardMark,
  MenuIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/home";

interface SiteHeaderProps {
  nav: NavItem[];
}

export function SiteHeader({ nav }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 h-[var(--header-h)] w-full border-b border-transparent bg-white/92 backdrop-blur-xl">
      <div className="ff-container flex h-full items-center gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-black"
          aria-label="Forward Foundation home"
        >
          <ForwardMark className="size-7" />
          <span className="hidden text-[15px] font-semibold tracking-[-0.02em] sm:inline">
            Forward Foundation
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] sm:hidden">
            Forward
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-3 py-2 text-[14px] font-medium leading-none text-black transition-colors hover:bg-black/[0.05]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="mailto:info@forwardfnd.org?subject=Forward%20Foundation%20access"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-4 text-[13px] font-medium leading-none text-white transition hover:bg-black/80 sm:px-5 sm:text-[14px]"
          >
            Ask about access
            <ArrowUpRightIcon className="size-3" />
          </a>
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            className="inline-flex size-9 items-center justify-center rounded-full text-black transition hover:bg-black/[0.05] lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 top-[var(--header-h)] bottom-0 border-t border-black/10 bg-white lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <nav className="ff-container flex flex-col py-5" aria-label="Mobile navigation">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="border-b border-black/10 py-5 text-[24px] font-medium leading-none tracking-[-0.03em]"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-auto pt-8 text-[14px] leading-relaxed text-black/55">
            <p>Free, human-confirmed decision support.</p>
            <p>Sacramento, California.</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
