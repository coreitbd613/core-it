"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"

import { getCurrentUser, logout, type CurrentUser } from "@/lib/auth"
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
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await logout()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <PanelDashboardShell
      panelLabel="Admin"
      panelHomeHref="/admin/dashboard"
      navItems={adminNavItems}
      user={{
        name: user?.name ?? "Admin",
        email: user?.email ?? "",
        avatar: user?.avatarUrl,
      }}
      profileHref="/admin/profile"
      onLogout={handleLogout}
      loading={loading}
    >
      {children}
    </PanelDashboardShell>
  )
}
