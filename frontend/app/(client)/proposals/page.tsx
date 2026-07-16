"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2Icon, ClockIcon, FileTextIcon, XCircleIcon } from "lucide-react"
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
  mockProposals,
  proposalStatusLabels,
  proposalStatusVariant,
  proposalTotalBdt,
  type Proposal,
} from "@/lib/mock/proposals"

// Mock only — scoped to the current mock organization ("Acme Corp").
// Once the backend exists, this becomes a GET scoped by OrganizationContext.
const CURRENT_ORG_ID = "org-1"

export default function ProposalsPage() {
  const [search, setSearch] = useState("")
  const proposals = useMemo(
    () => mockProposals.filter((p) => p.organizationId === CURRENT_ORG_ID),
    []
  )

  const stats = useMemo<DashboardStatItem[]>(() => {
    const pending = proposals.filter((p) => p.status === "SENT").length
    const approved = proposals.filter((p) => p.status === "APPROVED").length
    const rejected = proposals.filter((p) => p.status === "REJECTED").length
    return [
      { label: "Total Proposals", value: proposals.length, icon: FileTextIcon, tone: "primary" },
      { label: "Awaiting Response", value: pending, icon: ClockIcon, tone: "chart4" },
      { label: "Approved", value: approved, icon: CheckCircle2Icon, tone: "chart2" },
      { label: "Rejected", value: rejected, icon: XCircleIcon, tone: "neutral" },
    ]
  }, [proposals])

  const columns = useMemo<ColumnDef<Proposal>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Proposal" />,
        cell: ({ row }) => (
          <Link href={`/proposals/${row.original.id}`} className="font-medium text-foreground hover:underline">
            {row.original.title}
          </Link>
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
      <div>
        <h1 className="text-2xl font-bold">Proposals</h1>
        <p className="text-muted-foreground">
          Proposals sent to you by Core IT — review and approve to kick off a project.
        </p>
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
