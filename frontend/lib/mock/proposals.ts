export type ProposalStatus = "DRAFT" | "SENT" | "VIEWED" | "APPROVED" | "REJECTED" | "EXPIRED"

export type ProposalLineItem = {
  id: string
  description: string
  quantity: number
  unitPriceBdt: number
}

export type Proposal = {
  id: string
  organizationId: string
  organizationName: string
  proposalNumber: string
  title: string
  descriptionHtml: string
  lineItems: ProposalLineItem[]
  taxPercent: number
  discountPercent: number
  paymentTerms: string
  timeline: string
  validUntil: string | null
  status: ProposalStatus
  createdBy: string
  sentAt: string | null
  respondedAt: string | null
  viewedAt: string | null
  contractId: string | null
  convertedInvoiceId: string | null
}

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
}

export const proposalStatusVariant: Record<
  ProposalStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DRAFT: "outline",
  SENT: "secondary",
  VIEWED: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  EXPIRED: "destructive",
}

export function proposalTotalBdt(proposal: Pick<Proposal, "lineItems">): number {
  return proposal.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceBdt, 0)
}

export function proposalGrandTotalBdt(
  proposal: Pick<Proposal, "lineItems" | "taxPercent" | "discountPercent">
): number {
  const subtotal = proposalTotalBdt(proposal)
  const afterDiscount = subtotal - subtotal * (proposal.discountPercent / 100)
  return afterDiscount + afterDiscount * (proposal.taxPercent / 100)
}

/** Recomputes EXPIRED from the validity date, matching how deriveInvoiceStatus works. */
export function deriveProposalStatus(proposal: Proposal): ProposalStatus {
  if (
    (proposal.status === "SENT" || proposal.status === "VIEWED") &&
    proposal.validUntil &&
    new Date(proposal.validUntil) < new Date()
  ) {
    return "EXPIRED"
  }
  return proposal.status
}

let proposalNumberSeq = 6

export function nextProposalNumber(): string {
  proposalNumberSeq += 1
  return `PROP-2026-${String(proposalNumberSeq).padStart(3, "0")}`
}

export const mockProposals: Proposal[] = [
  {
    id: "prop-1",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    proposalNumber: "PROP-2026-001",
    title: "E-commerce platform revamp",
    descriptionHtml:
      "<p>Full redesign and rebuild of the Acme Corp online store, including checkout and inventory sync.</p>",
    lineItems: [
      { id: "li-1", description: "UI/UX design", quantity: 1, unitPriceBdt: 80000 },
      { id: "li-2", description: "Frontend development", quantity: 1, unitPriceBdt: 150000 },
      { id: "li-3", description: "Backend & integrations", quantity: 1, unitPriceBdt: 120000 },
    ],
    taxPercent: 0,
    discountPercent: 0,
    paymentTerms: "50% advance, 50% on delivery",
    timeline: "6-8 weeks from advance payment",
    validUntil: "2026-08-10",
    status: "SENT",
    createdBy: "Core IT",
    sentAt: "2026-07-10",
    respondedAt: null,
    viewedAt: null,
    contractId: null,
    convertedInvoiceId: null,
  },
  {
    id: "prop-2",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    proposalNumber: "PROP-2026-002",
    title: "Monthly maintenance retainer",
    descriptionHtml: "<p>Ongoing bug fixes, security patches, and small feature requests.</p>",
    lineItems: [
      { id: "li-4", description: "Maintenance retainer (per month)", quantity: 3, unitPriceBdt: 25000 },
    ],
    taxPercent: 0,
    discountPercent: 0,
    paymentTerms: "Billed monthly in advance",
    timeline: "Ongoing, starts immediately",
    validUntil: "2026-07-20",
    status: "APPROVED",
    createdBy: "Core IT",
    sentAt: "2026-06-20",
    respondedAt: "2026-06-22",
    viewedAt: "2026-06-21",
    contractId: null,
    convertedInvoiceId: null,
  },
  {
    id: "prop-3",
    organizationId: "org-2",
    organizationName: "Bay Traders Ltd",
    proposalNumber: "PROP-2026-003",
    title: "Inventory management system",
    descriptionHtml:
      "<p>Custom inventory tracking system with barcode scanning support.</p>",
    lineItems: [
      { id: "li-5", description: "System design", quantity: 1, unitPriceBdt: 40000 },
      { id: "li-6", description: "Development", quantity: 1, unitPriceBdt: 220000 },
    ],
    taxPercent: 0,
    discountPercent: 0,
    paymentTerms: "40% advance, 30% mid-project, 30% on delivery",
    timeline: "10-12 weeks from advance payment",
    validUntil: "2026-06-15",
    status: "REJECTED",
    createdBy: "Core IT",
    sentAt: "2026-05-15",
    respondedAt: "2026-05-25",
    viewedAt: "2026-05-16",
    contractId: null,
    convertedInvoiceId: null,
  },
  {
    id: "prop-4",
    organizationId: "org-2",
    organizationName: "Bay Traders Ltd",
    proposalNumber: "PROP-2026-004",
    title: "Company website redesign",
    descriptionHtml: "<p>A modern marketing site with blog and careers page.</p>",
    lineItems: [
      { id: "li-7", description: "Design", quantity: 1, unitPriceBdt: 35000 },
      { id: "li-8", description: "Development", quantity: 1, unitPriceBdt: 65000 },
    ],
    taxPercent: 0,
    discountPercent: 0,
    paymentTerms: "50% advance, 50% on delivery",
    timeline: "4-6 weeks from advance payment",
    validUntil: null,
    status: "DRAFT",
    createdBy: "Core IT",
    sentAt: null,
    respondedAt: null,
    viewedAt: null,
    contractId: null,
    convertedInvoiceId: null,
  },
  {
    id: "prop-5",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    proposalNumber: "PROP-2026-005",
    title: "Q3 hosting & maintenance",
    descriptionHtml: "<p>Quarterly VPS hosting and maintenance retainer.</p>",
    lineItems: [
      { id: "li-9", description: "VPS hosting (quarterly)", quantity: 1, unitPriceBdt: 18000 },
      { id: "li-10", description: "Maintenance retainer (quarterly)", quantity: 1, unitPriceBdt: 45000 },
    ],
    taxPercent: 0,
    discountPercent: 0,
    paymentTerms: "100% advance",
    timeline: "Starts immediately upon signing",
    validUntil: "2026-08-05",
    status: "APPROVED",
    createdBy: "Core IT",
    sentAt: "2026-07-05",
    respondedAt: "2026-07-06",
    viewedAt: "2026-07-05",
    contractId: "contract-1",
    convertedInvoiceId: null,
  },
  {
    id: "prop-6",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    proposalNumber: "PROP-2026-006",
    title: "Q4 feature sprint",
    descriptionHtml: "<p>A focused two-week sprint to ship a new feature.</p>",
    lineItems: [
      { id: "li-11", description: "New feature sprint (2 weeks)", quantity: 1, unitPriceBdt: 90000 },
    ],
    taxPercent: 0,
    discountPercent: 0,
    paymentTerms: "50% advance, 50% on delivery",
    timeline: "2 weeks from advance payment",
    validUntil: "2026-08-11",
    status: "APPROVED",
    createdBy: "Core IT",
    sentAt: "2026-07-11",
    respondedAt: "2026-07-12",
    viewedAt: "2026-07-11",
    contractId: "contract-2",
    convertedInvoiceId: null,
  },
]
