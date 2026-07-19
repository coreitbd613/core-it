"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { XIcon } from "lucide-react"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { mockProposals } from "@/lib/mock/proposals"

import { ProposalForm } from "../../_components/proposal-form"

export default function EditProposalPage() {
  const params = useParams<{ id: string }>()
  const proposal = mockProposals.find((p) => p.id === params.id)

  if (!proposal) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Proposal not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/proposals">Back to proposals</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (proposal.status !== "DRAFT") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>This proposal can no longer be edited</EmptyTitle>
          <EmptyDescription>
            Only drafts can be edited — once a proposal is sent, use the discussion thread to
            follow up, or send a new proposal instead.{" "}
            <Link href={`/admin/proposals/${proposal.id}`}>View proposal</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <ProposalForm mode="edit" proposal={proposal} />
}
