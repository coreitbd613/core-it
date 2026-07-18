"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, CheckIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ProposalComments } from "@/components/shared/proposal-comments"
import { ProposalDownloadButton } from "@/components/shared/proposal-pdf"
import { useClientAuth } from "@/contexts/client-auth-context"
import { formatBDT } from "@/lib/format"
import { contractStatusLabels, mockContracts } from "@/lib/mock/contracts"
import {
  deriveProposalStatus,
  mockProposals,
  proposalGrandTotalBdt,
  proposalStatusLabels,
  proposalStatusVariant,
  proposalTotalBdt,
} from "@/lib/mock/proposals"

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>()
  const { user } = useClientAuth()
  const [, forceRerender] = React.useState(0)

  const proposal = mockProposals.find((p) => p.id === params.id)

  React.useEffect(() => {
    if (proposal && proposal.status === "SENT") {
      proposal.status = "VIEWED"
      proposal.viewedAt = new Date().toISOString().slice(0, 10)
      forceRerender((n) => n + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal])

  if (!proposal) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Proposal not found</EmptyTitle>
          <EmptyDescription>
            It may have been removed. <Link href="/portal/proposals">Back to proposals</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function respond(status: "APPROVED" | "REJECTED") {
    proposal!.status = status
    proposal!.respondedAt = new Date().toISOString().slice(0, 10)
    forceRerender((n) => n + 1)
    toast.success(status === "APPROVED" ? "Proposal approved." : "Proposal rejected.")
  }

  const subtotal = proposalTotalBdt(proposal)
  const total = proposalGrandTotalBdt(proposal)
  const discountAmount = subtotal * (proposal.discountPercent / 100)
  const taxAmount = (subtotal - discountAmount) * (proposal.taxPercent / 100)
  const status = deriveProposalStatus(proposal)
  const canRespond = status === "SENT" || status === "VIEWED"
  const contract = proposal.contractId
    ? mockContracts.find((c) => c.id === proposal.contractId)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal/proposals" aria-label="Back to proposals">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <p className="text-muted-foreground">
            {proposal.proposalNumber} · From {proposal.createdBy}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ProposalDownloadButton proposal={proposal} />
          <Badge variant={proposalStatusVariant[status]}>{proposalStatusLabels[status]}</Badge>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: proposal.descriptionHtml }}
          />

          <div className="mt-4 flex flex-col divide-y rounded-lg border">
            {proposal.lineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {formatBDT(item.quantity * item.unitPriceBdt)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatBDT(subtotal)}</span>
            </div>
            {proposal.discountPercent > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Discount ({proposal.discountPercent}%)</span>
                <span className="tabular-nums">-{formatBDT(discountAmount)}</span>
              </div>
            )}
            {proposal.taxPercent > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Tax ({proposal.taxPercent}%)</span>
                <span className="tabular-nums">{formatBDT(taxAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t pt-1.5 text-sm font-semibold text-foreground">
              <span>Total</span>
              <span className="tabular-nums">{formatBDT(total)}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Payment terms</p>
              <p className="text-sm text-foreground">{proposal.paymentTerms || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Timeline</p>
              <p className="text-sm text-foreground">{proposal.timeline || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valid until</p>
              <p className="text-sm text-foreground">
                {proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          {contract && (
            <p className="mt-4 text-sm text-muted-foreground">
              {contract.status === "SIGNED" ? (
                <>
                  Contract signed —{" "}
                  <Link href={`/portal/contracts/${contract.id}`} className="underline">
                    view contract
                  </Link>
                  .
                </>
              ) : (
                <>
                  A contract is ready for your signature —{" "}
                  <Link href={`/portal/contracts/${contract.id}`} className="underline">
                    review and sign
                  </Link>{" "}
                  ({contractStatusLabels[contract.status].toLowerCase()}).
                </>
              )}
            </p>
          )}

          {proposal.convertedInvoiceId && (
            <p className="mt-4 text-sm text-muted-foreground">
              This proposal was converted to{" "}
              <Link href={`/portal/invoices/${proposal.convertedInvoiceId}`} className="underline">
                an invoice
              </Link>
              .
            </p>
          )}
        </CardContent>
        {canRespond && (
          <CardFooter className="justify-end gap-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <XIcon />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject this proposal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Core IT will be notified. You can ask them to send a revised proposal later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => respond("REJECTED")}>Reject</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => respond("APPROVED")}>
              <CheckIcon />
              Approve
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <ProposalComments
            proposalId={proposal.id}
            authorName={user?.name ?? "You"}
            authorRole="CLIENT"
            onAdded={() => forceRerender((n) => n + 1)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
