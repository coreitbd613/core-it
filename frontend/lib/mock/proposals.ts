export type ProposalStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED"

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
  title: string
  description: string
  lineItems: ProposalLineItem[]
  status: ProposalStatus
  createdBy: string
  sentAt: string | null
  respondedAt: string | null
}

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}

export const proposalStatusVariant: Record<
  ProposalStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DRAFT: "outline",
  SENT: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
}

export function proposalTotalBdt(proposal: Pick<Proposal, "lineItems">): number {
  return proposal.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceBdt, 0)
}

export const mockProposals: Proposal[] = [
  {
    id: "prop-1",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    title: "E-commerce platform revamp",
    description:
      "Full redesign and rebuild of the Acme Corp online store, including checkout and inventory sync.",
    lineItems: [
      { id: "li-1", description: "UI/UX design", quantity: 1, unitPriceBdt: 80000 },
      { id: "li-2", description: "Frontend development", quantity: 1, unitPriceBdt: 150000 },
      { id: "li-3", description: "Backend & integrations", quantity: 1, unitPriceBdt: 120000 },
    ],
    status: "SENT",
    createdBy: "Core IT",
    sentAt: "2026-07-10",
    respondedAt: null,
  },
  {
    id: "prop-2",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    title: "Monthly maintenance retainer",
    description: "Ongoing bug fixes, security patches, and small feature requests.",
    lineItems: [
      { id: "li-4", description: "Maintenance retainer (per month)", quantity: 3, unitPriceBdt: 25000 },
    ],
    status: "APPROVED",
    createdBy: "Core IT",
    sentAt: "2026-06-20",
    respondedAt: "2026-06-22",
  },
  {
    id: "prop-3",
    organizationId: "org-2",
    organizationName: "Bay Traders Ltd",
    title: "Inventory management system",
    description: "Custom inventory tracking system with barcode scanning support.",
    lineItems: [
      { id: "li-5", description: "System design", quantity: 1, unitPriceBdt: 40000 },
      { id: "li-6", description: "Development", quantity: 1, unitPriceBdt: 220000 },
    ],
    status: "REJECTED",
    createdBy: "Core IT",
    sentAt: "2026-05-15",
    respondedAt: "2026-05-25",
  },
  {
    id: "prop-4",
    organizationId: "org-2",
    organizationName: "Bay Traders Ltd",
    title: "Company website redesign",
    description: "A modern marketing site with blog and careers page.",
    lineItems: [
      { id: "li-7", description: "Design", quantity: 1, unitPriceBdt: 35000 },
      { id: "li-8", description: "Development", quantity: 1, unitPriceBdt: 65000 },
    ],
    status: "DRAFT",
    createdBy: "Core IT",
    sentAt: null,
    respondedAt: null,
  },
]
