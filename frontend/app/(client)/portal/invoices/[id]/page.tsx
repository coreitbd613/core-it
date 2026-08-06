"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, PrinterIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { InvoiceDocument } from "@/components/shared/invoice-document"
import { InvoiceDownloadButton } from "@/components/shared/invoice-pdf"
import { useMyInvoice } from "@/hooks/use-invoices"
import { invoiceStatusLabels, invoiceStatusVariant } from "@/lib/invoices"
import { mockProposals } from "@/lib/mock/proposals"

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: invoice, isLoading } = useMyInvoice(params.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Invoice not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/portal/invoices">Back to invoices</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const status = invoice.computed.status
  const relatedProposal = invoice.proposalId
    ? mockProposals.find((p) => p.id === invoice.proposalId)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal/invoices" aria-label="Back to invoices">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{invoice.number}</h1>
          <p className="text-muted-foreground">
            Issued {new Date(invoice.issuedAt).toLocaleDateString()} · Due{" "}
            {new Date(invoice.dueAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={invoiceStatusVariant[status]} className="ml-auto">
          {invoiceStatusLabels[status]}
        </Badge>
        <Button variant="outline" size="sm" className="print:hidden" onClick={() => window.print()}>
          <PrinterIcon />
          Print
        </Button>
        <div className="print:hidden">
          <InvoiceDownloadButton invoice={invoice} />
        </div>
      </div>

      <InvoiceDocument invoice={invoice} />

      {relatedProposal && (
        <p className="mx-auto -mt-2 w-full max-w-3xl text-sm text-muted-foreground print:hidden">
          Created from proposal{" "}
          <Link href={`/portal/proposals/${relatedProposal.id}`} className="underline">
            {relatedProposal.proposalNumber}
          </Link>
          .
        </p>
      )}

      {invoice.status === "CANCELLED" && invoice.voidReason && (
        <p className="mx-auto -mt-2 w-full max-w-3xl text-sm text-muted-foreground print:hidden">
          <span className="font-medium text-foreground">Void reason:</span> {invoice.voidReason}
        </p>
      )}
    </div>
  )
}
