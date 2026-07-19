"use client"

import * as React from "react"

import type { MemberRole } from "@/app/(client)/portal/settings/team/_components/team-mock-data"

const STORAGE_KEY = "core-it:mock-membership-role"

type MockRoleContextValue = {
  role: MemberRole
  setRole: (role: MemberRole) => void
  canManageTeam: boolean
  canManageCompany: boolean
  canViewBilling: boolean
}

const MockRoleContext = React.createContext<MockRoleContextValue | null>(null)

export function MockRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<MemberRole>("OWNER")

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as MemberRole | null
    if (stored) setRoleState(stored)
  }, [])

  const setRole = React.useCallback((next: MemberRole) => {
    setRoleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = React.useMemo<MockRoleContextValue>(
    () => ({
      role,
      setRole,
      canManageTeam: role === "OWNER" || role === "ADMIN",
      canManageCompany: role === "OWNER" || role === "ADMIN",
      canViewBilling: role !== "MEMBER",
    }),
    [role, setRole]
  )

  return <MockRoleContext.Provider value={value}>{children}</MockRoleContext.Provider>
}

export function useMockRole() {
  const ctx = React.useContext(MockRoleContext)
  if (!ctx) throw new Error("useMockRole must be used within MockRoleProvider")
  return ctx
}
