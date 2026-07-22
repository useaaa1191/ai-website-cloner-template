import type { ReactNode } from "react";

interface ContentSectionProps {
  eyebrow?: string;
  heading: string;
  description?: string;
  children: ReactNode;
  id?: string;
}

export function ContentSection({ eyebrow, heading, description, children, id }: ContentSectionProps) {
  return (
    <section id={id} className="ff-container ff-section scroll-mt-20">
      <div className="mb-12 max-w-3xl">
        {eyebrow ? <p className="ff-kicker text-black/45">{eyebrow}</p> : null}
        <h2 className="ff-balance mt-5 text-[42px] font-medium leading-[1.02] tracking-[-0.05em] md:text-[58px]">{heading}</h2>
        {description ? <p className="mt-5 text-[16px] leading-relaxed text-black/55">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
