"use client";

import { useState } from "react";
import { Globe, Server, ShoppingCart, Smartphone, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/ui/terminal";

type TerminalTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  command: string;
  lines: string[];
  result: string;
};

const tabs: TerminalTab[] = [
  {
    id: "web",
    label: "Web Development",
    icon: Globe,
    command: "> core-it deploy acme-store",
    lines: [
      "✔ Provisioning domain acme-store.com",
      "✔ Issuing SSL certificate",
      "✔ Building web application",
      "✔ Deploying to production",
      "✔ Configuring hosting & backups",
    ],
    result: "Deployed in 42s — acme-store.com is live.",
  },
  {
    id: "ecommerce",
    label: "E-Commerce",
    icon: ShoppingCart,
    command: "> core-it init storefront --template ecommerce",
    lines: [
      "✔ Setting up product catalog",
      "✔ Configuring payment gateway",
      "✔ Syncing inventory in real time",
      "✔ Enabling order tracking",
    ],
    result: "Storefront ready — zero-downtime launch.",
  },
  {
    id: "mobile",
    label: "Mobile App",
    icon: Smartphone,
    command: "> core-it build --platform ios,android",
    lines: [
      "✔ Compiling native modules",
      "✔ Running device test suite (128 passed)",
      "✔ Signing release build",
      "✔ Submitting to App Store & Play Store",
    ],
    result: "Build shipped — v1.0.0 live in both stores.",
  },
  {
    id: "hosting",
    label: "Domain & Hosting",
    icon: Server,
    command: "> core-it hosting status acme-store.com",
    lines: [
      "✔ Uptime: 99.98% (30 days)",
      "✔ SSL: valid, auto-renewing",
      "✔ Backups: daily, last run 2h ago",
      "✔ CDN: 42 edge nodes active",
    ],
    result: "All systems operational.",
  },
];

export function HeroTerminal() {
  const [activeId, setActiveId] = useState(tabs[0].id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <Terminal
        key={active.id}
        className="h-[19rem] w-full rounded-lg shadow-xl sm:h-[21rem] lg:h-[24rem]"
      >
        <TypingAnimation className="text-sm sm:text-base">{active.command}</TypingAnimation>

        {active.lines.map((line) => (
          <AnimatedSpan key={line} className="text-sm text-green-500 sm:text-base">
            {line}
          </AnimatedSpan>
        ))}

        <TypingAnimation className="text-sm text-muted-foreground sm:text-base">
          {active.result}
        </TypingAnimation>
      </Terminal>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
