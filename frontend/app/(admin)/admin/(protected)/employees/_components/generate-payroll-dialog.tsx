"use client"

import * as React from "react"
import { PlayIcon } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { activeEmployees, mockEmployees } from "@/lib/mock/employees"
import { hasPayslipForMonth, mockPayslips } from "@/lib/mock/payroll"

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function GeneratePayrollDialog({ onGenerated }: { onGenerated: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState(currentMonth())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const eligible = activeEmployees(mockEmployees).filter(
      (employee) => employee.employmentType !== "INTERN" && !hasPayslipForMonth(employee.id, month, mockPayslips)
    )

    if (eligible.length === 0) {
      toast.error("Every eligible employee already has a payslip for this month.")
      return
    }

    const now = new Date().toISOString()
    for (const employee of eligible) {
      mockPayslips.unshift({
        id: crypto.randomUUID(),
        employeeId: employee.id,
        month,
        basicSalaryBdt: employee.basicSalaryBdt,
        allowances: [{ label: "House rent", amountBdt: Math.round(employee.basicSalaryBdt * 0.4) }],
        deductions: [{ label: "Provident fund", amountBdt: Math.round(employee.basicSalaryBdt * 0.05) }],
        status: "PENDING",
        paidAt: null,
        createdAt: now,
        updatedAt: now,
      })
    }

    toast.success(`Generated ${eligible.length} payslip${eligible.length > 1 ? "s" : ""} for ${month}.`)
    setOpen(false)
    onGenerated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlayIcon />
          Run payroll
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Run payroll</DialogTitle>
            <DialogDescription>
              Generates a pending payslip for every active employee who doesn&apos;t already have one for the month.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="payroll-month">Month</FieldLabel>
              <Input
                id="payroll-month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Generate</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
