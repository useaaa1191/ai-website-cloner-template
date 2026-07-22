"use client";

import { FormEvent, useState } from "react";
import { ArrowUpIcon, CheckIcon, MicIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type RecommendationKind = "home" | "team" | "urgent" | "review";

interface Recommendation {
  kind: RecommendationKind;
  label: string;
  summary: string;
  reasons: string[];
  confidence: string;
}

const examples = [
  "Skipped breakfast and lunch, more withdrawn than baseline.",
  "Sudden slurred speech started 20 minutes ago.",
  "She seemed off, but I can’t explain how.",
] as const;

const recommendations: Record<RecommendationKind, Recommendation> = {
  home: {
    kind: "home",
    label: "Manage at home",
    summary:
      "This sounds close to the baseline you described. Keep observing and note any new change.",
    reasons: ["Within personal baseline", "No urgent red-flag language", "Observation is specific"],
    confidence: "Demo pattern: within baseline",
  },
  team: {
    kind: "team",
    label: "Contact the care team",
    summary:
      "The appetite and withdrawal changes are worth reviewing with the care team, especially because both differ from baseline.",
    reasons: ["Appetite decrease", "More withdrawn than usual", "Two changes from personal baseline"],
    confidence: "Demo pattern: contact care team",
  },
  urgent: {
    kind: "urgent",
    label: "Seek urgent help",
    summary:
      "Sudden slurred speech is treated as urgent red-flag language. Call emergency services now rather than waiting for this tool.",
    reasons: ["Sudden onset", "Stroke-like symptom phrase", "Deterministic crisis route"],
    confidence: "Rule-based urgent route",
  },
  review: {
    kind: "review",
    label: "More context needed",
    summary:
      "I can’t make a careful recommendation from this yet. What changed, when did it start, and how is it different from the usual baseline?",
    reasons: ["Observation is too broad", "No timing provided", "Personal-baseline change is unclear"],
    confidence: "Human review · no guess",
  },
};

const toneClasses: Record<RecommendationKind, { panel: string; pill: string; dot: string }> = {
  home: {
    panel: "border-[#446853]/20 bg-[#eff5ef]",
    pill: "bg-[#dce8dd] text-[#294535]",
    dot: "bg-[#446853]",
  },
  team: {
    panel: "border-[#355c72]/20 bg-[#f0f5f7]",
    pill: "bg-[#dce9ef] text-[#24485d]",
    dot: "bg-[#355c72]",
  },
  urgent: {
    panel: "border-[#9a533d]/20 bg-[#fbf3ef]",
    pill: "bg-[#efddd4] text-[#793b2a]",
    dot: "bg-[#9a533d]",
  },
  review: {
    panel: "border-[#886521]/20 bg-[#fbf7eb]",
    pill: "bg-[#f2e6c8] text-[#6d5119]",
    dot: "bg-[#886521]",
  },
};

function classifyObservation(value: string): RecommendationKind {
  const normalized = value.toLowerCase();
  const urgentTerms = [
    "slurred",
    "chest pain",
    "short of breath",
    "oxygen",
    "cannot bear weight",
    "can't bear weight",
    "fainted",
    "stroke",
  ];
  const homeTerms = ["usual appetite", "calm afternoon", "normal routine", "within baseline"];
  const uncertainTerms = ["seemed off", "not sure", "something is wrong", "can’t explain", "can't explain"];

  if (urgentTerms.some((term) => normalized.includes(term))) return "urgent";
  if (value.trim().length < 24 || uncertainTerms.some((term) => normalized.includes(term))) return "review";
  if (homeTerms.some((term) => normalized.includes(term))) return "home";
  return "team";
}

export function CareDecisionDemo() {
  const [value, setValue] = useState("");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [action, setAction] = useState<"confirmed" | "noted" | null>(null);

  function analyze(observation: string) {
    const trimmed = observation.trim();
    if (!trimmed) return;
    setValue(trimmed);
    setRecommendation(recommendations[classifyObservation(trimmed)]);
    setAction(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    analyze(value);
  }

  function clearResult() {
    setRecommendation(null);
    setAction(null);
  }

  const tone = recommendation ? toneClasses[recommendation.kind] : null;

  return (
    <div id="try-kinsight" className="w-full scroll-mt-28 overflow-hidden rounded-[1.5rem] border border-black/12 bg-[#f7f7f4] shadow-[0_28px_80px_rgba(20,20,15,0.09)] md:rounded-[2rem]">
      <div className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-[#446853]" />
          <span className="text-[13px] font-semibold">KinSight</span>
          <span className="hidden text-[12px] text-black/45 sm:inline">caregiver-controlled demo</span>
        </div>
        <div className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-medium text-black/55">EN · ES</div>
      </div>

      <div className="grid min-h-[520px] lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-b border-black/10 bg-white p-5 md:p-7 lg:border-r lg:border-b-0">
          <p className="ff-kicker text-black/45">Try a scenario</p>
          <h2 className="mt-4 max-w-sm text-[26px] font-medium leading-[1.08] tracking-[-0.035em] md:text-[32px]">
            What changed today?
          </h2>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-black/55">
            Use one of the examples or describe an observation. This demonstration shows the decision pattern, not medical advice.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => analyze(example)}
                className="rounded-xl border border-black/10 bg-white px-3.5 py-3 text-left text-[13px] font-medium leading-snug transition hover:border-black/25 hover:bg-black/[0.02]"
              >
                {example}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5">
            <label htmlFor="care-observation" className="sr-only">Describe a care observation</label>
            <div className="rounded-[1.25rem] border border-black/15 bg-white p-3 shadow-sm focus-within:border-black/30">
              <textarea
                id="care-observation"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Describe what you noticed…"
                rows={3}
                className="w-full resize-none bg-transparent px-1 text-[14px] leading-relaxed outline-none placeholder:text-black/35"
              />
              <div className="mt-2 flex items-center justify-between">
                <button type="button" aria-label="Voice input demonstration" className="flex size-9 items-center justify-center rounded-full text-black/55 transition hover:bg-black/[0.05] hover:text-black">
                  <MicIcon className="size-[18px]" />
                </button>
                <button type="submit" aria-label="Review observation" className="flex size-9 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/80">
                  <ArrowUpIcon className="size-[18px]" />
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="relative flex min-h-[480px] flex-col p-5 md:p-7 lg:p-9" aria-live="polite">
          {!recommendation ? (
            <EmptyState />
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="ff-kicker text-black/45">Reviewable next step</span>
                <button type="button" onClick={clearResult} className="text-[12px] font-medium text-black/50 underline-offset-4 hover:text-black hover:underline">
                  Start over
                </button>
              </div>

              <div className={cn("mt-6 rounded-[1.25rem] border p-5 md:p-6", tone?.panel)}>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={cn("inline-flex rounded-full px-3 py-1.5 text-[12px] font-semibold", tone?.pill)}>{recommendation.label}</span>
                  <span className="text-[11px] font-medium text-black/45">{recommendation.confidence}</span>
                </div>
                <p className="mt-5 max-w-xl text-[19px] font-medium leading-[1.35] tracking-[-0.02em] md:text-[22px]">{recommendation.summary}</p>
              </div>

              <div className="mt-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/45">Why this appeared</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                  {recommendation.reasons.map((reason) => (
                    <li key={reason} className="flex min-h-20 flex-col justify-between rounded-xl border border-black/10 bg-white p-3.5 text-[12px] font-medium leading-snug">
                      <span className={cn("size-2 rounded-full", tone?.dot)} />
                      <span className="mt-3">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-7">
                {action ? (
                  <div className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-[13px] font-medium text-white">
                    <CheckIcon className="size-4" />
                    {action === "confirmed"
                      ? "Recorded as caregiver-confirmed."
                      : "Saved without taking an action."}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button type="button" onClick={() => setAction("confirmed")} className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[13px] font-medium text-white transition hover:bg-black/80">
                      Confirm this path
                    </button>
                    <button type="button" onClick={clearResult} className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 bg-white px-5 text-[13px] font-medium transition hover:bg-black/[0.04]">
                      Change it
                    </button>
                    <button type="button" onClick={() => setAction("noted")} className="inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-medium text-black/55 transition hover:bg-black/[0.04] hover:text-black">
                      Not now
                    </button>
                  </div>
                )}
                <p className="mt-3 text-[11px] leading-relaxed text-black/45">
                  KinSight never diagnoses, prescribes, or contacts a clinician on its own. If someone may be in immediate danger, call 911.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-14 text-center">
      <div className="relative flex size-32 items-center justify-center rounded-full bg-[#dce8dd]">
        <div className="absolute size-20 rounded-full border border-[#446853]/25" />
        <div className="absolute size-11 rounded-full border border-[#446853]/35" />
        <span className="size-2.5 rounded-full bg-[#446853]" />
      </div>
      <h3 className="mt-7 text-[22px] font-medium tracking-[-0.03em]">The tool waits for context.</h3>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-black/50">
        No observation means no recommendation. Incomplete information is a reason to ask, not a reason to guess.
      </p>
    </div>
  );
}
