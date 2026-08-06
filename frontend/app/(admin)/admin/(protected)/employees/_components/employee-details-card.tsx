"use client"

import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/format"
import {
  employeeStatusLabels,
  employeeStatusVariant,
  employmentTypeLabels,
  mockEmployees,
  reportingManagerOf,
  type Employee,
  type EmployeeStatus,
} from "@/lib/mock/employees"

export function EmployeeDetailsCard({
  employee,
  onStatusChange,
}: {
  employee: Employee
  onStatusChange: (status: EmployeeStatus) => void
}) {
  const manager = reportingManagerOf(employee, mockEmployees)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Details</CardTitle>
        <Badge variant={employeeStatusVariant[employee.status]}>
          {employeeStatusLabels[employee.status]}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{employee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{employee.name}</p>
            <p className="text-xs text-muted-foreground">{employee.employeeCode}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="text-sm text-foreground">{employee.department}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Designation</p>
            <p className="text-sm text-foreground">{employee.designation}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm text-foreground">{employmentTypeLabels[employee.employmentType]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Join date</p>
            <p className="text-sm text-foreground">{formatDate(employee.joinDate)}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Reports to</p>
          {manager ? (
            <Link href={`/admin/employees/${manager.id}`} className="text-sm text-foreground hover:underline">
              {manager.name}
            </Link>
          ) : (
            <p className="text-sm text-foreground">—</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">Status</p>
          <Select value={employee.status} onValueChange={(v) => onStatusChange(v as EmployeeStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(employeeStatusLabels) as EmployeeStatus[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {employeeStatusLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
