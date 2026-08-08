"use client"

import { useState } from "react"
import {
  CalendarCheckIcon,
  CalendarXIcon,
  ClockIcon,
  UsersRoundIcon,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DatePickerField } from "@/components/shared/date-picker-field"
import {
  attendanceStatusLabels,
  attendanceStatusVariant,
  findAttendanceRecord,
  markAttendance,
  mockAttendance,
  todaysAttendanceCounts,
  type AttendanceStatus,
} from "@/lib/mock/attendance"
import { activeEmployees, mockEmployees, type Employee } from "@/lib/mock/employees"

import { MarkAttendanceDialog } from "../_components/mark-attendance-dialog"

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function AdminAttendancePage() {
  const [date, setDate] = useState(today())
  const [, forceRerender] = useState(0)

  const employees = activeEmployees(mockEmployees)

  const counts = todaysAttendanceCounts(mockAttendance, date)
  const stats: DashboardStatItem[] = [
    { label: "Present", value: counts.PRESENT, icon: CalendarCheckIcon, tone: "chart3" },
    { label: "Absent", value: counts.ABSENT, icon: CalendarXIcon, tone: "destructive" },
    { label: "Late", value: counts.LATE, icon: ClockIcon, tone: "chart4" },
    { label: "On Leave", value: counts.ON_LEAVE, icon: UsersRoundIcon, tone: "chart2" },
  ]

  function handleSave(employee: Employee, status: AttendanceStatus, checkIn: string, checkOut: string) {
    markAttendance(mockAttendance, employee.id, date, status, {
      checkIn: checkIn || null,
      checkOut: checkOut || null,
    })
    forceRerender((n) => n + 1)
  }

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.department}</span>
          </div>
        </div>
      ),
    },
    {
      id: "checkIn",
      header: "Check-in",
      cell: ({ row }) => {
        const record = findAttendanceRecord(row.original.id, date, mockAttendance)
        return <span className="text-sm text-muted-foreground">{record?.checkIn ?? "—"}</span>
      },
    },
    {
      id: "checkOut",
      header: "Check-out",
      cell: ({ row }) => {
        const record = findAttendanceRecord(row.original.id, date, mockAttendance)
        return <span className="text-sm text-muted-foreground">{record?.checkOut ?? "—"}</span>
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const record = findAttendanceRecord(row.original.id, date, mockAttendance)
        if (!record) return <span className="text-sm text-muted-foreground">Not marked</span>
        return (
          <Badge variant={attendanceStatusVariant[record.status]}>
            {attendanceStatusLabels[record.status]}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const record = findAttendanceRecord(row.original.id, date, mockAttendance)
        return (
          <MarkAttendanceDialog
            employee={row.original}
            date={date}
            existingRecord={record}
            onSave={(status, checkIn, checkOut) => handleSave(row.original, status, checkIn, checkOut)}
          />
        )
      },
      size: 40,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Daily attendance sheet across the company.</p>
        </div>
        <div className="w-48">
          <DatePickerField value={date} onChange={setDate} />
        </div>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTable columns={columns} data={employees} getRowId={(row) => row.id} emptyMessage="No employees yet." />
    </div>
  )
}
