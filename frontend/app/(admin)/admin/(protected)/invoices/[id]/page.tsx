"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, BanIcon, SendIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

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
import { Textarea } from "@/components/ui/textarea"
import { InvoiceDownloadButton } from "@/components/shared/invoice-pdf"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { formatBDT } from "@/lib/format"
import {
  deriveInvoiceStatus,
  invoiceBalanceBdt,
  invoiceStatusLabels,
  invoiceStatusVariant,
  invoiceTotalBdt,
  invoiceTypeLabels,
  mockInvoices,
  paymentMethodLabels,
  type PaymentMethod,
} from "@/lib/mock/invoices"
import { mockProposals } from "@/lib/mock/proposals"

import { RecordPaymentDialog } from "./_components/record-payment-dialog"

export default function AdminInvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAdminAuth()
  const [, forceRerender] = React.useState(0)
  const [voidReason, setVoidReason] = React.useState("")

  const invoice = mockInvoices.find((inv) => inv.id === params.id)

  if (!invoice) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Invoice not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/invoices">Back to invoices</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const total = invoiceTotalBdt(invoice)
  const balance = invoiceBalanceBdt(invoice)
  const status = deriveInvoiceStatus(invoice)
  const relatedProposal = invoice.proposalId
    ? mockProposals.find((p) => p.id === invoice.proposalId)
    : null
  const canVoid = status !== "DRAFT" && status !== "CANCELLED" && status !== "PAID"

  function handleSend() {
    invoice!.status = "SENT"
    forceRerender((n) => n + 1)
    toast.success(`Sent to ${invoice!.organizationName}.`)
  }

  function handleVoid() {
    invoice!.status = "CANCELLED"
    invoice!.voidReason = voidReason.trim()
    setVoidReason("")
    forceRerender((n) => n + 1)
    toast.success("Invoice voided.")
  }

  function handleRecordPayment(amount: number, method: PaymentMethod, note: string) {
    invoice!.payments.push({
      id: crypto.randomUUID(),
      amountBdt: amount,
      method,
      note,
      recordedBy: user?.name ?? user?.email ?? "Core IT",
      paidAt: new Date().toISOString().slice(0, 10),
    })
    forceRerender((n) => n + 1)
    toast.success("Payment recorded.")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/invoices" aria-label="Back to invoices">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{invoice.number}</h1>
          <p className="text-muted-foreground">
            {invoice.organizationName} · {invoiceTypeLabels[invoice.type]}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={invoiceStatusVariant[status]}>{invoiceStatusLabels[status]}</Badge>
          <InvoiceDownloadButton invoice={invoice} />
          {canVoid && (
            <AlertDialog onOpenChange={(open) => !open && setVoidReason("")}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BanIcon />
                  Void
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Void this invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The invoice stays on record as cancelled — it won&apos;t be deleted, and
                    can&apos;t be sent or paid afterward.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Reason for voiding this invoice..."
                  rows={3}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={!voidReason.trim()}
                    onClick={handleVoid}
                  >
                    Void invoice
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y rounded-lg border">
            {invoice.lineItems.map((item) => (
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
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Balance due</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatBDT(balance)}
              </span>
            </div>
          </div>

          {relatedProposal && (
            <p className="mt-4 text-sm text-muted-foreground">
              Created from proposal{" "}
              <Link href={`/admin/proposals/${relatedProposal.id}`} className="underline">
                {relatedProposal.proposalNumber}
              </Link>
              .
            </p>
          )}

          {invoice.status === "CANCELLED" && invoice.voidReason && (
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Void reason:</span>{" "}
              {invoice.voidReason}
            </p>
          )}
        </CardContent>
        {invoice.status === "DRAFT" && (
          <CardFooter className="justify-end border-t">
            <Button onClick={handleSend}>
              <SendIcon />
              Send to company
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card className="max-w-3xl">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Payment history</CardTitle>
          {balance > 0 && invoice.status !== "DRAFT" && invoice.status !== "CANCELLED" && (
            <RecordPaymentDialog maxAmount={balance} onRecord={handleRecordPayment} />
          )}
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
                      {new Date(payment.paidAt).toLocaleDateString()} · recorded by{" "}
                      {payment.recordedBy}
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
