"use client";

import { useEffect, useState } from "react";
import { SendUpIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { HeroChip } from "@/types/home";

interface HeroSectionProps {
  title: string;
  placeholder: string;
  rotatingPrompts: string[];
  chips: HeroChip[];
  moreChip: HeroChip;
}

export function HeroSection({
  title,
  placeholder,
  rotatingPrompts,
  chips,
  moreChip,
}: HeroSectionProps) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [value, setValue] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (value) return;
    const id = window.setInterval(() => {
      setPromptIndex((i) => (i + 1) % rotatingPrompts.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [rotatingPrompts.length, value]);

  const displayPlaceholder = value
    ? ""
    : rotatingPrompts[promptIndex] || placeholder;

  const visibleChips = expanded ? [...chips, moreChip] : chips.slice(0, 4);

  function submitPrompt() {
    const q = value.trim() || rotatingPrompts[promptIndex];
    const url = `https://chatgpt.com/?q=${encodeURIComponent(q)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="relative -mb-8 flex h-[calc(100svh-var(--header-h)-11rem)] min-h-[380px] max-h-[640px] flex-col items-center justify-center px-6 pb-4 pt-2 md:px-8">
      <div className="flex w-full max-w-[720px] flex-col items-center">
        <h1 className="mb-6 text-center text-[28px] font-semibold leading-[34px] tracking-[0.3px] text-black">
          {title}
        </h1>

        <form
          className="relative w-full"
          onSubmit={(e) => {
            e.preventDefault();
            submitPrompt();
          }}
        >
          <div className="flex min-h-[56px] items-center rounded-full border border-oai-border bg-white px-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition focus-within:border-black/30">
            <label className="sr-only" htmlFor="chatgpt-prompt">
              {placeholder}
            </label>
            <input
              id="chatgpt-prompt"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={displayPlaceholder}
              className="w-full bg-transparent py-3 text-[16px] font-normal text-black outline-none placeholder:text-black/40"
            />
            <button
              type="submit"
              aria-label="Send prompt to ChatGPT"
              className="ml-2 flex size-9 shrink-0 items-center justify-center rounded-full bg-oai-pill text-black transition hover:bg-oai-pill-hover"
            >
              <SendUpIcon className="size-5" />
            </button>
          </div>
        </form>

        <div className="mt-5 flex max-w-full flex-wrap items-center justify-center gap-2">
          {visibleChips.map((chip) => (
            <a
              key={chip.label}
              href={chip.href}
              target={chip.external ? "_blank" : undefined}
              rel={chip.external ? "noopener noreferrer" : undefined}
              className="inline-flex h-10 items-center rounded-full border border-oai-border bg-transparent px-3 text-[13px] font-medium leading-none text-black/80 transition hover:bg-oai-pill hover:text-black"
            >
              {chip.label}
            </a>
          ))}
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={cn(
                "inline-flex h-10 items-center rounded-full border border-oai-border bg-transparent px-3 text-[13px] font-medium leading-none text-black/60 transition hover:bg-oai-pill hover:text-black"
              )}
            >
              More
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
