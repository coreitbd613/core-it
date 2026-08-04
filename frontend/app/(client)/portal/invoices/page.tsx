"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangleIcon, ReceiptIcon, WalletIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMyInvoices } from "@/hooks/use-invoices"
import { formatBDT } from "@/lib/format"
import {
  invoiceStatusLabels,
  invoiceStatusVariant,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/invoices"

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL")
  const { data: orgInvoices = [] } = useMyInvoices()
  const invoices = useMemo(
    () =>
      orgInvoices.filter((inv) => {
        if (statusFilter !== "ALL" && inv.computed.status !== statusFilter) return false
        return true
      }),
    [orgInvoices, statusFilter]
  )

  const stats = useMemo<DashboardStatItem[]>(() => {
    const activeInvoices = orgInvoices.filter((inv) => inv.computed.status !== "CANCELLED")
    const outstanding = activeInvoices.reduce((sum, inv) => sum + inv.computed.balanceBdt, 0)
    const overdue = activeInvoices.filter((inv) => inv.computed.status === "OVERDUE").length
    return [
      { label: "Total Invoices", value: orgInvoices.length, icon: ReceiptIcon, tone: "primary" },
      { label: "Outstanding Balance", value: formatBDT(outstanding), icon: WalletIcon, tone: "chart4" },
      { label: "Overdue", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
    ]
  }, [orgInvoices])

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "number",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
        cell: ({ row }) => (
          <Link href={`/portal/invoices/${row.original.id}`} className="font-medium text-foreground hover:underline">
            {row.original.number}
          </Link>
        ),
      },
      {
        id: "total",
        accessorFn: (row) => row.computed.grandTotalBdt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(row.original.computed.grandTotalBdt)}
          </span>
        ),
      },
      {
        id: "balance",
        accessorFn: (row) => row.computed.balanceBdt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(row.original.computed.balanceBdt)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.computed.status
          return <Badge variant={invoiceStatusVariant[status]}>{invoiceStatusLabels[status]}</Badge>
        },
      },
      {
        id: "dueAt",
        accessorFn: (row) => row.dueAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
        cell: ({ row }) => new Date(row.original.dueAt).toLocaleDateString(),
      },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">Track what you owe and what&apos;s been paid.</p>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoices..."
        showReset={statusFilter !== "ALL"}
        onReset={() => {
          setStatusFilter("ALL")
        }}
        filters={
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as InvoiceStatus | "ALL")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {(Object.keys(invoiceStatusLabels) as InvoiceStatus[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {invoiceStatusLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <DataTable
        columns={columns}
        data={invoices}
        getRowId={(row) => row.id}
        emptyMessage="No invoices yet."
        globalFilter={search}
        enableRowSelection={false}
      />
    </div>
  )
}
