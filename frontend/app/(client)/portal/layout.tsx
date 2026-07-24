"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2Icon,
  FileSignatureIcon,
  FileTextIcon,
  FolderKanbanIcon,
  GlobeIcon,
  LayoutDashboard,
  ReceiptTextIcon,
  ScrollTextIcon,
  ShieldIcon,
  User,
  UsersIcon,
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
import { mockContracts } from "@/lib/mock/contracts"
import { latestProposalVersions, mockProposals } from "@/lib/mock/proposals"
import { mockProjects } from "@/lib/mock/projects"
import { mockInvoices } from "@/lib/mock/invoices"

import { MockRoleSwitcher } from "./_components/mock-role-switcher"

const CURRENT_ORG_ID = "org-1"

function buildSearchItems(): SearchItem[] {
  const navEntries: SearchItem[] = [
    { id: "nav-dashboard", group: "Go to", label: "Dashboard", href: "/portal/dashboard", icon: <LayoutDashboard className="size-4" /> },
    { id: "nav-proposals", group: "Go to", label: "Proposals", href: "/portal/proposals", icon: <FileTextIcon className="size-4" /> },
    { id: "nav-projects", group: "Go to", label: "Projects", href: "/portal/projects", icon: <FolderKanbanIcon className="size-4" /> },
    { id: "nav-domains", group: "Go to", label: "Domains", href: "/portal/domains/orders", icon: <GlobeIcon className="size-4" /> },
    { id: "nav-contracts", group: "Go to", label: "Contracts", href: "/portal/contracts", icon: <FileSignatureIcon className="size-4" /> },
    { id: "nav-invoices", group: "Go to", label: "Invoices", href: "/portal/invoices", icon: <ReceiptTextIcon className="size-4" /> },
    { id: "nav-statements", group: "Go to", label: "Statements", href: "/portal/statements", icon: <ScrollTextIcon className="size-4" /> },
    { id: "nav-company", group: "Go to", label: "Company settings", href: "/portal/settings/company", icon: <Building2Icon className="size-4" /> },
    { id: "nav-team", group: "Go to", label: "Team", href: "/portal/settings/team", icon: <UsersIcon className="size-4" /> },
    { id: "nav-profile", group: "Go to", label: "Profile", href: "/portal/profile", icon: <User className="size-4" /> },
  ]

  const proposalEntries: SearchItem[] = latestProposalVersions(
    mockProposals.filter((p) => p.organizationId === CURRENT_ORG_ID)
  )
    .map((p) => ({
      id: `proposal-${p.id}`,
      group: "Proposals",
      label: p.title,
      href: `/portal/proposals/${p.id}`,
    }))

  const projectEntries: SearchItem[] = mockProjects
    .filter((p) => p.organizationId === CURRENT_ORG_ID)
    .map((p) => ({
      id: `project-${p.id}`,
      group: "Projects",
      label: p.name,
      href: `/portal/projects/${p.id}`,
    }))

  const invoiceEntries: SearchItem[] = mockInvoices
    .filter((inv) => inv.organizationId === CURRENT_ORG_ID)
    .map((inv) => ({
      id: `invoice-${inv.id}`,
      group: "Invoices",
      label: inv.number,
      href: `/portal/invoices/${inv.id}`,
    }))

  const contractEntries: SearchItem[] = mockContracts
    .filter((c) => c.organizationId === CURRENT_ORG_ID)
    .map((c) => ({
      id: `contract-${c.id}`,
      group: "Contracts",
      label: c.title,
      href: `/portal/contracts/${c.id}`,
    }))

  return [
    ...navEntries,
    ...proposalEntries,
    ...projectEntries,
    ...invoiceEntries,
    ...contractEntries,
  ]
}

function buildNavItems(canManageTeam: boolean, canViewBilling: boolean): PanelNavItem[] {
  return [
    { name: "Dashboard", href: "/portal/dashboard", icon: <LayoutDashboard /> },
    { name: "Proposals", href: "/portal/proposals", icon: <FileTextIcon /> },
    { name: "Projects", href: "/portal/projects", icon: <FolderKanbanIcon /> },
    { name: "Domains", href: "/portal/domains/orders", icon: <GlobeIcon /> },
    ...(canViewBilling
      ? [
          { name: "Contracts", href: "/portal/contracts", icon: <FileSignatureIcon /> },
          { name: "Invoices", href: "/portal/invoices", icon: <ReceiptTextIcon /> },
          { name: "Statements", href: "/portal/statements", icon: <ScrollTextIcon /> },
        ]
      : []),
    { name: "Company", href: "/portal/settings/company", icon: <Building2Icon /> },
    ...(canManageTeam ? [{ name: "Team", href: "/portal/settings/team", icon: <UsersIcon /> }] : []),
    { name: "Profile", href: "/portal/profile", icon: <User /> },
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
      panelHomeHref="/portal/dashboard"
      navItems={buildNavItems(canManageTeam, canViewBilling)}
      user={{
        name: user?.name ?? "User",
        email: user?.email ?? "",
        avatar: user?.avatarUrl,
      }}
      profileHref="/portal/profile"
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
