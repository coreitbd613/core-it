import Link from "next/link"
import { FileTextIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatBDT, formatDate } from "@/lib/format"
import { mockProposals, proposalGrandTotalBdt, proposalStatusLabels, proposalStatusVariant } from "@/lib/mock/proposals"

export function ClientProposalsTab({ organizationName }: { organizationName: string }) {
  const proposals = mockProposals.filter((p) => p.organizationName === organizationName)

  if (proposals.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyTitle>No proposals yet</EmptyTitle>
          <EmptyDescription>Proposals sent to this client will show up here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col divide-y p-0">
        {proposals.map((proposal) => (
          <Link
            key={proposal.id}
            href={`/admin/proposals/${proposal.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{proposal.title}</p>
              <p className="text-xs text-muted-foreground">
                {proposal.proposalNumber}
                {proposal.sentAt ? ` · Sent ${formatDate(proposal.sentAt)}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatBDT(proposalGrandTotalBdt(proposal))}
              </span>
              <Badge variant={proposalStatusVariant[proposal.status]}>
                {proposalStatusLabels[proposal.status]}
              </Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
