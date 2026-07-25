import { ChevronRight, ChevronLeft } from "lucide-react";

import { Marquee } from "@/components/ui/marquee";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

const tags = services.map((service) => service.title.toUpperCase());

function TagRow({ reverse }: { reverse?: boolean }) {
  const Separator = reverse ? ChevronLeft : ChevronRight;

  return (
    <Marquee
      reverse={reverse}
      className="py-2 [--duration:25s] [--gap:1.25rem] sm:py-4 sm:[--gap:2.5rem]"
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-5 whitespace-nowrap text-sm font-bold tracking-tight text-white sm:gap-10 sm:text-xl lg:text-2xl"
        >
          {tag}
          <Separator className="size-3.5 shrink-0 text-white/50 sm:size-5" />
        </span>
      ))}
    </Marquee>
  );
}

interface ServiceRibbonProps {
  className?: string;
}

const ServiceRibbon = ({ className }: ServiceRibbonProps) => {
  return (
    <section
      className={cn(
        "relative isolate z-10 h-40 overflow-hidden bg-background sm:h-64 lg:h-72",
        className
      )}
    >
      <div className="absolute left-1/2 top-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-3 bg-primary shadow-lg sm:-rotate-6">
        <TagRow />
      </div>
      <div className="absolute left-1/2 top-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 rotate-3 bg-brand-navy shadow-lg sm:rotate-6">
        <TagRow reverse />
      </div>
    </section>
  );
};

export { ServiceRibbon };
