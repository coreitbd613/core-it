"use client"

import * as React from "react"
import { ExternalLinkIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { Proposal } from "@/lib/mock/proposals"

export function ProposalPdfLinkCard({
  proposal,
  onSaved,
}: {
  proposal: Proposal
  onSaved: () => void
}) {
  const [pdfUrlDraft, setPdfUrlDraft] = React.useState(proposal.pdfUrl ?? "")

  React.useEffect(() => {
    setPdfUrlDraft(proposal.pdfUrl ?? "")
  }, [proposal.id, proposal.pdfUrl])

  const isDirty = pdfUrlDraft.trim() !== (proposal.pdfUrl ?? "")

  function handleSave() {
    proposal.pdfUrl = pdfUrlDraft.trim() || null
    onSaved()
    toast.success(proposal.pdfUrl ? "PDF link saved." : "PDF link removed.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal PDF</CardTitle>
        <CardDescription>
          Paste a link to a manually-made PDF (Google Drive, Dropbox, etc.) — when set, it&apos;s
          what the company downloads instead of the auto-generated PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Field>
          <FieldLabel htmlFor="proposal-pdf-url">PDF link</FieldLabel>
          <Input
            id="proposal-pdf-url"
            type="url"
            placeholder="https://drive.google.com/..."
            value={pdfUrlDraft}
            onChange={(e) => setPdfUrlDraft(e.target.value)}
          />
        </Field>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={!isDirty}>
            {proposal.pdfUrl && !pdfUrlDraft.trim() ? "Remove link" : "Save"}
          </Button>
          {proposal.pdfUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={proposal.pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon />
                Open
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
