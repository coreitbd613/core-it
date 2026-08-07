"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  useFileMyRevisionRequest,
  useRespondToRevisionRequest,
  useUpdateProject,
} from "@/hooks/use-projects"
import { formatDate } from "@/lib/format"
import {
  revisionStats,
  revisionStatusLabels,
  revisionStatusVariant,
  type Project,
  type RevisionStatus,
  type UpdateProjectInput,
} from "@/lib/projects"

const revisionStatuses: RevisionStatus[] = ["OPEN", "IN_PROGRESS", "DONE"]

export function ProjectRevisionsTab({
  project,
  variant,
}: {
  project: Project
  variant: "admin" | "portal"
}) {
  const updateProject = useUpdateProject(project.id)
  const respondToRevision = useRespondToRevisionRequest(project.id)
  const fileRevisionRequest = useFileMyRevisionRequest(project.id)

  const revisions = project.revisionRequests
  const stats = revisionStats(project)

  function handleStatusChange(revisionId: string, status: RevisionStatus) {
    respondToRevision.mutate(
      { revisionId, input: { status } },
      {
        onSuccess: () => toast.success("Revision status updated."),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't update this revision."),
      }
    )
  }

  function handleRequest(description: string) {
    fileRevisionRequest.mutate(
      { description },
      {
        onSuccess: () => toast.success("Revision request sent to Core IT."),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't send this request."),
      }
    )
  }

  function saveField<K extends keyof UpdateProjectInput>(
    key: K,
    value: UpdateProjectInput[K],
    successMessage: string
  ) {
    updateProject.mutate(
      { [key]: value } as UpdateProjectInput,
      {
        onSuccess: () => toast.success(successMessage),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't save this project."),
      }
    )
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Revision requests</CardTitle>
        {variant === "portal" && <RequestRevisionDialog onRequest={handleRequest} />}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
          {variant === "admin" ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Included in policy</span>
              <Input
                type="number"
                min={0}
                defaultValue={stats.included}
                className="h-7 w-16"
                onBlur={(e) => {
                  const next = Number(e.target.value)
                  if (Number.isNaN(next) || next === stats.included) return
                  saveField("includedRevisions", next, "Revision policy updated.")
                }}
              />
            </div>
          ) : (
            <Badge variant="outline">{stats.included} included</Badge>
          )}
          <Badge variant="secondary">{stats.used} used</Badge>
          <Badge variant={stats.remaining > 0 ? "default" : "outline"}>
            {stats.remaining} remaining
          </Badge>
          {stats.extra > 0 && (
            <Badge variant="destructive">{stats.extra} extra (billable)</Badge>
          )}
        </div>

        {variant === "admin" && (
          <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Revision window (days)</p>
              <Input
                type="number"
                min={0}
                defaultValue={project.revisionWindowDays ?? ""}
                className="h-8"
                onBlur={(e) => {
                  const next = e.target.value ? Number(e.target.value) : null
                  if (next === project.revisionWindowDays) return
                  saveField("revisionWindowDays", next, "Revision window updated.")
                }}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Max days per revision</p>
              <Input
                type="number"
                min={0}
                defaultValue={project.maxDaysPerRevision ?? ""}
                className="h-8"
                onBlur={(e) => {
                  const next = e.target.value ? Number(e.target.value) : null
                  if (next === project.maxDaysPerRevision) return
                  saveField("maxDaysPerRevision", next, "Max turnaround updated.")
                }}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price per extra revision (BDT)</p>
              <Input
                type="number"
                min={0}
                defaultValue={project.extraRevisionPriceBdt ?? ""}
                className="h-8"
                onBlur={(e) => {
                  const next = e.target.value ? Number(e.target.value) : null
                  if (next === (project.extraRevisionPriceBdt ? Number(project.extraRevisionPriceBdt) : null))
                    return
                  saveField("extraRevisionPriceBdt", next, "Extra revision price updated.")
                }}
              />
            </div>
            <div className="sm:col-span-3">
              <p className="text-xs text-muted-foreground">Revision notes</p>
              <Textarea
                defaultValue={project.revisionNotes ?? ""}
                rows={2}
                placeholder="Additional revision policy notes"
                onBlur={(e) => {
                  const next = e.target.value.trim() || null
                  if (next === project.revisionNotes) return
                  saveField("revisionNotes", next, "Revision notes updated.")
                }}
              />
            </div>
          </div>
        )}

        {variant === "portal" && (project.revisionWindowDays || project.revisionNotes) && (
          <p className="text-xs text-muted-foreground">
            {project.revisionWindowDays && `Revisions can be requested within ${project.revisionWindowDays} days of delivery. `}
            {project.revisionNotes}
          </p>
        )}

        {revisions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No revisions requested yet.</p>
        ) : (
          <div className="flex flex-col divide-y rounded-lg border">
            {revisions.map((revision) => (
              <div key={revision.id} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {revision.requestedBy} · {formatDate(revision.requestedAt)}
                  </span>
                  {variant === "admin" ? (
                    <Select
                      value={revision.status}
                      onValueChange={(status) =>
                        handleStatusChange(revision.id, status as RevisionStatus)
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
                  ) : (
                    <Badge variant={revisionStatusVariant[revision.status]}>
                      {revisionStatusLabels[revision.status]}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-foreground">{revision.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
