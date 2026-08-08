"use client"

import { FaWhatsapp } from "react-icons/fa6"

import { Button } from "@/components/ui/button"
import { waLink, type Lead } from "@/lib/leads"

export function LeadQuickActions({ lead }: { lead: Lead }) {
  const whatsappLink = waLink(lead.phone)

  if (!whatsappLink) return null

  return (
    <Button variant="ghost" size="icon-sm" aria-label="WhatsApp" asChild>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <FaWhatsapp className="text-[#25D366]" />
      </a>
    </Button>
  )
}
