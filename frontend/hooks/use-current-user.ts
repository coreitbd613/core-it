"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  changePassword,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  type AuthScope,
  type ChangePasswordInput,
  type CurrentUser,
  type UpdateProfileInput,
} from "@/lib/auth"

export function currentUserKey(scope: AuthScope) {
  return ["current-user", scope] as const
}

export function useCurrentUser(scope: AuthScope = "client") {
  return useQuery({
    queryKey: currentUserKey(scope),
    queryFn: () => getCurrentUser(scope),
  })
}

export function useUpdateProfile(scope: AuthScope = "client") {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input, scope),
    onSuccess: (user: CurrentUser) => {
      queryClient.setQueryData(currentUserKey(scope), user)
    },
  })
}

export function useChangePassword(scope: AuthScope = "client") {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input, scope),
  })
}

export function useUploadAvatar(scope: AuthScope = "client") {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file, scope),
    onSuccess: (user: CurrentUser) => {
      queryClient.setQueryData(currentUserKey(scope), user)
    },
  })
}
