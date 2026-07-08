"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  type CurrentUser,
  type UpdateProfileInput,
} from "@/lib/auth"

export const currentUserKey = ["current-user"] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: getCurrentUser,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user: CurrentUser) => {
      queryClient.setQueryData(currentUserKey, user)
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (user: CurrentUser) => {
      queryClient.setQueryData(currentUserKey, user)
    },
  })
}
