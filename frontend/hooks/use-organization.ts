"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createOrganization,
  getAdminOrganization,
  getAdminOrganizations,
  getMyOrganization,
  updateAdminOrganization,
  updateMyOrganization,
  uploadOrganizationLogo,
  type Organization,
  type UpdateOrganizationInput,
} from "@/lib/organizations"

const myOrganizationKey = ["organization", "mine"] as const
const adminOrganizationsKey = ["organization", "admin", "list"] as const
const adminOrganizationKey = (id: string) => ["organization", "admin", id] as const

export function useMyOrganization() {
  return useQuery({
    queryKey: myOrganizationKey,
    queryFn: getMyOrganization,
    retry: false,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createOrganization(name),
    onSuccess: (organization: Organization) => {
      queryClient.setQueryData(myOrganizationKey, organization)
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) => updateMyOrganization(input),
    onSuccess: (organization: Organization) => {
      queryClient.setQueryData(myOrganizationKey, organization)
    },
  })
}

export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadOrganizationLogo(file),
    onSuccess: (organization: Organization) => {
      queryClient.setQueryData(myOrganizationKey, organization)
    },
  })
}

export function useAdminOrganizations() {
  return useQuery({
    queryKey: adminOrganizationsKey,
    queryFn: getAdminOrganizations,
  })
}

export function useAdminOrganization(id: string) {
  return useQuery({
    queryKey: adminOrganizationKey(id),
    queryFn: () => getAdminOrganization(id),
    enabled: Boolean(id),
  })
}

export function useUpdateAdminOrganization(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) => updateAdminOrganization(id, input),
    onSuccess: (organization: Organization) => {
      queryClient.setQueryData(adminOrganizationKey(id), organization)
      void queryClient.invalidateQueries({ queryKey: adminOrganizationsKey })
    },
  })
}
