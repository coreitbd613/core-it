"use client"

import * as React from "react"
import { toast } from "sonner"

import { useUpdateLeadStage } from "@/hooks/use-leads"
import { leadStageLabels, type Lead, type LeadStage } from "@/lib/leads"

export function useLeadStageChange() {
  const updateStage = useUpdateLeadStage()
  const [lostDialogOpen, setLostDialogOpen] = React.useState(false)
  const [lostReason, setLostReason] = React.useState("")
  const pendingLeadRef = React.useRef<Lead | null>(null)

  function attemptStageChange(lead: Lead, stage: LeadStage) {
    if (stage === lead.stage) return

    if (stage === "LOST") {
      pendingLeadRef.current = lead
      setLostReason("")
      setLostDialogOpen(true)
      return
    }

    updateStage.mutate(
      { id: lead.id, input: { stage } },
      {
        onSuccess: () => toast.success(`Marked as ${leadStageLabels[stage]}.`),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't update this lead."),
      }
    )
  }

  function confirmLost() {
    const lead = pendingLeadRef.current
    if (!lead) return

    updateStage.mutate(
      { id: lead.id, input: { stage: "LOST", lostReason: lostReason.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success("Lead marked as lost.")
          setLostDialogOpen(false)
          pendingLeadRef.current = null
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't update this lead."),
      }
    )
  }

  function cancelLost() {
    setLostDialogOpen(false)
    pendingLeadRef.current = null
  }

  return {
    attemptStageChange,
    lostDialogOpen,
    lostReason,
    setLostReason,
    confirmLost,
    cancelLost,
  }
}
