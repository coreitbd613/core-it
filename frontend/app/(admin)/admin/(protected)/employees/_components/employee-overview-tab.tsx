"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBDT, formatDate } from "@/lib/format"
import type { Employee } from "@/lib/mock/employees"

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value ?? "—"}</p>
    </div>
  )
}

export function EmployeeOverviewTab({ employee }: { employee: Employee }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Email" value={employee.email} />
          <Field label="Phone" value={employee.phone} />
          <Field label="Date of birth" value={employee.dateOfBirth ? formatDate(employee.dateOfBirth) : null} />
          <Field label="Gender" value={employee.gender} />
          <Field label="Address" value={employee.address} />
          <Field label="Salary (BDT / month)" value={formatBDT(employee.basicSalaryBdt)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Name" value={employee.emergencyContact?.name} />
          <Field label="Relation" value={employee.emergencyContact?.relation} />
          <Field label="Phone" value={employee.emergencyContact?.phone} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Bank" value={employee.bankInfo?.bankName} />
          <Field label="Account number" value={employee.bankInfo?.accountNumber} />
          <Field label="Branch" value={employee.bankInfo?.branchName} />
        </CardContent>
      </Card>
    </div>
  )
}
