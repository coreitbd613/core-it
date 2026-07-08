"use client"

import * as React from "react"
import { createContext, useCallback, useContext, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { logout as logoutRequest, type CurrentUser } from "@/lib/auth"
import { currentUserKey, useCurrentUser } from "@/hooks/use-current-user"

type AdminAuthContextValue = {
  user: CurrentUser | null | undefined
  isPending: boolean
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { data: user, isPending } = useCurrentUser("admin")

  const logout = useCallback(async () => {
    await logoutRequest("admin")
    queryClient.setQueryData(currentUserKey("admin"), null)
  }, [queryClient])

  const value = useMemo(() => ({ user, isPending, logout }), [user, isPending, logout])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
