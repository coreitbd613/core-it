"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangleIcon, DownloadIcon, ReceiptIcon, WalletIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { useMyInvoices } from "@/hooks/use-invoices"
import { formatBDT, formatDate } from "@/lib/format"
import {
  invoiceStatusLabels,
  invoiceStatusVariant,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/invoices"

export default function InvoicesPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL")
  const { data: orgInvoices = [] } = useMyInvoices()
  const invoices = useMemo(
    () =>
      statusFilter === "ALL"
        ? orgInvoices
        : orgInvoices.filter((inv) => inv.computed.status === statusFilter),
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
          <Link
            href={`/portal/invoices/${row.original.id}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {row.original.number}
          </Link>
        ),
      },
      {
        id: "issuedAt",
        accessorFn: (row) => row.issuedAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Issued" />,
        cell: ({ row }) => formatDate(row.original.issuedAt),
      },
      {
        id: "dueAt",
        accessorFn: (row) => row.dueAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
        cell: ({ row }) => formatDate(row.original.dueAt),
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
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void downloadInvoicePdf(row.original)
            }}
          >
            <DownloadIcon />
            Download
          </Button>
        ),
        size: 40,
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

      <div className="flex justify-end">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as InvoiceStatus | "ALL")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {(Object.keys(invoiceStatusLabels) as InvoiceStatus[])
              // DRAFT invoices never reach the client — omit the dead filter option.
              .filter((key) => key !== "DRAFT")
              .map((key) => (
                <SelectItem key={key} value={key}>
                  {invoiceStatusLabels[key]}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        getRowId={(row) => row.id}
        hidePagination
        onRowClick={(row) => router.push(`/portal/invoices/${row.id}`)}
        getRowClassName={(row) =>
          row.computed.status === "OVERDUE" ? "bg-destructive/5 hover:bg-destructive/10" : undefined
        }
        emptyMessage={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptIcon />
              </EmptyMedia>
              <EmptyTitle>No invoices yet</EmptyTitle>
              <EmptyDescription>Invoices from Core IT will show up here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      />
    </div>
  )
}
