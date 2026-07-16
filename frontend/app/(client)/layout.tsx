"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileTextIcon, LayoutDashboard, ReceiptIcon, Settings, ShieldIcon, User } from "lucide-react"

import { useClientAuth } from "@/contexts/client-auth-context"
import { MockRoleProvider, useMockRole } from "@/contexts/mock-role-context"
import { Button } from "@/components/ui/button"
import PanelDashboardShell, {
  type PanelNavItem,
} from "@/components/shared/dashboard/PanelDashboardShell"

import { MockRoleSwitcher } from "./_components/mock-role-switcher"

function buildNavItems(canManageTeam: boolean, canViewBilling: boolean): PanelNavItem[] {
  return [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { name: "Proposals", href: "/proposals", icon: <FileTextIcon /> },
    ...(canViewBilling
      ? [
          {
            name: "Billing",
            href: "/quotations",
            icon: <ReceiptIcon />,
            children: [
              { name: "Quotations", href: "/quotations" },
              { name: "Invoices", href: "/invoices" },
              { name: "Statements", href: "/statements" },
            ],
          },
        ]
      : []),
    {
      name: "Settings",
      href: "/settings/company",
      icon: <Settings />,
      children: [
        { name: "Company", href: "/settings/company" },
        ...(canManageTeam ? [{ name: "Team", href: "/settings/team" }] : []),
      ],
    },
    { name: "Profile", href: "/profile", icon: <User /> },
  ]
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MockRoleProvider>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </MockRoleProvider>
  )
}

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isPending, logout } = useClientAuth()
  const { canManageTeam, canViewBilling } = useMockRole()

  async function handleLogout() {
    await logout()
    router.push("/login")
    router.refresh()
  }

  return (
    <PanelDashboardShell
      panelHomeHref="/dashboard"
      navItems={buildNavItems(canManageTeam, canViewBilling)}
      user={{
        name: user?.name ?? "User",
        email: user?.email ?? "",
        avatar: user?.avatarUrl,
      }}
      profileHref="/profile"
      onLogout={handleLogout}
      loading={isPending}
      sidebarFooterExtra={
        user?.role === "ADMIN" ? (
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
            <Link href="/admin/dashboard">
              <ShieldIcon />
              Admin panel
            </Link>
          </Button>
        ) : undefined
      }
    >
      {children}
      <MockRoleSwitcher />
    </PanelDashboardShell>
  )
}
