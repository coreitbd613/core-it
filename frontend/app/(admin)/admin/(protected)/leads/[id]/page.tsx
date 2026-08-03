"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon, PencilIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { formatBDT } from "@/lib/format"
import {
  LEAD_OWNERS,
  isLeadClosed,
  leadSourceLabels,
  leadStageLabels,
  leadStageVariant,
  logLeadActivity,
  mockLeads,
} from "@/lib/mock/leads"

import { LeadActivityTimeline } from "../_components/lead-activity-timeline"
import { LeadFollowUpCard } from "../_components/lead-follow-up-card"
import { LeadStageStepper } from "../_components/lead-stage-stepper"

export default function AdminLeadDetailPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAdminAuth()
  const authorName = user?.name ?? "Core IT"
  const [, forceRerender] = React.useState(0)

  const lead = mockLeads.find((l) => l.id === params.id)

  if (!lead) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Lead not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/leads">Back to leads</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function refresh() {
    forceRerender((n) => n + 1)
  }

  function handleReassign(owner: string) {
    lead!.ownerName = owner === "unassigned" ? null : owner
    logLeadActivity(
      lead!,
      "NOTE",
      owner === "unassigned" ? "Unassigned" : `Reassigned to ${owner}`,
      authorName
    )
    refresh()
  }

  function handleConvert() {
    lead!.stage = "WON"
    lead!.convertedAt = new Date().toISOString()
    logLeadActivity(lead!, "CONVERTED", "Converted to customer", authorName)
    toast.success("Lead converted — create their account under Customers to finish onboarding.")
    refresh()
  }

  const closed = isLeadClosed(lead)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/leads" aria-label="Back to leads">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{lead.contactName}</h1>
          <p className="text-muted-foreground">{lead.companyName ?? lead.email ?? "No company"}</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" asChild>
            <Link href={`/admin/leads/${lead.id}/edit`}>
              <PencilIcon />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline stage</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadStageStepper lead={lead} authorName={authorName} onChange={refresh} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadActivityTimeline lead={lead} authorName={authorName} onChange={refresh} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Details</CardTitle>
              <Badge variant={leadStageVariant[lead.stage]}>{leadStageLabels[lead.stage]}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="hover:underline">
                        {lead.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="hover:underline">
                        {lead.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="text-sm text-foreground">{leadSourceLabels[lead.source]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Est. value</p>
                  <p className="text-sm text-foreground">
                    {lead.estimatedValueBdt != null ? formatBDT(lead.estimatedValueBdt) : "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Owner</p>
                <Select value={lead.ownerName ?? "unassigned"} onValueChange={handleReassign}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {LEAD_OWNERS.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {lead.convertedAt && (
                <p className="text-sm text-muted-foreground">
                  Converted on {new Date(lead.convertedAt).toLocaleDateString()}.
                </p>
              )}
            </CardContent>
            {!closed && (
              <CardFooter className="border-t">
                <Button className="w-full" onClick={handleConvert}>
                  Convert to customer
                  <ArrowRightIcon />
                </Button>
              </CardFooter>
            )}
          </Card>

          <LeadFollowUpCard lead={lead} authorName={authorName} onChange={refresh} />
        </div>
      </div>
    </div>
  )
}
