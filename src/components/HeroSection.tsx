import { ArrowUpRightIcon } from "@/components/icons";
import { CareDecisionDemo } from "@/components/CareDecisionDemo";
import type { ActionLink } from "@/types/home";

interface HeroSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: ActionLink;
  secondaryAction: ActionLink;
}

export function HeroSection({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: HeroSectionProps) {
  return (
    <section className="ff-container pb-16 pt-16 md:pb-24 md:pt-24 lg:pt-28">
      <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
        <p className="ff-kicker text-black/45">{eyebrow}</p>
        <h1 className="ff-balance mt-7 text-[52px] font-medium leading-[0.96] tracking-[-0.06em] sm:text-[68px] md:text-[84px] lg:text-[96px]">
          {title}
        </h1>
        <p className="ff-pretty mt-7 max-w-[720px] text-[18px] leading-[1.5] tracking-[-0.02em] text-black/58 md:text-[22px]">
          {description}
        </p>
        <div className="mt-8 flex flex-col items-center gap-2.5 sm:flex-row">
          <a href={primaryAction.href} className="inline-flex h-11 items-center gap-2 rounded-full bg-black px-5 text-[14px] font-medium text-white transition hover:bg-black/80">
            {primaryAction.label}
            <ArrowUpRightIcon className="size-3.5" />
          </a>
          <a href={secondaryAction.href} className="inline-flex h-11 items-center rounded-full border border-black/15 bg-white px-5 text-[14px] font-medium transition hover:bg-black/[0.04]">
            {secondaryAction.label}
          </a>
        </div>
      </div>

      <div className="mt-14 md:mt-20">
        <CareDecisionDemo />
      </div>
    </section>
  );
}
