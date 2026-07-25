import { SiteHeader } from "@/app/_components/site-header";
import { SiteHero } from "@/app/_components/site-hero";
import { SiteFooter } from "@/app/_components/site-footer";
import { CtaBanner } from "@/components/cta-banner";
import { GlobalReach } from "@/components/global-reach";
import { PortfolioMarquee } from "@/components/portfolio-marquee";
import { ServiceRibbon } from "@/components/service-ribbon";
import { ServicesAccordion } from "@/components/services-accordion";
import { WhatWeDo } from "@/components/what-we-do";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <SiteHero />
        <ServicesAccordion />
        <ServiceRibbon />
        <PortfolioMarquee />
        <GlobalReach />
        <WhatWeDo />
        <CtaBanner />
      </main>
      <SiteFooter />
    </>
  );
}
