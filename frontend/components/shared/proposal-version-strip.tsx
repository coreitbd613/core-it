import Link from "next/link"

import { cn } from "@/lib/utils"
import { proposalVersionHistory, type Proposal } from "@/lib/mock/proposals"

export function ProposalVersionStrip({
  proposal,
  basePath,
}: {
  proposal: Proposal
  basePath: string
}) {
  const versions = proposalVersionHistory(proposal)
  if (versions.length <= 1) return null

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Versions:</span>
      <div className="flex items-center gap-1.5">
        {versions.map((v) => (
          <Link
            key={v.id}
            href={`${basePath}/${v.id}`}
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs font-medium",
              v.id === proposal.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            v{v.version}
          </Link>
        ))}
      </div>
    </div>
  )
}
