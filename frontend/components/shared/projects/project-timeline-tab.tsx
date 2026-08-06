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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  isMilestoneOverdue,
  milestoneProgress,
  milestoneStatusLabels,
  milestoneStatusVariant,
  milestonesForProject,
  mockMilestones,
  type MilestoneStatus,
  type Project,
} from "@/lib/mock/projects"

const milestoneStatuses: MilestoneStatus[] = ["PENDING", "IN_PROGRESS", "DONE"]

export function ProjectTimelineTab({
  project,
  variant,
  onChange,
}: {
  project: Project
  variant: "admin" | "portal"
  onChange?: () => void
}) {
  const milestones = milestonesForProject(project.id)
  const progress = milestoneProgress(project.id)

  function handleAdd(title: string, dueAt: string) {
    mockMilestones.push({
      id: crypto.randomUUID(),
      projectId: project.id,
      title,
      dueAt: dueAt || null,
      status: "PENDING",
      completedAt: null,
    })
    onChange?.()
    toast.success("Milestone added.")
  }

  function handleStatusChange(milestoneId: string, status: MilestoneStatus) {
    const milestone = mockMilestones.find((m) => m.id === milestoneId)
    if (!milestone) return
    milestone.status = status
    milestone.completedAt = status === "DONE" ? new Date().toISOString().slice(0, 10) : null
    onChange?.()
    toast.success("Milestone updated.")
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Timeline</CardTitle>
        {variant === "admin" && <AddMilestoneDialog onAdd={handleAdd} />}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progress.done} of {progress.total} milestones complete
            </span>
            <span className="font-medium text-foreground">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} />
        </div>

        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No milestones yet.</p>
        ) : (
          <div className="flex flex-col divide-y rounded-lg border">
            {milestones.map((milestone) => {
              const overdue = isMilestoneOverdue(milestone)
              return (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-foreground">{milestone.title}</span>
                    <span
                      className={`text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {milestone.dueAt
                        ? `${overdue ? "Overdue — " : "Due "}${new Date(
                            milestone.dueAt
                          ).toLocaleDateString()}`
                        : "No due date"}
                    </span>
                  </div>
                  {variant === "admin" ? (
                    <Select
                      value={milestone.status}
                      onValueChange={(status) =>
                        handleStatusChange(milestone.id, status as MilestoneStatus)
                      }
                    >
                      <SelectTrigger size="sm" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {milestoneStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {milestoneStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={milestoneStatusVariant[milestone.status]}>
                      {milestoneStatusLabels[milestone.status]}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AddMilestoneDialog({ onAdd }: { onAdd: (title: string, dueAt: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [dueAt, setDueAt] = React.useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), dueAt)
    setTitle("")
    setDueAt("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Add milestone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add milestone</DialogTitle>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="milestone-title">Title</FieldLabel>
              <Input
                id="milestone-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wireframes & design system"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="milestone-due">Due date</FieldLabel>
              <Input
                id="milestone-due"
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
