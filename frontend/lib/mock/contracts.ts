import { proposalTotalBdt, type Proposal } from "@/lib/mock/proposals"
import { formatBDT } from "@/lib/format"

export type ContractStatus = "SENT" | "SIGNED"

export type Contract = {
  id: string
  proposalId: string
  organizationId: string
  organizationName: string
  title: string
  termsText: string
  status: ContractStatus
  sentAt: string
  signedByName: string | null
  signedAt: string | null
}

export const contractStatusLabels: Record<ContractStatus, string> = {
  SENT: "Awaiting signature",
  SIGNED: "Signed",
}

export const contractStatusVariant: Record<ContractStatus, "default" | "secondary"> = {
  SENT: "secondary",
  SIGNED: "default",
}

export function generateContractTerms(proposal: Proposal): string {
  const lines = proposal.lineItems
    .map((item) => `- ${item.description} (Qty ${item.quantity}) — ${formatBDT(item.quantity * item.unitPriceBdt)}`)
    .join("\n")

  return `This agreement is entered into between Core IT ("Service Provider") and ${proposal.organizationName} ("Client") for the following scope of work, based on proposal "${proposal.title}":

${lines}

Total contract value: ${formatBDT(proposalTotalBdt(proposal))}

The Client agrees to the scope, pricing, and delivery terms described above. Work will commence once this agreement is signed. Payment terms and invoicing will follow per the associated invoice(s) issued after signing.`
}

export const mockContracts: Contract[] = [
  {
    id: "contract-1",
    proposalId: "prop-5",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    title: "Q3 hosting & maintenance",
    termsText:
      "This agreement is entered into between Core IT (\"Service Provider\") and Acme Corp (\"Client\") for the following scope of work, based on proposal \"Q3 hosting & maintenance\":\n\n- VPS hosting (quarterly) (Qty 1) — ৳18,000\n- Maintenance retainer (quarterly) (Qty 1) — ৳45,000\n\nTotal contract value: ৳63,000\n\nThe Client agrees to the scope, pricing, and delivery terms described above. Work will commence once this agreement is signed. Payment terms and invoicing will follow per the associated invoice(s) issued after signing.",
    status: "SIGNED",
    sentAt: "2026-07-06",
    signedByName: "Rafiq Islam",
    signedAt: "2026-07-07",
  },
  {
    id: "contract-2",
    proposalId: "prop-6",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    title: "Q4 feature sprint",
    termsText:
      "This agreement is entered into between Core IT (\"Service Provider\") and Acme Corp (\"Client\") for the following scope of work, based on proposal \"Q4 feature sprint\":\n\n- New feature sprint (2 weeks) (Qty 1) — ৳90,000\n\nTotal contract value: ৳90,000\n\nThe Client agrees to the scope, pricing, and delivery terms described above. Work will commence once this agreement is signed. Payment terms and invoicing will follow per the associated invoice(s) issued after signing.",
    status: "SENT",
    sentAt: "2026-07-13",
    signedByName: null,
    signedAt: null,
  },
]
