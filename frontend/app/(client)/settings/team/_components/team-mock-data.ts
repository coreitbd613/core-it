export type MemberRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "BILLING"
export type MemberStatus = "ACTIVE" | "PENDING"

export type TeamMember = {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  role: MemberRole
  status: MemberStatus
  joinedAt: string
}

export const roleLabels: Record<MemberRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  MEMBER: "Member",
  BILLING: "Billing",
}

export const roleDescriptions: Record<MemberRole, string> = {
  OWNER: "Full access, including billing and deleting the company.",
  ADMIN: "Full access except deleting the company.",
  MANAGER: "Can manage projects, proposals, and invoices.",
  MEMBER: "Can view and work on assigned projects.",
  BILLING: "Can only view and manage invoices/payments.",
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: "u1",
    name: "Rafiq Islam",
    email: "rafiq@acmecorp.com",
    role: "OWNER",
    status: "ACTIVE",
    joinedAt: "2026-06-01",
  },
  {
    id: "u2",
    name: "Nusrat Jahan",
    email: "nusrat@acmecorp.com",
    role: "MANAGER",
    status: "ACTIVE",
    joinedAt: "2026-06-10",
  },
  {
    id: "u3",
    name: "Tanvir Ahmed",
    email: "tanvir@acmecorp.com",
    role: "MEMBER",
    status: "ACTIVE",
    joinedAt: "2026-06-15",
  },
  {
    id: "u4",
    name: "Shammi Akter",
    email: "shammi@acmecorp.com",
    role: "BILLING",
    status: "PENDING",
    joinedAt: "2026-07-10",
  },
]
