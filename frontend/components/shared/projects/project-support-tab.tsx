"use client"

import * as React from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/shared/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useAdminFileSupportTicket,
  useFileMySupportTicket,
  useRespondToSupportTicket,
  useUpdateProject,
} from "@/hooks/use-projects"
import { formatDate } from "@/lib/format"
import { STAFF_MEMBERS } from "@/lib/staff"
import {
  supportSlaLabels,
  supportStatus,
  supportTicketStats,
  supportTicketStatusLabels,
  supportTicketStatusVariant,
  type Project,
  type SupportSla,
  type SupportTicketStatus,
  type UpdateProjectInput,
} from "@/lib/projects"

const supportMonthOptions = [1, 3, 6, 12]
const supportTicketStatuses: SupportTicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"]

function isHtmlEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length === 0
}

export function ProjectSupportTab({
  project,
  variant,
}: {
  project: Project
  variant: "admin" | "portal"
}) {
  const updateProject = useUpdateProject(project.id)
  const status = supportStatus(project)
  const ticketStats = supportTicketStats(project)
  const tickets = project.supportTickets
  const fileMyTicket = useFileMySupportTicket(project.id)
  const fileAdminTicket = useAdminFileSupportTicket(project.id)
  const respondToTicket = useRespondToSupportTicket(project.id)

  const [subject, setSubject] = React.useState("")
  const [description, setDescription] = React.useState("")

  function handleFileTicket(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || isHtmlEmpty(description)) return
    const mutation = variant === "portal" ? fileMyTicket : fileAdminTicket
    mutation.mutate(
      { subject: subject.trim(), description },
      {
        onSuccess: () => {
          toast.success("Support ticket submitted.")
          setSubject("")
          setDescription("")
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't submit this ticket."),
      }
    )
  }

  function handleTicketStatusChange(ticketId: string, ticketStatus: SupportTicketStatus) {
    respondToTicket.mutate(
      { ticketId, input: { status: ticketStatus } },
      {
        onSuccess: () => toast.success("Ticket updated."),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't update this ticket."),
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

  const badgeVariant =
    status.state === "ACTIVE" ? "default" : status.state === "EXPIRED" ? "destructive" : "outline"

  const statusLabel =
    status.state === "NOT_STARTED"
      ? "Not started"
      : status.state === "ACTIVE"
        ? `Active — ${status.daysRemaining} day${status.daysRemaining === 1 ? "" : "s"} left`
        : "Expired"

  return (
    <div className="flex max-w-3xl flex-col gap-6">
    <Card>
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
                    {STAFF_MEMBERS.map((owner) => (
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

    <Card>
      <CardHeader>
        <CardTitle>Support tickets</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
          <Badge variant="outline">
            {ticketStats.included == null ? "Unlimited included" : `${ticketStats.included} included`}
          </Badge>
          <Badge variant="secondary">{ticketStats.used} filed</Badge>
          {ticketStats.remaining != null && (
            <Badge variant={ticketStats.remaining > 0 ? "default" : "outline"}>
              {ticketStats.remaining} remaining
            </Badge>
          )}
        </div>

        <form onSubmit={handleFileTicket} className="rounded-lg border p-3">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ticket-subject">Subject</FieldLabel>
              <Input
                id="ticket-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Contact form not sending emails"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="ticket-description">What&apos;s going on?</FieldLabel>
              <RichTextEditor
                id="ticket-description"
                value={description}
                onChange={setDescription}
                placeholder="Describe the issue..."
                minHeight="120px"
              />
            </Field>
          </FieldGroup>
          <div className="mt-3 flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!subject.trim() || isHtmlEmpty(description)}
            >
              Submit ticket
            </Button>
          </div>
        </form>

        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No support tickets yet.</p>
        ) : (
          <div className="flex flex-col divide-y rounded-lg border">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{ticket.subject}</span>
                    <span className="text-xs text-muted-foreground">
                      {ticket.requestedBy} · {formatDate(ticket.requestedAt)}
                    </span>
                  </div>
                  {variant === "admin" ? (
                    <Select
                      value={ticket.status}
                      onValueChange={(v) =>
                        handleTicketStatusChange(ticket.id, v as SupportTicketStatus)
                      }
                    >
                      <SelectTrigger size="sm" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportTicketStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {supportTicketStatusLabels[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={supportTicketStatusVariant[ticket.status]}>
                      {supportTicketStatusLabels[ticket.status]}
                    </Badge>
                  )}
                </div>
                <div
                  className="prose prose-sm max-w-none text-foreground dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: ticket.description }}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  )
}
