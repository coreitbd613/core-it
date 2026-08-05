"use client"

import Image from "next/image"

import { useQrCodeDataUrl } from "@/hooks/use-qr-code-data-url"
import { BUSINESS_ADDRESS, MAPS_URL, MOBILE_BANKING_NUMBER, PRIVACY_URL, TERMS_URL } from "@/lib/contact"
import { formatBDT, formatDate } from "@/lib/format"
import { invoiceStatusLabels, paymentMethodLabels, type Invoice, type InvoiceStatus } from "@/lib/invoices"
import { cn } from "@/lib/utils"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "")

const watermarkLabels: Partial<Record<InvoiceStatus, string>> = {
  PAID: "Paid",
  CANCELLED: "Void",
  OVERDUE: "Overdue",
}

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.computed.subtotalBdt
  const discountAmount = invoice.computed.discountAmountBdt
  const taxAmount = (subtotal - discountAmount) * (invoice.taxPercent / 100)
  const total = invoice.computed.grandTotalBdt
  const paid = invoice.computed.paidBdt
  const balance = invoice.computed.balanceBdt
  const status = invoice.computed.status
  const watermark = watermarkLabels[status]
  const qrCodeUrl = useQrCodeDataUrl(`${SITE_URL}/invoices/view/${invoice.id}`)
  const canPay = balance > 0 && status !== "CANCELLED" && status !== "DRAFT"

  return (
    <div
      data-invoice-document
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl border bg-card p-8 shadow-sm sm:p-10 print:border-0 print:shadow-none"
    >
      {watermark && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 text-7xl font-bold tracking-widest text-foreground/5 select-none sm:text-8xl"
        >
          {watermark.toUpperCase()}
        </span>
      )}

      {/* Header: logo left, invoice title/number/status right */}
      <div className="relative flex items-start justify-between gap-6">
        <Image
          src="/logo-light.png"
          alt="Core IT"
          width={527}
          height={135}
          className="h-12 w-auto dark:hidden"
        />
        <Image
          src="/logo-dark.png"
          alt="Core IT"
          width={527}
          height={135}
          className="hidden h-12 w-auto dark:block"
        />

        <div className="flex flex-col items-end gap-2 text-right">
          <p className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Invoice
          </p>
          <p className="text-sm font-semibold tracking-wide text-primary">#{invoice.number}</p>
          <p
            className={cn(
              "text-xs font-semibold tracking-wider uppercase",
              status === "PAID" ? "text-green-600 dark:text-green-500" : "text-destructive"
            )}
          >
            {invoiceStatusLabels[status]}
          </p>
        </div>
      </div>

      {/* Bill to / Company details */}
      <div className="relative mt-8 grid grid-cols-1 gap-6 border-t pt-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-wider text-foreground uppercase">Bill to</p>
          <p className="mt-1 font-medium text-foreground">
            {invoice.organization?.name ?? invoice.customerName}
          </p>

          <div className="mt-4 flex flex-col gap-1 text-sm">
            <div className="flex gap-1.5">
              <span className="text-foreground">Invoice date:</span>
              <span className="text-foreground">{formatDate(invoice.issuedAt)}</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-foreground">Due date:</span>
              <span className="text-foreground">{formatDate(invoice.dueAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end sm:text-right">
          {qrCodeUrl && (
            <Image
              src={qrCodeUrl}
              alt="Scan to view this invoice online"
              width={72}
              height={72}
              unoptimized
              className="size-16 rounded-md border p-1"
            />
          )}
          <p className="font-medium text-foreground">Core IT</p>
          <p className="-mt-1 text-sm text-foreground">{SITE_HOST}</p>
          <p className="text-sm text-foreground">info@coreitbd.com</p>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground no-underline">
            {BUSINESS_ADDRESS}
          </a>
        </div>
      </div>

      {/* Line items */}
      <div className="relative mt-8 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-xs tracking-wider text-foreground uppercase">
              <th className="w-10 px-4 py-2.5 text-left font-semibold">#</th>
              <th className="px-4 py-2.5 text-left font-semibold">Item</th>
              <th className="px-4 py-2.5 text-right font-semibold">Qty</th>
              <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoice.lineItems.map((item, index) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-foreground tabular-nums">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-foreground">{item.description}</td>
                <td className="px-4 py-3 text-right text-foreground">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                  {formatBDT(Number(item.unitPriceBdt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="relative mt-6 flex flex-col items-end gap-2">
        <div className="flex w-full max-w-56 items-center justify-between text-sm">
          <span className="text-foreground">Sub total</span>
          <span className="font-medium tabular-nums text-foreground">{formatBDT(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex w-full max-w-56 items-center justify-between text-sm">
            <span className="text-foreground">
              Discount {invoice.discountType === "PERCENT" ? `(${invoice.discountPercent}%)` : ""}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              -{formatBDT(discountAmount)}
            </span>
          </div>
        )}
        {invoice.taxPercent > 0 && (
          <div className="flex w-full max-w-56 items-center justify-between text-sm">
            <span className="text-foreground">Tax ({invoice.taxPercent}%)</span>
            <span className="font-medium tabular-nums text-foreground">{formatBDT(taxAmount)}</span>
          </div>
        )}
        <div className="flex w-full max-w-56 items-center justify-between border-t pt-2 text-sm">
          <span className="font-medium text-foreground">Total</span>
          <span className="font-medium tabular-nums text-foreground">{formatBDT(total)}</span>
        </div>
        {paid > 0 && (
          <div className="flex w-full max-w-56 items-center justify-between text-sm">
            <span className="text-foreground">Paid</span>
            <span className="font-medium tabular-nums text-foreground">-{formatBDT(paid)}</span>
          </div>
        )}
        <div className="flex w-full max-w-56 items-center justify-between border-t pt-2 text-base font-semibold text-foreground">
          <span>Amount due</span>
          <span className="tabular-nums">{formatBDT(balance)}</span>
        </div>
      </div>

      {invoice.payments.length > 0 && (
        <div className="relative mt-8 border-t pt-6">
          <p className="mb-3 text-xs font-semibold tracking-wider text-foreground uppercase">
            Transactions
          </p>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-xs tracking-wider text-foreground uppercase">
                  <th className="px-4 py-2.5 text-left font-semibold">Payment</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Method</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.payments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-foreground tabular-nums">
                      #{index + 1}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {paymentMethodLabels[payment.method]}
                    </td>
                    <td className="px-4 py-3 text-foreground tabular-nums">
                      {formatDate(payment.paidAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {formatBDT(Number(payment.amountBdt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {canPay && (
        <div className="relative mt-8 border-t pt-6">
          <p className="text-xs font-semibold tracking-wider text-foreground uppercase">Offline payment</p>
          <p className="mt-2 text-sm text-foreground">bKash / Nagad / Rocket</p>
          <p className="text-sm tabular-nums text-foreground">
            Send Money to {MOBILE_BANKING_NUMBER} <span className="text-foreground">(Personal)</span>
          </p>
          <p className="mt-1 text-xs text-foreground">
            Please add <span className="font-medium text-foreground">{invoice.number}</span> as
            the reference.
          </p>
        </div>
      )}

      {invoice.notes && (
        <div className="relative mt-8 border-t pt-6">
          <p className="text-xs font-semibold tracking-wider text-foreground uppercase">Notes</p>
          <p className="mt-2 text-sm whitespace-pre-line text-foreground">{invoice.notes}</p>
        </div>
      )}

      <div className="relative mt-8 border-t pt-6">
        <p className="text-xs font-semibold tracking-wider text-foreground uppercase">
          Terms &amp; conditions
        </p>
        <p className="mt-2 text-xs leading-relaxed text-foreground">
          By proceeding with this invoice and/or payment, the client acknowledges and agrees to
          the Terms of Service ({TERMS_URL}) and Privacy Policy ({PRIVACY_URL}).
        </p>
      </div>
    </div>
  )
}
