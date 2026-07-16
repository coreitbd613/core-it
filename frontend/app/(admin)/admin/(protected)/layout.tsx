"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FileTextIcon,
  Globe,
  LayoutDashboard,
  ReceiptIcon,
  Settings,
  Users,
} from "lucide-react"

import { AdminAuthProvider, useAdminAuth } from "@/contexts/admin-auth-context"
import PanelDashboardShell, {
  type PanelNavItem,
} from "@/components/shared/dashboard/PanelDashboardShell"

const adminNavItems: PanelNavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard /> },
  { name: "Proposals", href: "/admin/proposals", icon: <FileTextIcon /> },
  {
    name: "Billing",
    href: "/admin/quotations",
    icon: <ReceiptIcon />,
    children: [
      { name: "Quotations", href: "/admin/quotations" },
      { name: "Invoices", href: "/admin/invoices" },
    ],
  },
  { name: "Domain Orders", href: "/admin/domain-orders", icon: <Globe /> },
  { name: "Customers", href: "/admin/customers", icon: <Users /> },
  { name: "Settings", href: "/admin/settings", icon: <Settings /> },
]

function AdminProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isPending, logout } = useAdminAuth()

  async function handleLogout() {
    await logout()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <PanelDashboardShell
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

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminProtectedShell>{children}</AdminProtectedShell>
    </AdminAuthProvider>
  )
}
