import { SiteHeader } from "@/app/_components/site-header";
import { SiteHero } from "@/app/_components/site-hero";
import { SiteFooter } from "@/app/_components/site-footer";
import { GlobalReach } from "@/components/global-reach";
import { ServicesGrid } from "@/components/services-grid";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <SiteHero />
        <ServicesGrid />
        <GlobalReach />
      </main>
      <SiteFooter />
    </>
  );
}
