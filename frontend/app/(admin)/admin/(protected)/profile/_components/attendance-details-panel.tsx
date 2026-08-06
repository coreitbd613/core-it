"use client"

import { CoffeeIcon, LogInIcon, LogOutIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatDuration } from "@/lib/format"
import {
  attendanceStatusLabels,
  attendanceStatusVariant,
  checkInNow,
  checkOutNow,
  endBreak,
  findAttendanceRecord,
  startBreak,
  workedMinutes,
  type AttendanceRecord,
} from "@/lib/mock/attendance"
import type { Employee } from "@/lib/mock/employees"

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center">
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

export function AttendanceDetailsPanel({
  employee,
  records,
  selectedDate,
  onChange,
}: {
  employee: Employee
  records: AttendanceRecord[]
  selectedDate: Date
  onChange: () => void
}) {
  const dateKey = toDateKey(selectedDate)
  const isToday = dateKey === todayKey()
  const record = findAttendanceRecord(employee.id, dateKey, records)
  const onBreak = Boolean(record?.breakStartedAt)

  function handleCheckIn() {
    checkInNow(records, employee.id, dateKey)
    toast.success("Checked in.")
    onChange()
  }

  function handleCheckOut() {
    checkOutNow(records, employee.id, dateKey)
    toast.success("Checked out.")
    onChange()
  }

  function handleBreakToggle() {
    if (onBreak) {
      endBreak(records, employee.id, dateKey)
      toast.success("Break ended.")
    } else {
      startBreak(records, employee.id, dateKey)
      toast.success("Break started.")
    }
    onChange()
  }

  const duration = record ? workedMinutes(record) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Check in" value={record?.checkIn ?? "—"} />
          <Stat label="Check out" value={record?.checkOut ?? "—"} />
          <Stat label="Duration" value={duration > 0 ? formatDuration(duration) : "—"} />
        </div>

        {isToday && (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleCheckIn} disabled={Boolean(record?.checkIn)}>
              <LogInIcon />
              Check in
            </Button>
            <Button variant="outline" onClick={handleCheckOut} disabled={!record?.checkIn || Boolean(record?.checkOut)}>
              <LogOutIcon />
              Check out
            </Button>
            <Button
              variant="outline"
              className="col-span-2"
              onClick={handleBreakToggle}
              disabled={!record?.checkIn || Boolean(record?.checkOut)}
            >
              <CoffeeIcon />
              {onBreak ? "End break" : "Take break"}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{formatDate(selectedDate)}</p>
          {record && (
            <Badge variant={attendanceStatusVariant[record.status]}>
              {attendanceStatusLabels[record.status]}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Row label="Check-in" value={record?.checkIn ?? "—"} />
          <Row label="Check-out" value={record?.checkOut ?? "—"} />
          <Row label="Working hours" value={duration > 0 ? formatDuration(duration) : "—"} />
          <Row label="Break duration" value={record && record.breakMinutes > 0 ? formatDuration(record.breakMinutes) : "—"} />
        </div>
      </CardContent>
    </Card>
  )
}
