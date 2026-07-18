"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ClockIcon, FileSignatureIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import {
  contractStatusLabels,
  contractStatusVariant,
  mockContracts,
  type Contract,
} from "@/lib/mock/contracts"

const CURRENT_ORG_ID = "org-1"

export default function ContractsPage() {
  const [search, setSearch] = useState("")
  const contracts = useMemo(
    () => mockContracts.filter((c) => c.organizationId === CURRENT_ORG_ID),
    []
  )

  const stats = useMemo<DashboardStatItem[]>(() => {
    const pending = contracts.filter((c) => c.status === "SENT").length
    return [
      { label: "Total Contracts", value: contracts.length, icon: FileSignatureIcon, tone: "primary" },
      { label: "Awaiting Signature", value: pending, icon: ClockIcon, tone: "chart4" },
    ]
  }, [contracts])

  const columns = useMemo<ColumnDef<Contract>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contract" />,
        cell: ({ row }) => (
          <Link href={`/portal/contracts/${row.original.id}`} className="font-medium text-foreground hover:underline">
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={contractStatusVariant[row.original.status]}>
            {contractStatusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "sentAt",
        accessorFn: (row) => row.sentAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sent" />,
        cell: ({ row }) => new Date(row.original.sentAt).toLocaleDateString(),
      },
      {
        id: "signedAt",
        accessorFn: (row) => row.signedAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Signed" />,
        cell: ({ row }) =>
          row.original.signedAt ? new Date(row.original.signedAt).toLocaleDateString() : "—",
      },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Contracts</h1>
        <p className="text-muted-foreground">Review and sign agreements from Core IT.</p>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search contracts..."
      />

      <DataTable
        columns={columns}
        data={contracts}
        getRowId={(row) => row.id}
        emptyMessage="No contracts yet."
        globalFilter={search}
        enableRowSelection={false}
      />
    </div>
  )
}
