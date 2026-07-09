"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Menu } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { useClientAuth } from "@/contexts/client-auth-context";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Work", href: "/#work" },
  { label: "Domains", href: "/domains" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

function HeaderThemeToggle({
  resolvedTheme,
  setTheme,
  className,
}: {
  resolvedTheme?: string;
  setTheme: (theme: string) => void;
  className?: string;
}) {
  return (
    <AnimatedThemeToggler
      theme={resolvedTheme === "light" ? "light" : "dark"}
      onThemeChange={(theme) => setTheme(theme)}
      className={className}
    />
  );
}

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isPending } = useClientAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navText = overlay
    ? "text-white/80 hover:text-white hover:bg-white/10"
    : "text-foreground/80 hover:text-foreground hover:bg-muted";
  const iconText = overlay
    ? "text-white/80 hover:bg-white/10 hover:text-white"
    : "text-foreground/80 hover:bg-muted hover:text-foreground";
  const skeletonPill = overlay ? "bg-white/10" : "bg-muted";

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full backdrop-blur-md",
        overlay
          ? "border-b border-white/10 bg-black/30"
          : "border-b border-border bg-background/70"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="CORE IT home">
          {overlay ? (
            <Image
              src="/logo-dark.png"
              alt="CORE IT"
              width={420}
              height={264}
              priority
              className="h-12 w-auto rounded-sm"
            />
          ) : (
            <>
              <Image
                src="/logo-light.png"
                alt="CORE IT"
                width={420}
                height={264}
                priority
                className="h-12 w-auto rounded-sm dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt="CORE IT"
                width={420}
                height={264}
                priority
                className="hidden h-12 w-auto rounded-sm dark:block"
              />
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" className={navText} asChild>
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {mounted && (
            <HeaderThemeToggle
              resolvedTheme={resolvedTheme}
              setTheme={setTheme}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg [&_svg]:size-4.5",
                iconText
              )}
            />
          )}
          {isPending ? (
            <div className="flex items-center gap-2" aria-hidden>
              <div className={cn("h-8 w-16 animate-pulse rounded-lg", skeletonPill)} />
              <div className={cn("h-8 w-20 animate-pulse rounded-lg", skeletonPill)} />
            </div>
          ) : user ? (
            <Button className="gap-2" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" className={navText} asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className={cn("border-none bg-transparent md:hidden", iconText)}
            >
              <Menu strokeWidth={3} className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Image
                src="/logo-light.png"
                alt="CORE IT"
                width={420}
                height={264}
                className="h-8 w-auto rounded-sm dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt="CORE IT"
                width={420}
                height={264}
                className="hidden h-8 w-auto rounded-sm dark:block"
              />
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-2">
              {navLinks.map((link) => (
                <SheetClose key={link.href} asChild>
                  <a
                    href={link.href}
                    className="rounded-md px-3 py-2.5 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 p-4">
              {mounted && (
                <div className="mb-1 flex items-center justify-between rounded-lg border border-input px-3 py-2.5">
                  <span className="text-sm font-medium text-foreground">
                    {resolvedTheme === "light" ? "Light mode" : "Dark mode"}
                  </span>
                  <HeaderThemeToggle
                    resolvedTheme={resolvedTheme}
                    setTheme={setTheme}
                    className="flex size-8 items-center justify-center rounded-md text-foreground hover:bg-muted [&_svg]:size-4"
                  />
                </div>
              )}
              {isPending ? (
                <div className="flex flex-col gap-2" aria-hidden>
                  <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
                  <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
                </div>
              ) : user ? (
                <SheetClose asChild>
                  <Button className="gap-2" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </Button>
                </SheetClose>
              ) : (
                <>
                  <SheetClose asChild>
                    <Button variant="outline" asChild>
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild>
                      <Link href="/signup">Sign up</Link>
                    </Button>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
