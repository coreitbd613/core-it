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
import { formatBDT } from "@/lib/format"
import {
  mockQuotations,
  quotationStatusLabels,
  quotationStatusVariant,
  quotationTotalBdt,
} from "@/lib/mock/quotations"

export default function QuotationDetailPage() {
  const params = useParams<{ id: string }>()
  const [, forceRerender] = React.useState(0)

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
            <Link href="/quotations">Back to quotations</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function respond(status: "ACCEPTED" | "DECLINED") {
    quotation!.status = status
    quotation!.respondedAt = new Date().toISOString().slice(0, 10)
    forceRerender((n) => n + 1)
    toast.success(status === "ACCEPTED" ? "Quotation accepted." : "Quotation declined.")
  }

  const total = quotationTotalBdt(quotation)
  const canRespond = quotation.status === "SENT"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/quotations" aria-label="Back to quotations">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{quotation.title}</h1>
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

          {quotation.status === "CONVERTED" && quotation.convertedInvoiceId && (
            <p className="mt-4 text-sm text-muted-foreground">
              This quotation was converted to{" "}
              <Link href={`/invoices/${quotation.convertedInvoiceId}`} className="underline">
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
                  Decline
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Decline this quotation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Core IT will be notified that you don&apos;t want to proceed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => respond("DECLINED")}>Decline</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => respond("ACCEPTED")}>
              <CheckIcon />
              Accept
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
