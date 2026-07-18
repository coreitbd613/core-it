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
import { formatBDT } from "@/lib/format"
import {
  deriveInvoiceStatus,
  invoiceBalanceBdt,
  invoiceStatusLabels,
  invoiceStatusVariant,
  invoiceTotalBdt,
  mockInvoices,
  type Invoice,
} from "@/lib/mock/invoices"

const CURRENT_ORG_ID = "org-1"

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const invoices = useMemo(
    () => mockInvoices.filter((inv) => inv.organizationId === CURRENT_ORG_ID),
    []
  )

  const stats = useMemo<DashboardStatItem[]>(() => {
    const outstanding = invoices.reduce((sum, inv) => sum + invoiceBalanceBdt(inv), 0)
    const overdue = invoices.filter((inv) => deriveInvoiceStatus(inv) === "OVERDUE").length
    return [
      { label: "Total Invoices", value: invoices.length, icon: ReceiptIcon, tone: "primary" },
      { label: "Outstanding Balance", value: formatBDT(outstanding), icon: WalletIcon, tone: "chart4" },
      { label: "Overdue", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
    ]
  }, [invoices])

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
        accessorFn: (row) => invoiceTotalBdt(row),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(invoiceTotalBdt(row.original))}
          </span>
        ),
      },
      {
        id: "balance",
        accessorFn: (row) => invoiceBalanceBdt(row),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(invoiceBalanceBdt(row.original))}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = deriveInvoiceStatus(row.original)
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
