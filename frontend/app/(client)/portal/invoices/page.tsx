"use client"

import { useMemo } from "react"
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
import { downloadInvoicePdf } from "@/components/shared/invoice-pdf"
import { useMyInvoices } from "@/hooks/use-invoices"
import { formatBDT, formatDate } from "@/lib/format"
import { invoiceStatusLabels, invoiceStatusVariant, type Invoice } from "@/lib/invoices"

export default function InvoicesPage() {
  const router = useRouter()
  const { data: orgInvoices = [] } = useMyInvoices()

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
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTable
        columns={columns}
        data={orgInvoices}
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
