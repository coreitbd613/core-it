import { mockEmployees } from "./employees"

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "ON_LEAVE"

export type AttendanceRecord = {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  notes: string | null
  /** Total minutes spent on break so far — accumulated each time a break ends. */
  breakMinutes: number
  /** Set while a break is in progress; null when not on break. */
  breakStartedAt: string | null
  createdAt: string
  updatedAt: string
}

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  HALF_DAY: "Half day",
  ON_LEAVE: "On leave",
}

export const attendanceStatusVariant: Record<
  AttendanceStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PRESENT: "default",
  ABSENT: "destructive",
  LATE: "secondary",
  HALF_DAY: "secondary",
  ON_LEAVE: "outline",
}

export function findAttendanceRecord(
  employeeId: string,
  date: string,
  records: AttendanceRecord[]
): AttendanceRecord | undefined {
  return records.find((record) => record.employeeId === employeeId && record.date === date)
}

/** Percentage of PRESENT/LATE (full credit) and HALF_DAY (half credit) days in range, inclusive. */
export function attendanceRate(
  employeeId: string,
  records: AttendanceRecord[],
  fromDate: string,
  toDate: string
): number {
  const inRange = records.filter(
    (record) => record.employeeId === employeeId && record.date >= fromDate && record.date <= toDate
  )
  if (inRange.length === 0) return 0
  const credit = inRange.reduce((sum, record) => {
    if (record.status === "PRESENT" || record.status === "LATE") return sum + 1
    if (record.status === "HALF_DAY") return sum + 0.5
    return sum
  }, 0)
  return Math.round((credit / inRange.length) * 100)
}

export function todaysAttendanceCounts(
  records: AttendanceRecord[],
  date: string
): Record<AttendanceStatus, number> {
  const counts: Record<AttendanceStatus, number> = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    HALF_DAY: 0,
    ON_LEAVE: 0,
  }
  for (const record of records) {
    if (record.date === date) counts[record.status] += 1
  }
  return counts
}

function findOrCreateRecord(
  records: AttendanceRecord[],
  employeeId: string,
  date: string
): AttendanceRecord {
  const existing = findAttendanceRecord(employeeId, date, records)
  if (existing) return existing
  const now = new Date().toISOString()
  const created: AttendanceRecord = {
    id: crypto.randomUUID(),
    employeeId,
    date,
    checkIn: null,
    checkOut: null,
    status: "ABSENT",
    notes: null,
    breakMinutes: 0,
    breakStartedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  records.unshift(created)
  return created
}

/** Finds-or-creates today's/that day's record for an employee, then applies the patch in place. */
export function markAttendance(
  records: AttendanceRecord[],
  employeeId: string,
  date: string,
  status: AttendanceStatus,
  patch?: { checkIn?: string | null; checkOut?: string | null; notes?: string | null }
): AttendanceRecord[] {
  const record = findOrCreateRecord(records, employeeId, date)
  record.status = status
  if (patch?.checkIn !== undefined) record.checkIn = patch.checkIn
  if (patch?.checkOut !== undefined) record.checkOut = patch.checkOut
  if (patch?.notes !== undefined) record.notes = patch.notes
  record.updatedAt = new Date().toISOString()
  return records
}

function nowTime(): string {
  return new Date().toTimeString().slice(0, 5)
}

/** After this check-in time, the day is marked LATE instead of PRESENT. */
const LATE_CUTOFF = "10:00"

/** Self-service check-in for "right now" — creates today's record if it doesn't exist yet. */
export function checkInNow(records: AttendanceRecord[], employeeId: string, date: string): AttendanceRecord {
  const record = findOrCreateRecord(records, employeeId, date)
  const time = nowTime()
  record.checkIn = time
  record.status = time > LATE_CUTOFF ? "LATE" : "PRESENT"
  record.updatedAt = new Date().toISOString()
  return record
}

export function checkOutNow(records: AttendanceRecord[], employeeId: string, date: string): AttendanceRecord {
  const record = findOrCreateRecord(records, employeeId, date)
  record.checkOut = nowTime()
  record.updatedAt = new Date().toISOString()
  return record
}

export function startBreak(records: AttendanceRecord[], employeeId: string, date: string): AttendanceRecord {
  const record = findOrCreateRecord(records, employeeId, date)
  record.breakStartedAt = new Date().toISOString()
  record.updatedAt = new Date().toISOString()
  return record
}

export function endBreak(records: AttendanceRecord[], employeeId: string, date: string): AttendanceRecord {
  const record = findOrCreateRecord(records, employeeId, date)
  if (record.breakStartedAt) {
    const elapsedMs = Date.now() - new Date(record.breakStartedAt).getTime()
    record.breakMinutes += Math.max(Math.round(elapsedMs / 60_000), 0)
    record.breakStartedAt = null
  }
  record.updatedAt = new Date().toISOString()
  return record
}

/** Minutes worked so far today: check-in to check-out (or now, if still checked in), minus breaks. */
export function workedMinutes(record: Pick<AttendanceRecord, "checkIn" | "checkOut" | "breakMinutes">): number {
  if (!record.checkIn) return 0
  const today = new Date().toISOString().slice(0, 10)
  const start = new Date(`${today}T${record.checkIn}:00`)
  const end = record.checkOut ? new Date(`${today}T${record.checkOut}:00`) : new Date()
  const minutes = Math.round((end.getTime() - start.getTime()) / 60_000) - record.breakMinutes
  return Math.max(minutes, 0)
}

/** Bangladesh weekend is Friday(5)/Saturday(6), not Sunday. */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 5 || day === 6
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export type AttendanceMonthlySummary = {
  present: number
  late: number
  absent: number
  onLeave: number
  noRecord: number
  avgHours: number
  rate: number
  workingDays: number
}

/** Working days (Sun–Thu) in `month` ("YYYY-MM") that have already happened, up to and including today. */
function workingDaysSoFar(month: string): string[] {
  const [year, monthIndex] = month.split("-").map(Number)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex - 1
  const lastDay = isCurrentMonth ? today.getDate() : new Date(year, monthIndex, 0).getDate()

  const days: string[] = []
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, monthIndex - 1, day)
    if (!isWeekend(date)) days.push(toDateKey(date))
  }
  return days
}

/** Summarizes one employee's attendance for a month — mirrors the Present/Late/Absent/Leave/No-record tiles on a self-service profile. */
export function attendanceMonthlySummary(
  employeeId: string,
  records: AttendanceRecord[],
  month: string
): AttendanceMonthlySummary {
  const workingDays = workingDaysSoFar(month)
  const byDate = new Map(
    records.filter((r) => r.employeeId === employeeId).map((r) => [r.date, r] as const)
  )

  let present = 0
  let late = 0
  let absent = 0
  let onLeave = 0
  let noRecord = 0
  let totalMinutes = 0
  let daysWithHours = 0

  for (const date of workingDays) {
    const record = byDate.get(date)
    if (!record) {
      noRecord += 1
      continue
    }
    if (record.status === "PRESENT" || record.status === "HALF_DAY") present += 1
    else if (record.status === "LATE") late += 1
    else if (record.status === "ABSENT") absent += 1
    else if (record.status === "ON_LEAVE") onLeave += 1

    if (record.checkIn) {
      totalMinutes += workedMinutes(record)
      daysWithHours += 1
    }
  }

  const credited = present + late
  return {
    present,
    late,
    absent,
    onLeave,
    noRecord,
    avgHours: daysWithHours > 0 ? Math.round((totalMinutes / daysWithHours / 60) * 10) / 10 : 0,
    rate: workingDays.length > 0 ? Math.round((credited / workingDays.length) * 100) : 0,
    workingDays: workingDays.length,
  }
}

/**
 * Deterministic seed generator — index-based variation, never Math.random(), since this
 * module is imported by "use client" pages that Next.js pre-renders on the server before
 * hydrating; a random seed would cause a hydration mismatch.
 */
function buildSeedAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  const workDays: Date[] = []
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (workDays.length < 15) {
    if (!isWeekend(cursor)) workDays.unshift(new Date(cursor))
    cursor.setDate(cursor.getDate() - 1)
  }

  mockEmployees.forEach((employee, employeeIndex) => {
    if (employee.status === "TERMINATED") return
    workDays.forEach((day, dayIndex) => {
      const dateKey = toDateKey(day)
      const roll = (employeeIndex * 3 + dayIndex) % 10
      let status: AttendanceStatus = "PRESENT"
      if (employee.status === "ON_LEAVE" && dayIndex >= workDays.length - 3) {
        status = "ON_LEAVE"
      } else if (roll === 9) {
        status = "ABSENT"
      } else if (roll === 8) {
        status = "LATE"
      } else if (roll === 7) {
        status = "HALF_DAY"
      }
      const checkIn = status === "ABSENT" || status === "ON_LEAVE" ? null : status === "LATE" ? "10:15" : "09:05"
      const checkOut =
        status === "ABSENT" || status === "ON_LEAVE"
          ? null
          : status === "HALF_DAY"
            ? "13:30"
            : "18:10"
      records.push({
        id: `att-${employee.id}-${dateKey}`,
        employeeId: employee.id,
        date: dateKey,
        checkIn,
        checkOut,
        status,
        notes: null,
        breakMinutes: status === "ABSENT" || status === "ON_LEAVE" ? 0 : 30,
        breakStartedAt: null,
        createdAt: `${dateKey}T09:00:00`,
        updatedAt: `${dateKey}T18:00:00`,
      })
    })
  })

  return records
}

export const mockAttendance: AttendanceRecord[] = buildSeedAttendance()
