"use client";

import { ArrowRight, Globe as GlobeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/globe";
import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";

interface GlobalReachProps {
  className?: string;
}

const GlobalReach = ({ className }: GlobalReachProps) => {
  return (
    <section
      id="global-reach"
      className={cn(
        "relative z-10 overflow-hidden border-t border-border bg-background py-32",
        className
      )}
    >
      {/* Subtle particle field */}
      <Particles
        className="absolute inset-0"
        quantity={80}
        staticity={40}
        size={0.4}
        color="#000000"
      />

      {/* Orange radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 85% 50%, color-mix(in oklch, #FD6005 25%, transparent), transparent)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Text column - always first, so it sits above the globe on mobile */}
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#FD6005]/40 bg-[#FD6005]/10 px-4 py-1.5 text-sm font-medium text-[#FD6005] backdrop-blur-sm">
            <GlobeIcon className="size-4" />
            Global Presence
          </span>

          <h2 className="mt-6 text-balance text-4xl font-medium text-foreground md:text-6xl">
            Powering Businesses{" "}
            <span className="text-[#FD6005]">Across the Globe</span>
          </h2>

          <p className="mt-6 max-w-md text-base tracking-tight text-muted-foreground">
            Wherever your business operates, we&apos;re ready to build with
            you. Our teams deliver software solutions for clients spanning
            every continent, backed by processes that scale across time
            zones.
          </p>

          <Button
            size="lg"
            className="mt-10 w-fit gap-2 bg-[#FD6005] px-8 text-white hover:bg-[#FD6005]/85"
            asChild
          >
            <a href="#contact">
              Get a Free Quote
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>

        {/* Globe column - full width below text on mobile, right side on desktop */}
        <div className="relative h-80 sm:h-96 lg:h-[32rem]">
          <Globe />
        </div>
      </div>
    </section>
  );
};

export { GlobalReach };
