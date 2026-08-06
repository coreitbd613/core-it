"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, PrinterIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { InvoiceDocument } from "@/components/shared/invoice-document"
import { InvoiceDownloadButton } from "@/components/shared/invoice-pdf"
import { useMyInvoice } from "@/hooks/use-invoices"
import { MOBILE_BANKING_NUMBER } from "@/lib/contact"
import { formatBDT, formatDate } from "@/lib/format"
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

  const { status, grandTotalBdt, paidBdt, balanceBdt } = invoice.computed
  const paidPercent = grandTotalBdt > 0 ? Math.min(100, Math.round((paidBdt / grandTotalBdt) * 100)) : 0
  const canPay = balanceBdt > 0 && status !== "CANCELLED" && status !== "DRAFT"
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
            Issued {formatDate(invoice.issuedAt)} · Due {formatDate(invoice.dueAt)}
          </p>
        </div>
        <Badge variant={invoiceStatusVariant[status]} className="ml-auto">
          {invoiceStatusLabels[status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
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

        <Card className="print:hidden lg:sticky lg:top-6">
          <CardHeader>
            <CardDescription>{balanceBdt > 0 ? "Amount due" : "Total"}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {formatBDT(balanceBdt > 0 ? balanceBdt : grandTotalBdt)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={invoiceStatusVariant[status]}>{invoiceStatusLabels[status]}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Due date</span>
                <span className="font-medium text-foreground">{formatDate(invoice.dueAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Issued</span>
                <span className="font-medium text-foreground">{formatDate(invoice.issuedAt)}</span>
              </div>
            </div>

            {grandTotalBdt > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Paid {formatBDT(paidBdt)} of {formatBDT(grandTotalBdt)}
                  </span>
                  <span className="tabular-nums">{paidPercent}%</span>
                </div>
                <Progress value={paidPercent} className="h-1.5" />
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1 [&>a]:w-full [&>button]:w-full">
                <InvoiceDownloadButton invoice={invoice} />
              </div>
              <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                <PrinterIcon />
                Print
              </Button>
            </div>

            {canPay && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Offline payment</p>
                <p className="mt-1">
                  bKash/Nagad/Rocket: <span className="tabular-nums text-foreground">{MOBILE_BANKING_NUMBER}</span>
                </p>
                <p>
                  Reference: <span className="font-medium text-foreground">{invoice.number}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
