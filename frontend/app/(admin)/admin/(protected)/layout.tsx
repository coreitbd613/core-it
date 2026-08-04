"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FileSignatureIcon,
  FileTextIcon,
  FolderKanbanIcon,
  Globe,
  LayoutDashboard,
  ReceiptTextIcon,
  Settings,
  TargetIcon,
  Users,
} from "lucide-react"

import { AdminAuthProvider, useAdminAuth } from "@/contexts/admin-auth-context"
import { useAdminInvoices } from "@/hooks/use-invoices"
import type { Invoice } from "@/lib/invoices"
import PanelDashboardShell, {
  type PanelNavItem,
} from "@/components/shared/dashboard/PanelDashboardShell"
import { GlobalSearch, type SearchItem } from "@/components/shared/dashboard/global-search"
import { NotificationsBell } from "@/components/shared/dashboard/notifications-bell"
import { getAdminNotifications } from "@/lib/mock/notifications"
import { mockContracts } from "@/lib/mock/contracts"
import { mockLeads } from "@/lib/mock/leads"
import { latestProposalVersions, mockProposals } from "@/lib/mock/proposals"
import { mockProjects } from "@/lib/mock/projects"

const adminNavItems: PanelNavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard /> },
  { name: "Leads", href: "/admin/leads", icon: <TargetIcon /> },
  { name: "Proposals", href: "/admin/proposals", icon: <FileTextIcon /> },
  { name: "Projects", href: "/admin/projects", icon: <FolderKanbanIcon /> },
  { name: "Contracts", href: "/admin/contracts", icon: <FileSignatureIcon /> },
  { name: "Invoices", href: "/admin/invoices", icon: <ReceiptTextIcon /> },
  { name: "Domain Orders", href: "/admin/domain-orders", icon: <Globe /> },
  { name: "Customers", href: "/admin/customers", icon: <Users /> },
  { name: "Settings", href: "/admin/settings", icon: <Settings /> },
]

function buildAdminSearchItems(invoices: Invoice[]): SearchItem[] {
  const navEntries: SearchItem[] = [
    { id: "nav-dashboard", group: "Go to", label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="size-4" /> },
    { id: "nav-leads", group: "Go to", label: "Leads", href: "/admin/leads", icon: <TargetIcon className="size-4" /> },
    { id: "nav-proposals", group: "Go to", label: "Proposals", href: "/admin/proposals", icon: <FileTextIcon className="size-4" /> },
    { id: "nav-projects", group: "Go to", label: "Projects", href: "/admin/projects", icon: <FolderKanbanIcon className="size-4" /> },
    { id: "nav-contracts", group: "Go to", label: "Contracts", href: "/admin/contracts", icon: <FileSignatureIcon className="size-4" /> },
    { id: "nav-invoices", group: "Go to", label: "Invoices", href: "/admin/invoices", icon: <ReceiptTextIcon className="size-4" /> },
    { id: "nav-domain-orders", group: "Go to", label: "Domain Orders", href: "/admin/domain-orders", icon: <Globe className="size-4" /> },
    { id: "nav-customers", group: "Go to", label: "Customers", href: "/admin/customers", icon: <Users className="size-4" /> },
    { id: "nav-settings", group: "Go to", label: "Settings", href: "/admin/settings", icon: <Settings className="size-4" /> },
  ]

  const leadEntries: SearchItem[] = mockLeads.map((lead) => ({
    id: `lead-${lead.id}`,
    group: "Leads",
    label: lead.contactName,
    description: lead.companyName ?? undefined,
    href: `/admin/leads/${lead.id}`,
  }))

  const proposalEntries: SearchItem[] = latestProposalVersions(mockProposals).map((p) => ({
    id: `proposal-${p.id}`,
    group: "Proposals",
    label: p.title,
    description: p.organizationName,
    href: `/admin/proposals/${p.id}`,
  }))

  const projectEntries: SearchItem[] = mockProjects.map((p) => ({
    id: `project-${p.id}`,
    group: "Projects",
    label: p.name,
    description: p.organizationName,
    href: `/admin/projects/${p.id}`,
  }))

  const invoiceEntries: SearchItem[] = invoices.map((inv) => ({
    id: `invoice-${inv.id}`,
    group: "Invoices",
    label: inv.number,
    description: inv.organization?.name ?? inv.customerName ?? undefined,
    href: `/admin/invoices/${inv.id}`,
  }))

  const contractEntries: SearchItem[] = mockContracts.map((c) => ({
    id: `contract-${c.id}`,
    group: "Contracts",
    label: c.title,
    description: c.organizationName,
    href: `/admin/contracts/${c.id}`,
  }))

  return [
    ...navEntries,
    ...leadEntries,
    ...proposalEntries,
    ...projectEntries,
    ...invoiceEntries,
    ...contractEntries,
  ]
}

function AdminProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isPending, logout } = useAdminAuth()
  const { data: invoices = [] } = useAdminInvoices()

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
      search={<GlobalSearch items={buildAdminSearchItems(invoices)} />}
      notifications={<NotificationsBell items={getAdminNotifications(invoices)} />}
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
