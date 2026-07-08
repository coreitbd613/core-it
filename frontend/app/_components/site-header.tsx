"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Menu } from "lucide-react";
import { useTheme } from "next-themes";

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
  { label: "Services", href: "#services" },
  { label: "Solutions", href: "#solutions" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isPending } = useClientAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="CORE IT home">
          <Image
            src="/logo-dark.png"
            alt="CORE IT"
            width={420}
            height={264}
            priority
            className="h-36 w-auto rounded-sm"
          />
        </Link>
        

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" asChild>
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {mounted && (
            <AnimatedThemeToggler
              theme={resolvedTheme === "light" ? "light" : "dark"}
              onThemeChange={(theme) => setTheme(theme)}
              className="flex size-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white [&_svg]:size-4.5"
            />
          )}
          {!mounted || isPending ? null : user ? (
            <Button
              size="lg"
              className="gap-2 bg-[#FD6005] text-white hover:bg-[#FD6005]/85"
              asChild
            >
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="lg" className="bg-[#FD6005] text-white hover:bg-[#FD6005]/85" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="border-none bg-transparent text-white hover:bg-transparent hover:text-white"
            >
              <Menu strokeWidth={3} className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Image
                  src="/logo.jpeg"
                  alt="CORE IT"
                  width={420}
                  height={264}
                  className="h-8 w-auto rounded-sm"
                />
              </SheetTitle>
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
                  <AnimatedThemeToggler
                    theme={resolvedTheme === "light" ? "light" : "dark"}
                    onThemeChange={(theme) => setTheme(theme)}
                    className="flex size-8 items-center justify-center rounded-md text-foreground hover:bg-muted [&_svg]:size-4"
                  />
                </div>
              )}
              {mounted && !isPending && user ? (
                <SheetClose asChild>
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </Button>
                </SheetClose>
              ) : (
                <>
                  <SheetClose asChild>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/login">Sign in</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button size="lg" asChild>
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
