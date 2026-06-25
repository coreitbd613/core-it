"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Code2,
  Smartphone,
  Bot,
  Database,
  ShoppingCart,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

const services = [
  { label: "Web Development", icon: Code2 },
  { label: "Mobile Apps", icon: Smartphone },
  { label: "AI Automation", icon: Bot },
  { label: "CRM & ERP", icon: Database },
  { label: "E-commerce", icon: ShoppingCart },
  { label: "SEO", icon: Search },
] as const;

const stats = [
  { value: "200+", label: "Projects delivered" },
  { value: "50+", label: "Happy clients" },
  { value: "10+", label: "Years experience" },
  { value: "24/7", label: "Support" },
] as const;

const slides = [
  {
    title: "Website Development",
    image: "/website-deveopment.jpeg",
    icon: Code2,
  },
  {
    title: "Mobile App Development",
    image: "/mobile-app-development.jpeg",
    icon: Smartphone,
  },
  {
    title: "AI Automation",
    image: "/AI-Automation.png",
    icon: Bot,
  },
] as const;

const SLIDE_COUNT = slides.length;

export function SiteHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hide all slides except the first
      slideRefs.current.forEach((el, i) => {
        if (i !== 0) {
          gsap.set(el, { rotateY: 90, scale: 0.6, opacity: 0 });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${window.innerHeight * (SLIDE_COUNT - 1)}`,
          onUpdate: (self) => {
            setActiveSlide(Math.round(self.progress * (SLIDE_COUNT - 1)));
          },
        },
      });

      // Each step: current arcs out to the left, next arcs in from the right
      for (let i = 0; i < SLIDE_COUNT - 1; i++) {
        tl.to(
          slideRefs.current[i],
          { rotateY: -90, scale: 0.6, opacity: 0, ease: "none" },
          i,
        ).to(
          slideRefs.current[i + 1],
          { rotateY: 0, scale: 1, opacity: 1, ease: "none" },
          i,
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-background"
    >
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--primary) 14%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="flex h-full flex-col lg:flex-row">
        {/* ── LEFT / TOP: hero content ── */}
        <div className="flex flex-col justify-center px-6 py-8 lg:w-1/2 lg:px-12 lg:py-0">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            Your trusted technology partner
          </span>

          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Professional Software Solutions for{" "}
            <span className="text-primary">Every Business Need</span>
          </h1>

          <p className="mt-4 hidden text-pretty text-base leading-7 text-muted-foreground sm:block lg:text-lg">
            From custom websites and mobile apps to AI automation, CRM &amp; ERP
            systems, e-commerce, and SEO — CORE IT builds the technology that
            moves your business forward.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="h-11 px-6" asChild>
              <a href="#contact">
                Get a Free Quote
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6" asChild>
              <a href="#services">Explore Services</a>
            </Button>
          </div>

          {/* Service pills — desktop only */}
          <div className="mt-5 hidden flex-wrap gap-2 md:flex">
            {services.map((service) => (
              <span
                key={service.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-xs"
              >
                <service.icon className="size-3.5 text-primary" />
                {service.label}
              </span>
            ))}
          </div>

          {/* Stats — desktop only */}
          <dl className="mt-8 hidden grid-cols-4 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center gap-0.5 bg-card px-3 py-4 text-center"
              >
                <dt className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </dt>
                <dd className="text-xs text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── RIGHT / BOTTOM: curved carousel ── */}
        <div
          className="relative flex-1 flex items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.title}
              ref={(el) => {
                if (el) slideRefs.current[i] = el;
              }}
              className="absolute flex flex-col items-center gap-3"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Service label */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <slide.icon className="size-4" />
                {slide.title}
              </div>

              {/* Image — fixed size, not full-height */}
              <div className="relative h-52 w-72 overflow-hidden rounded-2xl border border-border/60 shadow-xl sm:h-64 sm:w-80 lg:h-72 lg:w-[400px]">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 400px"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
