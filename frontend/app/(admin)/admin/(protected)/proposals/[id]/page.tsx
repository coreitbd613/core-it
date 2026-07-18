"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon, SendIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ProposalComments } from "@/components/shared/proposal-comments"
import { ProposalDownloadButton } from "@/components/shared/proposal-pdf"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { formatBDT } from "@/lib/format"
import {
  contractStatusLabels,
  contractStatusVariant,
  generateContractTerms,
  mockContracts,
} from "@/lib/mock/contracts"
import { mockInvoices } from "@/lib/mock/invoices"
import {
  deriveProposalStatus,
  mockProposals,
  proposalGrandTotalBdt,
  proposalStatusLabels,
  proposalStatusVariant,
  proposalTotalBdt,
} from "@/lib/mock/proposals"

function nextInvoiceNumber() {
  return `INV-2026-${String(mockInvoices.length + 1).padStart(3, "0")}`
}

export default function AdminProposalDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAdminAuth()
  const [, forceRerender] = React.useState(0)

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

  function handleSend() {
    proposal!.status = "SENT"
    proposal!.sentAt = new Date().toISOString().slice(0, 10)
    forceRerender((n) => n + 1)
    toast.success(`Sent to ${proposal!.organizationName}.`)
  }

  const contract = proposal.contractId
    ? mockContracts.find((c) => c.id === proposal.contractId)
    : null

  function handleSendContract() {
    const contractId = crypto.randomUUID()
    mockContracts.unshift({
      id: contractId,
      proposalId: proposal!.id,
      organizationId: proposal!.organizationId,
      organizationName: proposal!.organizationName,
      title: proposal!.title,
      termsText: generateContractTerms(proposal!),
      status: "SENT",
      sentAt: new Date().toISOString().slice(0, 10),
      signedByName: null,
      signedAt: null,
    })
    proposal!.contractId = contractId
    forceRerender((n) => n + 1)
    toast.success("Contract sent to the client.")
  }

  function handleConvert() {
    const invoiceId = crypto.randomUUID()
    const today = new Date()
    const due = new Date(today)
    due.setDate(due.getDate() + 14)

    mockInvoices.unshift({
      id: invoiceId,
      number: nextInvoiceNumber(),
      organizationId: proposal!.organizationId,
      organizationName: proposal!.organizationName,
      lineItems: proposal!.lineItems.map((item) => ({ ...item, id: crypto.randomUUID() })),
      payments: [],
      status: "SENT",
      issuedAt: today.toISOString().slice(0, 10),
      dueAt: due.toISOString().slice(0, 10),
    })

    proposal!.convertedInvoiceId = invoiceId
    router.push(`/admin/invoices/${invoiceId}`)
    toast.success("Converted to invoice.")
  }

  const subtotal = proposalTotalBdt(proposal)
  const total = proposalGrandTotalBdt(proposal)
  const discountAmount = subtotal * (proposal.discountPercent / 100)
  const taxAmount = (subtotal - discountAmount) * (proposal.taxPercent / 100)
  const status = deriveProposalStatus(proposal)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/proposals" aria-label="Back to proposals">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <p className="text-muted-foreground">
            {proposal.proposalNumber} · {proposal.organizationName}
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
            dangerouslySetInnerHTML={{ __html: proposal.descriptionHtml || "<p>No description provided.</p>" }}
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

          {proposal.respondedAt && (
            <p className="mt-4 text-sm text-muted-foreground">
              Company responded on {new Date(proposal.respondedAt).toLocaleDateString()}.
            </p>
          )}

          {proposal.convertedInvoiceId && (
            <p className="mt-4 text-sm text-muted-foreground">
              This proposal was converted to{" "}
              <Link href={`/admin/invoices/${proposal.convertedInvoiceId}`} className="underline">
                an invoice
              </Link>
              .
            </p>
          )}
        </CardContent>
        {proposal.status === "DRAFT" && (
          <CardFooter className="justify-end border-t">
            <Button onClick={handleSend}>
              <SendIcon />
              Send to company
            </Button>
          </CardFooter>
        )}
        {contract?.status === "SIGNED" && !proposal.convertedInvoiceId && (
          <CardFooter className="justify-end border-t">
            <Button onClick={handleConvert}>
              Convert to invoice
              <ArrowRightIcon />
            </Button>
          </CardFooter>
        )}
      </Card>

      {proposal.status === "APPROVED" && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Contract</CardTitle>
            <CardDescription>
              {contract
                ? "Client must sign before this can be invoiced."
                : "Send a contract for the client to sign before invoicing."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contract ? (
              <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                <span className="text-sm text-foreground">{contract.title}</span>
                <div className="flex items-center gap-3">
                  <Badge variant={contractStatusVariant[contract.status]}>
                    {contractStatusLabels[contract.status]}
                  </Badge>
                  <Link
                    href={`/admin/contracts/${contract.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ) : (
              <Button onClick={handleSendContract}>Send contract</Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <ProposalComments
            proposalId={proposal.id}
            authorName={user?.name ?? "Core IT"}
            authorRole="ADMIN"
            onAdded={() => forceRerender((n) => n + 1)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
