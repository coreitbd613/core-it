import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { deleteAdminCustomer, getAdminCustomers } from "@/lib/customers"

export function useAdminCustomers() {
  return useQuery({
    queryKey: ["admin-customers"],
    queryFn: getAdminCustomers,
  })
}

export function useDeleteAdminCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAdminCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
    },
  })
}

export function useDeleteAdminCustomers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(deleteAdminCustomer)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
    },
  })
}
