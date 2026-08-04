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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { InvoiceDocument } from "@/components/shared/invoice-document"
import { InvoiceDownloadButton } from "@/components/shared/invoice-pdf"
import {
  useAdminInvoice,
  useRecordPayment,
  useSendInvoice,
  useVoidInvoice,
} from "@/hooks/use-invoices"
import { formatBDT } from "@/lib/format"
import { invoiceStatusLabels, invoiceStatusVariant, paymentMethodLabels, type PaymentMethod } from "@/lib/invoices"
import { mockProposals } from "@/lib/mock/proposals"

import { RecordPaymentDialog } from "./_components/record-payment-dialog"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"

export default function AdminInvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const [voidReason, setVoidReason] = React.useState("")

  const { data: invoice, isLoading } = useAdminInvoice(params.id)
  const sendInvoice = useSendInvoice(params.id)
  const voidInvoice = useVoidInvoice(params.id)
  const recordPayment = useRecordPayment(params.id)

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
            <Link href="/admin/invoices">Back to invoices</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const balance = invoice.computed.balanceBdt
  const status = invoice.computed.status
  const relatedProposal = invoice.proposalId
    ? mockProposals.find((p) => p.id === invoice.proposalId)
    : null
  const canVoid = status !== "DRAFT" && status !== "CANCELLED" && status !== "PAID"

  async function handleSend() {
    try {
      await sendInvoice.mutateAsync()
      toast.success(`Sent to ${invoice!.organization.name}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't send this invoice.")
    }
  }

  async function handleVoid() {
    try {
      await voidInvoice.mutateAsync(voidReason.trim())
      setVoidReason("")
      toast.success("Invoice voided.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't void this invoice.")
    }
  }

  async function handleRecordPayment(amount: number, method: PaymentMethod, note: string) {
    try {
      await recordPayment.mutateAsync({ amountBdt: amount, method, note })
      toast.success("Payment recorded.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't record this payment.")
    }
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
          <p className="text-muted-foreground">{invoice.organization.name}</p>
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
                      {new Date(payment.paidAt).toLocaleDateString()}
                      {payment.recordedByUser
                        ? ` · recorded by ${payment.recordedByUser.name ?? payment.recordedByUser.email}`
                        : ""}
                      {payment.note ? ` · ${payment.note}` : ""}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    {formatBDT(Number(payment.amountBdt))}
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
