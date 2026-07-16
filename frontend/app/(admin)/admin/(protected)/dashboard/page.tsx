"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangleIcon,
  Building2Icon,
  FileTextIcon,
  ShieldCheck,
  UserPlus,
  Users,
  WalletIcon,
} from "lucide-react"

import { useAdminCustomers } from "@/hooks/use-customers"
import type { AdminCustomer } from "@/lib/customers"
import { formatBDT } from "@/lib/format"
import { mockOrganizations } from "@/lib/mock/organizations"
import { mockProposals } from "@/lib/mock/proposals"
import { deriveInvoiceStatus, invoiceBalanceBdt, mockInvoices } from "@/lib/mock/invoices"
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

export default function AdminDashboardPage() {
  const { data: customers, isPending } = useAdminCustomers()
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
    const outstanding = mockInvoices.reduce((sum, inv) => sum + invoiceBalanceBdt(inv), 0)
    const overdue = mockInvoices.filter((inv) => deriveInvoiceStatus(inv) === "OVERDUE").length
    return [
      { label: "Active Companies", value: mockOrganizations.length, icon: Building2Icon, tone: "primary" },
      { label: "Open Proposals", value: openProposals, icon: FileTextIcon, tone: "chart2" },
      { label: "Outstanding Revenue", value: formatBDT(outstanding), icon: WalletIcon, tone: "chart4" },
      { label: "Overdue Invoices", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
    ]
  }, [])

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
        <h2 className="text-lg font-semibold">Users</h2>
        <DashboardStatsGrid items={userStats} loading={isPending} />
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
