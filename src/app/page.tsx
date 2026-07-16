import { ContentSection } from "@/components/ContentSection";
import { CtaBanner } from "@/components/CtaBanner";
import { FeaturedGrid } from "@/components/FeaturedGrid";
import { HeroSection } from "@/components/HeroSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { homeContent } from "@/data/home";

export default function Home() {
  const { nav, hero, featured, news, stories, research, business, cta, footer } =
    homeContent;

  return (
    <>
      <SiteHeader nav={nav} />
      <main id="main" className="relative z-1 flex min-w-0 flex-col">
        <article className="flex min-w-0 flex-col gap-16 md:gap-24">
          <HeroSection
            title={hero.title}
            placeholder={hero.placeholder}
            rotatingPrompts={hero.rotatingPrompts}
            chips={hero.chips}
            moreChip={hero.moreChip}
          />
          <FeaturedGrid cards={featured} />
          <ContentSection section={news} variant="news" />
          <ContentSection section={stories} variant="stories" />
          <ContentSection section={research} variant="research" />
          <ContentSection section={business} variant="business" />
          <CtaBanner heading={cta.heading} button={cta.button} />
        </article>
      </main>
      <SiteFooter groups={footer} />
    </>
  );
}
