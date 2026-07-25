"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { services } from "@/lib/services";
import { useClientAuth } from "@/contexts/client-auth-context";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const navLinks = [
  { label: "Domains", href: "/domains" },
  { label: "Hosting", href: "/hosting" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact-us" },
] as const;

function MobileMenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-4 w-5 flex-col justify-between">
      <span
        className={cn(
          "h-0.5 w-full rounded-full bg-current transition-transform duration-300 ease-out",
          open && "translate-y-[7px] rotate-45"
        )}
      />
      <span
        className={cn(
          "h-0.5 w-full rounded-full bg-current transition-opacity duration-200 ease-out",
          open && "opacity-0"
        )}
      />
      <span
        className={cn(
          "h-0.5 w-full rounded-full bg-current transition-transform duration-300 ease-out",
          open && "-translate-y-[7px] -rotate-45"
        )}
      />
    </span>
  );
}

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

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isPending } = useClientAuth();
  // Admin sessions use a separate cookie/scope from client sessions, so an
  // admin can be signed into the panel without a client session existing.
  const { data: adminUser } = useCurrentUser("admin");
  const isAdmin = adminUser?.role === "ADMIN";
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"main" | "services">("main");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function toggleMobileMenu() {
    setMobileOpen((open) => {
      if (!open) setMobileView("main");
      return !open;
    });
  }

  const navText = "text-foreground/80 hover:text-foreground hover:bg-muted";
  const iconText = "text-foreground/80 hover:bg-muted hover:text-foreground";
  const skeletonPill = "bg-muted";

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="CORE IT home">
          <Image
            src="/logo-light.png"
            alt="CORE IT"
            width={527}
            height={135}
            priority
            className="h-9 w-auto dark:hidden"
          />
          <Image
            src="/logo-dark.png"
            alt="CORE IT"
            width={527}
            height={135}
            priority
            className="hidden h-9 w-auto dark:block"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn("bg-transparent", navText)}>
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[720px] grid-cols-2 gap-2 p-3">
                    {services.map((service) => (
                      <li key={service.title}>
                        <NavigationMenuLink asChild>
                          <Link href={service.href ?? "/#services"} className="flex-row items-start gap-4 p-3">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <service.icon className="size-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-base font-semibold text-foreground">
                                {service.title}
                              </span>
                              <span className="text-sm leading-relaxed text-muted-foreground">
                                {service.description}
                              </span>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" className={navText} asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAdmin && (
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/admin/dashboard">
                <ShieldCheck className="size-4" />
                Admin
              </Link>
            </Button>
          )}
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
              <Link href="/portal/dashboard">
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

        <div className="flex items-center gap-1 md:hidden">
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
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={toggleMobileMenu}
            className={cn("relative z-[60] border-none bg-transparent", iconText)}
          >
            <MobileMenuIcon open={mobileOpen} />
          </Button>

          <div
            aria-hidden={!mobileOpen}
            className={cn(
              "fixed inset-0 z-50 flex flex-col bg-background transition-all duration-300 ease-out",
              mobileOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-4 opacity-0"
            )}
          >
            <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
              <Image
                src="/logo-light.png"
                alt="CORE IT"
                width={527}
                height={135}
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt="CORE IT"
                width={527}
                height={135}
                className="hidden h-8 w-auto dark:block"
              />
            </div>

            {mobileView === "main" ? (
              <nav className="flex flex-col overflow-y-auto px-6">
                <button
                  type="button"
                  onClick={() => setMobileView("services")}
                  className="flex items-center justify-between border-b border-dashed border-border py-4 text-left text-lg font-medium text-foreground"
                >
                  Services
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="border-b border-dashed border-border py-4 text-lg font-medium text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            ) : (
              <div className="flex flex-col overflow-y-auto px-6">
                <button
                  type="button"
                  onClick={() => setMobileView("main")}
                  className="flex items-center gap-1 py-4 text-sm font-medium text-muted-foreground"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </button>
                {services.map((service) => (
                  <Link
                    key={service.title}
                    href={service.href ?? "/#services"}
                    onClick={closeMobileMenu}
                    className="flex items-start gap-3 border-b border-dashed border-border py-4"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <service.icon className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-foreground">
                        {service.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {service.description}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 px-6 py-6">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 gap-2 text-base"
                  onClick={closeMobileMenu}
                  asChild
                >
                  <Link href="/admin/dashboard">
                    <ShieldCheck className="size-5" />
                    Admin
                  </Link>
                </Button>
              )}
              {isPending ? (
                <div className="grid grid-cols-2 gap-3" aria-hidden>
                  <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
                  <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
                </div>
              ) : user ? (
                <Button size="lg" className="h-12 gap-2 text-base" onClick={closeMobileMenu} asChild>
                  <Link href="/portal/dashboard">
                    <LayoutDashboard className="size-5" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 text-base"
                    onClick={closeMobileMenu}
                    asChild
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button size="lg" className="h-12 text-base" onClick={closeMobileMenu} asChild>
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
