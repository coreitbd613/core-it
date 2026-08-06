"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/format"
import {
  attendanceRate,
  attendanceStatusLabels,
  attendanceStatusVariant,
  mockAttendance,
  type AttendanceRecord,
} from "@/lib/mock/attendance"
import type { Employee } from "@/lib/mock/employees"

const columns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span className="text-sm text-foreground">{formatDate(row.original.date)}</span>,
  },
  {
    accessorKey: "checkIn",
    header: "Check-in",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.checkIn ?? "—"}</span>
    ),
  },
  {
    accessorKey: "checkOut",
    header: "Check-out",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.checkOut ?? "—"}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={attendanceStatusVariant[row.original.status]}>
        {attendanceStatusLabels[row.original.status]}
      </Badge>
    ),
  },
]

export function EmployeeAttendanceTab({ employee }: { employee: Employee }) {
  const records = useMemo(
    () =>
      mockAttendance
        .filter((record) => record.employeeId === employee.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [employee.id]
  )

  const fromDate = records.at(-1)?.date ?? employee.joinDate
  const toDate = records[0]?.date ?? employee.joinDate
  const rate = attendanceRate(employee.id, mockAttendance, fromDate, toDate)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={rate} className="h-2 flex-1" />
            <span className="text-sm font-medium tabular-nums text-foreground">{rate}%</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Over the last {records.length} recorded work days.</p>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={records} getRowId={(row) => row.id} emptyMessage="No attendance records yet." />
    </div>
  )
}
