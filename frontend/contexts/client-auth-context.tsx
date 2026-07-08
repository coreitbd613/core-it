"use client"

import * as React from "react"
import { createContext, useCallback, useContext, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { logout as logoutRequest, type CurrentUser } from "@/lib/auth"
import { currentUserKey, useCurrentUser } from "@/hooks/use-current-user"

type ClientAuthContextValue = {
  user: CurrentUser | null | undefined
  isPending: boolean
  logout: () => Promise<void>
}

const ClientAuthContext = createContext<ClientAuthContextValue | null>(null)

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { data: user, isPending } = useCurrentUser("client")

  const logout = useCallback(async () => {
    await logoutRequest("client")
    queryClient.setQueryData(currentUserKey("client"), null)
  }, [queryClient])

  const value = useMemo(() => ({ user, isPending, logout }), [user, isPending, logout])

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext)
  if (!context) {
    throw new Error("useClientAuth must be used within a ClientAuthProvider")
  }
  return context
}
