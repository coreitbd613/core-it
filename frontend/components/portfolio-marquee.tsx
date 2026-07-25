import Image from "next/image";

import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

const row1 = [
  { src: "/demo/749652272_122120539869341644_3759717613618636761_n.jpg", alt: "Skincare e-commerce landing page" },
  { src: "/demo/750274071_122120537979341644_4798796805816063679_n.jpg", alt: "Bonsai magazine landing page" },
  { src: "/demo/752484462_122120538495341644_4845034615585529237_n.jpg", alt: "Toy store product page" },
  { src: "/demo/754324124_122120544141341644_2031382095648071941_n.jpg", alt: "Sci-fi game landing page" },
];

const row2 = [
  { src: "/demo/pancakes-landing-page.jpeg", alt: "Pancakes restaurant landing page" },
  { src: "/demo/original-3ed8ad9d875d770a7e63fd9bc8a15381.webp", alt: "Logistics company landing page" },
  { src: "/demo/original-bc172da207850d0513456eadae81729b.webp", alt: "Game landing page" },
  { src: "/demo/original-d54fa725101b32be88a54fcd4da253dd.webp", alt: "Movie promo landing page" },
];

interface PortfolioMarqueeProps {
  className?: string;
}

function MarqueeCard({
  src,
  alt,
  rotate,
}: {
  src: string;
  alt: string;
  rotate: "rotate-2" | "-rotate-2";
}) {
  return (
    <div
      className={cn(
        "relative h-28 w-44 shrink-0 overflow-hidden rounded-2xl border border-border shadow-xl transition-transform duration-500 hover:rotate-0 sm:h-48 sm:w-72 lg:h-56 lg:w-80",
        rotate
      )}
    >
      <Image src={src} alt={alt} fill className="object-cover" sizes="(min-width: 1024px) 20rem, (min-width: 640px) 18rem, 11rem" />
    </div>
  );
}

const PortfolioMarquee = ({ className }: PortfolioMarqueeProps) => {
  return (
    <section className={cn("relative z-10 overflow-hidden bg-[#20ABE9] py-24", className)}>

      <div className="flex flex-col gap-6">
        <Marquee className="[--duration:35s]">
          {row1.map((item, i) => (
            <MarqueeCard key={item.src} {...item} rotate={i % 2 === 0 ? "-rotate-2" : "rotate-2"} />
          ))}
        </Marquee>
        <Marquee reverse className="[--duration:35s]">
          {row2.map((item, i) => (
            <MarqueeCard key={item.src} {...item} rotate={i % 2 === 0 ? "rotate-2" : "-rotate-2"} />
          ))}
        </Marquee>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent sm:w-48" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent sm:w-48" />
    </section>
  );
};

export { PortfolioMarquee };
