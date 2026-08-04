"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, PrinterIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InvoiceDocument } from "@/components/shared/invoice-document"
import { InvoiceDownloadButton } from "@/components/shared/invoice-pdf"
import { formatBDT } from "@/lib/format"
import {
  deriveInvoiceStatus,
  invoiceStatusLabels,
  invoiceStatusVariant,
  mockInvoices,
  paymentMethodLabels,
} from "@/lib/mock/invoices"
import { mockProposals } from "@/lib/mock/proposals"

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const [, forceRerender] = React.useState(0)
  const invoice = mockInvoices.find((inv) => inv.id === params.id)

  React.useEffect(() => {
    if (invoice && invoice.status === "SENT") {
      invoice.status = "VIEWED"
      forceRerender((n) => n + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice?.id])

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

  const status = deriveInvoiceStatus(invoice)
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

      <Card className="max-w-3xl print:hidden">
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {paymentMethodLabels[payment.method]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.paidAt).toLocaleDateString()}
                      {payment.note ? ` · ${payment.note}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatBDT(payment.amountBdt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
