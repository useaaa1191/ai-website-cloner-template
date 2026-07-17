"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ExternalArrowIcon,
  MenuIcon,
  OpenAILogo,
  SearchIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/home";

interface SiteHeaderProps {
  nav: NavItem[];
}

export function SiteHeader({ nav }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-[var(--header-h)] w-full bg-white transition-[border-color] duration-150",
        scrolled ? "border-b border-oai-border" : "border-b border-transparent"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md"
      >
        Skip to main content
      </a>
      <div className="oai-container flex h-full items-center gap-5">
        <Link href="/" className="shrink-0 text-black" aria-label="OpenAI">
          <OpenAILogo className="h-[17px] w-auto" />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[14px] font-medium leading-none text-black transition-colors hover:bg-oai-pill"
            >
              {item.label}
              {item.external ? (
                <ExternalArrowIcon className="h-3 w-3 -translate-y-px" />
              ) : null}
            </Link>
          ))}
          <button
            type="button"
            aria-label="Open Search"
            className="ml-1 inline-flex size-9 items-center justify-center rounded-full text-black transition-colors hover:bg-oai-pill"
          >
            <SearchIcon className="size-4" />
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 items-center gap-1 rounded-full bg-oai-pill px-5 text-[14px] font-medium leading-none text-black transition-colors hover:bg-oai-pill-hover sm:inline-flex"
          >
            Log in
            <ChevronDownIcon className="size-3.5" />
          </button>
          <a
            href="https://chatgpt.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1 rounded-full bg-black px-5 text-[14px] font-medium leading-none text-white transition-opacity hover:opacity-85"
          >
            Try ChatGPT
            <ExternalArrowIcon className="h-3 w-3 -translate-y-px" />
          </a>
          <button
            type="button"
            aria-label="Open mobile navigation"
            className="inline-flex size-9 items-center justify-center rounded-full text-black lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <MenuIcon className="size-5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-x-0 top-[var(--header-h)] border-b border-oai-border bg-white lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav className="oai-container flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="rounded-lg px-3 py-3 text-[16px] font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
