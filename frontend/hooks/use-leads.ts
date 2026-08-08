"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  addLeadActivity,
  convertLead,
  createLead,
  deleteLead,
  getAdminLead,
  getAdminLeads,
  updateFollowUp,
  updateLead,
  updateLeadStage,
  type CreateLeadActivityInput,
  type CreateLeadInput,
  type Lead,
  type LeadSource,
  type LeadStage,
  type UpdateFollowUpInput,
  type UpdateLeadInput,
  type UpdateLeadStageInput,
} from "@/lib/leads"

const adminLeadsKey = (filters?: { stage?: LeadStage; source?: LeadSource }) =>
  ["leads", "admin", filters ?? {}] as const
const adminLeadKey = (id: string) => ["leads", "admin", "detail", id] as const

export function useAdminLeads(filters?: { stage?: LeadStage; source?: LeadSource }) {
  return useQuery({
    queryKey: adminLeadsKey(filters),
    queryFn: () => getAdminLeads(filters),
  })
}

export function useAdminLead(id: string) {
  return useQuery({
    queryKey: adminLeadKey(id),
    queryFn: () => getAdminLead(id),
    enabled: Boolean(id),
  })
}

function useInvalidateLeadLists() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["leads", "admin"] })
  }
}

export function useCreateLead() {
  const invalidateLists = useInvalidateLeadLists()

  return useMutation({
    mutationFn: (input: CreateLeadInput) => createLead(input),
    onSuccess: () => invalidateLists(),
  })
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateLeadLists()

  return useMutation({
    mutationFn: (input: UpdateLeadInput) => updateLead(id, input),
    onSuccess: (lead: Lead) => {
      queryClient.setQueryData(adminLeadKey(id), lead)
      invalidateLists()
    },
  })
}

export function useDeleteLead() {
  const invalidateLists = useInvalidateLeadLists()

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => invalidateLists(),
  })
}

// Unbound (id passed per-call, not fixed at hook-creation) — the Kanban
// board and list-page bulk actions need one hook instance that can update
// any lead in the currently loaded set, not just a single fixed lead.
export function useUpdateLeadStage() {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateLeadLists()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLeadStageInput }) =>
      updateLeadStage(id, input),
    onSuccess: (lead: Lead) => {
      queryClient.setQueryData(adminLeadKey(lead.id), lead)
      invalidateLists()
    },
  })
}

// Unbound for the same reason as useUpdateLeadStage above.
export function useConvertLead() {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateLeadLists()

  return useMutation({
    mutationFn: (id: string) => convertLead(id),
    onSuccess: (lead: Lead) => {
      queryClient.setQueryData(adminLeadKey(lead.id), lead)
      invalidateLists()
    },
  })
}

export function useUpdateFollowUp(id: string) {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateLeadLists()

  return useMutation({
    mutationFn: (input: UpdateFollowUpInput) => updateFollowUp(id, input),
    onSuccess: (lead: Lead) => {
      queryClient.setQueryData(adminLeadKey(id), lead)
      invalidateLists()
    },
  })
}

export function useAddLeadActivity(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLeadActivityInput) => addLeadActivity(id, input),
    onSuccess: (lead: Lead) => {
      queryClient.setQueryData(adminLeadKey(id), lead)
    },
  })
}
