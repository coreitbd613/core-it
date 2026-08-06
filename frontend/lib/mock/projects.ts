export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED"
export type RevisionStatus = "OPEN" | "IN_PROGRESS" | "DONE"
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "DONE"
export type SupportState = "NOT_STARTED" | "ACTIVE" | "EXPIRED"
export type BillingType = "FIXED_PRICE" | "HOURLY" | "RETAINER"
export type SupportSla = "STANDARD" | "PRIORITY" | "PREMIUM"
export type DeploymentMethod = "MANUAL" | "CI_CD" | "FTP" | "GIT_PUSH"
export type TeamAccessLevel = "FULL" | "EDIT" | "VIEW"
export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH"
export type RiskStatus = "OPEN" | "MITIGATED" | "CLOSED"
export type DependencyStatus = "PENDING" | "RECEIVED" | "BLOCKED"

export type RevisionRequest = {
  id: string
  projectId: string
  description: string
  status: RevisionStatus
  requestedBy: string
  requestedAt: string
  respondedAt: string | null
}

export type Milestone = {
  id: string
  projectId: string
  title: string
  dueAt: string | null
  status: MilestoneStatus
  completedAt: string | null
}

export type CredentialEntry = {
  id: string
  projectId: string
  label: string
  username: string | null
  password: string | null
  url: string | null
  notes: string | null
}

export type DeliveryConfigItem = {
  id: string
  projectId: string
  label: string
  included: boolean
}

export type ProjectTeamMember = {
  id: string
  projectId: string
  name: string
  role: string
  accessLevel: TeamAccessLevel
}

export type ProjectRisk = {
  id: string
  projectId: string
  description: string
  severity: RiskSeverity
  mitigation: string | null
  status: RiskStatus
}

export type ProjectDependency = {
  id: string
  projectId: string
  description: string
  neededFrom: string | null
  dueAt: string | null
  status: DependencyStatus
}

export type Project = {
  id: string
  organizationId: string
  organizationName: string
  name: string
  description: string | null
  proposalId: string | null
  contractId: string | null
  status: ProjectStatus
  startedAt: string
  targetEndAt: string | null
  completedAt: string | null
  includedRevisions: number
  supportMonths: number
  updatedAt: string

  // Basic info
  projectCode: string
  clientContact: string | null
  projectType: string | null
  department: string | null
  projectManagerName: string | null

  // Commercial
  billingType: BillingType
  paymentTerms: string | null
  paymentSchedule: string | null
  taxPercent: number
  discountPercent: number
  estimatedEffortHours: number | null

  // Timeline
  goLiveAt: string | null

  // Revision policy
  revisionWindowDays: number | null
  maxDaysPerRevision: number | null
  extraRevisionPriceBdt: number | null
  revisionNotes: string | null

  // After-sales support
  supportSla: SupportSla
  supportWorkingHours: string | null
  includedSupportTickets: number | null
  supportContactName: string | null
  sendRenewalReminder: boolean

  // Technical / credentials
  domain: string | null
  hostingProvider: string | null
  serverDetails: string | null
  repositoryUrl: string | null
  stagingUrl: string | null
  productionUrl: string | null
  techStack: string | null
  deploymentMethod: DeploymentMethod | null
}

export const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  COMPLETED: "Completed",
}

export const projectStatusVariant: Record<
  ProjectStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PLANNING: "outline",
  IN_PROGRESS: "secondary",
  REVIEW: "secondary",
  COMPLETED: "default",
}

export const revisionStatusLabels: Record<RevisionStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
}

export const revisionStatusVariant: Record<
  RevisionStatus,
  "default" | "secondary" | "outline"
> = {
  OPEN: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
}

export const milestoneStatusLabels: Record<MilestoneStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
}

export const milestoneStatusVariant: Record<
  MilestoneStatus,
  "default" | "secondary" | "outline"
> = {
  PENDING: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
}

export const billingTypeLabels: Record<BillingType, string> = {
  FIXED_PRICE: "Fixed price",
  HOURLY: "Hourly",
  RETAINER: "Retainer",
}

export const supportSlaLabels: Record<SupportSla, string> = {
  STANDARD: "Standard",
  PRIORITY: "Priority",
  PREMIUM: "Premium",
}

export const deploymentMethodLabels: Record<DeploymentMethod, string> = {
  MANUAL: "Manual",
  CI_CD: "CI/CD",
  FTP: "FTP",
  GIT_PUSH: "Git push",
}

export const teamAccessLevelLabels: Record<TeamAccessLevel, string> = {
  FULL: "Full access",
  EDIT: "Edit",
  VIEW: "View only",
}

export const riskSeverityLabels: Record<RiskSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
}

export const riskSeverityVariant: Record<RiskSeverity, "outline" | "secondary" | "destructive"> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "destructive",
}

export const riskStatusLabels: Record<RiskStatus, string> = {
  OPEN: "Open",
  MITIGATED: "Mitigated",
  CLOSED: "Closed",
}

export const dependencyStatusLabels: Record<DependencyStatus, string> = {
  PENDING: "Pending",
  RECEIVED: "Received",
  BLOCKED: "Blocked",
}

export const dependencyStatusVariant: Record<
  DependencyStatus,
  "outline" | "default" | "destructive"
> = {
  PENDING: "outline",
  RECEIVED: "default",
  BLOCKED: "destructive",
}

export const PROJECT_TYPES = ["Website", "Web App", "Mobile App", "E-commerce", "Maintenance", "Other"]

export const PROJECT_DEPARTMENTS = ["Design", "Development", "Marketing", "Support"]

export const PAYMENT_TERMS_OPTIONS = ["Due on receipt", "Net 15", "Net 30", "Net 45", "50/50 split"]

export const TEAM_ROLES = ["Project Manager", "Developer", "Designer", "QA", "Support"]

export const DEFAULT_MILESTONE_TITLES = [
  "Project Initiation & Kickoff",
  "Requirements Gathering & Analysis",
  "Design & Prototyping",
  "Development Phase 1",
  "Development Phase 2",
  "Testing & QA",
  "Client Acceptance & UAT",
  "Deployment & Go-Live",
]

export const DEFAULT_DELIVERY_ITEMS = [
  "Internal QA",
  "Client Acceptance",
  "UAT",
  "Documentation",
  "Source Code Delivery",
  "Credentials Delivery",
  "Training",
  "Handover",
  "Deployment",
  "Production Verification",
  "SSL Certificate",
  "Analytics Setup",
  "SEO Optimization",
]

export function nextProjectCode(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `PRJ-${random}`
}

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    name: "Monthly maintenance retainer",
    description:
      "Ongoing maintenance retainer covering bug fixes, content updates, and small feature requests for the Acme storefront.",
    proposalId: "prop-2",
    contractId: null,
    status: "IN_PROGRESS",
    startedAt: "2026-06-23",
    targetEndAt: "2026-09-23",
    completedAt: null,
    includedRevisions: 4,
    supportMonths: 3,
    updatedAt: "2026-07-10",
    projectCode: "PRJ-AC0001",
    clientContact: "Rafiq Islam",
    projectType: "Maintenance",
    department: "Development",
    projectManagerName: "Nusrat Jahan",
    billingType: "RETAINER",
    paymentTerms: "Net 30",
    paymentSchedule: "Monthly, in advance",
    taxPercent: 0,
    discountPercent: 0,
    estimatedEffortHours: 20,
    goLiveAt: "2026-06-25",
    revisionWindowDays: 14,
    maxDaysPerRevision: 3,
    extraRevisionPriceBdt: 1500,
    revisionNotes:
      "Minor content/bug-fix requests only — larger scope changes are quoted separately.",
    supportSla: "STANDARD",
    supportWorkingHours: "9am–6pm, Sun–Thu",
    includedSupportTickets: 10,
    supportContactName: "Nusrat Jahan",
    sendRenewalReminder: true,
    domain: "acmecorp.com",
    hostingProvider: "cPanel — HostBD",
    serverDetails: "Shared hosting, 4GB RAM",
    repositoryUrl: "https://github.com/core-it/acmecorp-site",
    stagingUrl: "https://staging.acmecorp.com",
    productionUrl: "https://acmecorp.com",
    techStack: "WordPress, PHP, MySQL",
    deploymentMethod: "FTP",
  },
  {
    id: "proj-2",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    name: "E-commerce platform revamp",
    description: "Full redesign and rebuild of the Acme e-commerce platform, including checkout and inventory sync.",
    proposalId: "prop-1",
    contractId: null,
    status: "PLANNING",
    startedAt: "2026-07-12",
    targetEndAt: "2026-10-31",
    completedAt: null,
    includedRevisions: 3,
    supportMonths: 6,
    updatedAt: "2026-07-12",
    projectCode: "PRJ-AC0002",
    clientContact: "Rafiq Islam",
    projectType: "E-commerce",
    department: "Development",
    projectManagerName: "Nusrat Jahan",
    billingType: "FIXED_PRICE",
    paymentTerms: "50/50 split",
    paymentSchedule: "50% upfront, 50% on delivery",
    taxPercent: 0,
    discountPercent: 0,
    estimatedEffortHours: 320,
    goLiveAt: null,
    revisionWindowDays: 14,
    maxDaysPerRevision: 5,
    extraRevisionPriceBdt: 3000,
    revisionNotes: null,
    supportSla: "STANDARD",
    supportWorkingHours: null,
    includedSupportTickets: null,
    supportContactName: null,
    sendRenewalReminder: false,
    domain: null,
    hostingProvider: null,
    serverDetails: null,
    repositoryUrl: null,
    stagingUrl: null,
    productionUrl: null,
    techStack: "Next.js, PostgreSQL",
    deploymentMethod: null,
  },
  {
    id: "proj-3",
    organizationId: "org-2",
    organizationName: "Bay Traders Ltd",
    name: "Company website redesign",
    description: "Brand refresh and rebuild of the Bay Traders marketing site.",
    proposalId: null,
    contractId: null,
    status: "REVIEW",
    startedAt: "2026-05-20",
    targetEndAt: "2026-07-15",
    completedAt: null,
    includedRevisions: 2,
    supportMonths: 3,
    updatedAt: "2026-07-05",
    projectCode: "PRJ-BT0001",
    clientContact: "Tanvir Ahmed",
    projectType: "Website",
    department: "Design",
    projectManagerName: "Rafiq Islam",
    billingType: "FIXED_PRICE",
    paymentTerms: "Net 15",
    paymentSchedule: null,
    taxPercent: 0,
    discountPercent: 0,
    estimatedEffortHours: null,
    goLiveAt: null,
    revisionWindowDays: 14,
    maxDaysPerRevision: null,
    extraRevisionPriceBdt: null,
    revisionNotes: null,
    supportSla: "STANDARD",
    supportWorkingHours: null,
    includedSupportTickets: null,
    supportContactName: null,
    sendRenewalReminder: false,
    domain: null,
    hostingProvider: null,
    serverDetails: null,
    repositoryUrl: null,
    stagingUrl: null,
    productionUrl: null,
    techStack: null,
    deploymentMethod: null,
  },
  {
    id: "proj-4",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    name: "Q3 hosting & maintenance",
    description: null,
    proposalId: null,
    contractId: "contract-1",
    status: "PLANNING",
    startedAt: "2026-07-07",
    targetEndAt: null,
    completedAt: null,
    includedRevisions: 2,
    supportMonths: 3,
    updatedAt: "2026-07-07",
    projectCode: "PRJ-AC0003",
    clientContact: null,
    projectType: "Maintenance",
    department: "Development",
    projectManagerName: null,
    billingType: "FIXED_PRICE",
    paymentTerms: null,
    paymentSchedule: null,
    taxPercent: 0,
    discountPercent: 0,
    estimatedEffortHours: null,
    goLiveAt: null,
    revisionWindowDays: null,
    maxDaysPerRevision: null,
    extraRevisionPriceBdt: null,
    revisionNotes: null,
    supportSla: "STANDARD",
    supportWorkingHours: null,
    includedSupportTickets: null,
    supportContactName: null,
    sendRenewalReminder: false,
    domain: null,
    hostingProvider: null,
    serverDetails: null,
    repositoryUrl: null,
    stagingUrl: null,
    productionUrl: null,
    techStack: null,
    deploymentMethod: null,
  },
]

export const mockRevisionRequests: RevisionRequest[] = [
  {
    id: "rev-1",
    projectId: "proj-1",
    description: "Please update the homepage banner image to the new summer campaign artwork.",
    status: "DONE",
    requestedBy: "Rafiq Islam",
    requestedAt: "2026-06-28",
    respondedAt: "2026-06-29",
  },
  {
    id: "rev-2",
    projectId: "proj-1",
    description: "The checkout page total isn't updating when a discount code is applied.",
    status: "IN_PROGRESS",
    requestedBy: "Nusrat Jahan",
    requestedAt: "2026-07-08",
    respondedAt: null,
  },
  {
    id: "rev-3",
    projectId: "proj-3",
    description: "Can we swap the contact form's map to show our new office location?",
    status: "OPEN",
    requestedBy: "Tanvir Ahmed",
    requestedAt: "2026-07-04",
    respondedAt: null,
  },
]

export const mockMilestones: Milestone[] = [
  {
    id: "mile-1",
    projectId: "proj-1",
    title: "Onboarding call & scope confirmation",
    dueAt: "2026-06-25",
    status: "DONE",
    completedAt: "2026-06-24",
  },
  {
    id: "mile-2",
    projectId: "proj-1",
    title: "July content refresh",
    dueAt: "2026-07-20",
    status: "DONE",
    completedAt: "2026-07-18",
  },
  {
    id: "mile-3",
    projectId: "proj-1",
    title: "Checkout discount-code bug fix",
    dueAt: "2026-08-01",
    status: "IN_PROGRESS",
    completedAt: null,
  },
  {
    id: "mile-4",
    projectId: "proj-2",
    title: "Wireframes & design system",
    dueAt: "2026-07-25",
    status: "PENDING",
    completedAt: null,
  },
  {
    id: "mile-5",
    projectId: "proj-2",
    title: "Checkout & inventory integration",
    dueAt: "2026-09-05",
    status: "PENDING",
    completedAt: null,
  },
  {
    id: "mile-6",
    projectId: "proj-3",
    title: "Homepage & contact page build",
    dueAt: "2026-07-01",
    status: "PENDING",
    completedAt: null,
  },
]

export const mockProjectCredentials: CredentialEntry[] = [
  {
    id: "cred-1",
    projectId: "proj-1",
    label: "Hosting (cPanel)",
    username: "acmecorp",
    password: "K9#mQ2vL8xR",
    url: "https://cpanel.acmecorp.com:2083",
    notes: null,
  },
  {
    id: "cred-2",
    projectId: "proj-1",
    label: "WordPress admin",
    username: "admin@acmecorp.com",
    password: "wP!9zT4bN6qE",
    url: "https://acmecorp.com/wp-admin",
    notes: "Editor role also exists for the content team — ask before creating new admins.",
  },
]

export const mockDeliveryConfigItems: DeliveryConfigItem[] = DEFAULT_DELIVERY_ITEMS.map(
  (label, index) => ({
    id: `delivery-1-${index}`,
    projectId: "proj-1",
    label,
    included: !["UAT", "Training", "Deployment", "Production Verification", "Analytics Setup", "SEO Optimization"].includes(
      label
    ),
  })
)

export const mockProjectTeam: ProjectTeamMember[] = [
  { id: "team-1", projectId: "proj-1", name: "Nusrat Jahan", role: "Project Manager", accessLevel: "FULL" },
  { id: "team-2", projectId: "proj-1", name: "Rafiq Islam", role: "Developer", accessLevel: "EDIT" },
]

export const mockProjectRisks: ProjectRisk[] = [
  {
    id: "risk-1",
    projectId: "proj-1",
    description: "Client's shared hosting plan may not handle traffic spikes during campaigns.",
    severity: "MEDIUM",
    mitigation: "Recommend upgrading to a VPS before the next campaign.",
    status: "OPEN",
  },
]

export const mockProjectDependencies: ProjectDependency[] = [
  {
    id: "dep-1",
    projectId: "proj-1",
    description: "Need updated product photos for the July content refresh.",
    neededFrom: "Acme Corp marketing team",
    dueAt: "2026-07-15",
    status: "RECEIVED",
  },
  {
    id: "dep-2",
    projectId: "proj-1",
    description: "Waiting on renewed SSL certificate purchase approval.",
    neededFrom: "Acme Corp",
    dueAt: "2026-08-10",
    status: "PENDING",
  },
]

export function revisionsForProject(projectId: string): RevisionRequest[] {
  return mockRevisionRequests
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
}

export function revisionStats(project: Project): {
  included: number
  used: number
  remaining: number
  extra: number
} {
  const used = mockRevisionRequests.filter((r) => r.projectId === project.id).length
  const remaining = Math.max(0, project.includedRevisions - used)
  const extra = Math.max(0, used - project.includedRevisions)
  return { included: project.includedRevisions, used, remaining, extra }
}

export function milestonesForProject(projectId: string): Milestone[] {
  return mockMilestones
    .filter((m) => m.projectId === projectId)
    .sort((a, b) => {
      if (!a.dueAt) return 1
      if (!b.dueAt) return -1
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
    })
}

export function milestoneProgress(projectId: string): { done: number; total: number; percent: number } {
  const milestones = milestonesForProject(projectId)
  const done = milestones.filter((m) => m.status === "DONE").length
  const total = milestones.length
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export function isMilestoneOverdue(milestone: Milestone): boolean {
  if (!milestone.dueAt || milestone.status === "DONE") return false
  return new Date(milestone.dueAt).getTime() < Date.now()
}

export function supportStatus(project: Project): {
  state: SupportState
  endsAt: string | null
  daysRemaining: number | null
} {
  if (!project.completedAt) {
    return { state: "NOT_STARTED", endsAt: null, daysRemaining: null }
  }
  const endsAt = new Date(project.completedAt)
  endsAt.setMonth(endsAt.getMonth() + project.supportMonths)
  const daysRemaining = Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return {
    state: daysRemaining > 0 ? "ACTIVE" : "EXPIRED",
    endsAt: endsAt.toISOString().slice(0, 10),
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
  }
}

export function deliveryConfigForProject(projectId: string): DeliveryConfigItem[] {
  return mockDeliveryConfigItems.filter((d) => d.projectId === projectId)
}

export function teamForProject(projectId: string): ProjectTeamMember[] {
  return mockProjectTeam.filter((t) => t.projectId === projectId)
}

export function risksForProject(projectId: string): ProjectRisk[] {
  return mockProjectRisks.filter((r) => r.projectId === projectId)
}

export function dependenciesForProject(projectId: string): ProjectDependency[] {
  return mockProjectDependencies.filter((d) => d.projectId === projectId)
}
