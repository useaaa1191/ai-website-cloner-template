import Image from "next/image";
import type { ContentSection as ContentSectionData } from "@/types/home";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  section: ContentSectionData;
  variant: "news" | "stories" | "research" | "business";
}

export function ContentSection({ section, variant }: ContentSectionProps) {
  const isNews = variant === "news";

  return (
    <section className="oai-container">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-[22px] font-medium leading-[28px] tracking-[-0.22px] text-black">
          {section.heading}
        </h2>
        {section.viewMore ? (
          <a
            href={section.viewMore.href}
            className="shrink-0 text-[14px] font-medium text-black underline-offset-4 transition hover:underline"
          >
            {section.viewMore.text}
          </a>
        ) : null}
      </div>

      {isNews ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
          {section.cards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group grid grid-cols-[104px_1fr] items-start gap-4 sm:grid-cols-[120px_1fr]"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.imageAlt || card.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="120px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-[17px] font-medium leading-snug tracking-[-0.17px] text-black transition group-hover:opacity-70">
                  {card.title}
                </h3>
                <p className="mt-2 text-[13px] font-medium text-oai-muted">
                  {[card.category, card.date].filter(Boolean).join(" · ")}
                </p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-6 sm:grid-cols-2",
            "lg:grid-cols-3"
          )}
        >
          {section.cards.map((card) => (
            <a key={card.title} href={card.href} className="group flex flex-col">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.imageAlt || card.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                ) : null}
              </div>
              <div className="mt-4">
                <h3 className="text-[17px] font-medium leading-snug tracking-[-0.17px] text-black transition group-hover:opacity-70 md:text-[18px]">
                  {card.title}
                </h3>
                <p className="mt-2 text-[13px] font-medium text-oai-muted">
                  {[card.category, card.date].filter(Boolean).join(" · ")}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
