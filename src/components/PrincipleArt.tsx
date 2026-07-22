import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { PrincipleVisual } from "@/types/home";

interface PrincipleArtProps {
  visual: PrincipleVisual;
  tone: "sage" | "clay" | "blue" | "gold" | "plum" | "mint";
}

const toneClasses = {
  sage: "bg-[#dce8dd] text-[#294535]",
  clay: "bg-[#efddd4] text-[#793b2a]",
  blue: "bg-[#dce9ef] text-[#24485d]",
  gold: "bg-[#f2e6c8] text-[#6d5119]",
  plum: "bg-[#e8ddea] text-[#4e3d53]",
  mint: "bg-[#dcebe5] text-[#315b4c]",
} as const;

export function PrincipleArt({ visual, tone }: PrincipleArtProps) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden rounded-[1.25rem]", toneClasses[tone])}>
      <div className="absolute inset-0 opacity-45 ff-grid-lines" />
      {visual === "baseline" ? <BaselineArt /> : null}
      {visual === "reasons" ? <ReasonsArt /> : null}
      {visual === "refusal" ? <RefusalArt /> : null}
      {visual === "humanGate" ? <HumanGateArt /> : null}
      {visual === "protection" ? <ProtectionArt /> : null}
      {visual === "language" ? <LanguageArt /> : null}
    </div>
  );
}

function BaselineArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8">
      <div className="relative h-36 w-full max-w-64">
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-current/35" />
        <svg viewBox="0 0 280 120" className="absolute inset-0 size-full" fill="none" aria-hidden="true">
          <path d="M2 69C30 65 39 45 66 49s36 31 62 23 36-37 61-30 30 38 51 35 27-20 38-22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="189" cy="42" r="7" fill="currentColor" />
          <circle cx="240" cy="77" r="5" fill="white" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="absolute left-0 top-0 rounded-full bg-white/65 px-2.5 py-1 text-[11px] font-semibold">Personal baseline</span>
        <span className="absolute right-0 bottom-0 rounded-full bg-white/65 px-2.5 py-1 text-[11px] font-semibold">Change noticed</span>
      </div>
    </div>
  );
}

function ReasonsArt() {
  const items = ["Appetite change", "More withdrawn", "2 days from baseline"];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-8">
      {items.map((item, index) => (
        <div key={item} className={cn("flex w-full max-w-64 items-center gap-3 rounded-xl border border-current/15 bg-white/65 px-3.5 py-3", index === 1 && "translate-x-4")}>
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#24485d] text-white">
            <CheckIcon className="size-3" />
          </span>
          <span className="text-[12px] font-semibold">{item}</span>
        </div>
      ))}
    </div>
  );
}

function RefusalArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="w-full max-w-64 rounded-2xl border border-current/20 bg-white/70 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="size-2 rounded-full bg-current" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">More context needed</span>
        </div>
        <p className="text-[16px] font-medium leading-snug">I can’t make a careful recommendation from this yet.</p>
        <div className="mt-4 h-2 w-3/4 rounded-full bg-current/15" />
        <div className="mt-2 h-2 w-1/2 rounded-full bg-current/15" />
      </div>
    </div>
  );
}

function HumanGateArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8">
      <div className="flex w-full max-w-72 items-center justify-between gap-3">
        <div className="rounded-xl border border-current/15 bg-white/65 px-4 py-5 text-center text-[12px] font-semibold">Suggestion</div>
        <div className="h-px flex-1 bg-current/30" />
        <div className="rounded-xl bg-[#793b2a] px-4 py-5 text-center text-[12px] font-semibold text-white">Person</div>
        <div className="h-px flex-1 bg-current/30" />
        <div className="rounded-xl border border-current/15 bg-white/65 px-4 py-5 text-center text-[12px] font-semibold">Action</div>
      </div>
    </div>
  );
}

function ProtectionArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 180 180" className="size-44" fill="none" aria-hidden="true">
        <path d="M90 18 145 39v44c0 39-22 64-55 79-33-15-55-40-55-79V39l55-21Z" fill="white" fillOpacity=".62" stroke="currentColor" strokeWidth="3" />
        <path d="m63 87 18 18 38-42" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function LanguageArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 p-8">
      <div className="-translate-y-5 rounded-[1.25rem] rounded-bl-sm bg-white/72 px-5 py-4 text-[26px] font-semibold shadow-sm">EN</div>
      <div className="translate-y-5 rounded-[1.25rem] rounded-br-sm bg-[#315b4c] px-5 py-4 text-[26px] font-semibold text-white shadow-sm">ES</div>
      <div className="absolute bottom-8 flex h-8 items-center gap-1">
        {["h-3", "h-[22px]", "h-[30px]", "h-[18px]", "h-[26px]", "h-3.5", "h-[21px]"].map((heightClass, index) => (
          <span key={`${heightClass}-${index}`} className={cn("w-1 rounded-full bg-current/45", heightClass)} />
        ))}
      </div>
    </div>
  );
}
