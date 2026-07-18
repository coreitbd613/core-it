export type ProposalCommentAuthorRole = "CLIENT" | "ADMIN"

export type ProposalComment = {
  id: string
  proposalId: string
  authorName: string
  authorRole: ProposalCommentAuthorRole
  message: string
  createdAt: string
}

export const mockProposalComments: ProposalComment[] = [
  {
    id: "comment-1",
    proposalId: "prop-1",
    authorName: "Rafiq Islam",
    authorRole: "CLIENT",
    message: "Can you clarify what's included under \"Backend & integrations\"? Does that cover the payment gateway too?",
    createdAt: "2026-07-11T09:15:00",
  },
  {
    id: "comment-2",
    proposalId: "prop-1",
    authorName: "Core IT",
    authorRole: "ADMIN",
    message: "Yes, that line item includes the payment gateway integration (bKash/Nagad) along with inventory sync.",
    createdAt: "2026-07-11T10:02:00",
  },
]
