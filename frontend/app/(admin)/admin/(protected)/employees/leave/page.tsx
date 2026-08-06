"use client"

import { useState } from "react"
import { CheckIcon, HourglassIcon, UsersRoundIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useAdminAuth } from "@/contexts/admin-auth-context"
import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import {
  DataTableRowActions,
  type DataTableRowAction,
} from "@/components/shared/data-table/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format"
import { findEmployeeById } from "@/lib/mock/employees"
import {
  approveLeave,
  isOnLeaveToday,
  leaveStatusLabels,
  leaveStatusVariant,
  leaveTypeLabels,
  mockLeaveRequests,
  pendingLeaveCount,
  rejectLeave,
  type LeaveRequest,
  type LeaveStatus,
} from "@/lib/mock/leave"

import { LeaveRequestDialog } from "../_components/leave-request-dialog"

export default function AdminLeaveRequestsPage() {
  const { user } = useAdminAuth()
  const approverName = user?.name ?? "Core IT"
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL")
  const [rejectingRequest, setRejectingRequest] = useState<LeaveRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [, forceRerender] = useState(0)

  const rows = mockLeaveRequests.filter(
    (request) => statusFilter === "ALL" || request.status === statusFilter
  )

  function handleApprove(request: LeaveRequest) {
    approveLeave(request, approverName)
    toast.success("Leave approved.")
    forceRerender((n) => n + 1)
  }

  function confirmReject() {
    if (!rejectingRequest) return
    rejectLeave(rejectingRequest, approverName, rejectionReason.trim())
    setRejectingRequest(null)
    setRejectionReason("")
    toast.success("Leave rejected.")
    forceRerender((n) => n + 1)
  }

  const stats: DashboardStatItem[] = [
    { label: "Pending", value: pendingLeaveCount(mockLeaveRequests), icon: HourglassIcon, tone: "chart3" },
    {
      label: "On Leave Today",
      value: [...new Set(mockLeaveRequests.filter((r) => r.status === "APPROVED").map((r) => r.employeeId))].filter(
        (employeeId) => isOnLeaveToday(employeeId, mockLeaveRequests)
      ).length,
      icon: UsersRoundIcon,
      tone: "primary",
    },
    {
      label: "Approved",
      value: mockLeaveRequests.filter((r) => r.status === "APPROVED").length,
      icon: CheckIcon,
      tone: "chart2",
    },
    {
      label: "Rejected",
      value: mockLeaveRequests.filter((r) => r.status === "REJECTED").length,
      icon: XIcon,
      tone: "destructive",
    },
  ]

  const columns: ColumnDef<LeaveRequest>[] = [
    {
      id: "employee",
      header: "Employee",
      accessorFn: (row) => findEmployeeById(row.employeeId)?.name ?? "",
      cell: ({ row }) => {
        const employee = findEmployeeById(row.original.employeeId)
        return <span className="text-sm font-medium text-foreground">{employee?.name ?? "Unknown"}</span>
      },
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => <span className="text-sm text-foreground">{leaveTypeLabels[row.original.type]}</span>,
    },
    {
      id: "dates",
      header: "Dates",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)} ({row.original.days}d)
        </span>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <span className="max-w-64 truncate text-sm text-muted-foreground">{row.original.reason || "—"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={leaveStatusVariant[row.original.status]}>{leaveStatusLabels[row.original.status]}</Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const request = row.original
        if (request.status !== "PENDING") return null
        const actions: DataTableRowAction[] = [
          {
            label: "Approve",
            icon: <CheckIcon />,
            confirm: {
              title: "Approve this leave request?",
              description: "The employee will be marked on leave for the requested dates.",
              confirmLabel: "Approve",
            },
            onClick: () => handleApprove(request),
          },
          {
            label: "Reject",
            icon: <XIcon />,
            destructive: true,
            onClick: () => {
              setRejectionReason("")
              setRejectingRequest(request)
            },
          },
        ]
        return <DataTableRowActions actions={actions} />
      },
      size: 40,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leave requests</h1>
          <p className="text-muted-foreground">Review and approve leave across the company.</p>
        </div>
        <LeaveRequestDialog onCreated={() => forceRerender((n) => n + 1)} />
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search leave requests..."
        filters={
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeaveStatus | "ALL")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {(Object.keys(leaveStatusLabels) as LeaveStatus[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {leaveStatusLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <DataTable columns={columns} data={rows} getRowId={(row) => row.id} emptyMessage="No leave requests yet." globalFilter={search} />

      <Dialog open={rejectingRequest !== null} onOpenChange={(open) => !open && setRejectingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject leave request?</DialogTitle>
            <DialogDescription>Optionally note why — this is visible to the employee.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Team is short-staffed that week"
            rows={3}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
