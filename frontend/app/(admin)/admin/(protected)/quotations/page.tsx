"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { FileTextIcon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatBDT } from "@/lib/format"
import {
  mockQuotations,
  quotationStatusLabels,
  quotationStatusVariant,
  quotationTotalBdt,
  type Quotation,
} from "@/lib/mock/quotations"

export default function AdminQuotationsPage() {
  const [search, setSearch] = useState("")
  const quotations = mockQuotations

  const stats = useMemo<DashboardStatItem[]>(() => {
    const sent = quotations.filter((q) => q.status === "SENT").length
    const accepted = quotations.filter((q) => q.status === "ACCEPTED" || q.status === "CONVERTED").length
    return [
      { label: "Total Quotations", value: quotations.length, icon: FileTextIcon, tone: "primary" },
      { label: "Awaiting Response", value: sent, icon: FileTextIcon, tone: "chart4" },
      { label: "Accepted", value: accepted, icon: FileTextIcon, tone: "chart2" },
    ]
  }, [quotations])

  const columns = useMemo<ColumnDef<Quotation>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Quotation" />,
        cell: ({ row }) => (
          <Link
            href={`/admin/quotations/${row.original.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "organizationName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
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
    ],
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Price quotes across every company.</p>
        </div>
        <Button asChild>
          <Link href="/admin/quotations/new">
            <PlusIcon />
            New quotation
          </Link>
        </Button>
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
