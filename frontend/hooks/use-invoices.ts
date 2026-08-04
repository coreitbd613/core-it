"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createInvoice,
  deleteInvoice,
  getAdminInvoice,
  getAdminInvoices,
  getMyInvoice,
  getMyInvoices,
  getPublicInvoice,
  recordPayment,
  sendInvoice,
  updateInvoice,
  voidInvoice,
  type CreateInvoiceInput,
  type Invoice,
  type InvoiceStatus,
  type RecordPaymentInput,
  type UpdateInvoiceInput,
} from "@/lib/invoices"

const myInvoicesKey = ["invoices", "mine"] as const
const myInvoiceKey = (id: string) => ["invoices", "mine", id] as const
const publicInvoiceKey = (id: string) => ["invoices", "public", id] as const
const adminInvoicesKey = (filters?: { organizationId?: string; status?: InvoiceStatus }) =>
  ["invoices", "admin", filters ?? {}] as const
const adminInvoiceKey = (id: string) => ["invoices", "admin", id] as const

export function useMyInvoices() {
  return useQuery({
    queryKey: myInvoicesKey,
    queryFn: getMyInvoices,
  })
}

export function useMyInvoice(id: string) {
  return useQuery({
    queryKey: myInvoiceKey(id),
    queryFn: () => getMyInvoice(id),
    enabled: Boolean(id),
  })
}

export function usePublicInvoice(id: string) {
  return useQuery({
    queryKey: publicInvoiceKey(id),
    queryFn: () => getPublicInvoice(id),
    enabled: Boolean(id),
  })
}

export function useAdminInvoices(filters?: { organizationId?: string; status?: InvoiceStatus }) {
  return useQuery({
    queryKey: adminInvoicesKey(filters),
    queryFn: () => getAdminInvoices(filters),
  })
}

export function useAdminInvoice(id: string) {
  return useQuery({
    queryKey: adminInvoiceKey(id),
    queryFn: () => getAdminInvoice(id),
    enabled: Boolean(id),
  })
}

function useInvalidateInvoiceLists() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["invoices", "admin"] })
    void queryClient.invalidateQueries({ queryKey: myInvoicesKey })
  }
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateInvoiceLists()

  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => createInvoice(input),
    onSuccess: (invoice: Invoice) => {
      queryClient.setQueryData(adminInvoiceKey(invoice.id), invoice)
      invalidateLists()
    },
  })
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateInvoiceLists()

  return useMutation({
    mutationFn: (input: UpdateInvoiceInput) => updateInvoice(id, input),
    onSuccess: (invoice: Invoice) => {
      queryClient.setQueryData(adminInvoiceKey(id), invoice)
      invalidateLists()
    },
  })
}

export function useSendInvoice(id: string) {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateInvoiceLists()

  return useMutation({
    mutationFn: () => sendInvoice(id),
    onSuccess: (invoice: Invoice) => {
      queryClient.setQueryData(adminInvoiceKey(id), invoice)
      invalidateLists()
    },
  })
}

export function useVoidInvoice(id: string) {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateInvoiceLists()

  return useMutation({
    mutationFn: (voidReason: string) => voidInvoice(id, voidReason),
    onSuccess: (invoice: Invoice) => {
      queryClient.setQueryData(adminInvoiceKey(id), invoice)
      invalidateLists()
    },
  })
}

export function useRecordPayment(id: string) {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateInvoiceLists()

  return useMutation({
    mutationFn: (input: RecordPaymentInput) => recordPayment(id, input),
    onSuccess: (invoice: Invoice) => {
      queryClient.setQueryData(adminInvoiceKey(id), invoice)
      invalidateLists()
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  const invalidateLists = useInvalidateInvoiceLists()

  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: adminInvoiceKey(id) })
      invalidateLists()
    },
  })
}
