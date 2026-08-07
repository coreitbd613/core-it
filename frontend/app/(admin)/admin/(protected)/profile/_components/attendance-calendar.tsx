"use client"

import * as React from "react"
import type { DayButton } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { attendanceStatusLabels, isWeekend, type AttendanceRecord, type AttendanceStatus } from "@/lib/mock/attendance"

// Each status gets a genuinely distinct hue (not shades of one color) so the
// calendar reads at a glance instead of blurring together.
const STATUS_DAY_CLASSNAMES: Record<AttendanceStatus, string> = {
  PRESENT: "bg-primary/10 text-primary",
  LATE: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  HALF_DAY: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  ON_LEAVE: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  ABSENT: "bg-destructive/15 text-destructive",
}

const LEGEND_ITEMS: { status: AttendanceStatus; dotClassName: string }[] = [
  { status: "PRESENT", dotClassName: "bg-primary" },
  { status: "LATE", dotClassName: "bg-amber-500" },
  { status: "HALF_DAY", dotClassName: "bg-blue-500" },
  { status: "ON_LEAVE", dotClassName: "bg-violet-500" },
  { status: "ABSENT", dotClassName: "bg-destructive" },
]

const STATUS_MODIFIER_KEYS = ["present", "late", "halfDay", "onLeave", "absent"] as const
const MODIFIER_TO_STATUS: Record<(typeof STATUS_MODIFIER_KEYS)[number], AttendanceStatus> = {
  present: "PRESENT",
  late: "LATE",
  halfDay: "HALF_DAY",
  onLeave: "ON_LEAVE",
  absent: "ABSENT",
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function StatusDayButton({
  day,
  modifiers,
  className,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const statusKey = STATUS_MODIFIER_KEYS.find((key) => modifiers[key])
  const status = statusKey ? MODIFIER_TO_STATUS[statusKey] : undefined
  const notMarked = Boolean(modifiers.notMarked)

  return (
    <button
      type="button"
      data-selected-single={modifiers.selected}
      className={cn(
        "flex aspect-square size-full min-w-(--cell-size) flex-col items-center justify-center gap-0.5 rounded-(--cell-radius) text-sm leading-none font-normal hover:bg-accent data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        status && STATUS_DAY_CLASSNAMES[status],
        notMarked && "bg-muted text-muted-foreground",
        modifiers.disabled && "text-muted-foreground opacity-40",
        className
      )}
      {...props}
    >
      <span>{day.date.getDate()}</span>
      {status && <span className="text-[9px] leading-none font-medium">{attendanceStatusLabels[status]}</span>}
      {notMarked && <span className="text-[9px] leading-none font-medium">Not marked</span>}
    </button>
  )
}

export function AttendanceCalendar({
  employeeId,
  records,
  month,
  onMonthChange,
  selected,
  onSelect,
}: {
  employeeId: string
  records: AttendanceRecord[]
  month: Date
  onMonthChange: (month: Date) => void
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}) {
  const byDate = React.useMemo(
    () => new Map(records.filter((r) => r.employeeId === employeeId).map((r) => [r.date, r] as const)),
    [records, employeeId]
  )
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const statusDays: Record<AttendanceStatus, Date[]> = {
    PRESENT: [],
    LATE: [],
    HALF_DAY: [],
    ON_LEAVE: [],
    ABSENT: [],
  }
  const notMarkedDays: Date[] = []

  const cursor = new Date(month.getFullYear(), month.getMonth(), 1)
  while (cursor.getMonth() === month.getMonth()) {
    const date = new Date(cursor)
    if (!isWeekend(date) && date <= today) {
      const record = byDate.get(toDateKey(date))
      if (record) statusDays[record.status].push(date)
      else notMarkedDays.push(date)
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={onMonthChange}
          selected={selected}
          onSelect={onSelect}
          disabled={{ after: today }}
          modifiers={{
            present: statusDays.PRESENT,
            late: statusDays.LATE,
            halfDay: statusDays.HALF_DAY,
            onLeave: statusDays.ON_LEAVE,
            absent: statusDays.ABSENT,
            notMarked: notMarkedDays,
          }}
          components={{ DayButton: StatusDayButton }}
          className="w-full"
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3">
          {LEGEND_ITEMS.map(({ status, dotClassName }) => (
            <span key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("size-2 rounded-full", dotClassName)} />
              {attendanceStatusLabels[status]}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
