"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileTextIcon,
  FolderKanbanIcon,
  GlobeIcon,
  LayoutDashboard,
  ReceiptIcon,
  ReceiptTextIcon,
  Settings,
  ShieldIcon,
  User,
} from "lucide-react"

import { useClientAuth } from "@/contexts/client-auth-context"
import { MockRoleProvider, useMockRole } from "@/contexts/mock-role-context"
import { Button } from "@/components/ui/button"
import PanelDashboardShell, {
  type PanelNavItem,
} from "@/components/shared/dashboard/PanelDashboardShell"
import { GlobalSearch, type SearchItem } from "@/components/shared/dashboard/global-search"
import { NotificationsBell } from "@/components/shared/dashboard/notifications-bell"
import { getClientNotifications } from "@/lib/mock/notifications"
import { mockProposals } from "@/lib/mock/proposals"
import { mockProjects } from "@/lib/mock/projects"
import { mockQuotations } from "@/lib/mock/quotations"
import { mockInvoices } from "@/lib/mock/invoices"

import { MockRoleSwitcher } from "./_components/mock-role-switcher"

const CURRENT_ORG_ID = "org-1"

function buildSearchItems(): SearchItem[] {
  const navEntries: SearchItem[] = [
    { id: "nav-dashboard", group: "Go to", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="size-4" /> },
    { id: "nav-proposals", group: "Go to", label: "Proposals", href: "/proposals", icon: <FileTextIcon className="size-4" /> },
    { id: "nav-projects", group: "Go to", label: "Projects", href: "/projects", icon: <FolderKanbanIcon className="size-4" /> },
    { id: "nav-domains", group: "Go to", label: "Domains", href: "/domains/orders", icon: <GlobeIcon className="size-4" /> },
    { id: "nav-quotations", group: "Go to", label: "Quotations", href: "/quotations", icon: <ReceiptIcon className="size-4" /> },
    { id: "nav-invoices", group: "Go to", label: "Invoices", href: "/invoices", icon: <ReceiptTextIcon className="size-4" /> },
    { id: "nav-statements", group: "Go to", label: "Statements", href: "/statements", icon: <ReceiptIcon className="size-4" /> },
    { id: "nav-company", group: "Go to", label: "Company settings", href: "/settings/company", icon: <Settings className="size-4" /> },
    { id: "nav-team", group: "Go to", label: "Team", href: "/settings/team", icon: <Settings className="size-4" /> },
    { id: "nav-profile", group: "Go to", label: "Profile", href: "/profile", icon: <User className="size-4" /> },
  ]

  const proposalEntries: SearchItem[] = mockProposals
    .filter((p) => p.organizationId === CURRENT_ORG_ID)
    .map((p) => ({
      id: `proposal-${p.id}`,
      group: "Proposals",
      label: p.title,
      href: `/proposals/${p.id}`,
    }))

  const projectEntries: SearchItem[] = mockProjects
    .filter((p) => p.organizationId === CURRENT_ORG_ID)
    .map((p) => ({
      id: `project-${p.id}`,
      group: "Projects",
      label: p.name,
      href: `/projects/${p.id}`,
    }))

  const quotationEntries: SearchItem[] = mockQuotations
    .filter((q) => q.organizationId === CURRENT_ORG_ID)
    .map((q) => ({
      id: `quotation-${q.id}`,
      group: "Quotations",
      label: q.title,
      href: `/quotations/${q.id}`,
    }))

  const invoiceEntries: SearchItem[] = mockInvoices
    .filter((inv) => inv.organizationId === CURRENT_ORG_ID)
    .map((inv) => ({
      id: `invoice-${inv.id}`,
      group: "Invoices",
      label: inv.number,
      href: `/invoices/${inv.id}`,
    }))

  return [...navEntries, ...proposalEntries, ...projectEntries, ...quotationEntries, ...invoiceEntries]
}

function buildNavItems(canManageTeam: boolean, canViewBilling: boolean): PanelNavItem[] {
  return [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
    { name: "Proposals", href: "/proposals", icon: <FileTextIcon /> },
    { name: "Projects", href: "/projects", icon: <FolderKanbanIcon /> },
    { name: "Domains", href: "/domains/orders", icon: <GlobeIcon /> },
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
      search={<GlobalSearch items={buildSearchItems()} />}
      notifications={<NotificationsBell items={getClientNotifications(CURRENT_ORG_ID)} />}
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
