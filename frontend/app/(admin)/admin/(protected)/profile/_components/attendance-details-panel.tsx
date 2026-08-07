"use client"

import { CoffeeIcon, LogInIcon, LogOutIcon, TimerIcon, type LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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

function Stat({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: LucideIcon
  iconClassName: string
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/30 p-3 text-center">
      <span className={cn("flex size-8 items-center justify-center rounded-full", iconClassName)}>
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[11px] text-muted-foreground uppercase">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
      </div>
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
        <div className="grid grid-cols-2 gap-2">
          <Stat
            icon={LogInIcon}
            iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            label="Check in"
            value={record?.checkIn ?? "—"}
          />
          <Stat
            icon={LogOutIcon}
            iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            label="Check out"
            value={record?.checkOut ?? "—"}
          />
          <Stat
            icon={TimerIcon}
            iconClassName="bg-primary/10 text-primary"
            label="Duration"
            value={duration > 0 ? formatDuration(duration) : "—"}
          />
          <Stat
            icon={CoffeeIcon}
            iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            label="Break"
            value={record && record.breakMinutes > 0 ? formatDuration(record.breakMinutes) : "—"}
          />
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
      </CardContent>
    </Card>
  )
}
