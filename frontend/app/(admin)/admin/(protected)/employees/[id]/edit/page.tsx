"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { XIcon } from "lucide-react"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { mockEmployees } from "@/lib/mock/employees"

import { EmployeeForm } from "../../_components/employee-form"

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>()
  const employee = mockEmployees.find((e) => e.id === params.id)

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

  return <EmployeeForm mode="edit" employee={employee} />
}
