"use client"

import Image from "next/image"

import { useQrCodeDataUrl } from "@/hooks/use-qr-code-data-url"
import { MOBILE_BANKING_NUMBER } from "@/lib/contact"
import { formatBDT } from "@/lib/format"
import {
  deriveInvoiceStatus,
  invoiceBalanceBdt,
  invoiceGrandTotalBdt,
  invoicePaidBdt,
  invoiceStatusLabels,
  invoiceTotalBdt,
  invoiceTypeLabels,
  type Invoice,
} from "@/lib/mock/invoices"
import { cn } from "@/lib/utils"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "")

const watermarkLabels: Partial<Record<Invoice["status"], string>> = {
  PAID: "Paid",
  CANCELLED: "Void",
  OVERDUE: "Overdue",
}

function signed(amount: number, sign: "+" | "-" = "+"): string {
  return `${sign}${formatBDT(amount)}`
}

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const subtotal = invoiceTotalBdt(invoice)
  const discountAmount = subtotal * (invoice.discountPercent / 100)
  const taxAmount = (subtotal - discountAmount) * (invoice.taxPercent / 100)
  const total = invoiceGrandTotalBdt(invoice)
  const paid = invoicePaidBdt(invoice)
  const balance = invoiceBalanceBdt(invoice)
  const status = deriveInvoiceStatus(invoice)
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

      {/* Header: logo left, invoice title/number/status/QR right */}
      <div className="relative flex items-start justify-between gap-6">
        <Image
          src="/logo-light.png"
          alt="Core IT"
          width={527}
          height={135}
          className="h-9 w-auto dark:hidden"
        />
        <Image
          src="/logo-dark.png"
          alt="Core IT"
          width={527}
          height={135}
          className="hidden h-9 w-auto dark:block"
        />

        <div className="flex flex-col items-end gap-2 text-right">
          <p className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Invoice
          </p>
          <p className="text-sm font-medium text-primary">#{invoice.number}</p>
          <p
            className={cn(
              "text-xs font-semibold tracking-wide uppercase",
              status === "PAID" ? "text-muted-foreground" : "text-destructive"
            )}
          >
            {invoiceStatusLabels[status]}
          </p>
          {qrCodeUrl && (
            <Image
              src={qrCodeUrl}
              alt="Scan to view this invoice online"
              width={72}
              height={72}
              unoptimized
              className="mt-1 size-16 rounded-md border p-1"
            />
          )}
        </div>
      </div>

      {/* Bill to / Company details */}
      <div className="relative mt-8 grid grid-cols-1 gap-6 border-t pt-6 sm:grid-cols-2">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Bill to</p>
          <p className="mt-1 font-medium text-foreground">{invoice.organizationName}</p>

          <div className="mt-4 flex flex-col gap-1 text-sm">
            <div className="flex gap-1.5">
              <span className="text-muted-foreground">Invoice date:</span>
              <span className="text-foreground">
                {new Date(invoice.issuedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-muted-foreground">Due date:</span>
              <span className="text-foreground">
                {new Date(invoice.dueAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-muted-foreground">Type:</span>
              <span className="text-foreground">{invoiceTypeLabels[invoice.type]}</span>
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="font-medium text-foreground">Core IT</p>
          <p className="mt-1 text-sm text-muted-foreground">{SITE_HOST}</p>
          <p className="text-sm text-muted-foreground">info@coreitbd.com</p>
        </div>
      </div>

      {/* Line items */}
      <div className="relative mt-8 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <th className="w-10 px-4 py-2.5 text-left font-medium">#</th>
              <th className="px-4 py-2.5 text-left font-medium">Item</th>
              <th className="px-4 py-2.5 text-right font-medium">Qty</th>
              <th className="px-4 py-2.5 text-right font-medium">Rate</th>
              <th className="px-4 py-2.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoice.lineItems.map((item, index) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-foreground">{item.description}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {signed(item.unitPriceBdt)}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                  {signed(item.quantity * item.unitPriceBdt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="relative mt-6 flex flex-col items-end gap-2">
        <div className="flex w-full max-w-56 items-center justify-between text-sm">
          <span className="text-muted-foreground">Sub total</span>
          <span className="font-medium tabular-nums text-foreground">{signed(subtotal)}</span>
        </div>
        {invoice.discountPercent > 0 && (
          <div className="flex w-full max-w-56 items-center justify-between text-sm">
            <span className="text-muted-foreground">Discount ({invoice.discountPercent}%)</span>
            <span className="font-medium tabular-nums text-foreground">
              {signed(discountAmount, "-")}
            </span>
          </div>
        )}
        {invoice.taxPercent > 0 && (
          <div className="flex w-full max-w-56 items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax ({invoice.taxPercent}%)</span>
            <span className="font-medium tabular-nums text-foreground">{signed(taxAmount)}</span>
          </div>
        )}
        <div className="flex w-full max-w-56 items-center justify-between border-t pt-2 text-sm">
          <span className="font-medium text-foreground">Total</span>
          <span className="font-medium tabular-nums text-foreground">{signed(total)}</span>
        </div>
        {paid > 0 && (
          <div className="flex w-full max-w-56 items-center justify-between text-sm">
            <span className="text-muted-foreground">Paid</span>
            <span className="font-medium tabular-nums text-foreground">{signed(paid, "-")}</span>
          </div>
        )}
        <div className="flex w-full max-w-56 items-center justify-between border-t pt-2 text-base font-semibold text-foreground">
          <span>Amount due</span>
          <span className="tabular-nums">{signed(balance)}</span>
        </div>
      </div>

      {canPay && (
        <div className="relative mt-8 border-t pt-6">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Offline payment</p>
          <p className="mt-2 text-sm text-foreground">bKash / Nagad / Rocket</p>
          <p className="text-sm tabular-nums text-foreground">
            Send Money to {MOBILE_BANKING_NUMBER} <span className="text-muted-foreground">(Personal)</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please add <span className="font-medium text-foreground">{invoice.number}</span> as
            the reference.
          </p>
        </div>
      )}

      {invoice.notes && (
        <div className="relative mt-8 border-t pt-6">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Notes</p>
          <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{invoice.notes}</p>
        </div>
      )}

      <div className="relative mt-8 border-t pt-6">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          Terms &amp; conditions
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          By proceeding with this invoice and/or payment, the client acknowledges and agrees to
          the Terms of Service and Privacy Policy available at {SITE_HOST}/terms.
        </p>
      </div>
    </div>
  )
}
