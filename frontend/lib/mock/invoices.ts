export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE"
export type PaymentMethod = "BANK_TRANSFER" | "CASH" | "OTHER"

export type InvoiceLineItem = {
  id: string
  description: string
  quantity: number
  unitPriceBdt: number
}

export type Payment = {
  id: string
  amountBdt: number
  method: PaymentMethod
  note: string
  recordedBy: string
  paidAt: string
}

export type Invoice = {
  id: string
  number: string
  organizationId: string
  organizationName: string
  lineItems: InvoiceLineItem[]
  payments: Payment[]
  status: InvoiceStatus
  issuedAt: string
  dueAt: string
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
}

export const invoiceStatusVariant: Record<
  InvoiceStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DRAFT: "outline",
  SENT: "secondary",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
  OVERDUE: "destructive",
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  BANK_TRANSFER: "Bank transfer",
  CASH: "Cash",
  OTHER: "Other",
}

export function invoiceTotalBdt(invoice: Pick<Invoice, "lineItems">): number {
  return invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceBdt, 0)
}

export function invoicePaidBdt(invoice: Pick<Invoice, "payments">): number {
  return invoice.payments.reduce((sum, payment) => sum + payment.amountBdt, 0)
}

export function invoiceBalanceBdt(invoice: Pick<Invoice, "lineItems" | "payments">): number {
  return invoiceTotalBdt(invoice) - invoicePaidBdt(invoice)
}

/** Recomputes status from payments vs total, matching how the real backend would derive it. */
export function deriveInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === "DRAFT") return "DRAFT"
  const balance = invoiceBalanceBdt(invoice)
  if (balance <= 0) return "PAID"
  if (invoicePaidBdt(invoice) > 0) return "PARTIALLY_PAID"
  if (new Date(invoice.dueAt) < new Date()) return "OVERDUE"
  return "SENT"
}

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    number: "INV-2026-001",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    lineItems: [{ id: "ili-1", description: "5 revision credits", quantity: 1, unitPriceBdt: 15000 }],
    payments: [
      {
        id: "pay-1",
        amountBdt: 15000,
        method: "BANK_TRANSFER",
        note: "Paid in full via bKash-linked bank transfer.",
        recordedBy: "Core IT",
        paidAt: "2026-06-15",
      },
    ],
    status: "PAID",
    issuedAt: "2026-06-13",
    dueAt: "2026-06-27",
  },
  {
    id: "inv-2",
    number: "INV-2026-002",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    lineItems: [
      { id: "ili-2", description: "Maintenance retainer (Jul)", quantity: 1, unitPriceBdt: 25000 },
    ],
    payments: [
      {
        id: "pay-2",
        amountBdt: 10000,
        method: "CASH",
        note: "Partial payment received in office.",
        recordedBy: "Core IT",
        paidAt: "2026-07-08",
      },
    ],
    status: "PARTIALLY_PAID",
    issuedAt: "2026-07-01",
    dueAt: "2026-07-20",
  },
  {
    id: "inv-3",
    number: "INV-2026-003",
    organizationId: "org-2",
    organizationName: "Bay Traders Ltd",
    lineItems: [
      { id: "ili-3", description: "System design", quantity: 1, unitPriceBdt: 40000 },
      { id: "ili-4", description: "Development (milestone 1)", quantity: 1, unitPriceBdt: 100000 },
    ],
    payments: [],
    status: "OVERDUE",
    issuedAt: "2026-06-01",
    dueAt: "2026-06-20",
  },
]
