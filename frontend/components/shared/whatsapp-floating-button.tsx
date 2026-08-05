"use client"

import { usePathname } from "next/navigation"
import { FaWhatsapp } from "react-icons/fa6"

import { WHATSAPP_URL } from "@/lib/contact"

// WhatsApp's brand green — a fixed third-party brand color, not a Core IT
// design token (same literal used for the icon in site-footer.tsx).
const WHATSAPP_GREEN = "#25D366"

const PREFILLED_MESSAGE = "Hi Core IT! I'd like to know more about your services."

export function WhatsAppFloatingButton() {
  const pathname = usePathname()
  // Admin/portal are internal dashboards, not marketing pages — no chat CTA there.
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/portal")) {
    return null
  }

  return (
    <a
      href={`${WHATSAPP_URL}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed right-6 bottom-6 z-50 flex size-14 items-center justify-center"
    >
      <span
        aria-hidden
        className="motion-safe:animate-ping absolute inset-0 rounded-full opacity-60"
        style={{ backgroundColor: WHATSAPP_GREEN }}
      />
      <span
        className="relative flex size-14 items-center justify-center rounded-full shadow-lg transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: WHATSAPP_GREEN }}
      >
        <FaWhatsapp className="size-7 text-white" />
      </span>
    </a>
  )
}
