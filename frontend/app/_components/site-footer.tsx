"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa6";

import { Dock, DockIcon } from "@/components/ui/dock";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/coreitbd",
    icon: FaFacebookF,
    color: "#1877F2",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/8801581633810",
    icon: FaWhatsapp,
    color: "#25D366",
  },
  {
    label: "Instagram",
    href: "#",
    icon: FaInstagram,
    color: "#E4405F",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/core-it-bd",
    icon: FaLinkedinIn,
    color: "#0A66C2",
  },
] as const;

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Domains", href: "/domains" },
      { label: "Hosting", href: "/hosting" },
      { label: "Sign up", href: "/signup" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Services", href: "/#services" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Terms and Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12 lg:px-8">
        <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
          <Link href="/" className="flex h-8 w-fit items-center" aria-label="CORE IT home">
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
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Professional software solutions for every business need.
          </p>
          <Dock className="mx-0 mt-0 justify-start gap-1">
            {socialLinks.map(({ label, href, icon: Icon, color }) => (
              <DockIcon key={label}>
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-full items-center justify-center"
                >
                  <Icon className="size-full" style={{ color }} />
                </Link>
              </DockIcon>
            ))}
          </Dock>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground">
              {column.title}
            </span>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {year} CORE IT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
