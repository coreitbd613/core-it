"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangleIcon, PlusIcon, ReceiptIcon, Trash2Icon, WalletIcon } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { createSelectionColumn } from "@/components/shared/data-table/data-table-select-column"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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

export default function AdminInvoicesPage() {
  const [search, setSearch] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [, forceRerender] = useState(0)
  const invoices = mockInvoices
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  function handleBulkDelete() {
    for (const id of selectedIds) {
      const index = mockInvoices.findIndex((inv) => inv.id === id)
      if (index !== -1) mockInvoices.splice(index, 1)
    }
    setRowSelection({})
    forceRerender((n) => n + 1)
    toast.success(`Deleted ${selectedIds.length} draft invoice${selectedIds.length > 1 ? "s" : ""}.`)
  }

  const stats = useMemo<DashboardStatItem[]>(() => {
    const outstanding = invoices.reduce((sum, inv) => sum + invoiceBalanceBdt(inv), 0)
    const overdue = invoices.filter((inv) => deriveInvoiceStatus(inv) === "OVERDUE").length
    return [
      { label: "Total Invoices", value: invoices.length, icon: ReceiptIcon, tone: "primary" },
      { label: "Outstanding", value: formatBDT(outstanding), icon: WalletIcon, tone: "chart4" },
      { label: "Overdue", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
    ]
  }, [invoices])

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      createSelectionColumn<Invoice>(),
      {
        accessorKey: "number",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
        cell: ({ row }) => (
          <Link
            href={`/admin/invoices/${row.original.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {row.original.number}
          </Link>
        ),
      },
      {
        accessorKey: "organizationName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Invoices and payment status across every company.</p>
        </div>
        <Button asChild>
          <Link href="/admin/invoices/new">
            <PlusIcon />
            New invoice
          </Link>
        </Button>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoices..."
        bulkActions={
          selectedCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2Icon />
                  Delete ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {selectedCount} draft invoice{selectedCount > 1 ? "s" : ""}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={handleBulkDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        }
      />

      <DataTable
        columns={columns}
        data={invoices}
        getRowId={(row) => row.id}
        emptyMessage="No invoices yet."
        globalFilter={search}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        enableRowSelection={(row) => deriveInvoiceStatus(row) === "DRAFT"}
      />
    </div>
  )
}
