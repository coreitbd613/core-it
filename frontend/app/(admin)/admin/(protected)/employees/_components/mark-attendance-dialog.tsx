"use client"

import * as React from "react"
import { PencilIcon } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { attendanceStatusLabels, type AttendanceRecord, type AttendanceStatus } from "@/lib/mock/attendance"
import type { Employee } from "@/lib/mock/employees"

const STATUSES = Object.keys(attendanceStatusLabels) as AttendanceStatus[]

export function MarkAttendanceDialog({
  employee,
  date,
  existingRecord,
  onSave,
}: {
  employee: Employee
  date: string
  existingRecord?: AttendanceRecord
  onSave: (status: AttendanceStatus, checkIn: string, checkOut: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState<AttendanceStatus>(existingRecord?.status ?? "PRESENT")
  const [checkIn, setCheckIn] = React.useState(existingRecord?.checkIn ?? "")
  const [checkOut, setCheckOut] = React.useState(existingRecord?.checkOut ?? "")

  React.useEffect(() => {
    if (open) {
      setStatus(existingRecord?.status ?? "PRESENT")
      setCheckIn(existingRecord?.checkIn ?? "")
      setCheckOut(existingRecord?.checkOut ?? "")
    }
  }, [open, existingRecord])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(status, checkIn, checkOut)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Mark attendance for ${employee.name}`}>
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mark attendance</DialogTitle>
            <DialogDescription>
              {employee.name} — {date}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="attendance-status">Status</FieldLabel>
              <Select value={status} onValueChange={(v) => setStatus(v as AttendanceStatus)}>
                <SelectTrigger id="attendance-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {attendanceStatusLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="attendance-checkin">Check-in</FieldLabel>
                <Input
                  id="attendance-checkin"
                  type="time"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="attendance-checkout">Check-out</FieldLabel>
                <Input
                  id="attendance-checkout"
                  type="time"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
