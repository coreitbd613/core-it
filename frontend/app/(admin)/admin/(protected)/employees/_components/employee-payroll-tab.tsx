"use client"

import { useMemo, useState } from "react"
import { EyeIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { formatBDT } from "@/lib/format"
import type { Employee } from "@/lib/mock/employees"
import {
  mockPayslips,
  netSalaryBdt,
  payslipStatusLabels,
  payslipStatusVariant,
  payslipsForEmployee,
  type Payslip,
} from "@/lib/mock/payroll"

import { PayslipDetailDialog } from "./payslip-detail-dialog"

export function EmployeePayrollTab({ employee }: { employee: Employee }) {
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null)
  const payslips = useMemo(() => payslipsForEmployee(employee.id, mockPayslips), [employee.id])

  const columns: ColumnDef<Payslip>[] = [
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.month}</span>,
    },
    {
      id: "net",
      header: "Net pay",
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums text-foreground">
          {formatBDT(netSalaryBdt(row.original))}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={payslipStatusVariant[row.original.status]}>
          {payslipStatusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setSelectedPayslip(row.original)}
        >
          <EyeIcon className="size-4" />
          View
        </button>
      ),
      size: 80,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <DataTable columns={columns} data={payslips} getRowId={(row) => row.id} emptyMessage="No payslips yet." />
      <PayslipDetailDialog payslip={selectedPayslip} onOpenChange={(open) => !open && setSelectedPayslip(null)} />
    </div>
  )
}
