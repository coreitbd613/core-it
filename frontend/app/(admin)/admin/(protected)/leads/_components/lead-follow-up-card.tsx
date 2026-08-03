"use client"

import * as React from "react"
import { AlertTriangleIcon, CalendarClockIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { isLeadOverdue, logLeadActivity, type Lead } from "@/lib/mock/leads"

export function LeadFollowUpCard({
  lead,
  authorName,
  onChange,
}: {
  lead: Lead
  authorName: string
  onChange: () => void
}) {
  const [date, setDate] = React.useState(lead.nextFollowUpAt ?? "")
  const overdue = isLeadOverdue(lead)

  function handleSave() {
    lead.nextFollowUpAt = date || null
    logLeadActivity(
      lead,
      "FOLLOW_UP_SCHEDULED",
      date ? `Follow-up set for ${new Date(date).toLocaleDateString()}` : "Follow-up cleared",
      authorName
    )
    toast.success(date ? "Follow-up scheduled." : "Follow-up cleared.")
    onChange()
  }

  function handleClear() {
    setDate("")
    lead.nextFollowUpAt = null
    logLeadActivity(lead, "FOLLOW_UP_SCHEDULED", "Follow-up cleared", authorName)
    toast.success("Follow-up cleared.")
    onChange()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClockIcon className="size-4" />
          Follow-up
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {overdue && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertTriangleIcon className="size-4" />
            Overdue
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="follow-up-date">Next follow-up date</FieldLabel>
          <Input
            id="follow-up-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
