import { authFetch } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED"
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "DONE"
export type RevisionStatus = "OPEN" | "IN_PROGRESS" | "DONE"
export type TeamAccessLevel = "FULL" | "EDIT" | "VIEW"
export type SupportSla = "STANDARD" | "PRIORITY" | "PREMIUM"
export type DeploymentMethod = "MANUAL" | "CI_CD" | "FTP" | "GIT_PUSH"
export type SupportState = "NOT_STARTED" | "ACTIVE" | "EXPIRED"

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

export type ProjectMilestone = {
  id: string
  projectId: string
  title: string
  dueAt: string | null
  status: MilestoneStatus
  completedAt: string | null
}

export type ProjectRevisionRequest = {
  id: string
  projectId: string
  description: string
  status: RevisionStatus
  requestedBy: string
  requestedAt: string
  respondedAt: string | null
}

export type ProjectCredential = {
  id: string
  projectId: string
  label: string
  username: string | null
  password: string | null
  url: string | null
  notes: string | null
}

export type ProjectTeamMember = {
  id: string
  projectId: string
  name: string
  role: string
  accessLevel: TeamAccessLevel
}

export type Project = {
  id: string
  organizationId: string
  organization: { id: string; name: string } | null
  name: string
  description: string | null
  proposalId: string | null // no real Proposal backend exists yet — freeform, not a FK
  contractId: string | null // same reasoning
  status: ProjectStatus
  startedAt: string
  targetEndAt: string | null
  completedAt: string | null
  includedRevisions: number
  supportMonths: number

  projectType: string | null
  department: string | null
  projectManagerName: string | null

  paymentTerms: string | null
  paymentSchedule: string | null
  // Decimal fields serialize as strings over the wire — parse with Number() when doing math.
  contractValueBdt: string | null

  goLiveAt: string | null

  revisionWindowDays: number | null
  maxDaysPerRevision: number | null
  extraRevisionPriceBdt: string | null
  revisionNotes: string | null

  supportSla: SupportSla
  supportWorkingHours: string | null
  includedSupportTickets: number | null
  supportContactName: string | null
  sendRenewalReminder: boolean

  domain: string | null
  hostingProvider: string | null
  serverDetails: string | null
  repositoryUrl: string | null
  stagingUrl: string | null
  productionUrl: string | null
  techStack: string | null
  deploymentMethod: DeploymentMethod | null
  credentialsNotes: string | null

  createdAt: string
  updatedAt: string

  milestones: ProjectMilestone[]
  revisionRequests: ProjectRevisionRequest[]
  credentials: ProjectCredential[]
  teamMembers: ProjectTeamMember[]
}

export function revisionStats(
  project: Pick<Project, "includedRevisions" | "revisionRequests">
): { included: number; used: number; remaining: number; extra: number } {
  const used = project.revisionRequests.length
  const remaining = Math.max(0, project.includedRevisions - used)
  const extra = Math.max(0, used - project.includedRevisions)
  return { included: project.includedRevisions, used, remaining, extra }
}

export function milestoneProgress(
  milestones: ProjectMilestone[]
): { done: number; total: number; percent: number } {
  const done = milestones.filter((m) => m.status === "DONE").length
  const total = milestones.length
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export function isMilestoneOverdue(milestone: ProjectMilestone): boolean {
  if (!milestone.dueAt || milestone.status === "DONE") return false
  return new Date(milestone.dueAt).getTime() < Date.now()
}

export function supportStatus(
  project: Pick<Project, "completedAt" | "supportMonths">
): { state: SupportState; endsAt: string | null; daysRemaining: number | null } {
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

export type CreateMilestoneInput = { title: string; dueAt?: string }
export type UpdateMilestoneInput = { title?: string; dueAt?: string; status?: MilestoneStatus }
export type CreateTeamMemberInput = { name: string; role: string; accessLevel?: TeamAccessLevel }
export type UpdateTeamMemberInput = Partial<CreateTeamMemberInput>
export type CreateCredentialInput = {
  label: string
  username?: string | null
  password?: string | null
  url?: string | null
  notes?: string | null
}
export type UpdateCredentialInput = Partial<CreateCredentialInput>
export type CreateRevisionRequestInput = { description: string; requestedBy?: string }
export type RespondRevisionRequestInput = { status: RevisionStatus }

export type CreateProjectInput = {
  organizationId: string
  name: string
  description?: string
  proposalId?: string
  contractId?: string
  startedAt: string
  targetEndAt?: string
  includedRevisions?: number
  supportMonths?: number
  projectType?: string
  department?: string
  projectManagerName?: string
  paymentTerms?: string
  paymentSchedule?: string
  contractValueBdt?: number
  goLiveAt?: string
  revisionWindowDays?: number
  maxDaysPerRevision?: number
  extraRevisionPriceBdt?: number
  revisionNotes?: string
  supportSla?: SupportSla
  supportWorkingHours?: string
  includedSupportTickets?: number
  supportContactName?: string
  sendRenewalReminder?: boolean
  domain?: string
  hostingProvider?: string
  serverDetails?: string
  repositoryUrl?: string
  stagingUrl?: string
  productionUrl?: string
  techStack?: string
  deploymentMethod?: DeploymentMethod
  credentialsNotes?: string
  milestones?: CreateMilestoneInput[]
  teamMembers?: CreateTeamMemberInput[]
  credentials?: CreateCredentialInput[]
}

// Nullable fields accept `null` explicitly (to clear them) in addition to
// `undefined` (to leave them untouched) — the backend's class-validator
// @IsOptional() already treats null as "skip validation, pass it through",
// so Prisma sets the column to NULL instead of a no-op.
export type UpdateProjectInput = {
  name?: string
  description?: string | null
  proposalId?: string | null
  contractId?: string | null
  startedAt?: string
  targetEndAt?: string | null
  includedRevisions?: number
  supportMonths?: number
  projectType?: string | null
  department?: string | null
  projectManagerName?: string | null
  paymentTerms?: string | null
  paymentSchedule?: string | null
  contractValueBdt?: number | null
  goLiveAt?: string | null
  revisionWindowDays?: number | null
  maxDaysPerRevision?: number | null
  extraRevisionPriceBdt?: number | null
  revisionNotes?: string | null
  supportSla?: SupportSla
  supportWorkingHours?: string | null
  includedSupportTickets?: number | null
  supportContactName?: string | null
  sendRenewalReminder?: boolean
  domain?: string | null
  hostingProvider?: string | null
  serverDetails?: string | null
  repositoryUrl?: string | null
  stagingUrl?: string | null
  productionUrl?: string | null
  techStack?: string | null
  deploymentMethod?: DeploymentMethod | null
  credentialsNotes?: string | null
}

async function parseErrorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null
  return body?.message ?? fallback
}

// --- Admin ---

export async function getAdminProjects(filters?: {
  organizationId?: string
  status?: ProjectStatus
}): Promise<Project[]> {
  const params = new URLSearchParams()
  if (filters?.organizationId) params.set("organizationId", filters.organizationId)
  if (filters?.status) params.set("status", filters.status)
  const query = params.toString() ? `?${params.toString()}` : ""

  const res = await authFetch(`${API_URL}/projects/admin${query}`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load projects."))
  }
  return (await res.json()) as Project[]
}

export async function getAdminProject(id: string): Promise<Project> {
  const res = await authFetch(`${API_URL}/projects/admin/${id}`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load this project."))
  }
  return (await res.json()) as Project
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await authFetch(
    `${API_URL}/projects/admin`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't create this project."))
  }
  return (await res.json()) as Project
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${id}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't save this project."))
  }
  return (await res.json()) as Project
}

export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${id}/status`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't update this project's status."))
  }
  return (await res.json()) as Project
}

export async function deleteProject(id: string): Promise<void> {
  const res = await authFetch(`${API_URL}/projects/admin/${id}`, { method: "DELETE" }, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't delete this project."))
  }
}

export async function addMilestone(projectId: string, input: CreateMilestoneInput): Promise<ProjectMilestone> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/milestones`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't add this milestone."))
  }
  return (await res.json()) as ProjectMilestone
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  input: UpdateMilestoneInput
): Promise<ProjectMilestone> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/milestones/${milestoneId}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't update this milestone."))
  }
  return (await res.json()) as ProjectMilestone
}

export async function deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/milestones/${milestoneId}`,
    { method: "DELETE" },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't remove this milestone."))
  }
}

export async function adminFileRevisionRequest(
  projectId: string,
  input: CreateRevisionRequestInput
): Promise<ProjectRevisionRequest> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/revisions`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't file this revision request."))
  }
  return (await res.json()) as ProjectRevisionRequest
}

export async function respondToRevisionRequest(
  projectId: string,
  revisionId: string,
  input: RespondRevisionRequestInput
): Promise<ProjectRevisionRequest> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/revisions/${revisionId}/respond`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't update this revision request."))
  }
  return (await res.json()) as ProjectRevisionRequest
}

export async function addCredential(
  projectId: string,
  input: CreateCredentialInput
): Promise<ProjectCredential> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/credentials`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't add this credential."))
  }
  return (await res.json()) as ProjectCredential
}

export async function updateCredential(
  projectId: string,
  credentialId: string,
  input: UpdateCredentialInput
): Promise<ProjectCredential> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/credentials/${credentialId}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't update this credential."))
  }
  return (await res.json()) as ProjectCredential
}

export async function deleteCredential(projectId: string, credentialId: string): Promise<void> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/credentials/${credentialId}`,
    { method: "DELETE" },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't remove this credential."))
  }
}

export async function addTeamMember(
  projectId: string,
  input: CreateTeamMemberInput
): Promise<ProjectTeamMember> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/team`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't add this team member."))
  }
  return (await res.json()) as ProjectTeamMember
}

export async function updateTeamMember(
  projectId: string,
  teamMemberId: string,
  input: UpdateTeamMemberInput
): Promise<ProjectTeamMember> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/team/${teamMemberId}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't update this team member."))
  }
  return (await res.json()) as ProjectTeamMember
}

export async function deleteTeamMember(projectId: string, teamMemberId: string): Promise<void> {
  const res = await authFetch(
    `${API_URL}/projects/admin/${projectId}/team/${teamMemberId}`,
    { method: "DELETE" },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't remove this team member."))
  }
}

// --- Client-facing ---

export async function getMyProjects(organizationId?: string): Promise<Project[]> {
  const query = organizationId ? `?organizationId=${organizationId}` : ""
  const res = await authFetch(`${API_URL}/projects/mine${query}`, {}, "client")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load your projects."))
  }
  return (await res.json()) as Project[]
}

export async function getMyProject(id: string): Promise<Project> {
  const res = await authFetch(`${API_URL}/projects/mine/${id}`, {}, "client")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load this project."))
  }
  return (await res.json()) as Project
}

export async function createMyProject(input: CreateProjectInput): Promise<Project> {
  const res = await authFetch(
    `${API_URL}/projects/mine`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "client"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't start this project."))
  }
  return (await res.json()) as Project
}

export async function fileMyRevisionRequest(
  projectId: string,
  input: CreateRevisionRequestInput
): Promise<ProjectRevisionRequest> {
  const res = await authFetch(
    `${API_URL}/projects/mine/${projectId}/revisions`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "client"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't submit this revision request."))
  }
  return (await res.json()) as ProjectRevisionRequest
}
