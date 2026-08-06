import { authFetch } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED"
export type PaymentMethod = "BKASH" | "NAGAD" | "ROCKET" | "BANK_TRANSFER" | "CASH" | "OTHER"
export type DiscountType = "PERCENT" | "FLAT"

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
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
  CANCELLED: "destructive",
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  BKASH: "bKash",
  NAGAD: "Nagad",
  ROCKET: "Rocket",
  BANK_TRANSFER: "Bank transfer",
  CASH: "Cash",
  OTHER: "Other",
}

export type InvoiceLineItem = {
  id: string
  invoiceId: string
  description: string
  // Freeform label only (e.g. "1 year", "2 licenses") — not used in Amount math.
  quantity: string | null
  // Decimal fields serialize as strings over the wire — parse with Number() when doing math.
  // This is the line's Amount directly; quantity does not multiply it.
  unitPriceBdt: string
}

export type Payment = {
  id: string
  invoiceId: string
  amountBdt: string
  method: PaymentMethod
  note: string | null
  transactionId: string | null
  recordedByUserId: string | null
  recordedByUser?: { id: string; name: string | null; email: string } | null
  paidAt: string
  createdAt: string
}

export type InvoiceComputed = {
  subtotalBdt: number
  discountAmountBdt: number
  grandTotalBdt: number
  paidBdt: number
  balanceBdt: number
  status: InvoiceStatus
}

export type Invoice = {
  id: string
  number: string
  organizationId: string | null
  organization: { id: string; name: string } | null
  // Set instead of organization for one-off billing to a customer with no Organization record.
  customerName: string | null
  // Optional company name shown alongside customerName (adhoc mode only).
  customerCompanyName: string | null
  proposalId: string | null
  status: InvoiceStatus
  voidReason: string | null
  taxPercent: number
  // Exactly one applies, chosen by discountType — the other stays at its default.
  discountType: DiscountType
  discountPercent: number
  discountFlatBdt: string
  notes: string | null
  issuedAt: string
  dueAt: string
  createdAt: string
  updatedAt: string
  lineItems: InvoiceLineItem[]
  payments: Payment[]
  computed: InvoiceComputed
}

export type InvoiceLineItemInput = {
  description: string
  quantity?: string
  unitPriceBdt: number
}

export type CreateInvoiceInput = {
  // Provide exactly one of the two.
  organizationId?: string
  customerName?: string
  customerCompanyName?: string
  proposalId?: string
  dueAt: string
  lineItems: InvoiceLineItemInput[]
  taxPercent?: number
  discountType?: DiscountType
  discountPercent?: number
  discountFlatBdt?: number
  notes?: string
  status?: "DRAFT" | "SENT"
}

export type UpdateInvoiceInput = {
  dueAt?: string
  lineItems?: InvoiceLineItemInput[]
  taxPercent?: number
  discountType?: DiscountType
  discountPercent?: number
  discountFlatBdt?: number
  notes?: string
}

export type RecordPaymentInput = {
  amountBdt: number
  method: PaymentMethod
  note?: string
  paidAt?: string
  transactionId?: string
}

async function parseErrorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null
  return body?.message ?? fallback
}

export async function getMyInvoices(): Promise<Invoice[]> {
  const res = await authFetch(`${API_URL}/invoices/mine`, {}, "client")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load your invoices."))
  }
  return (await res.json()) as Invoice[]
}

export async function getMyInvoice(id: string): Promise<Invoice> {
  const res = await authFetch(`${API_URL}/invoices/mine/${id}`, {}, "client")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load this invoice."))
  }
  return (await res.json()) as Invoice
}

export async function getPublicInvoice(id: string): Promise<Invoice> {
  const res = await fetch(`${API_URL}/invoices/public/${id}`)
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load this invoice."))
  }
  return (await res.json()) as Invoice
}

export async function getAdminInvoices(filters?: {
  organizationId?: string
  status?: InvoiceStatus
}): Promise<Invoice[]> {
  const params = new URLSearchParams()
  if (filters?.organizationId) params.set("organizationId", filters.organizationId)
  if (filters?.status) params.set("status", filters.status)
  const query = params.toString() ? `?${params.toString()}` : ""

  const res = await authFetch(`${API_URL}/invoices/admin${query}`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load invoices."))
  }
  return (await res.json()) as Invoice[]
}

export async function getAdminInvoice(id: string): Promise<Invoice> {
  const res = await authFetch(`${API_URL}/invoices/admin/${id}`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load this invoice."))
  }
  return (await res.json()) as Invoice
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const res = await authFetch(
    `${API_URL}/invoices/admin`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "admin",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't create this invoice."))
  }
  return (await res.json()) as Invoice
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
  const res = await authFetch(
    `${API_URL}/invoices/admin/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "admin",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't save this invoice."))
  }
  return (await res.json()) as Invoice
}

export async function sendInvoice(id: string): Promise<Invoice> {
  const res = await authFetch(`${API_URL}/invoices/admin/${id}/send`, { method: "PATCH" }, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't send this invoice."))
  }
  return (await res.json()) as Invoice
}

export async function voidInvoice(id: string, voidReason: string): Promise<Invoice> {
  const res = await authFetch(
    `${API_URL}/invoices/admin/${id}/void`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voidReason }),
    },
    "admin",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't void this invoice."))
  }
  return (await res.json()) as Invoice
}

export async function recordPayment(id: string, input: RecordPaymentInput): Promise<Invoice> {
  const res = await authFetch(
    `${API_URL}/invoices/admin/${id}/payments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "admin",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't record this payment."))
  }
  return (await res.json()) as Invoice
}

export async function deleteInvoice(id: string): Promise<void> {
  const res = await authFetch(`${API_URL}/invoices/admin/${id}`, { method: "DELETE" }, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't delete this invoice."))
  }
}
