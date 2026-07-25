"use client";

import { Sparkles } from "lucide-react";
import { HeroTerminal } from "@/app/_components/hero-terminal";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { SpecularButton } from "@/components/ui/specular-button";
import { WHATSAPP_URL } from "@/lib/contact";

export function SiteHero() {
  return (
    <section className="bg-background sticky top-0 z-0 min-h-screen overflow-hidden lg:h-screen">
      {/* Slowly drifting light gradient background */}
      <div
        aria-hidden
        className="animate-gradient-drift pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at center, color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%), radial-gradient(ellipse 55% 45% at center, color-mix(in oklch, var(--brand-navy) 10%, transparent), transparent 70%)",
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundSize: "80% 80%, 70% 70%",
          backgroundPosition: "20% 20%, 80% 70%",
        }}
      />

      {/* Content: text/CTAs on the left, terminal on the right */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-28 lg:h-full lg:grid-cols-2 lg:px-8 lg:py-0">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Eyebrow badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FD6005]/40 bg-[#FD6005]/10 px-4 py-1.5 text-sm font-medium text-[#FD6005] backdrop-blur-sm">
            <Sparkles className="size-4" />
            Your trusted technology partner
          </span>

          {/* Headline */}
          <h1 className="text-foreground mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
            Professional Software Solutions for{" "}
            <span className="text-[#FD6005]">Every Business Need</span>
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-md text-balance text-base text-muted-foreground">
            We design, build, and host software that fits how your business actually runs —
            from custom platforms to the everyday IT infrastructure behind them.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <InteractiveHoverButton
              className="h-12 rounded-lg border-transparent bg-white px-8 text-base text-neutral-900 shadow-md"
              onClick={() => window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer")}
            >
              Contact Us
            </InteractiveHoverButton>
            <SpecularButton
              radius={8}
              tint="#ffffff"
              tintOpacity={0.85}
              blur={6}
              textColor="#171717"
              lineColor="#0A2540"
              baseColor="#0A2540"
              className="h-12 px-8 text-base font-semibold shadow-md"
              onClick={() => document.getElementById("services")?.scrollIntoView()}
            >
              Explore Services
            </SpecularButton>
          </div>
        </div>

        {/* Terminal */}
        <div className="flex justify-self-center lg:justify-self-end">
          <HeroTerminal />
        </div>
      </div>
    </section>
  );
}
