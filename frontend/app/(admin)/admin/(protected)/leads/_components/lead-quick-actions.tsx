"use client"

import { MailIcon, PhoneIcon } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa6"

import { Button } from "@/components/ui/button"
import { waLink, type Lead } from "@/lib/mock/leads"

export function LeadQuickActions({ lead }: { lead: Lead }) {
  const whatsappLink = waLink(lead.phone)

  if (!lead.phone && !lead.email) return null

  return (
    <div className="flex items-center gap-1">
      {lead.phone && (
        <Button variant="ghost" size="icon-sm" aria-label="Call" asChild>
          <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()}>
            <PhoneIcon />
          </a>
        </Button>
      )}
      {lead.email && (
        <Button variant="ghost" size="icon-sm" aria-label="Email" asChild>
          <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()}>
            <MailIcon />
          </a>
        </Button>
      )}
      {whatsappLink && (
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
      )}
    </div>
  )
}
