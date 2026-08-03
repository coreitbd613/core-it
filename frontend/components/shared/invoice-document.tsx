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
  invoiceTotalBdt,
  invoiceTypeLabels,
  type Invoice,
} from "@/lib/mock/invoices"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"

const watermarkLabels: Partial<Record<Invoice["status"], string>> = {
  PAID: "Paid",
  CANCELLED: "Void",
  OVERDUE: "Overdue",
}

const mobileBankingOptions = [
  { name: "bKash", instruction: "Send Money" },
  { name: "Nagad", instruction: "Send Money" },
  { name: "Rocket", instruction: "Send Money" },
]

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

      <div className="relative flex flex-col justify-between gap-6 sm:flex-row">
        <div>
          <Image
            src="/logo-light.png"
            alt="Core IT"
            width={527}
            height={135}
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src="/logo-dark.png"
            alt="Core IT"
            width={527}
            height={135}
            className="hidden h-8 w-auto dark:block"
          />
          <p className="mt-2 text-sm text-muted-foreground">info@coreitbd.com</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
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
          <div className="sm:text-right">
            <p className="text-sm text-muted-foreground">{invoice.number}</p>
            <p className="mt-1 text-sm text-muted-foreground">Billed to</p>
            <p className="font-medium text-foreground">{invoice.organizationName}</p>
          </div>
        </div>
      </div>

      <div className="relative mt-8 grid grid-cols-3 gap-4 border-t border-b py-4">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Issued</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {new Date(invoice.issuedAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Due</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {new Date(invoice.dueAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Type</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {invoiceTypeLabels[invoice.type]}
          </p>
        </div>
      </div>

      <div className="relative mt-8 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2.5 text-left font-medium">Description</th>
              <th className="px-4 py-2.5 text-right font-medium">Qty</th>
              <th className="px-4 py-2.5 text-right font-medium">Unit price</th>
              <th className="px-4 py-2.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoice.lineItems.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-foreground">{item.description}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {formatBDT(item.unitPriceBdt)}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                  {formatBDT(item.quantity * item.unitPriceBdt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="relative mt-6 flex flex-col items-end gap-2">
        <div className="flex w-full max-w-56 items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium tabular-nums text-foreground">{formatBDT(subtotal)}</span>
        </div>
        {invoice.discountPercent > 0 && (
          <div className="flex w-full max-w-56 items-center justify-between text-sm">
            <span className="text-muted-foreground">Discount ({invoice.discountPercent}%)</span>
            <span className="font-medium tabular-nums text-foreground">
              -{formatBDT(discountAmount)}
            </span>
          </div>
        )}
        {invoice.taxPercent > 0 && (
          <div className="flex w-full max-w-56 items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax ({invoice.taxPercent}%)</span>
            <span className="font-medium tabular-nums text-foreground">{formatBDT(taxAmount)}</span>
          </div>
        )}
        <div className="flex w-full max-w-56 items-center justify-between border-t pt-2 text-sm">
          <span className="font-medium text-foreground">Total</span>
          <span className="font-medium tabular-nums text-foreground">{formatBDT(total)}</span>
        </div>
        {paid > 0 && (
          <div className="flex w-full max-w-56 items-center justify-between text-sm">
            <span className="text-muted-foreground">Paid</span>
            <span className="font-medium tabular-nums text-foreground">-{formatBDT(paid)}</span>
          </div>
        )}
        <div className="flex w-full max-w-56 items-center justify-between border-t pt-2 text-base font-semibold text-foreground">
          <span>Balance due</span>
          <span className="tabular-nums">{formatBDT(balance)}</span>
        </div>
      </div>

      {canPay && (
        <div className="relative mt-8 border-t pt-6">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">How to pay</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {mobileBankingOptions.map((option) => (
              <div key={option.name} className="rounded-lg border p-3">
                <p className="text-sm font-medium text-foreground">{option.name}</p>
                <p className="mt-1 text-sm tabular-nums text-foreground">
                  {MOBILE_BANKING_NUMBER}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {option.instruction} (Personal)
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Please reference <span className="font-medium text-foreground">{invoice.number}</span>{" "}
            when paying.
          </p>
        </div>
      )}

      {invoice.notes && (
        <div className="relative mt-8 border-t pt-6">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">Notes</p>
          <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{invoice.notes}</p>
        </div>
      )}
    </div>
  )
}
