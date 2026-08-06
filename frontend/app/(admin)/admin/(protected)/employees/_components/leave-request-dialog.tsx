"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { activeEmployees, mockEmployees, type Employee } from "@/lib/mock/employees"
import { leaveDaysBetween, leaveTypeLabels, mockLeaveRequests, type LeaveType } from "@/lib/mock/leave"

const LEAVE_TYPES = Object.keys(leaveTypeLabels) as LeaveType[]

export function LeaveRequestDialog({
  employee,
  onCreated,
}: {
  /** When provided, the employee picker is locked to this employee. */
  employee?: Employee
  onCreated: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [employeeId, setEmployeeId] = React.useState(employee?.id ?? "")
  const [type, setType] = React.useState<LeaveType>("CASUAL")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [reason, setReason] = React.useState("")

  React.useEffect(() => {
    if (open) setEmployeeId(employee?.id ?? "")
  }, [open, employee?.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!employeeId) {
      toast.error("Select an employee.")
      return
    }
    if (!startDate || !endDate) {
      toast.error("Pick a start and end date.")
      return
    }
    if (endDate < startDate) {
      toast.error("End date can't be before the start date.")
      return
    }

    mockLeaveRequests.unshift({
      id: crypto.randomUUID(),
      employeeId,
      type,
      startDate,
      endDate,
      days: leaveDaysBetween(startDate, endDate),
      reason: reason.trim(),
      status: "PENDING",
      approverName: null,
      decidedAt: null,
      rejectionReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    toast.success("Leave request submitted.")
    setStartDate("")
    setEndDate("")
    setReason("")
    setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Request leave
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request leave</DialogTitle>
            <DialogDescription>
              {employee ? `Submit a leave request for ${employee.name}.` : "Submit a leave request on behalf of an employee."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            {!employee && (
              <Field>
                <FieldLabel htmlFor="leave-employee">Employee</FieldLabel>
                <Select value={employeeId} onValueChange={setEmployeeId}>
                  <SelectTrigger id="leave-employee" className="w-full">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEmployees(mockEmployees).map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="leave-type">Leave type</FieldLabel>
              <Select value={type} onValueChange={(v) => setType(v as LeaveType)}>
                <SelectTrigger id="leave-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {leaveTypeLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="leave-start">Start date</FieldLabel>
                <DatePickerField id="leave-start" value={startDate} onChange={setStartDate} />
              </Field>
              <Field>
                <FieldLabel htmlFor="leave-end">End date</FieldLabel>
                <DatePickerField id="leave-end" value={endDate} onChange={setEndDate} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="leave-reason">Reason</FieldLabel>
              <Textarea
                id="leave-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief reason for the leave"
                rows={2}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Submit request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
