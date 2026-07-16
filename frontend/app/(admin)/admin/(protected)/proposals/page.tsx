"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { FileTextIcon, PlusIcon, SendIcon } from "lucide-react"
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
  mockProposals,
  proposalStatusLabels,
  proposalStatusVariant,
  proposalTotalBdt,
  type Proposal,
} from "@/lib/mock/proposals"

export default function AdminProposalsPage() {
  const [search, setSearch] = useState("")
  const proposals = mockProposals

  const stats = useMemo<DashboardStatItem[]>(() => {
    const sent = proposals.filter((p) => p.status === "SENT").length
    const approved = proposals.filter((p) => p.status === "APPROVED").length
    const totalValue = proposals.reduce((sum, p) => sum + proposalTotalBdt(p), 0)
    return [
      { label: "Total Proposals", value: proposals.length, icon: FileTextIcon, tone: "primary" },
      { label: "Awaiting Response", value: sent, icon: SendIcon, tone: "chart4" },
      { label: "Approved", value: approved, icon: FileTextIcon, tone: "chart2" },
      { label: "Total Value", value: formatBDT(totalValue), icon: FileTextIcon, tone: "chart5" },
    ]
  }, [proposals])

  const columns = useMemo<ColumnDef<Proposal>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Proposal" />,
        cell: ({ row }) => (
          <Link
            href={`/admin/proposals/${row.original.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "organizationName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.organizationName}</span>
        ),
      },
      {
        id: "total",
        accessorFn: (row) => proposalTotalBdt(row),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(proposalTotalBdt(row.original))}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={proposalStatusVariant[row.original.status]}>
            {proposalStatusLabels[row.original.status]}
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Proposals</h1>
          <p className="text-muted-foreground">Proposals across every company you work with.</p>
        </div>
        <Button asChild>
          <Link href="/admin/proposals/new">
            <PlusIcon />
            New proposal
          </Link>
        </Button>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search proposals..."
      />

      <DataTable
        columns={columns}
        data={proposals}
        getRowId={(row) => row.id}
        emptyMessage="No proposals yet."
        globalFilter={search}
        enableRowSelection={false}
      />
    </div>
  )
}
