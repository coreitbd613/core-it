"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { startOfWeek } from "date-fns"
import {
  AlertTriangleIcon,
  Building2Icon,
  CalendarOffIcon,
  FileTextIcon,
  HourglassIcon,
  ShieldCheck,
  TargetIcon,
  UserPlus,
  Users,
  UsersRoundIcon,
  WalletIcon,
} from "lucide-react"

import { useAdminCustomers } from "@/hooks/use-customers"
import { useAdminInvoices } from "@/hooks/use-invoices"
import { useAdminLeads } from "@/hooks/use-leads"
import { useAdminOrganizations } from "@/hooks/use-organization"
import type { AdminCustomer } from "@/lib/customers"
import { formatBDT } from "@/lib/format"
import { activeEmployees, mockEmployees } from "@/lib/mock/employees"
import {
  isLeadClosed,
  isLeadOverdue,
  leadStageLabels,
  leadStageVariant,
  pipelineValueBdt,
  type Lead,
} from "@/lib/leads"
import { isOnLeaveToday, mockLeaveRequests, pendingLeaveCount } from "@/lib/mock/leave"
import { mockPayslips, totalPayrollForMonth } from "@/lib/mock/payroll"
import { mockProposals } from "@/lib/mock/proposals"
import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"

const columns: ColumnDef<AdminCustomer>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => row.original.name ?? "—",
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "ADMIN" ? "default" : "secondary"}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    accessorFn: (row) => row.createdAt,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]

const followUpColumns: ColumnDef<Lead>[] = [
  {
    accessorKey: "contactName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Lead" />,
    cell: ({ row }) => row.original.contactName,
  },
  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) => row.original.companyName ?? "—",
  },
  {
    id: "stage",
    header: "Stage",
    cell: ({ row }) => (
      <Badge variant={leadStageVariant[row.original.stage]}>
        {leadStageLabels[row.original.stage]}
      </Badge>
    ),
  },
  {
    id: "nextFollowUpAt",
    accessorFn: (row) => row.nextFollowUpAt,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Next Follow-up" />,
    cell: ({ row }) =>
      row.original.nextFollowUpAt
        ? new Date(row.original.nextFollowUpAt).toLocaleDateString()
        : "—",
  },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: customers, isPending } = useAdminCustomers()
  const { data: organizations = [] } = useAdminOrganizations()
  const { data: invoices = [] } = useAdminInvoices()
  const { data: leads = [] } = useAdminLeads()
  const rows = customers ?? []

  const userStats = useMemo<DashboardStatItem[]>(() => {
    const admins = rows.filter((c) => c.role === "ADMIN").length
    const today = new Date().toDateString()
    const newToday = rows.filter((c) => new Date(c.createdAt).toDateString() === today).length
    return [
      { label: "Total Users", value: rows.length, icon: Users, tone: "primary" },
      { label: "Admins", value: admins, icon: ShieldCheck, tone: "neutral" },
      { label: "New Signups Today", value: newToday, icon: UserPlus, tone: "chart2" },
    ]
  }, [rows])

  const businessStats = useMemo<DashboardStatItem[]>(() => {
    const openProposals = mockProposals.filter((p) => p.status === "SENT").length
    const activeInvoices = invoices.filter((inv) => inv.computed.status !== "CANCELLED")
    const outstanding = activeInvoices.reduce((sum, inv) => sum + inv.computed.balanceBdt, 0)
    const overdue = activeInvoices.filter((inv) => inv.computed.status === "OVERDUE").length
    return [
      { label: "Active Companies", value: organizations.length, icon: Building2Icon, tone: "primary" },
      { label: "Open Proposals", value: openProposals, icon: FileTextIcon, tone: "chart2" },
      { label: "Outstanding Revenue", value: formatBDT(outstanding), icon: WalletIcon, tone: "chart4" },
      { label: "Overdue Invoices", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
    ]
  }, [organizations, invoices])

  const leadStats = useMemo<DashboardStatItem[]>(() => {
    const weekStart = startOfWeek(new Date())
    const newThisWeek = leads.filter((lead) => new Date(lead.createdAt) >= weekStart).length
    const overdue = leads.filter((lead) => isLeadOverdue(lead)).length
    return [
      { label: "New Leads This Week", value: newThisWeek, icon: TargetIcon, tone: "primary" },
      { label: "Overdue Follow-ups", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
      { label: "Pipeline Value", value: formatBDT(pipelineValueBdt(leads)), icon: WalletIcon, tone: "chart4" },
    ]
  }, [leads])

  const employeeStats = useMemo<DashboardStatItem[]>(() => {
    const headcount = activeEmployees(mockEmployees).length
    const onLeaveToday = mockEmployees.filter((e) => isOnLeaveToday(e.id, mockLeaveRequests)).length
    const pendingLeave = pendingLeaveCount(mockLeaveRequests)
    const currentMonth = new Date().toISOString().slice(0, 7)
    return [
      { label: "Headcount", value: headcount, icon: UsersRoundIcon, tone: "primary" },
      { label: "On Leave Today", value: onLeaveToday, icon: CalendarOffIcon, tone: "chart2" },
      { label: "Pending Leave Requests", value: pendingLeave, icon: HourglassIcon, tone: "chart3" },
      {
        label: "Payroll This Month",
        value: formatBDT(totalPayrollForMonth(mockPayslips, currentMonth)),
        icon: WalletIcon,
        tone: "chart4",
      },
    ]
  }, [])

  const followUpsDue = leads
    .filter((lead) => !isLeadClosed(lead) && lead.nextFollowUpAt)
    .sort(
      (a, b) => new Date(a.nextFollowUpAt!).getTime() - new Date(b.nextFollowUpAt!).getTime()
    )
    .slice(0, 5)

  const recentUsers = [...rows]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your CRM/ERP activity.</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Business</h2>
        <DashboardStatsGrid items={businessStats} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Leads</h2>
        <DashboardStatsGrid items={leadStats} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Employees</h2>
        <DashboardStatsGrid items={employeeStats} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Users</h2>
        <DashboardStatsGrid items={userStats} loading={isPending} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Follow-ups due</h2>
        <DataTable
          columns={followUpColumns}
          data={followUpsDue}
          getRowId={(row) => row.id}
          emptyMessage="No follow-ups due."
          enableRowSelection={false}
          onRowClick={(row) => router.push(`/admin/leads/${row.id}`)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Recent users</h2>
        <DataTable
          columns={columns}
          data={recentUsers}
          getRowId={(row) => row.id}
          isLoading={isPending}
          emptyMessage="No users yet."
          enableRowSelection={false}
        />
      </div>
    </div>
  )
}
