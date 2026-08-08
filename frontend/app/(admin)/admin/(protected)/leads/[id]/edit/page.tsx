"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { XIcon } from "lucide-react"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useAdminLead } from "@/hooks/use-leads"

import { LeadForm } from "../../_components/lead-form"

export default function EditLeadPage() {
  const params = useParams<{ id: string }>()
  const { data: lead, isLoading } = useAdminLead(params.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-6" />
      </div>
    )
  }

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
