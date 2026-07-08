"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createDomainOrder,
  getAllDomainOrders,
  getDomainOrder,
  getMyDomainOrders,
  searchDomains,
  updateDomainOrderStatus,
  type AdminDomainOrder,
  type CreateDomainOrderInput,
  type DomainOrderStatus,
} from "@/lib/domains"

export function useDomainSearch(query: string) {
  return useQuery({
    queryKey: ["domain-search", query],
    queryFn: () => searchDomains(query),
    enabled: query.trim().length > 0,
  })
}

export function useCreateDomainOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDomainOrderInput) => createDomainOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-domain-orders"] })
    },
  })
}

export function useMyDomainOrders() {
  return useQuery({
    queryKey: ["my-domain-orders"],
    queryFn: getMyDomainOrders,
  })
}

export function useDomainOrders() {
  return useQuery({
    queryKey: ["admin-domain-orders"],
    queryFn: getAllDomainOrders,
  })
}

export function useDomainOrder(id: string) {
  return useQuery({
    queryKey: ["admin-domain-orders", id],
    queryFn: () => getDomainOrder(id),
    enabled: Boolean(id),
  })
}

export function useUpdateDomainOrderStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { status: DomainOrderStatus; adminNote?: string }) =>
      updateDomainOrderStatus(id, input),
    onSuccess: (order: AdminDomainOrder) => {
      queryClient.setQueryData(["admin-domain-orders", id], order)
      queryClient.invalidateQueries({ queryKey: ["admin-domain-orders"] })
    },
  })
}
