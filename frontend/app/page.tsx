import { SiteHeader } from "@/app/_components/site-header";
import { SiteHero } from "@/app/_components/site-hero";
import { GlobalReach } from "@/components/global-reach";
import { Services12 } from "@/components/services12";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <SiteHero />
        <Services12 />
        <GlobalReach />
      </main>
    </>
  );
}
