"use client"

import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/format"
import type { Employee } from "@/lib/mock/employees"
import {
  LEAVE_TYPE_ANNUAL_QUOTA,
  leaveStatusLabels,
  leaveStatusVariant,
  leaveTypeLabels,
  leaveUsedThisYear,
  mockLeaveRequests,
  type LeaveRequest,
  type LeaveType,
} from "@/lib/mock/leave"

import { LeaveRequestDialog } from "./leave-request-dialog"

const columns: ColumnDef<LeaveRequest>[] = [
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => <span className="text-sm text-foreground">{leaveTypeLabels[row.original.type]}</span>,
  },
  {
    id: "dates",
    header: "Dates",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
      </span>
    ),
  },
  {
    accessorKey: "days",
    header: "Days",
    cell: ({ row }) => <span className="text-sm tabular-nums text-foreground">{row.original.days}</span>,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={leaveStatusVariant[row.original.status]}>{leaveStatusLabels[row.original.status]}</Badge>
    ),
  },
]

const LEAVE_TYPES = Object.keys(leaveTypeLabels) as LeaveType[]

export function EmployeeLeaveTab({ employee }: { employee: Employee }) {
  const [, forceRerender] = useState(0)

  const requests = useMemo(
    () =>
      mockLeaveRequests
        .filter((request) => request.employeeId === employee.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [employee.id]
  )

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Leave balances</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {LEAVE_TYPES.filter((type) => LEAVE_TYPE_ANNUAL_QUOTA[type] > 0).map((type) => {
            const quota = LEAVE_TYPE_ANNUAL_QUOTA[type]
            const used = leaveUsedThisYear(employee.id, type, mockLeaveRequests)
            return (
              <div key={type} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{leaveTypeLabels[type]}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {used} / {quota} days
                  </span>
                </div>
                <Progress value={Math.min((used / quota) * 100, 100)} className="h-1.5" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Requests</h3>
        <LeaveRequestDialog employee={employee} onCreated={() => forceRerender((n) => n + 1)} />
      </div>

      <DataTable columns={columns} data={requests} getRowId={(row) => row.id} emptyMessage="No leave requests yet." />
    </div>
  )
}
