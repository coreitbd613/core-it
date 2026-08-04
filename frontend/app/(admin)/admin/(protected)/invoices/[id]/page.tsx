"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, BanIcon, CopyIcon, PrinterIcon, SendIcon, XIcon } from "lucide-react"
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Textarea } from "@/components/ui/textarea"
import { InvoiceDocument } from "@/components/shared/invoice-document"
import { InvoiceDownloadButton } from "@/components/shared/invoice-pdf"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { formatBDT } from "@/lib/format"
import {
  deriveInvoiceStatus,
  invoiceBalanceBdt,
  invoiceStatusLabels,
  invoiceStatusVariant,
  mockInvoices,
  paymentMethodLabels,
  type PaymentMethod,
} from "@/lib/mock/invoices"
import { mockProposals } from "@/lib/mock/proposals"

import { RecordPaymentDialog } from "./_components/record-payment-dialog"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"

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
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/invoices" aria-label="Back to invoices">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{invoice.number}</h1>
          <p className="text-muted-foreground">{invoice.organizationName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={invoiceStatusVariant[status]}>{invoiceStatusLabels[status]}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(`${SITE_URL}/invoices/view/${invoice.id}`)
              toast.success("Link copied.")
            }}
          >
            <CopyIcon />
            Copy link
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <PrinterIcon />
            Print
          </Button>
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

      <InvoiceDocument invoice={invoice} />

      {relatedProposal && (
        <p className="mx-auto -mt-2 w-full max-w-3xl text-sm text-muted-foreground print:hidden">
          Created from proposal{" "}
          <Link href={`/admin/proposals/${relatedProposal.id}`} className="underline">
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

      {invoice.status === "DRAFT" && (
        <div className="mx-auto flex w-full max-w-3xl justify-end print:hidden">
          <Button onClick={handleSend}>
            <SendIcon />
            Send to company
          </Button>
        </div>
      )}

      <Card className="max-w-3xl print:hidden">
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
