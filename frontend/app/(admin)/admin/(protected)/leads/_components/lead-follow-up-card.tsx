"use client"

import * as React from "react"
import { AlertTriangleIcon, CalendarClockIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUpdateFollowUp } from "@/hooks/use-leads"
import { isLeadOverdue, type Lead } from "@/lib/leads"

export function LeadFollowUpCard({ lead }: { lead: Lead }) {
  const updateFollowUp = useUpdateFollowUp(lead.id)
  const [date, setDate] = React.useState(lead.nextFollowUpAt?.slice(0, 10) ?? "")
  const overdue = isLeadOverdue(lead)

  function save(nextDate: string) {
    updateFollowUp.mutate(
      { nextFollowUpAt: nextDate || null },
      {
        onSuccess: () => toast.success(nextDate ? "Follow-up scheduled." : "Follow-up cleared."),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't update the follow-up."),
      }
    )
  }

  function handleClear() {
    setDate("")
    save("")
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
          <Button size="sm" className="flex-1" onClick={() => save(date)}>
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
