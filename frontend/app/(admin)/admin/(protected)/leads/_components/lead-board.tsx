"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatBDT } from "@/lib/format"
import {
  LEAD_STAGE_ORDER,
  isLeadOverdue,
  leadStageLabels,
  type Lead,
  type LeadStage,
} from "@/lib/leads"

import { LeadQuickActions } from "./lead-quick-actions"
import { useLeadStageChange } from "./use-lead-stage-change"

const BOARD_STAGES: LeadStage[] = [...LEAD_STAGE_ORDER, "LOST"]

export function LeadBoard({ leads }: { leads: Lead[] }) {
  const {
    attemptStageChange,
    lostDialogOpen,
    lostReason,
    setLostReason,
    confirmLost,
    cancelLost,
  } = useLeadStageChange()
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = React.useState<LeadStage | null>(null)

  function handleDrop(stage: LeadStage) {
    setDragOverStage(null)
    const lead = leads.find((l) => l.id === draggingId)
    setDraggingId(null)
    if (!lead) return
    attemptStageChange(lead, stage)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {BOARD_STAGES.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage)
          const stageValue = stageLeads.reduce(
            (sum, lead) => sum + (lead.estimatedValueBdt ? Number(lead.estimatedValueBdt) : 0),
            0
          )

          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverStage(stage)
              }}
              onDragLeave={() => setDragOverStage((current) => (current === stage ? null : current))}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(stage)
              }}
              className={cn(
                "flex flex-col gap-3 rounded-lg border bg-muted/20 p-3",
                dragOverStage === stage && "ring-2 ring-primary/40"
              )}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-foreground">
                  {leadStageLabels[stage]}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {stageLeads.length}
                  </span>
                </span>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {formatBDT(stageValue)}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {stageLeads.length === 0 ? (
                  <p className="px-1 text-xs text-muted-foreground">No leads</p>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggingId(lead.id)}
                      onDragEnd={() => setDraggingId(null)}
                      className={cn(
                        "flex flex-col gap-2 rounded-lg border bg-background p-3 shadow-sm transition-opacity",
                        draggingId === lead.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="size-7 shrink-0">
                          <AvatarFallback className="text-[10px]">
                            {lead.contactName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="truncate text-sm font-medium text-foreground hover:underline"
                          >
                            {lead.contactName}
                          </Link>
                          <span className="truncate text-xs text-muted-foreground">
                            {lead.companyName ?? lead.email ?? "—"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium tabular-nums text-foreground">
                          {lead.estimatedValueBdt != null
                            ? formatBDT(Number(lead.estimatedValueBdt))
                            : "—"}
                        </span>
                        {isLeadOverdue(lead) && (
                          <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                            <AlertTriangleIcon className="size-3" />
                            Overdue
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-end">
                        <LeadQuickActions lead={lead} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={lostDialogOpen} onOpenChange={(open) => !open && cancelLost()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark this lead as lost?</DialogTitle>
            <DialogDescription>Optionally note why this lead didn&apos;t convert.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            placeholder="e.g. Went with a competitor, budget fell through..."
            rows={3}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={cancelLost}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmLost}>
              Mark as lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
