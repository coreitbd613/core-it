"use client"

import * as React from "react"
import { ArrowRightIcon, CalendarClockIcon, MessageSquareIcon, SendIcon, TrophyIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAddLeadActivity } from "@/hooks/use-leads"
import { type Lead, type LeadActivityType } from "@/lib/leads"

const activityIcons: Record<LeadActivityType, React.ElementType> = {
  NOTE: MessageSquareIcon,
  STAGE_CHANGE: ArrowRightIcon,
  FOLLOW_UP_SCHEDULED: CalendarClockIcon,
  CONVERTED: TrophyIcon,
}

export function LeadActivityTimeline({ lead }: { lead: Lead }) {
  const addActivity = useAddLeadActivity(lead.id)
  const [message, setMessage] = React.useState("")

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    addActivity.mutate(
      { message: message.trim() },
      {
        onSuccess: () => setMessage(""),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't add this note."),
      }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {lead.activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {lead.activities.map((activity) => {
            const Icon = activityIcons[activity.type]
            const isNote = activity.type === "NOTE"
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex gap-3 rounded-lg border px-4 py-3",
                  isNote ? "bg-primary/5" : "bg-muted/30"
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {activity.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{activity.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={handleAddNote} className="flex flex-col gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Log a call, add a note..."
          rows={3}
        />
        <Button type="submit" size="sm" className="self-end" disabled={!message.trim()}>
          <SendIcon />
          Add note
        </Button>
      </form>
    </div>
  )
}
