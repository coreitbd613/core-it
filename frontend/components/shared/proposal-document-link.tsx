import { DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProposalDownloadButton } from "@/components/shared/proposal-pdf"
import type { Proposal } from "@/lib/mock/proposals"

/** Shows the manually-uploaded PDF link when set, otherwise falls back to the auto-generated PDF. */
export function ProposalDocumentLink({ proposal }: { proposal: Proposal }) {
  if (proposal.pdfUrl) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href={proposal.pdfUrl} target="_blank" rel="noopener noreferrer">
          <DownloadIcon />
          Download PDF
        </a>
      </Button>
    )
  }

  return <ProposalDownloadButton proposal={proposal} />
}
