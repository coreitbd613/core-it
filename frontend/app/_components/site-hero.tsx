"use client";

import { Sparkles } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Orb } from "@/components/ui/orb";
import { SpecularButton } from "@/components/ui/specular-button";

export function SiteHero() {
  return (
    <section className="bg-background sticky top-0 z-0 h-screen overflow-hidden">
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

      {/* Orb glow, centered behind the headline — hidden on small screens to keep the
          hero light on low-end/mobile devices. Orb's shader fills its whole canvas with
          a flat color outside the sphere (no real transparency), so the container is
          masked to fade that fill to transparent at the edges. Sized via inline style
          (not an arbitrary Tailwind class) because Orb measures its container once on
          mount with no ResizeObserver — a late Turbopack CSS injection would otherwise
          leave the canvas locked at the wrong size. */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
        <div
          className="opacity-40 [mask-image:radial-gradient(circle,black_35%,transparent_68%)] [-webkit-mask-image:radial-gradient(circle,black_35%,transparent_68%)]"
          style={{ width: 900, height: 900 }}
        >
          <Orb hue={20} backgroundColor="#F6F4EE" hoverIntensity={0} rotateOnHover={false} />
        </div>
      </div>

      {/* Centered content */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        {/* Eyebrow badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-[#FD6005]/40 bg-[#FD6005]/10 px-4 py-1.5 text-sm font-medium text-[#FD6005] backdrop-blur-sm">
          <Sparkles className="size-4" />
          Your trusted technology partner
        </span>

        {/* Headline */}
        <h1 className="text-foreground mt-6 max-w-5xl text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
          Professional Software Solutions for{" "}
          <span className="text-[#FD6005]">Every Business Need</span>
        </h1>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <InteractiveHoverButton
            className="h-12 rounded-lg border-transparent bg-white px-8 text-base text-neutral-900 shadow-md"
            onClick={() => document.getElementById("contact")?.scrollIntoView()}
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
    </section>
  );
}
