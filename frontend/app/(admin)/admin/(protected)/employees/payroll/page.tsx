"use client"

import { useState } from "react"
import { CheckIcon, EyeIcon, HourglassIcon, WalletIcon } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import {
  DataTableRowActions,
  type DataTableRowAction,
} from "@/components/shared/data-table/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatBDT } from "@/lib/format"
import { findEmployeeById } from "@/lib/mock/employees"
import {
  markPayslipPaid,
  mockPayslips,
  netSalaryBdt,
  payslipStatusLabels,
  payslipStatusVariant,
  totalPayrollForMonth,
  type Payslip,
} from "@/lib/mock/payroll"

import { GeneratePayrollDialog } from "../_components/generate-payroll-dialog"
import { PayslipDetailDialog } from "../_components/payslip-detail-dialog"

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export default function AdminPayrollPage() {
  const [month, setMonth] = useState(currentMonth())
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null)
  const [, forceRerender] = useState(0)

  const rows = mockPayslips.filter((payslip) => payslip.month === month)

  function handleMarkPaid(payslip: Payslip) {
    markPayslipPaid(payslip)
    toast.success("Marked as paid.")
    forceRerender((n) => n + 1)
  }

  const stats: DashboardStatItem[] = [
    { label: "Total Payroll", value: formatBDT(totalPayrollForMonth(mockPayslips, month)), icon: WalletIcon, tone: "primary" },
    { label: "Paid", value: rows.filter((p) => p.status === "PAID").length, icon: CheckIcon, tone: "chart3" },
    { label: "Pending", value: rows.filter((p) => p.status === "PENDING").length, icon: HourglassIcon, tone: "chart4" },
  ]

  const columns: ColumnDef<Payslip>[] = [
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
      cell: ({ row }) => {
        const payslip = row.original
        const actions: DataTableRowAction[] = [
          { label: "View", icon: <EyeIcon />, onClick: () => setSelectedPayslip(payslip) },
        ]
        if (payslip.status === "PENDING") {
          actions.push({
            label: "Mark paid",
            icon: <CheckIcon />,
            confirm: {
              title: "Mark this payslip as paid?",
              description: "This records today as the payment date.",
              confirmLabel: "Mark paid",
            },
            onClick: () => handleMarkPaid(payslip),
          })
        }
        return <DataTableRowActions actions={actions} />
      },
      size: 40,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payroll</h1>
        </div>
        <div className="flex items-center gap-2">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" />
          <GeneratePayrollDialog onGenerated={() => forceRerender((n) => n + 1)} />
        </div>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTable columns={columns} data={rows} getRowId={(row) => row.id} emptyMessage="No payslips for this month yet." />

      <PayslipDetailDialog payslip={selectedPayslip} onOpenChange={(open) => !open && setSelectedPayslip(null)} />
    </div>
  )
}
