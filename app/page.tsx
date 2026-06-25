import { SiteHeader } from "@/app/_components/site-header";
import { SiteHero } from "@/app/_components/site-hero";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <SiteHero />
      </main>
    </>
  );
}
