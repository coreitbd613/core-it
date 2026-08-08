"use client"

import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { LEAD_STAGE_ORDER, leadStageLabels, type Lead } from "@/lib/leads"

import { useLeadStageChange } from "./use-lead-stage-change"

export function LeadStageStepper({ lead }: { lead: Lead }) {
  const {
    attemptStageChange,
    lostDialogOpen,
    lostReason,
    setLostReason,
    confirmLost,
    cancelLost,
  } = useLeadStageChange()
  const currentIndex = LEAD_STAGE_ORDER.indexOf(lead.stage)

  if (lead.stage === "LOST") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
        <Badge variant="destructive">Lost</Badge>
        <p className="text-sm text-muted-foreground">{lead.lostReason || "No reason given."}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {LEAD_STAGE_ORDER.map((stage, index) => {
        const isActive = stage === lead.stage
        const isComplete = index < currentIndex
        return (
          <React.Fragment key={stage}>
            {index > 0 && (
              <div className={cn("h-px w-6 shrink-0", isComplete ? "bg-primary" : "bg-border")} />
            )}
            <button
              type="button"
              onClick={() => attemptStageChange(lead, stage)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : isComplete
                    ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {isComplete && <CheckIcon className="size-3.5" />}
              {leadStageLabels[stage]}
            </button>
          </React.Fragment>
        )
      })}

      <Dialog open={lostDialogOpen} onOpenChange={(open) => !open && cancelLost()}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-2 text-muted-foreground hover:text-destructive"
          onClick={() => attemptStageChange(lead, "LOST")}
        >
          <XIcon />
          Mark as lost
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark {lead.contactName} as lost?</DialogTitle>
            <DialogDescription>
              Optionally note why this lead didn&apos;t convert.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            placeholder="e.g. Went with a competitor, budget fell through..."
            rows={3}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={cancelLost}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmLost}>
              Mark as lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
