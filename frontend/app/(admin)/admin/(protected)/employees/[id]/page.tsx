"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, PencilIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockEmployees, type EmployeeStatus } from "@/lib/mock/employees"

import { EmployeeAttendanceTab } from "../_components/employee-attendance-tab"
import { EmployeeDetailsCard } from "../_components/employee-details-card"
import { EmployeeDocumentsTab } from "../_components/employee-documents-tab"
import { EmployeeLeaveTab } from "../_components/employee-leave-tab"
import { EmployeeOverviewTab } from "../_components/employee-overview-tab"
import { EmployeePayrollTab } from "../_components/employee-payroll-tab"

export default function AdminEmployeeDetailPage() {
  const params = useParams<{ id: string }>()
  const [, forceRerender] = React.useState(0)

  const employee = mockEmployees.find((e) => e.id === params.id)

  function handleStatusChange(status: EmployeeStatus) {
    if (!employee) return
    employee.status = status
    employee.terminationDate =
      status === "TERMINATED" ? (employee.terminationDate ?? new Date().toISOString().slice(0, 10)) : null
    employee.updatedAt = new Date().toISOString()
    forceRerender((n) => n + 1)
  }

  if (!employee) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Employee not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/employees">Back to employees</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/employees" aria-label="Back to employees">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{employee.name}</h1>
          <p className="text-muted-foreground">
            {employee.designation} · {employee.department}
          </p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" asChild>
            <Link href={`/admin/employees/${employee.id}/edit`}>
              <PencilIcon />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="leave">Leave</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <EmployeeOverviewTab employee={employee} />
            </TabsContent>
            <TabsContent value="attendance" className="mt-4">
              <EmployeeAttendanceTab employee={employee} />
            </TabsContent>
            <TabsContent value="leave" className="mt-4">
              <EmployeeLeaveTab employee={employee} />
            </TabsContent>
            <TabsContent value="payroll" className="mt-4">
              <EmployeePayrollTab employee={employee} />
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <EmployeeDocumentsTab employee={employee} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <EmployeeDetailsCard employee={employee} onStatusChange={handleStatusChange} />
        </div>
      </div>
    </div>
  )
}
