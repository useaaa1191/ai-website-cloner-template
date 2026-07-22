import { HeroSection } from "@/components/HeroSection";
import { HomeSections } from "@/components/HomeSections";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { homeContent } from "@/data/home";

export default function Home() {
  return (
    <>
      <SiteHeader nav={homeContent.nav} />
      <main id="main" className="relative flex min-w-0 flex-col">
        <HeroSection {...homeContent.hero} />
        <HomeSections
          programs={homeContent.programs}
          principles={homeContent.principles}
          evidence={homeContent.evidence}
          scenarios={homeContent.scenarios}
          safety={homeContent.safety}
          access={homeContent.access}
        />
      </main>
      <SiteFooter groups={homeContent.footer} />
    </>
  );
}
