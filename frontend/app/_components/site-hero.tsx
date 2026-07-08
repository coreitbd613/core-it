"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function SiteHero() {
  return (
    <section className="sticky top-0 z-0 h-screen overflow-hidden">
      {/* Looping video background */}
      <video
        className="absolute inset-0 size-full object-cover"
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Orange radial glow from bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 100%, color-mix(in oklch, #FD6005 30%, transparent), transparent)",
        }}
      />

      {/* Centered content */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
        {/* Eyebrow badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-[#FD6005]/40 bg-[#FD6005]/10 px-4 py-1.5 text-sm font-medium text-[#FD6005] backdrop-blur-sm">
          <Sparkles className="size-4" />
          Your trusted technology partner
        </span>

        {/* Headline */}
        <h1
          className="mt-6 max-w-5xl text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.6)" }}
        >
          Professional Software Solutions for{" "}
          <span className="text-[#FD6005]">Every Business Need</span>
        </h1>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <InteractiveHoverButton
            className="h-12 rounded-lg px-8 text-base"
            onClick={() => document.getElementById("contact")?.scrollIntoView()}
          >
            Contact Us
          </InteractiveHoverButton>
          <Button
            
            variant="outline"
            className="border-white/25 bg-white/5 font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
            asChild
          >
            <a href="#services">Explore Services</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
