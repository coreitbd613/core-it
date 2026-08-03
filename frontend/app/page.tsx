import { SiteHeader } from "@/app/_components/site-header";
import { SiteHero } from "@/app/_components/site-hero";
import { SiteContact } from "@/app/_components/site-contact";
import { SiteFooter } from "@/app/_components/site-footer";
import { OfficeGallery } from "@/app/_components/office-gallery";
import { GlobalReach } from "@/components/global-reach";
import { PortfolioMarquee } from "@/components/portfolio-marquee";
import { ServicesAccordion } from "@/components/services-accordion";
import { WhatWeDo } from "@/components/what-we-do";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <SiteHero />
        <ServicesAccordion />
        <PortfolioMarquee />
        <GlobalReach />
        <WhatWeDo />
        <OfficeGallery />
        <SiteContact />
      </main>
      <SiteFooter />
    </>
  );
}
