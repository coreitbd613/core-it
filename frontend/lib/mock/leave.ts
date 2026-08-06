export type LeaveType = "SICK" | "CASUAL" | "EARNED" | "UNPAID" | "MATERNITY" | "PATERNITY"
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"

export type LeaveRequest = {
  id: string
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  approverName: string | null
  decidedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export const LEAVE_TYPE_ANNUAL_QUOTA: Record<LeaveType, number> = {
  SICK: 14,
  CASUAL: 10,
  EARNED: 15,
  UNPAID: 0,
  MATERNITY: 112,
  PATERNITY: 14,
}

export const leaveTypeLabels: Record<LeaveType, string> = {
  SICK: "Sick leave",
  CASUAL: "Casual leave",
  EARNED: "Earned leave",
  UNPAID: "Unpaid leave",
  MATERNITY: "Maternity leave",
  PATERNITY: "Paternity leave",
}

export const leaveStatusLabels: Record<LeaveStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
}

export const leaveStatusVariant: Record<
  LeaveStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  CANCELLED: "outline",
}

/** Simple inclusive calendar-day diff — no weekend exclusion, consistent with this repo's style. */
export function leaveDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000)
  return Math.max(diff + 1, 1)
}

export function approveLeave(request: LeaveRequest, approverName: string): void {
  request.status = "APPROVED"
  request.approverName = approverName
  request.decidedAt = new Date().toISOString()
  request.rejectionReason = null
  request.updatedAt = new Date().toISOString()
}

export function rejectLeave(request: LeaveRequest, approverName: string, reason: string): void {
  request.status = "REJECTED"
  request.approverName = approverName
  request.decidedAt = new Date().toISOString()
  request.rejectionReason = reason
  request.updatedAt = new Date().toISOString()
}

export function leaveUsedThisYear(
  employeeId: string,
  type: LeaveType,
  requests: LeaveRequest[]
): number {
  const year = new Date().getFullYear()
  return requests
    .filter(
      (request) =>
        request.employeeId === employeeId &&
        request.type === type &&
        request.status === "APPROVED" &&
        new Date(request.startDate).getFullYear() === year
    )
    .reduce((sum, request) => sum + request.days, 0)
}

export function pendingLeaveCount(requests: LeaveRequest[]): number {
  return requests.filter((request) => request.status === "PENDING").length
}

export function isOnLeaveToday(employeeId: string, requests: LeaveRequest[]): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return requests.some(
    (request) =>
      request.employeeId === employeeId &&
      request.status === "APPROVED" &&
      request.startDate <= today &&
      request.endDate >= today
  )
}

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "leave-1",
    employeeId: "emp-10",
    type: "SICK",
    startDate: "2026-08-04",
    endDate: "2026-08-08",
    days: 5,
    reason: "Dengue fever, resting on doctor's advice.",
    status: "APPROVED",
    approverName: "Shirin Sultana",
    decidedAt: "2026-08-03T11:00:00",
    rejectionReason: null,
    createdAt: "2026-08-03T09:00:00",
    updatedAt: "2026-08-03T11:00:00",
  },
  {
    id: "leave-2",
    employeeId: "emp-6",
    type: "CASUAL",
    startDate: "2026-08-10",
    endDate: "2026-08-11",
    days: 2,
    reason: "Family function out of town.",
    status: "PENDING",
    approverName: null,
    decidedAt: null,
    rejectionReason: null,
    createdAt: "2026-08-05T15:20:00",
    updatedAt: "2026-08-05T15:20:00",
  },
  {
    id: "leave-3",
    employeeId: "emp-7",
    type: "EARNED",
    startDate: "2026-08-20",
    endDate: "2026-08-24",
    days: 5,
    reason: "Annual trip with family.",
    status: "PENDING",
    approverName: null,
    decidedAt: null,
    rejectionReason: null,
    createdAt: "2026-08-06T08:40:00",
    updatedAt: "2026-08-06T08:40:00",
  },
  {
    id: "leave-4",
    employeeId: "emp-8",
    type: "SICK",
    startDate: "2026-07-14",
    endDate: "2026-07-14",
    days: 1,
    reason: "Fever.",
    status: "APPROVED",
    approverName: "Shirin Sultana",
    decidedAt: "2026-07-13T10:00:00",
    rejectionReason: null,
    createdAt: "2026-07-13T08:00:00",
    updatedAt: "2026-07-13T10:00:00",
  },
  {
    id: "leave-5",
    employeeId: "emp-3",
    type: "CASUAL",
    startDate: "2026-07-08",
    endDate: "2026-07-08",
    days: 1,
    reason: "Personal errand.",
    status: "REJECTED",
    approverName: "Nazrul Islam",
    decidedAt: "2026-07-07T09:30:00",
    rejectionReason: "Client demo scheduled same day — please reschedule.",
    createdAt: "2026-07-06T14:00:00",
    updatedAt: "2026-07-07T09:30:00",
  },
  {
    id: "leave-6",
    employeeId: "emp-13",
    type: "EARNED",
    startDate: "2026-06-15",
    endDate: "2026-06-19",
    days: 5,
    reason: "Pre-planned vacation.",
    status: "APPROVED",
    approverName: "Farhana Kabir",
    decidedAt: "2026-06-10T11:00:00",
    rejectionReason: null,
    createdAt: "2026-06-09T10:00:00",
    updatedAt: "2026-06-10T11:00:00",
  },
  {
    id: "leave-7",
    employeeId: "emp-9",
    type: "CASUAL",
    startDate: "2026-05-25",
    endDate: "2026-05-26",
    days: 2,
    reason: "Sister's wedding.",
    status: "APPROVED",
    approverName: "Nazrul Islam",
    decidedAt: "2026-05-20T09:00:00",
    rejectionReason: null,
    createdAt: "2026-05-18T09:00:00",
    updatedAt: "2026-05-20T09:00:00",
  },
  {
    id: "leave-8",
    employeeId: "emp-11",
    type: "SICK",
    startDate: "2026-05-02",
    endDate: "2026-05-03",
    days: 2,
    reason: "Migraine.",
    status: "APPROVED",
    approverName: "Shirin Sultana",
    decidedAt: "2026-05-01T10:00:00",
    rejectionReason: null,
    createdAt: "2026-05-01T08:30:00",
    updatedAt: "2026-05-01T10:00:00",
  },
  {
    id: "leave-9",
    employeeId: "emp-12",
    type: "UNPAID",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    days: 3,
    reason: "Extended personal travel beyond earned leave balance.",
    status: "APPROVED",
    approverName: "Nazrul Islam",
    decidedAt: "2026-04-05T09:00:00",
    rejectionReason: null,
    createdAt: "2026-04-03T09:00:00",
    updatedAt: "2026-04-05T09:00:00",
  },
  {
    id: "leave-10",
    employeeId: "emp-14",
    type: "CASUAL",
    startDate: "2026-08-14",
    endDate: "2026-08-14",
    days: 1,
    reason: "Bank work.",
    status: "PENDING",
    approverName: null,
    decidedAt: null,
    rejectionReason: null,
    createdAt: "2026-08-06T09:10:00",
    updatedAt: "2026-08-06T09:10:00",
  },
]
