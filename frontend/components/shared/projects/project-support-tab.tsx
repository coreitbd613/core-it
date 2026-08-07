"use client"

import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateProject } from "@/hooks/use-projects"
import { formatDate } from "@/lib/format"
import { LEAD_OWNERS } from "@/lib/mock/leads"
import {
  supportSlaLabels,
  supportStatus,
  type Project,
  type SupportSla,
  type UpdateProjectInput,
} from "@/lib/projects"

const supportMonthOptions = [1, 3, 6, 12]

export function ProjectSupportTab({
  project,
  variant,
}: {
  project: Project
  variant: "admin" | "portal"
}) {
  const updateProject = useUpdateProject(project.id)
  const status = supportStatus(project)

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

  const badgeVariant =
    status.state === "ACTIVE" ? "default" : status.state === "EXPIRED" ? "destructive" : "outline"

  const statusLabel =
    status.state === "NOT_STARTED"
      ? "Not started"
      : status.state === "ACTIVE"
        ? `Active — ${status.daysRemaining} day${status.daysRemaining === 1 ? "" : "s"} left`
        : "Expired"

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>After-sales support</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Badge variant={badgeVariant} className="w-fit">
          {statusLabel}
        </Badge>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Free support window</p>
            {variant === "admin" ? (
              <Select
                value={String(project.supportMonths)}
                onValueChange={(v) => saveField("supportMonths", Number(v), "Support policy updated.")}
              >
                <SelectTrigger size="sm" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportMonthOptions.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} {m === 1 ? "month" : "months"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-foreground">
                {project.supportMonths} {project.supportMonths === 1 ? "month" : "months"}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Support ends</p>
            <p className="text-sm text-foreground">
              {status.endsAt ? formatDate(status.endsAt) : "Starts once delivered"}
            </p>
          </div>
        </div>

        {status.state === "NOT_STARTED" && (
          <p className="text-sm text-muted-foreground">
            The support window begins once this project is marked Completed.
          </p>
        )}

        {variant === "admin" && (
          <div className="flex flex-col gap-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">SLA</p>
                <Select
                  value={project.supportSla}
                  onValueChange={(v) => saveField("supportSla", v as SupportSla, "SLA updated.")}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(supportSlaLabels).map(([v, label]) => (
                      <SelectItem key={v} value={v}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Working hours</p>
                <Input
                  defaultValue={project.supportWorkingHours ?? ""}
                  className="h-8"
                  placeholder="e.g. 9am–6pm"
                  onBlur={(e) => {
                    const next = e.target.value.trim() || null
                    if (next === project.supportWorkingHours) return
                    saveField("supportWorkingHours", next, "Working hours updated.")
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Included support tickets</p>
                <Input
                  type="number"
                  min={0}
                  defaultValue={project.includedSupportTickets ?? ""}
                  className="h-8"
                  onBlur={(e) => {
                    const next = e.target.value ? Number(e.target.value) : null
                    if (next === project.includedSupportTickets) return
                    saveField("includedSupportTickets", next, "Included tickets updated.")
                  }}
                />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Support contact</p>
                <Select
                  value={project.supportContactName ?? ""}
                  onValueChange={(v) =>
                    saveField("supportContactName", v || null, "Support contact updated.")
                  }
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_OWNERS.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="support-renewal-reminder"
                checked={project.sendRenewalReminder}
                onCheckedChange={(checked) =>
                  saveField("sendRenewalReminder", checked === true, "Renewal reminder updated.")
                }
              />
              <label htmlFor="support-renewal-reminder" className="text-sm text-foreground">
                Send renewal reminder
              </label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
