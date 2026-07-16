import Image from "next/image";
import type { FeaturedCard } from "@/types/home";

interface FeaturedGridProps {
  cards: FeaturedCard[];
}

function Media({ card, className }: { card: FeaturedCard; className?: string }) {
  if (card.video) {
    return (
      <video
        className={className}
        autoPlay
        muted
        loop
        playsInline
        poster={card.image ?? undefined}
        aria-label={card.imageAlt || card.title}
      >
        <source src={card.video} type="video/mp4" />
      </video>
    );
  }
  if (card.image) {
    return (
      <Image
        src={card.image}
        alt={card.imageAlt || card.title}
        fill
        className={className}
        sizes="(max-width: 1024px) 100vw, 66vw"
      />
    );
  }
  return <div className="size-full bg-neutral-200" />;
}

export function FeaturedGrid({ cards }: FeaturedGridProps) {
  const [primary, ...side] = cards;

  if (!primary) return null;

  return (
    <section className="oai-container">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <a
          href={primary.href}
          className="group relative flex flex-col lg:col-span-8"
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-black">
            <Media
              card={primary}
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <div className="mt-4">
            <h2 className="text-[22px] font-medium leading-[1.26] tracking-[-0.22px] text-black transition group-hover:opacity-70 md:text-[24px]">
              {primary.title}
            </h2>
            <p className="mt-2 text-[14px] font-medium text-oai-muted">
              {[primary.category, primary.readTime].filter(Boolean).join(" · ")}
            </p>
          </div>
        </a>

        <div className="flex flex-col gap-6 lg:col-span-4">
          {side.map((card) => (
            <a key={card.title} href={card.href} className="group flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-100 lg:aspect-[4/3]">
                {card.video ? (
                  <video
                    className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={card.image ?? undefined}
                  >
                    <source src={card.video} type="video/mp4" />
                  </video>
                ) : card.image ? (
                  <Image
                    src={card.image}
                    alt={card.imageAlt || card.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : null}
              </div>
              <div className="mt-3">
                <h3 className="text-[17px] font-medium leading-snug tracking-[-0.17px] text-black transition group-hover:opacity-70">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-[13px] font-medium text-oai-muted">
                  {[card.category, card.readTime].filter(Boolean).join(" · ")}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
