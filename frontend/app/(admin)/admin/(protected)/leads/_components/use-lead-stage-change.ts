"use client"

import * as React from "react"
import { toast } from "sonner"

import { leadStageLabels, logLeadActivity, type Lead, type LeadStage } from "@/lib/mock/leads"

export function useLeadStageChange(authorName: string, onChange: () => void) {
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

    lead.stage = stage
    logLeadActivity(lead, "STAGE_CHANGE", `Stage changed to ${leadStageLabels[stage]}`, authorName)
    toast.success(`Marked as ${leadStageLabels[stage]}.`)
    onChange()
  }

  function confirmLost() {
    const lead = pendingLeadRef.current
    if (!lead) return

    lead.stage = "LOST"
    lead.lostReason = lostReason.trim() || null
    logLeadActivity(
      lead,
      "STAGE_CHANGE",
      `Stage changed to Lost${lostReason.trim() ? ` — ${lostReason.trim()}` : ""}`,
      authorName
    )
    toast.success("Lead marked as lost.")
    setLostDialogOpen(false)
    pendingLeadRef.current = null
    onChange()
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
