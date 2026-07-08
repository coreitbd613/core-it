"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"

import { logout } from "@/lib/auth"
import { useCurrentUser } from "@/hooks/use-current-user"
import PanelDashboardShell, {
  type PanelNavItem,
} from "@/components/shared/dashboard/PanelDashboardShell"

const adminNavItems: PanelNavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard /> },
  { name: "Users", href: "/admin/users", icon: <Users /> },
  { name: "Settings", href: "/admin/settings", icon: <Settings /> },
]

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: user, isPending } = useCurrentUser()

  async function handleLogout() {
    await logout()
    queryClient.clear()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <PanelDashboardShell
      portalLabel="Admin Portal"
      panelHomeHref="/admin/dashboard"
      navItems={adminNavItems}
      user={{
        name: user?.name ?? "Admin",
        email: user?.email ?? "",
        avatar: user?.avatarUrl,
      }}
      profileHref="/admin/profile"
      onLogout={handleLogout}
      loading={isPending}
    >
      {children}
    </PanelDashboardShell>
  )
}
