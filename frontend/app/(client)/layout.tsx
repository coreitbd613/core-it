"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, User } from "lucide-react"

import { getCurrentUser, logout, type CurrentUser } from "@/lib/auth"
import PanelDashboardShell, {
  type PanelNavItem,
} from "@/components/shared/dashboard/PanelDashboardShell"

const userNavItems: PanelNavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
  { name: "Profile", href: "/profile", icon: <User /> },
]

export default function ClientLayout({
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
    router.push("/login")
    router.refresh()
  }

  return (
    <PanelDashboardShell
      panelLabel="User"
      portalLabel="Client Portal"
      panelHomeHref="/dashboard"
      navItems={userNavItems}
      user={{
        name: user?.name ?? "User",
        email: user?.email ?? "",
        avatar: user?.avatarUrl,
      }}
      profileHref="/profile"
      onLogout={handleLogout}
      loading={loading}
    >
      {children}
    </PanelDashboardShell>
  )
}
