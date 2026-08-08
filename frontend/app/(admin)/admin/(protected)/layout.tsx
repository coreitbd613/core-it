"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Building2Icon,
  FileSignatureIcon,
  FileTextIcon,
  FolderKanbanIcon,
  Globe,
  LayoutDashboard,
  ReceiptTextIcon,
  Settings,
  TargetIcon,
  Users,
  UsersRoundIcon,
} from "lucide-react"

import { AdminAuthProvider, useAdminAuth } from "@/contexts/admin-auth-context"
import { useAdminInvoices } from "@/hooks/use-invoices"
import { useAdminOrganizations } from "@/hooks/use-organization"
import { useAdminProjects } from "@/hooks/use-projects"
import { useAdminLeads } from "@/hooks/use-leads"
import type { Invoice } from "@/lib/invoices"
import type { Organization } from "@/lib/organizations"
import type { Project } from "@/lib/projects"
import type { Lead } from "@/lib/leads"
import PanelDashboardShell, {
  type PanelNavItem,
} from "@/components/shared/dashboard/PanelDashboardShell"
import { GlobalSearch, type SearchItem } from "@/components/shared/dashboard/global-search"
import { NotificationsBell } from "@/components/shared/dashboard/notifications-bell"
import { getAdminNotifications } from "@/lib/mock/notifications"
import { mockContracts } from "@/lib/mock/contracts"
import { mockEmployees } from "@/lib/mock/employees"
import { latestProposalVersions, mockProposals } from "@/lib/mock/proposals"

const adminNavItems: PanelNavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard /> },
  { name: "Leads", href: "/admin/leads", icon: <TargetIcon /> },
  { name: "Clients", href: "/admin/clients", icon: <Building2Icon /> },
  {
    name: "Employees",
    href: "/admin/employees",
    icon: <UsersRoundIcon />,
    children: [
      { name: "Directory", href: "/admin/employees", exact: true },
      { name: "Attendance", href: "/admin/employees/attendance" },
      { name: "Leave Requests", href: "/admin/employees/leave" },
      { name: "Payroll", href: "/admin/employees/payroll" },
    ],
  },
  { name: "Proposals", href: "/admin/proposals", icon: <FileTextIcon /> },
  { name: "Projects", href: "/admin/projects", icon: <FolderKanbanIcon /> },
  { name: "Contracts", href: "/admin/contracts", icon: <FileSignatureIcon /> },
  { name: "Invoices", href: "/admin/invoices", icon: <ReceiptTextIcon /> },
  { name: "Domain Orders", href: "/admin/domain-orders", icon: <Globe /> },
  { name: "Customers", href: "/admin/customers", icon: <Users /> },
  { name: "Settings", href: "/admin/settings", icon: <Settings /> },
]

function buildAdminSearchItems(
  invoices: Invoice[],
  organizations: Organization[],
  projects: Project[],
  leads: Lead[]
): SearchItem[] {
  const navEntries: SearchItem[] = [
    { id: "nav-dashboard", group: "Go to", label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="size-4" /> },
    { id: "nav-leads", group: "Go to", label: "Leads", href: "/admin/leads", icon: <TargetIcon className="size-4" /> },
    { id: "nav-clients", group: "Go to", label: "Clients", href: "/admin/clients", icon: <Building2Icon className="size-4" /> },
    { id: "nav-employees", group: "Go to", label: "Employee Directory", href: "/admin/employees", icon: <UsersRoundIcon className="size-4" /> },
    { id: "nav-attendance", group: "Go to", label: "Attendance", href: "/admin/employees/attendance", icon: <UsersRoundIcon className="size-4" /> },
    { id: "nav-leave", group: "Go to", label: "Leave Requests", href: "/admin/employees/leave", icon: <UsersRoundIcon className="size-4" /> },
    { id: "nav-payroll", group: "Go to", label: "Payroll", href: "/admin/employees/payroll", icon: <UsersRoundIcon className="size-4" /> },
    { id: "nav-proposals", group: "Go to", label: "Proposals", href: "/admin/proposals", icon: <FileTextIcon className="size-4" /> },
    { id: "nav-projects", group: "Go to", label: "Projects", href: "/admin/projects", icon: <FolderKanbanIcon className="size-4" /> },
    { id: "nav-contracts", group: "Go to", label: "Contracts", href: "/admin/contracts", icon: <FileSignatureIcon className="size-4" /> },
    { id: "nav-invoices", group: "Go to", label: "Invoices", href: "/admin/invoices", icon: <ReceiptTextIcon className="size-4" /> },
    { id: "nav-domain-orders", group: "Go to", label: "Domain Orders", href: "/admin/domain-orders", icon: <Globe className="size-4" /> },
    { id: "nav-customers", group: "Go to", label: "Customers", href: "/admin/customers", icon: <Users className="size-4" /> },
    { id: "nav-settings", group: "Go to", label: "Settings", href: "/admin/settings", icon: <Settings className="size-4" /> },
  ]

  const clientEntries: SearchItem[] = organizations.map((org) => ({
    id: `client-${org.id}`,
    group: "Clients",
    label: org.name,
    description: org.industry ?? undefined,
    href: `/admin/clients/${org.id}`,
  }))

  const leadEntries: SearchItem[] = leads.map((lead) => ({
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

  const projectEntries: SearchItem[] = projects.map((p) => ({
    id: `project-${p.id}`,
    group: "Projects",
    label: p.name,
    description: p.organization?.name,
    href: `/admin/projects/${p.projectCode}`,
  }))

  const invoiceEntries: SearchItem[] = invoices.map((inv) => ({
    id: `invoice-${inv.id}`,
    group: "Invoices",
    label: inv.number,
    description: inv.organization?.name ?? inv.customerCompanyName ?? inv.customerName ?? undefined,
    href: `/admin/invoices/${inv.id}`,
  }))

  const contractEntries: SearchItem[] = mockContracts.map((c) => ({
    id: `contract-${c.id}`,
    group: "Contracts",
    label: c.title,
    description: c.organizationName,
    href: `/admin/contracts/${c.id}`,
  }))

  const employeeEntries: SearchItem[] = mockEmployees.map((e) => ({
    id: `employee-${e.id}`,
    group: "Employees",
    label: e.name,
    description: `${e.designation} • ${e.department}`,
    href: `/admin/employees/${e.id}`,
  }))

  return [
    ...navEntries,
    ...clientEntries,
    ...leadEntries,
    ...proposalEntries,
    ...projectEntries,
    ...invoiceEntries,
    ...contractEntries,
    ...employeeEntries,
  ]
}

function AdminProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isPending, logout } = useAdminAuth()
  const { data: invoices = [] } = useAdminInvoices()
  const { data: organizations = [] } = useAdminOrganizations()
  const { data: projects = [] } = useAdminProjects()
  const { data: leads = [] } = useAdminLeads()

  async function handleLogout() {
    await logout()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <PanelDashboardShell
      panelHomeHref="/admin/dashboard"
      portalLabel="Admin Portal"
      navItems={adminNavItems}
      user={{
        name: user?.name ?? "Admin",
        email: user?.email ?? "",
        avatar: user?.avatarUrl,
      }}
      profileHref="/admin/profile"
      onLogout={handleLogout}
      loading={isPending}
      search={<GlobalSearch items={buildAdminSearchItems(invoices, organizations, projects, leads)} />}
      notifications={<NotificationsBell items={getAdminNotifications(invoices, projects)} />}
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
