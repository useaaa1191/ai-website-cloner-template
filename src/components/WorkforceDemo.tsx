"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string;
  role: string;
  distance: string;
  continuity: string;
  reason: string;
  tags: string[];
}

const candidates: Candidate[] = [
  {
    id: "rosa",
    name: "Rosa Q.",
    role: "Home care aide",
    distance: "5.2 mi",
    continuity: "8 of 10 visits",
    reason: "Best continuity and Spanish preference match",
    tags: ["Spanish", "Credentials clear", "No overtime"],
  },
  {
    id: "imani",
    name: "Imani P.",
    role: "Personal care aide",
    distance: "3.8 mi",
    continuity: "2 of 10 visits",
    reason: "Closest qualified candidate",
    tags: ["Skills match", "Credentials clear", "No overtime"],
  },
  {
    id: "mateo",
    name: "Mateo R.",
    role: "Home care aide",
    distance: "7.1 mi",
    continuity: "5 of 10 visits",
    reason: "Language and availability match",
    tags: ["Spanish", "Available", "Meal prep"],
  },
];

type ReviewState = "review" | "approved" | "rejected";

export function WorkforceDemo() {
  const [selectedId, setSelectedId] = useState(candidates[0].id);
  const [reviewState, setReviewState] = useState<ReviewState>("review");
  const [editing, setEditing] = useState(false);
  const [continuityFirst, setContinuityFirst] = useState(true);
  const [noOvertime, setNoOvertime] = useState(true);

  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0];

  function chooseCandidate(id: string) {
    setSelectedId(id);
    setReviewState("review");
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-black/12 bg-[#f7f7f4] shadow-[0_28px_80px_rgba(20,20,15,0.09)] md:rounded-[2rem]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-[#355c72]" />
          <span className="text-[13px] font-semibold">SteadyCrew</span>
          <span className="hidden text-[12px] text-black/45 sm:inline">supervisor review</span>
        </div>
        <div className="rounded-full bg-[#dce9ef] px-2.5 py-1 text-[11px] font-semibold text-[#24485d]">Proposal only · not published</div>
      </div>

      <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="border-b border-black/10 bg-white p-5 md:p-7 lg:border-r lg:border-b-0">
          <p className="ff-kicker text-black/45">Open visit · V-2214</p>
          <h3 className="mt-4 text-[25px] font-medium leading-[1.1] tracking-[-0.035em]">Today, 2:00–5:00 p.m.</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-black/55">Personal care and meal support. Spanish preferred. Familiar aide preferred.</p>

          <dl className="mt-7 grid grid-cols-2 gap-2">
            {[
              ["Location", "South Valley"],
              ["Call-out", "11:42 a.m."],
              ["Max hours", "Hard constraint"],
              ["Credentials", "Required"],
            ].map(([term, detail]) => (
              <div key={term} className="rounded-xl bg-black/[0.035] p-3.5">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black/40">{term}</dt>
                <dd className="mt-1.5 text-[12px] font-semibold">{detail}</dd>
              </div>
            ))}
          </dl>

          <button type="button" onClick={() => setEditing((current) => !current)} className="mt-5 text-[12px] font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-black">
            {editing ? "Close constraint editor" : "Edit proposal constraints"}
          </button>

          {editing ? (
            <div className="mt-4 space-y-2 rounded-xl border border-black/10 p-3.5">
              <ConstraintToggle label="Preserve continuity first" checked={continuityFirst} onChange={() => setContinuityFirst((current) => !current)} />
              <ConstraintToggle label="Prevent overtime" checked={noOvertime} onChange={() => setNoOvertime((current) => !current)} />
              <p className="pt-1 text-[10px] leading-relaxed text-black/45">Credentials and maximum-hours rules cannot be turned off.</p>
            </div>
          ) : null}
        </aside>

        <div className="p-5 md:p-7 lg:p-9">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="ff-kicker text-black/45">Explainable candidates</p>
              <h3 className="mt-3 text-[24px] font-medium tracking-[-0.035em]">Three safe matches</h3>
            </div>
            <span className="hidden text-[11px] font-medium text-black/45 sm:block">Sorted by current constraints</span>
          </div>

          <div className="mt-5 space-y-2.5" role="listbox" aria-label="Candidate proposals">
            {candidates.map((candidate, index) => {
              const selectedCandidate = candidate.id === selectedId;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  role="option"
                  aria-selected={selectedCandidate}
                  onClick={() => chooseCandidate(candidate.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[1rem] border p-3.5 text-left transition md:p-4",
                    selectedCandidate ? "border-[#355c72]/35 bg-[#f0f5f7]" : "border-black/10 bg-white hover:border-black/25",
                  )}
                >
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold", selectedCandidate ? "bg-[#355c72] text-white" : "bg-black/[0.05] text-black/55")}>{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[14px] font-semibold">{candidate.name}</span>
                      <span className="text-[11px] font-medium text-black/45">{candidate.distance}</span>
                    </span>
                    <span className="mt-0.5 block text-[11px] text-black/45">{candidate.role} · {candidate.continuity}</span>
                    <span className="mt-2 block text-[12px] font-medium leading-snug">{candidate.reason}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-[1rem] border border-black/10 bg-white p-4">
            <div className="flex flex-wrap gap-2">
              {selected.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-semibold">{tag}</span>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-black/50">Why {selected.name} appears: {selected.reason.toLowerCase()}. No disqualifying credential or maximum-hours conflict was found in this demonstration.</p>
          </div>

          <div className="mt-6" aria-live="polite">
            {reviewState === "review" ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={() => setReviewState("approved")} className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-[13px] font-medium text-white transition hover:bg-black/80">Approve proposal</button>
                <button type="button" onClick={() => setEditing(true)} className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 bg-white px-5 text-[13px] font-medium transition hover:bg-black/[0.04]">Edit constraints</button>
                <button type="button" onClick={() => setReviewState("rejected")} className="inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-medium text-black/55 transition hover:bg-black/[0.04] hover:text-black">Reject</button>
              </div>
            ) : (
              <div className={cn("flex items-start gap-3 rounded-xl px-4 py-3.5 text-[13px]", reviewState === "approved" ? "bg-[#dce8dd] text-[#294535]" : "bg-[#efddd4] text-[#793b2a]")}>
                <CheckIcon className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">{reviewState === "approved" ? "Supervisor approved. Awaiting worker acceptance." : "Proposal rejected. No schedule change was published."}</p>
                  <button type="button" onClick={() => setReviewState("review")} className="mt-1 text-[11px] font-semibold underline underline-offset-4">Return to review</button>
                </div>
              </div>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-black/45">Workers retain agency-defined decline rights. A supervisor approval does not remove the worker’s choice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConstraintToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function ConstraintToggle({ label, checked, onChange }: ConstraintToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange} className="flex w-full items-center justify-between gap-3 py-1 text-left text-[11px] font-medium">
      {label}
      <span className={cn("flex h-5 w-8 items-center rounded-full p-0.5 transition", checked ? "justify-end bg-black" : "justify-start bg-black/20")}>
        <span className="size-4 rounded-full bg-white" />
      </span>
    </button>
  );
}
