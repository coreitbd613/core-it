"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { attendanceMonthlySummary, type AttendanceRecord } from "@/lib/mock/attendance"

function Tile({ label, value, tone }: { label: string; value: number; tone: "default" | "destructive" | "muted" }) {
  const valueClass =
    tone === "destructive" ? "text-destructive" : tone === "muted" ? "text-muted-foreground" : "text-primary"
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground uppercase">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueClass}`}>{value}</p>
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
          <Tile label="Present" value={summary.present} tone="default" />
          <Tile label="Late" value={summary.late} tone="destructive" />
          <Tile label="Absent" value={summary.absent} tone="destructive" />
          <Tile label="Leave" value={summary.onLeave} tone="muted" />
          <Tile label="No record" value={summary.noRecord} tone="muted" />
          <Tile label="Avg hours" value={summary.avgHours} tone="default" />
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
