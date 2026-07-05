"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Bell, CheckCircle2, Clock, ListTodo } from "lucide-react"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/DataTable"
import { Badge } from "@/components/ui/badge"

type ActivityRow = {
  id: string
  activity: string
  status: "Done" | "In progress" | "Pending"
  updatedAt: string
}

// Placeholder until a real activity endpoint exists on the backend.
const mockStats: DashboardStatItem[] = [
  { label: "Open Tasks", value: 5, icon: ListTodo, tone: "primary" },
  { label: "Completed", value: 12, icon: CheckCircle2, tone: "chart2" },
  { label: "Pending Approval", value: 2, icon: Clock, tone: "chart4" },
  { label: "Notifications", value: 3, icon: Bell, tone: "neutral" },
]

const mockActivity: ActivityRow[] = [
  { id: "1", activity: "Submitted onboarding form", status: "Done", updatedAt: "2026-07-04" },
  { id: "2", activity: "Review pending invoice", status: "Pending", updatedAt: "2026-07-04" },
  { id: "3", activity: "Update profile details", status: "In progress", updatedAt: "2026-07-03" },
  { id: "4", activity: "Read welcome guide", status: "Done", updatedAt: "2026-07-01" },
]

const statusVariant: Record<ActivityRow["status"], "default" | "secondary" | "outline"> = {
  Done: "secondary",
  "In progress": "default",
  Pending: "outline",
}

const columns: ColumnDef<ActivityRow>[] = [
  { accessorKey: "activity", header: "Activity", enableSorting: true },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  { accessorKey: "updatedAt", header: "Updated", enableSorting: true },
]

export default function UserDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your activity at a glance.</p>
      </div>

      <DashboardStatsGrid items={mockStats} />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <DataTable
          columns={columns}
          data={mockActivity}
          getRowId={(row) => row.id}
          enableRowSelection={false}
        />
      </div>
    </div>
  )
}
