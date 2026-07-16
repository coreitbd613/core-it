export type QuotationStatus = "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "CONVERTED"

export type QuotationLineItem = {
  id: string
  description: string
  quantity: number
  unitPriceBdt: number
}

export type Quotation = {
  id: string
  organizationId: string
  organizationName: string
  title: string
  lineItems: QuotationLineItem[]
  status: QuotationStatus
  sentAt: string | null
  respondedAt: string | null
  convertedInvoiceId: string | null
}

export const quotationStatusLabels: Record<QuotationStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  CONVERTED: "Converted to invoice",
}

export const quotationStatusVariant: Record<
  QuotationStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DRAFT: "outline",
  SENT: "secondary",
  ACCEPTED: "default",
  DECLINED: "destructive",
  CONVERTED: "default",
}

export function quotationTotalBdt(quotation: Pick<Quotation, "lineItems">): number {
  return quotation.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceBdt, 0)
}

export const mockQuotations: Quotation[] = [
  {
    id: "quo-1",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    title: "Q3 hosting & maintenance",
    lineItems: [
      { id: "qli-1", description: "VPS hosting (quarterly)", quantity: 1, unitPriceBdt: 18000 },
      { id: "qli-2", description: "Maintenance retainer (quarterly)", quantity: 1, unitPriceBdt: 45000 },
    ],
    status: "SENT",
    sentAt: "2026-07-05",
    respondedAt: null,
    convertedInvoiceId: null,
  },
  {
    id: "quo-2",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    title: "Extra revision batch (5 revisions)",
    lineItems: [{ id: "qli-3", description: "5 revision credits", quantity: 1, unitPriceBdt: 15000 }],
    status: "CONVERTED",
    sentAt: "2026-06-12",
    respondedAt: "2026-06-13",
    convertedInvoiceId: "inv-1",
  },
  {
    id: "quo-3",
    organizationId: "org-2",
    organizationName: "Bay Traders Ltd",
    title: "Additional barcode hardware integration",
    lineItems: [
      { id: "qli-4", description: "Hardware integration", quantity: 1, unitPriceBdt: 30000 },
    ],
    status: "DECLINED",
    sentAt: "2026-05-28",
    respondedAt: "2026-06-01",
    convertedInvoiceId: null,
  },
]
