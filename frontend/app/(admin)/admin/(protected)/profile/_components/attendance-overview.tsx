"use client"

import * as React from "react"

import { mockAttendance } from "@/lib/mock/attendance"
import type { Employee } from "@/lib/mock/employees"

import { AttendanceCalendar } from "./attendance-calendar"
import { AttendanceDetailsPanel } from "./attendance-details-panel"
import { AttendanceSummaryPanel } from "./attendance-summary-panel"

function startOfToday(): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export function AttendanceOverview({ employee }: { employee: Employee }) {
  const [month, setMonth] = React.useState(() => startOfToday())
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => startOfToday())
  const [, forceRerender] = React.useState(0)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">Attendance overview</h2>
        <p className="text-sm text-muted-foreground">Calendar, selected-day details, and monthly attendance summary.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
        <AttendanceCalendar
          employeeId={employee.id}
          records={mockAttendance}
          month={month}
          onMonthChange={setMonth}
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
        />
        <AttendanceDetailsPanel
          employee={employee}
          records={mockAttendance}
          selectedDate={selectedDate}
          onChange={() => forceRerender((n) => n + 1)}
        />
        <AttendanceSummaryPanel employeeId={employee.id} records={mockAttendance} month={month} />
      </div>
    </div>
  )
}
