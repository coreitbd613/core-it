"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRightIcon,
  DownloadIcon,
  EyeIcon,
  FileSignatureIcon,
  FileTextIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
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
import { downloadProposalPdf } from "@/components/shared/proposal-pdf"
import { formatBDT } from "@/lib/format"
import { generateContractTerms, mockContracts } from "@/lib/mock/contracts"
import { mockInvoices } from "@/lib/mock/invoices"
import {
  deriveProposalStatus,
  mockProposals,
  proposalStatusLabels,
  proposalStatusVariant,
  proposalTotalBdt,
  type Proposal,
} from "@/lib/mock/proposals"

function nextInvoiceNumber() {
  return `INV-2026-${String(mockInvoices.length + 1).padStart(3, "0")}`
}

export default function AdminProposalsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [, forceRerender] = useState(0)
  const proposals = mockProposals
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  function handleSend(proposal: Proposal) {
    proposal.status = "SENT"
    proposal.sentAt = new Date().toISOString().slice(0, 10)
    forceRerender((n) => n + 1)
    toast.success(`Sent to ${proposal.organizationName}.`)
  }

  function handleSendContract(proposal: Proposal) {
    const contractId = crypto.randomUUID()
    mockContracts.unshift({
      id: contractId,
      proposalId: proposal.id,
      organizationId: proposal.organizationId,
      organizationName: proposal.organizationName,
      title: proposal.title,
      termsText: generateContractTerms(proposal),
      status: "SENT",
      sentAt: new Date().toISOString().slice(0, 10),
      signedByName: null,
      signedAt: null,
    })
    proposal.contractId = contractId
    forceRerender((n) => n + 1)
    toast.success("Contract sent to the client.")
  }

  function handleConvert(proposal: Proposal) {
    const invoiceId = crypto.randomUUID()
    const today = new Date()
    const due = new Date(today)
    due.setDate(due.getDate() + 14)

    mockInvoices.unshift({
      id: invoiceId,
      number: nextInvoiceNumber(),
      organizationId: proposal.organizationId,
      organizationName: proposal.organizationName,
      lineItems: proposal.lineItems.map((item) => ({ ...item, id: crypto.randomUUID() })),
      payments: [],
      status: "SENT",
      issuedAt: today.toISOString().slice(0, 10),
      dueAt: due.toISOString().slice(0, 10),
    })

    proposal.convertedInvoiceId = invoiceId
    router.push(`/admin/invoices/${invoiceId}`)
    toast.success("Converted to invoice.")
  }

  function handleDelete(proposal: Proposal) {
    const index = mockProposals.findIndex((p) => p.id === proposal.id)
    if (index !== -1) mockProposals.splice(index, 1)
    forceRerender((n) => n + 1)
    toast.success("Draft deleted.")
  }

  function handleBulkDelete() {
    for (const id of selectedIds) {
      const index = mockProposals.findIndex((p) => p.id === id)
      if (index !== -1) mockProposals.splice(index, 1)
    }
    setRowSelection({})
    forceRerender((n) => n + 1)
    toast.success(`Deleted ${selectedIds.length} draft${selectedIds.length > 1 ? "s" : ""}.`)
  }

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
      createSelectionColumn<Proposal>(),
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
          const proposal = row.original
          const contract = proposal.contractId
            ? mockContracts.find((c) => c.id === proposal.contractId)
            : null

          const actions: DataTableRowAction[] = [
            {
              label: "View",
              icon: <EyeIcon />,
              onClick: () => router.push(`/admin/proposals/${proposal.id}`),
            },
            {
              label: "Download PDF",
              icon: <DownloadIcon />,
              onClick: () => {
                void downloadProposalPdf(proposal)
              },
            },
          ]

          if (proposal.status === "DRAFT") {
            actions.push({
              label: "Send to company",
              icon: <SendIcon />,
              separatorBefore: true,
              onClick: () => handleSend(proposal),
            })
          }

          if (proposal.status === "APPROVED" && !contract) {
            actions.push({
              label: "Send contract",
              icon: <FileSignatureIcon />,
              separatorBefore: true,
              onClick: () => handleSendContract(proposal),
            })
          }

          if (contract?.status === "SIGNED" && !proposal.convertedInvoiceId) {
            actions.push({
              label: "Convert to invoice",
              icon: <ArrowRightIcon />,
              separatorBefore: true,
              onClick: () => handleConvert(proposal),
            })
          }

          if (proposal.status === "DRAFT") {
            actions.push({
              label: "Delete",
              icon: <Trash2Icon />,
              destructive: true,
              separatorBefore: true,
              confirm: {
                title: `Delete ${proposal.title}?`,
                description: "This draft will be permanently removed.",
                confirmLabel: "Delete",
              },
              onClick: () => handleDelete(proposal),
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
                    Delete {selectedCount} draft{selectedCount > 1 ? "s" : ""}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
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
        data={proposals}
        getRowId={(row) => row.id}
        emptyMessage="No proposals yet."
        globalFilter={search}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        enableRowSelection={(row) => row.status === "DRAFT"}
      />
    </div>
  )
}
