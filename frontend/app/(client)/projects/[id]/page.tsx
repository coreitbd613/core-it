"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, PlusIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  mockProjects,
  mockRevisionRequests,
  projectStatusLabels,
  projectStatusVariant,
  revisionStatusLabels,
  revisionStatusVariant,
} from "@/lib/mock/projects"
import { mockProposals } from "@/lib/mock/proposals"

export default function ProjectDetailPage() {
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
            <Link href="/projects">Back to projects</Link>
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

  function handleRequestRevision(description: string) {
    mockRevisionRequests.unshift({
      id: crypto.randomUUID(),
      projectId: project!.id,
      description,
      status: "OPEN",
      requestedBy: "You",
      requestedAt: new Date().toISOString().slice(0, 10),
      respondedAt: null,
    })
    forceRerender((n) => n + 1)
    toast.success("Revision request sent to Core IT.")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects" aria-label="Back to projects">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {linkedProposal && (
            <p className="text-muted-foreground">
              From proposal{" "}
              <Link href={`/proposals/${linkedProposal.id}`} className="underline">
                {linkedProposal.title}
              </Link>
            </p>
          )}
        </div>
        <Badge variant={projectStatusVariant[project.status]} className="ml-auto">
          {projectStatusLabels[project.status]}
        </Badge>
      </div>

      <Card className="max-w-3xl">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Revision requests</CardTitle>
          <RequestRevisionDialog onRequest={handleRequestRevision} />
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revisions requested yet.</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {revisions.map((revision) => (
                <div key={revision.id} className="flex flex-col gap-1.5 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {revision.requestedBy} · {new Date(revision.requestedAt).toLocaleDateString()}
                    </span>
                    <Badge variant={revisionStatusVariant[revision.status]}>
                      {revisionStatusLabels[revision.status]}
                    </Badge>
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

function RequestRevisionDialog({ onRequest }: { onRequest: (description: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [description, setDescription] = React.useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    onRequest(description.trim())
    setDescription("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Request a revision
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request a revision</DialogTitle>
            <DialogDescription>
              Describe the change you&apos;d like — Core IT will pick it up from here.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="revision-description">What needs to change?</FieldLabel>
              <Textarea
                id="revision-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the revision..."
                rows={4}
                required
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Send request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
