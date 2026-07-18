"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import {
  DataTableRowActions,
  type DataTableRowAction,
} from "@/components/shared/data-table/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { downloadProposalPdf } from "@/components/shared/proposal-pdf"
import { formatBDT } from "@/lib/format"
import {
  deriveProposalStatus,
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
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [, forceRerender] = useState(0)
  const proposals = useMemo(
    () => mockProposals.filter((p) => p.organizationId === CURRENT_ORG_ID),
    []
  )

  function respond(proposal: Proposal, status: "APPROVED" | "REJECTED") {
    proposal.status = status
    proposal.respondedAt = new Date().toISOString().slice(0, 10)
    forceRerender((n) => n + 1)
    toast.success(status === "APPROVED" ? "Proposal approved." : "Proposal rejected.")
  }

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
        accessorKey: "proposalNumber",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Number" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.proposalNumber}</span>
        ),
      },
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
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = deriveProposalStatus(row.original)
          return <Badge variant={proposalStatusVariant[status]}>{proposalStatusLabels[status]}</Badge>
        },
      },
      {
        id: "sentAt",
        accessorFn: (row) => row.sentAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sent" />,
        cell: ({ row }) =>
          row.original.sentAt ? new Date(row.original.sentAt).toLocaleDateString() : "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const status = deriveProposalStatus(row.original)
          const canRespond = status === "SENT" || status === "VIEWED"
          const actions: DataTableRowAction[] = [
            {
              label: "View",
              icon: <EyeIcon />,
              onClick: () => router.push(`/proposals/${row.original.id}`),
            },
          ]

          if (canRespond) {
            actions.push({
              label: "Approve",
              icon: <CheckIcon />,
              separatorBefore: true,
              onClick: () => respond(row.original, "APPROVED"),
            })
            actions.push({
              label: "Reject",
              icon: <XIcon />,
              destructive: true,
              confirm: {
                title: `Reject ${row.original.title}?`,
                description:
                  "Core IT will be notified. You can ask them to send a revised proposal later.",
                confirmLabel: "Reject",
              },
              onClick: () => respond(row.original, "REJECTED"),
            })
          }

          actions.push({
            label: "Download PDF",
            icon: <DownloadIcon />,
            separatorBefore: true,
            onClick: () => {
              void downloadProposalPdf(row.original)
            },
          })

          return <DataTableRowActions actions={actions} />
        },
        size: 40,
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
