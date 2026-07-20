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
import { formatBDT } from "@/lib/format"
import {
  deriveInvoiceStatus,
  invoiceBalanceBdt,
  invoiceStatusLabels,
  invoiceStatusVariant,
  invoiceTotalBdt,
  invoiceTypeLabels,
  mockInvoices,
  type Invoice,
  type InvoiceStatus,
  type InvoiceType,
} from "@/lib/mock/invoices"

const CURRENT_ORG_ID = "org-1"

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL")
  const [typeFilter, setTypeFilter] = useState<InvoiceType | "ALL">("ALL")
  const orgInvoices = useMemo(
    () => mockInvoices.filter((inv) => inv.organizationId === CURRENT_ORG_ID),
    []
  )
  const invoices = useMemo(
    () =>
      orgInvoices.filter((inv) => {
        if (statusFilter !== "ALL" && deriveInvoiceStatus(inv) !== statusFilter) return false
        if (typeFilter !== "ALL" && inv.type !== typeFilter) return false
        return true
      }),
    [orgInvoices, statusFilter, typeFilter]
  )

  const stats = useMemo<DashboardStatItem[]>(() => {
    const activeInvoices = orgInvoices.filter((inv) => deriveInvoiceStatus(inv) !== "CANCELLED")
    const outstanding = activeInvoices.reduce((sum, inv) => sum + invoiceBalanceBdt(inv), 0)
    const overdue = activeInvoices.filter((inv) => deriveInvoiceStatus(inv) === "OVERDUE").length
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
        id: "type",
        accessorFn: (row) => row.type,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {invoiceTypeLabels[row.original.type]}
          </span>
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
        showReset={statusFilter !== "ALL" || typeFilter !== "ALL"}
        onReset={() => {
          setStatusFilter("ALL")
          setTypeFilter("ALL")
        }}
        filters={
          <>
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
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as InvoiceType | "ALL")}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {(Object.keys(invoiceTypeLabels) as InvoiceType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {invoiceTypeLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
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
