"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "lucide-react"
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatBDT } from "@/lib/format"
import { mockInvoices } from "@/lib/mock/invoices"
import {
  mockQuotations,
  quotationStatusLabels,
  quotationStatusVariant,
  quotationTotalBdt,
} from "@/lib/mock/quotations"

function nextInvoiceNumber() {
  return `INV-2026-${String(mockInvoices.length + 1).padStart(3, "0")}`
}

export default function AdminQuotationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const quotation = mockQuotations.find((q) => q.id === params.id)

  if (!quotation) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Quotation not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/quotations">Back to quotations</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function handleConvert() {
    const invoiceId = crypto.randomUUID()
    const today = new Date()
    const due = new Date(today)
    due.setDate(due.getDate() + 14)

    mockInvoices.unshift({
      id: invoiceId,
      number: nextInvoiceNumber(),
      organizationId: quotation!.organizationId,
      organizationName: quotation!.organizationName,
      lineItems: quotation!.lineItems.map((item) => ({ ...item, id: crypto.randomUUID() })),
      payments: [],
      status: "SENT",
      issuedAt: today.toISOString().slice(0, 10),
      dueAt: due.toISOString().slice(0, 10),
    })

    quotation!.status = "CONVERTED"
    quotation!.convertedInvoiceId = invoiceId
    toast.success("Converted to invoice.")
    router.push(`/admin/invoices/${invoiceId}`)
  }

  const total = quotationTotalBdt(quotation)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/quotations" aria-label="Back to quotations">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{quotation.title}</h1>
          <p className="text-muted-foreground">{quotation.organizationName}</p>
        </div>
        <Badge variant={quotationStatusVariant[quotation.status]} className="ml-auto">
          {quotationStatusLabels[quotation.status]}
        </Badge>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y rounded-lg border">
            {quotation.lineItems.map((item) => (
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
            <div className="flex items-center justify-between gap-4 bg-muted/40 px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatBDT(total)}
              </span>
            </div>
          </div>
        </CardContent>
        {quotation.status === "ACCEPTED" && (
          <CardFooter className="justify-end border-t">
            <Button onClick={handleConvert}>
              Convert to invoice
              <ArrowRightIcon />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
