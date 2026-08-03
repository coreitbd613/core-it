"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangleIcon,
  DownloadIcon,
  EyeIcon,
  PlusIcon,
  ReceiptIcon,
  Trash2Icon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { createSelectionColumn } from "@/components/shared/data-table/data-table-select-column"
import {
  DataTableRowActions,
  type DataTableRowAction,
} from "@/components/shared/data-table/data-table-row-actions"
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { downloadInvoicePdf } from "@/components/shared/invoice-pdf"
import { formatBDT } from "@/lib/format"
import {
  deriveInvoiceStatus,
  invoiceBalanceBdt,
  invoiceGrandTotalBdt,
  invoicePaidBdt,
  invoiceStatusLabels,
  invoiceStatusVariant,
  invoiceTypeLabels,
  mockInvoices,
  type Invoice,
  type InvoiceStatus,
  type InvoiceType,
} from "@/lib/mock/invoices"

export default function AdminInvoicesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL")
  const [typeFilter, setTypeFilter] = useState<InvoiceType | "ALL">("ALL")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [renderTick, forceRerender] = useState(0)

  const invoices = useMemo(
    () =>
      mockInvoices.filter((inv) => {
        if (statusFilter !== "ALL" && deriveInvoiceStatus(inv) !== statusFilter) return false
        if (typeFilter !== "ALL" && inv.type !== typeFilter) return false
        return true
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusFilter, typeFilter, renderTick]
  )
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

  function handleDeleteOne(invoice: Invoice) {
    const index = mockInvoices.findIndex((inv) => inv.id === invoice.id)
    if (index !== -1) mockInvoices.splice(index, 1)
    forceRerender((n) => n + 1)
    toast.success(`Deleted ${invoice.number}.`)
  }

  const stats = useMemo<DashboardStatItem[]>(() => {
    const activeInvoices = mockInvoices.filter(
      (inv) => deriveInvoiceStatus(inv) !== "CANCELLED"
    )
    const outstanding = activeInvoices.reduce((sum, inv) => sum + invoiceBalanceBdt(inv), 0)
    const overdue = activeInvoices.filter((inv) => deriveInvoiceStatus(inv) === "OVERDUE").length

    const now = new Date()
    const collectedThisMonth = mockInvoices.reduce((sum, inv) => {
      const monthPayments = inv.payments.filter((payment) => {
        const paidAt = new Date(payment.paidAt)
        return paidAt.getFullYear() === now.getFullYear() && paidAt.getMonth() === now.getMonth()
      })
      return sum + monthPayments.reduce((paymentSum, payment) => paymentSum + payment.amountBdt, 0)
    }, 0)

    return [
      { label: "Total Invoices", value: mockInvoices.length, icon: ReceiptIcon, tone: "primary" },
      { label: "Outstanding", value: formatBDT(outstanding), icon: WalletIcon, tone: "chart4" },
      { label: "Overdue", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
      {
        label: "Collected this month",
        value: formatBDT(collectedThisMonth),
        icon: TrendingUpIcon,
        tone: "primary",
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderTick])

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
        id: "issuedAt",
        accessorFn: (row) => row.issuedAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Issued" />,
        cell: ({ row }) => new Date(row.original.issuedAt).toLocaleDateString(),
      },
      {
        id: "dueAt",
        accessorFn: (row) => row.dueAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
        cell: ({ row }) => new Date(row.original.dueAt).toLocaleDateString(),
      },
      {
        id: "total",
        accessorFn: (row) => invoiceGrandTotalBdt(row),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(invoiceGrandTotalBdt(row.original))}
          </span>
        ),
      },
      {
        id: "paid",
        accessorFn: (row) => invoicePaidBdt(row),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Paid" />,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatBDT(invoicePaidBdt(row.original))}
          </span>
        ),
      },
      {
        id: "balance",
        accessorFn: (row) => invoiceBalanceBdt(row),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
        cell: ({ row }) => {
          const status = deriveInvoiceStatus(row.original)
          const total = invoiceGrandTotalBdt(row.original)
          const paid = invoicePaidBdt(row.original)
          return (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatBDT(invoiceBalanceBdt(row.original))}
              </span>
              {status === "PARTIALLY_PAID" && total > 0 && (
                <Progress value={(paid / total) * 100} className="h-1 w-24" />
              )}
            </div>
          )
        },
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
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const invoice = row.original
          const actions: DataTableRowAction[] = [
            {
              label: "View",
              icon: <EyeIcon />,
              onClick: () => router.push(`/admin/invoices/${invoice.id}`),
            },
            {
              label: "Download PDF",
              icon: <DownloadIcon />,
              onClick: () => {
                void downloadInvoicePdf(invoice)
              },
            },
          ]

          if (deriveInvoiceStatus(invoice) === "DRAFT") {
            actions.push({
              label: "Delete",
              icon: <Trash2Icon />,
              destructive: true,
              separatorBefore: true,
              confirm: {
                title: `Delete ${invoice.number}?`,
                description: "This can't be undone.",
                confirmLabel: "Delete",
              },
              onClick: () => handleDeleteOne(invoice),
            })
          }

          return <DataTableRowActions actions={actions} />
        },
        size: 40,
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
        emptyMessage={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptIcon />
              </EmptyMedia>
              <EmptyTitle>No invoices yet</EmptyTitle>
              <EmptyDescription>
                Create your first invoice to start billing companies.
              </EmptyDescription>
            </EmptyHeader>
            <Button asChild>
              <Link href="/admin/invoices/new">
                <PlusIcon />
                New invoice
              </Link>
            </Button>
          </Empty>
        }
        globalFilter={search}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        enableRowSelection={(row) => deriveInvoiceStatus(row) === "DRAFT"}
        getRowClassName={(row) =>
          deriveInvoiceStatus(row) === "OVERDUE" ? "bg-destructive/5 hover:bg-destructive/10" : undefined
        }
      />
    </div>
  )
}
