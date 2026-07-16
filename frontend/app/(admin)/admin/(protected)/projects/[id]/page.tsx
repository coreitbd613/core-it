"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  mockProjects,
  mockRevisionRequests,
  projectStatusLabels,
  revisionStatusLabels,
  type ProjectStatus,
  type RevisionStatus,
} from "@/lib/mock/projects"
import { mockProposals } from "@/lib/mock/proposals"

const projectStatuses: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED"]
const revisionStatuses: RevisionStatus[] = ["OPEN", "IN_PROGRESS", "DONE"]

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const [, forceRerender] = React.useState(0)

  const project = mockProjects.find((p) => p.id === params.id)

  if (!project) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Project not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/projects">Back to projects</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const linkedProposal = project.proposalId
    ? mockProposals.find((p) => p.id === project.proposalId)
    : null

  const revisions = mockRevisionRequests
    .filter((r) => r.projectId === project.id)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())

  function handleStatusChange(status: ProjectStatus) {
    project!.status = status
    project!.updatedAt = new Date().toISOString().slice(0, 10)
    forceRerender((n) => n + 1)
    toast.success("Project status updated.")
  }

  function handleRevisionStatusChange(revisionId: string, status: RevisionStatus) {
    const revision = mockRevisionRequests.find((r) => r.id === revisionId)
    if (!revision) return
    revision.status = status
    revision.respondedAt = status === "DONE" ? new Date().toISOString().slice(0, 10) : revision.respondedAt
    forceRerender((n) => n + 1)
    toast.success("Revision status updated.")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects" aria-label="Back to projects">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">
            {project.organizationName}
            {linkedProposal && (
              <>
                {" "}
                · From proposal{" "}
                <Link href={`/admin/proposals/${linkedProposal.id}`} className="underline">
                  {linkedProposal.title}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="ml-auto">
          <Select value={project.status} onValueChange={handleStatusChange}>
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projectStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {projectStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Revision requests</CardTitle>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revisions requested yet.</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {revisions.map((revision) => (
                <div key={revision.id} className="flex flex-col gap-2 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {revision.requestedBy} · {new Date(revision.requestedAt).toLocaleDateString()}
                    </span>
                    <Select
                      value={revision.status}
                      onValueChange={(status) =>
                        handleRevisionStatusChange(revision.id, status as RevisionStatus)
                      }
                    >
                      <SelectTrigger size="sm" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {revisionStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {revisionStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-foreground">{revision.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
