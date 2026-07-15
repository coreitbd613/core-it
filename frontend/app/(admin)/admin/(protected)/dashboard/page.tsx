"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Activity, ShieldCheck, UserPlus, Users } from "lucide-react"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"

type RecentUser = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "USER"
  joinedAt: string
}

// Placeholder until a real stats/users endpoint exists on the backend.
const mockStats: DashboardStatItem[] = [
  { label: "Total Users", value: 1284, icon: Users, tone: "primary" },
  { label: "Admins", value: 6, icon: ShieldCheck, tone: "neutral" },
  { label: "New Signups Today", value: 18, icon: UserPlus, tone: "chart2" },
  { label: "Active Sessions", value: 92, icon: Activity, tone: "chart4" },
]

const mockRecentUsers: RecentUser[] = [
  { id: "1", name: "Amelia Turner", email: "amelia@example.com", role: "USER", joinedAt: "2026-07-04" },
  { id: "2", name: "Rafiq Islam", email: "rafiq@example.com", role: "ADMIN", joinedAt: "2026-07-03" },
  { id: "3", name: "Priya Nair", email: "priya@example.com", role: "USER", joinedAt: "2026-07-02" },
  { id: "4", name: "Diego Alvarez", email: "diego@example.com", role: "USER", joinedAt: "2026-07-01" },
  { id: "5", name: "Sana Malik", email: "sana@example.com", role: "USER", joinedAt: "2026-06-30" },
]

const columns: ColumnDef<RecentUser>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
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
    accessorKey: "joinedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your CRM/ERP activity.</p>
      </div>

      <DashboardStatsGrid items={mockStats} />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Recent users</h2>
        <DataTable
          columns={columns}
          data={mockRecentUsers}
          getRowId={(row) => row.id}
          enableRowSelection={false}
        />
      </div>
    </div>
  )
}
