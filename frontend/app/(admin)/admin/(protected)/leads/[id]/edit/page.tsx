"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { XIcon } from "lucide-react"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { mockLeads } from "@/lib/mock/leads"

import { LeadForm } from "../../_components/lead-form"

export default function EditLeadPage() {
  const params = useParams<{ id: string }>()
  const lead = mockLeads.find((l) => l.id === params.id)

  if (!lead) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Lead not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/leads">Back to leads</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <LeadForm mode="edit" lead={lead} />
}
