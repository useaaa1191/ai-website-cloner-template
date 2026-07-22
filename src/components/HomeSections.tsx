import { ArrowUpRightIcon, CheckIcon, ChevronIcon } from "@/components/icons";
import { PrincipleArt } from "@/components/PrincipleArt";
import { WorkforceDemo } from "@/components/WorkforceDemo";
import { cn } from "@/lib/utils";
import type {
  EvidenceMetric,
  Principle,
  Program,
  Scenario,
  HomeContent,
} from "@/types/home";

interface HomeSectionsProps {
  programs: Program[];
  principles: Principle[];
  evidence: HomeContent["evidence"];
  scenarios: Scenario[];
  safety: HomeContent["safety"];
  access: HomeContent["access"];
}

export function HomeSections({
  programs,
  principles,
  evidence,
  scenarios,
  safety,
  access,
}: HomeSectionsProps) {
  return (
    <>
      <ProgramsSection programs={programs} />
      <PrinciplesSection principles={principles} />
      <EvidenceSection evidence={evidence} />
      <ScenariosSection scenarios={scenarios} />
      <SafetySection safety={safety} />
      <AboutSection />
      <AccessSection access={access} />
    </>
  );
}

function ProgramsSection({ programs }: { programs: Program[] }) {
  return (
    <section id="programs" className="ff-container ff-section scroll-mt-20 border-t border-black/10">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <div>
          <p className="ff-kicker text-black/45">One foundation · two careful tools</p>
          <h2 className="ff-balance mt-5 text-[42px] font-medium leading-[1.02] tracking-[-0.05em] md:text-[58px]">
            Technology should lower the pressure.
          </h2>
        </div>
        <div className="max-w-2xl lg:pt-8">
          <p className="text-[19px] leading-[1.55] tracking-[-0.02em] text-black/58 md:text-[22px]">
            Each recommendation explains itself, waits for a person, and leaves the final call where it belongs. The interfaces are different because the decisions are different. The accountability pattern stays the same.
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {programs.map((program, index) => (
          <article
            key={program.id}
            id={program.id}
            className={cn(
              "scroll-mt-24 rounded-[1.5rem] p-6 md:p-8",
              index === 0 ? "bg-[#dce8dd]" : "bg-[#dce9ef]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold">{program.name}</p>
              <span className="rounded-full bg-white/55 px-2.5 py-1 text-[10px] font-semibold">{program.audience}</span>
            </div>
            <h3 className="ff-balance mt-16 text-[28px] font-medium leading-[1.06] tracking-[-0.04em] md:text-[34px]">
              {program.headline}
            </h3>
            <p className="mt-4 text-[14px] leading-relaxed text-black/60">{program.description}</p>
            <ul className="mt-7 space-y-3 border-t border-black/12 pt-5">
              {program.facts.map((fact) => (
                <li key={fact} className="flex items-start gap-2.5 text-[12px] font-medium leading-snug">
                  <CheckIcon className="mt-0.5 size-4 shrink-0" />
                  {fact}
                </li>
              ))}
            </ul>
          </article>
        ))}

        <article className="rounded-[1.5rem] bg-[#f2e6c8] p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold">Shared rules</p>
            <span className="rounded-full bg-white/55 px-2.5 py-1 text-[10px] font-semibold">Caregiver AI Principles</span>
          </div>
          <h3 className="ff-balance mt-16 text-[28px] font-medium leading-[1.06] tracking-[-0.04em] md:text-[34px]">Useful because the limits are clear.</h3>
          <p className="mt-4 text-[14px] leading-relaxed text-black/60">
            No diagnosis, no prescription, no silent publishing, no disciplinary scoring, and no confident answer when the context is not there.
          </p>
          <a href="#principles" className="mt-7 inline-flex items-center gap-2 text-[12px] font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-black">
            Read the product rules
            <ChevronIcon className="size-3.5" />
          </a>
        </article>
      </div>

      <div id="steadycrew" className="mt-20 scroll-mt-24 md:mt-28">
        <div className="mb-8 grid gap-5 md:grid-cols-2 md:items-end">
          <div>
            <p className="ff-kicker text-black/45">SteadyCrew in practice</p>
            <h2 className="ff-balance mt-4 text-[36px] font-medium leading-[1.04] tracking-[-0.045em] md:text-[48px]">A proposal, not an order.</h2>
          </div>
          <p className="max-w-xl text-[16px] leading-relaxed text-black/55 md:justify-self-end">
            The matching logic can narrow the field. A supervisor still approves the change, and the worker still has a choice.
          </p>
        </div>
        <WorkforceDemo />
      </div>
    </section>
  );
}

function PrinciplesSection({ principles }: { principles: Principle[] }) {
  return (
    <section id="how-it-works" className="ff-container ff-section scroll-mt-20 border-t border-black/10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="ff-kicker text-black/45">How it works</p>
          <h2 className="ff-balance mt-5 max-w-3xl text-[42px] font-medium leading-[1.02] tracking-[-0.05em] md:text-[58px]">The same accountable pattern, every time.</h2>
        </div>
        <p className="max-w-md text-[15px] leading-relaxed text-black/55">
          Not a general-purpose assistant. Six specific design commitments that make each output easier to inspect and easier to refuse.
        </p>
      </div>

      <div className="mt-14 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map((principle) => (
          <article key={principle.title}>
            <PrincipleArt visual={principle.visual} tone={principle.tone} />
            <h3 className="mt-5 text-[20px] font-medium tracking-[-0.025em]">{principle.title}</h3>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-black/55">{principle.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EvidenceSection({ evidence }: { evidence: HomeContent["evidence"] }) {
  return (
    <section id="evidence" className="scroll-mt-20 bg-[#11110f] py-20 text-white md:py-28">
      <div className="ff-container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="ff-kicker text-white/45">{evidence.eyebrow}</p>
            <h2 className="ff-balance mt-5 text-[44px] font-medium leading-[1] tracking-[-0.05em] md:text-[64px]">{evidence.title}</h2>
          </div>
          <div className="lg:pt-8">
            <p className="max-w-2xl text-[18px] leading-[1.55] tracking-[-0.02em] text-white/65 md:text-[21px]">{evidence.description}</p>
          </div>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[1.5rem] bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {evidence.metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
        <p className="mt-5 max-w-4xl text-[11px] leading-relaxed text-white/42">{evidence.note}</p>
      </div>
    </section>
  );
}

function MetricCard({ metric }: { metric: EvidenceMetric }) {
  return (
    <article className="min-h-64 bg-[#11110f] p-6 md:p-7">
      <p className="text-[44px] font-medium leading-none tracking-[-0.06em] md:text-[54px]">{metric.value}</p>
      <h3 className="mt-8 text-[14px] font-semibold">{metric.label}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-white/45">{metric.detail}</p>
    </article>
  );
}

function ScenariosSection({ scenarios }: { scenarios: Scenario[] }) {
  return (
    <section className="ff-container ff-section border-b border-black/10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ff-kicker text-black/45">Where the work begins</p>
          <h2 className="ff-balance mt-5 text-[42px] font-medium leading-[1.02] tracking-[-0.05em] md:text-[58px]">Built for the hard moments.</h2>
        </div>
        <p className="max-w-md text-[15px] leading-relaxed text-black/55">Three focused views of a decision that deserves context, reasons, and a person.</p>
      </div>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {scenarios.map((scenario, index) => (
          <article key={scenario.title} className="group">
            <ScenarioVisual accent={scenario.accent} index={index} />
            <p className="mt-5 ff-kicker text-black/45">{scenario.eyebrow}</p>
            <h3 className="ff-balance mt-3 text-[23px] font-medium leading-[1.12] tracking-[-0.035em] md:text-[27px]">{scenario.title}</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-black/55">{scenario.body}</p>
            <p className="mt-5 text-[11px] font-semibold text-black/38">{scenario.meta}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScenarioVisual({ accent, index }: { accent: Scenario["accent"]; index: number }) {
  const tones = {
    sage: "bg-[#dce8dd] text-[#294535]",
    blue: "bg-[#dce9ef] text-[#24485d]",
    clay: "bg-[#efddd4] text-[#793b2a]",
  } as const;

  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-[1.5rem]", tones[accent])}>
      <div className="absolute inset-0 opacity-45 ff-grid-lines" />
      {index === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-full max-w-72 space-y-3">
            <div className="ml-auto max-w-[85%] rounded-[1.25rem] rounded-br-sm bg-[#294535] px-4 py-3 text-[13px] font-medium leading-snug text-white">More withdrawn than usual. Skipped two meals.</div>
            <div className="max-w-[90%] rounded-[1.25rem] rounded-bl-sm bg-white/75 px-4 py-3 text-[13px] font-medium leading-snug">That is different from the baseline. Here are three reasons to review.</div>
            <div className="flex gap-2 pt-2">
              {['Appetite', 'Withdrawal', '2 days'].map((label) => <span key={label} className="rounded-full bg-white/65 px-2.5 py-1 text-[10px] font-semibold">{label}</span>)}
            </div>
          </div>
        </div>
      ) : null}
      {index === 1 ? (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-full max-w-72 rounded-[1.25rem] bg-white/72 p-5 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.08em]"><span>Call-out V-2214</span><span className="rounded-full bg-[#24485d] px-2 py-1 text-white">Open</span></div>
            <div className="mt-6 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-[#24485d] text-[12px] font-semibold text-white">RQ</span><div><p className="text-[14px] font-semibold">Rosa Q.</p><p className="text-[10px] opacity-60">Best continuity fit</p></div></div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[9px] font-semibold"><span className="rounded-lg bg-current/10 py-2">Spanish</span><span className="rounded-lg bg-current/10 py-2">5.2 mi</span><span className="rounded-lg bg-current/10 py-2">Clear</span></div>
          </div>
        </div>
      ) : null}
      {index === 2 ? (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="w-full max-w-72 rounded-[1.25rem] border border-current/20 bg-white/70 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] opacity-60">Request refused</p>
            <p className="mt-5 text-[22px] font-medium leading-tight tracking-[-0.035em]">This use is outside the rules.</p>
            <p className="mt-3 text-[12px] leading-relaxed opacity-65">Performance data cannot be turned into a disciplinary scorecard.</p>
            <div className="mt-6 h-1.5 w-full rounded-full bg-current/12"><div className="h-full w-2/5 rounded-full bg-current" /></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SafetySection({ safety }: { safety: HomeContent["safety"] }) {
  return (
    <section id="principles" className="ff-container ff-section scroll-mt-20">
      <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-24">
        <div>
          <p className="ff-kicker text-black/45">{safety.eyebrow}</p>
          <h2 className="ff-balance mt-5 text-[42px] font-medium leading-[1.02] tracking-[-0.05em] md:text-[58px]">{safety.title}</h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-black/55">{safety.description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {safety.cards.map((card, index) => (
            <article key={card.title} className={cn("flex min-h-[380px] flex-col rounded-[1.5rem] p-6 md:p-8", index === 0 ? "bg-[#f2e6c8]" : "bg-[#e8ddea]")}>
              <p className="ff-kicker opacity-55">{card.label}</p>
              <div className="mt-auto">
                <h3 className="ff-balance text-[30px] font-medium leading-[1.02] tracking-[-0.04em]">{card.title}</h3>
                <p className="mt-4 text-[14px] leading-relaxed text-black/60">{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 bg-[#f4f4f0] py-20 md:py-28">
      <div className="ff-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <div>
          <p className="ff-kicker text-black/45">About Forward Foundation</p>
          <h2 className="ff-balance mt-5 text-[40px] font-medium leading-[1.03] tracking-[-0.05em] md:text-[54px]">A nonprofit, not a prediction engine.</h2>
        </div>
        <div className="max-w-2xl lg:pt-7">
          <p className="text-[19px] leading-[1.55] tracking-[-0.02em] text-black/60">
            Forward Foundation is a California nonprofit public-benefit corporation based in Sacramento. We build focused tools with caregivers, aides, supervisors, disability advocates, aging-network partners, and clinical advisors.
          </p>
          <p className="mt-5 text-[14px] leading-relaxed text-black/50">
            Phase 2 work is planned around community advisory boards, mixed-method usability testing, bilingual review, privacy and security review, and staged deployment with partner organizations.
          </p>
        </div>
      </div>
    </section>
  );
}

function AccessSection({ access }: { access: HomeContent["access"] }) {
  return (
    <section id="access" className="ff-container py-8 md:py-12">
      <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[1.75rem] bg-[#11110f] px-6 py-16 text-center text-white md:rounded-[2.25rem]">
        <p className="ff-kicker text-white/45">Request access</p>
        <h2 className="ff-balance mt-6 max-w-4xl text-[46px] font-medium leading-[0.98] tracking-[-0.055em] md:text-[68px]">{access.title}</h2>
        <p className="ff-pretty mt-6 max-w-2xl text-[17px] leading-relaxed text-white/55">{access.description}</p>
        <div className="mt-9 flex flex-col gap-2.5 sm:flex-row">
          <a href={access.primaryAction.href} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-black transition hover:bg-white/80">
            {access.primaryAction.label}<ArrowUpRightIcon className="size-3.5" />
          </a>
          <a href={access.secondaryAction.href} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-[13px] font-semibold text-white transition hover:bg-white/10">
            {access.secondaryAction.label}<ArrowUpRightIcon className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
