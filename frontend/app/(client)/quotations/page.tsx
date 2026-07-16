"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ClockIcon, FileTextIcon } from "lucide-react"
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
  mockQuotations,
  quotationStatusLabels,
  quotationStatusVariant,
  quotationTotalBdt,
  type Quotation,
} from "@/lib/mock/quotations"

const CURRENT_ORG_ID = "org-1"

export default function QuotationsPage() {
  const [search, setSearch] = useState("")
  const quotations = useMemo(
    () => mockQuotations.filter((q) => q.organizationId === CURRENT_ORG_ID),
    []
  )

  const stats = useMemo<DashboardStatItem[]>(() => {
    const pending = quotations.filter((q) => q.status === "SENT").length
    return [
      { label: "Total Quotations", value: quotations.length, icon: FileTextIcon, tone: "primary" },
      { label: "Awaiting Response", value: pending, icon: ClockIcon, tone: "chart4" },
    ]
  }, [quotations])

  const columns = useMemo<ColumnDef<Quotation>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Quotation" />,
        cell: ({ row }) => (
          <Link href={`/quotations/${row.original.id}`} className="font-medium text-foreground hover:underline">
            {row.original.title}
          </Link>
        ),
      },
      {
        id: "total",
        accessorFn: (row) => quotationTotalBdt(row),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(quotationTotalBdt(row.original))}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={quotationStatusVariant[row.original.status]}>
            {quotationStatusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "sentAt",
        accessorFn: (row) => row.sentAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sent" />,
        cell: ({ row }) =>
          row.original.sentAt ? new Date(row.original.sentAt).toLocaleDateString() : "—",
      },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Quotations</h1>
        <p className="text-muted-foreground">
          Price quotes from Core IT — accept one to have it converted into an invoice.
        </p>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search quotations..."
      />

      <DataTable
        columns={columns}
        data={quotations}
        getRowId={(row) => row.id}
        emptyMessage="No quotations yet."
        globalFilter={search}
        enableRowSelection={false}
      />
    </div>
  )
}
