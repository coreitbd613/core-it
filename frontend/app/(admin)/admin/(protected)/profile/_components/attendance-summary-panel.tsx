"use client"

import {
  CalendarOffIcon,
  CheckCircle2Icon,
  CircleHelpIcon,
  ClockIcon,
  TriangleAlertIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { attendanceMonthlySummary, type AttendanceRecord } from "@/lib/mock/attendance"

function Tile({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: LucideIcon
  iconClassName: string
  label: string
  value: number | string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md", iconClassName)}>
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[11px] text-muted-foreground uppercase">{label}</p>
        <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function AttendanceSummaryPanel({
  employeeId,
  records,
  month,
}: {
  employeeId: string
  records: AttendanceRecord[]
  month: Date
}) {
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`
  const summary = attendanceMonthlySummary(employeeId, records, monthKey)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Tile
            icon={CheckCircle2Icon}
            iconClassName="bg-primary/10 text-primary"
            label="Present"
            value={summary.present}
          />
          <Tile
            icon={TriangleAlertIcon}
            iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            label="Late"
            value={summary.late}
          />
          <Tile
            icon={XCircleIcon}
            iconClassName="bg-destructive/10 text-destructive"
            label="Absent"
            value={summary.absent}
          />
          <Tile
            icon={CalendarOffIcon}
            iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            label="Leave"
            value={summary.onLeave}
          />
          <Tile
            icon={CircleHelpIcon}
            iconClassName="bg-muted text-muted-foreground"
            label="No record"
            value={summary.noRecord}
          />
          <Tile
            icon={ClockIcon}
            iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            label="Avg hours"
            value={summary.avgHours}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Attendance rate</span>
            <span className="tabular-nums text-foreground">{summary.rate}%</span>
          </div>
          <Progress value={summary.rate} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {summary.present + summary.late} of {summary.workingDays} working days
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
