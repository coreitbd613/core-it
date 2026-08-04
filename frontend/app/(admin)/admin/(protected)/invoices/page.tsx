"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangleIcon,
  CopyIcon,
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
import { useAdminInvoices, useDeleteInvoice } from "@/hooks/use-invoices"
import { formatBDT } from "@/lib/format"
import {
  invoiceStatusLabels,
  invoiceStatusVariant,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/invoices"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"

export default function AdminInvoicesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const { data: invoices = [] } = useAdminInvoices(
    statusFilter !== "ALL" ? { status: statusFilter } : undefined
  )
  const deleteInvoice = useDeleteInvoice()
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  async function handleBulkDelete() {
    try {
      await Promise.all(selectedIds.map((id) => deleteInvoice.mutateAsync(id)))
      setRowSelection({})
      toast.success(`Deleted ${selectedIds.length} draft invoice${selectedIds.length > 1 ? "s" : ""}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't delete those invoices.")
    }
  }

  async function handleDeleteOne(invoice: Invoice) {
    try {
      await deleteInvoice.mutateAsync(invoice.id)
      toast.success(`Deleted ${invoice.number}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't delete this invoice.")
    }
  }

  const stats = useMemo<DashboardStatItem[]>(() => {
    const activeInvoices = invoices.filter((inv) => inv.computed.status !== "CANCELLED")
    const outstanding = activeInvoices.reduce((sum, inv) => sum + inv.computed.balanceBdt, 0)
    const overdue = activeInvoices.filter((inv) => inv.computed.status === "OVERDUE").length

    const now = new Date()
    const collectedThisMonth = invoices.reduce((sum, inv) => {
      const monthPayments = inv.payments.filter((payment) => {
        const paidAt = new Date(payment.paidAt)
        return paidAt.getFullYear() === now.getFullYear() && paidAt.getMonth() === now.getMonth()
      })
      return sum + monthPayments.reduce((paymentSum, payment) => paymentSum + Number(payment.amountBdt), 0)
    }, 0)

    return [
      { label: "Total Invoices", value: invoices.length, icon: ReceiptIcon, tone: "primary" },
      { label: "Outstanding", value: formatBDT(outstanding), icon: WalletIcon, tone: "chart4" },
      { label: "Overdue", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
      {
        label: "Collected this month",
        value: formatBDT(collectedThisMonth),
        icon: TrendingUpIcon,
        tone: "primary",
      },
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
        id: "organizationName",
        accessorFn: (row) => row.organization?.name ?? row.customerName,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
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
        accessorFn: (row) => row.computed.grandTotalBdt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(row.original.computed.grandTotalBdt)}
          </span>
        ),
      },
      {
        id: "paid",
        accessorFn: (row) => row.computed.paidBdt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Paid" />,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatBDT(row.original.computed.paidBdt)}
          </span>
        ),
      },
      {
        id: "balance",
        accessorFn: (row) => row.computed.balanceBdt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
        cell: ({ row }) => {
          const { status, grandTotalBdt, paidBdt, balanceBdt } = row.original.computed
          return (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatBDT(balanceBdt)}
              </span>
              {status === "PARTIALLY_PAID" && grandTotalBdt > 0 && (
                <Progress value={(paidBdt / grandTotalBdt) * 100} className="h-1 w-24" />
              )}
            </div>
          )
        },
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
            {
              label: "Copy public link",
              icon: <CopyIcon />,
              onClick: () => {
                navigator.clipboard.writeText(`${SITE_URL}/invoices/view/${invoice.id}`)
                toast.success("Link copied.")
              },
            },
          ]

          if (invoice.computed.status === "DRAFT") {
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
    [router]
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
        enableRowSelection={(row) => row.computed.status === "DRAFT"}
        getRowClassName={(row) =>
          row.computed.status === "OVERDUE" ? "bg-destructive/5 hover:bg-destructive/10" : undefined
        }
      />
    </div>
  )
}
