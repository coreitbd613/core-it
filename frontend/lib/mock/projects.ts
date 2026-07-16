export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "REVIEW" | "COMPLETED"
export type RevisionStatus = "OPEN" | "IN_PROGRESS" | "DONE"

export type RevisionRequest = {
  id: string
  projectId: string
  description: string
  status: RevisionStatus
  requestedBy: string
  requestedAt: string
  respondedAt: string | null
}

export type Project = {
  id: string
  organizationId: string
  organizationName: string
  name: string
  proposalId: string | null
  status: ProjectStatus
  startedAt: string
  updatedAt: string
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

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    name: "Monthly maintenance retainer",
    proposalId: "prop-2",
    status: "IN_PROGRESS",
    startedAt: "2026-06-23",
    updatedAt: "2026-07-10",
  },
  {
    id: "proj-2",
    organizationId: "org-1",
    organizationName: "Acme Corp",
    name: "E-commerce platform revamp",
    proposalId: "prop-1",
    status: "PLANNING",
    startedAt: "2026-07-12",
    updatedAt: "2026-07-12",
  },
  {
    id: "proj-3",
    organizationId: "org-2",
    organizationName: "Bay Traders Ltd",
    name: "Company website redesign",
    proposalId: null,
    status: "REVIEW",
    startedAt: "2026-05-20",
    updatedAt: "2026-07-05",
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
