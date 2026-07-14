"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createHostingOrder,
  getAllHostingOrders,
  getHostingOrder,
  getHostingPlans,
  getMyHostingOrders,
  updateHostingOrderStatus,
  type AdminHostingOrder,
  type CreateHostingOrderInput,
  type HostingOrderStatus,
} from "@/lib/hosting"

export function useHostingPlans() {
  return useQuery({
    queryKey: ["hosting-plans"],
    queryFn: getHostingPlans,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateHostingOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateHostingOrderInput) => createHostingOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-hosting-orders"] })
    },
  })
}

export function useMyHostingOrders() {
  return useQuery({
    queryKey: ["my-hosting-orders"],
    queryFn: getMyHostingOrders,
  })
}

export function useHostingOrders() {
  return useQuery({
    queryKey: ["admin-hosting-orders"],
    queryFn: getAllHostingOrders,
  })
}

export function useHostingOrder(id: string) {
  return useQuery({
    queryKey: ["admin-hosting-orders", id],
    queryFn: () => getHostingOrder(id),
    enabled: Boolean(id),
  })
}

export function useUpdateHostingOrderStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { status: HostingOrderStatus; adminNote?: string }) =>
      updateHostingOrderStatus(id, input),
    onSuccess: (order: AdminHostingOrder) => {
      queryClient.setQueryData(["admin-hosting-orders", id], order)
      queryClient.invalidateQueries({ queryKey: ["admin-hosting-orders"] })
    },
  })
}
