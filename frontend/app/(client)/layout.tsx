"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, User } from "lucide-react"

import { useClientAuth } from "@/contexts/client-auth-context"
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
  const { user, isPending, logout } = useClientAuth()

  async function handleLogout() {
    await logout()
    router.push("/login")
    router.refresh()
  }

  return (
    <PanelDashboardShell
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
      loading={isPending}
    >
      {children}
    </PanelDashboardShell>
  )
}
