"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHero() {
  return (
    <section className="relative h-screen overflow-hidden">
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
          <Button
            size="lg"
            className="h-12 gap-2 bg-[#FD6005] px-8 text-white hover:bg-[#FD6005]/85"
            asChild
          >
            <a href="#contact">
              Get a Free Quote
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-white/25 bg-white/5 px-8 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
            asChild
          >
            <a href="#services">Explore Services</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
