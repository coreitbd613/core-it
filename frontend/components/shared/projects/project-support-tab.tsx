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
import { LEAD_OWNERS } from "@/lib/mock/leads"
import { supportSlaLabels, supportStatus, type Project, type SupportSla } from "@/lib/mock/projects"

const supportMonthOptions = [1, 3, 6, 12]

export function ProjectSupportTab({
  project,
  variant,
  onChange,
}: {
  project: Project
  variant: "admin" | "portal"
  onChange?: () => void
}) {
  const status = supportStatus(project)

  function handleMonthsChange(months: number) {
    project.supportMonths = months
    project.updatedAt = new Date().toISOString().slice(0, 10)
    onChange?.()
    toast.success("Support policy updated.")
  }

  function saveField<K extends keyof Project>(key: K, value: Project[K]) {
    project[key] = value
    project.updatedAt = new Date().toISOString().slice(0, 10)
    onChange?.()
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
                onValueChange={(v) => handleMonthsChange(Number(v))}
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
              {status.endsAt
                ? new Date(status.endsAt).toLocaleDateString()
                : "Starts once delivered"}
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
                  onValueChange={(v) => {
                    saveField("supportSla", v as SupportSla)
                    toast.success("SLA updated.")
                  }}
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
                    saveField("supportWorkingHours", next)
                    toast.success("Working hours updated.")
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
                    saveField("includedSupportTickets", next)
                    toast.success("Included tickets updated.")
                  }}
                />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Support contact</p>
                <Select
                  value={project.supportContactName ?? ""}
                  onValueChange={(v) => {
                    saveField("supportContactName", v || null)
                    toast.success("Support contact updated.")
                  }}
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
                onCheckedChange={(checked) => {
                  saveField("sendRenewalReminder", checked === true)
                }}
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
