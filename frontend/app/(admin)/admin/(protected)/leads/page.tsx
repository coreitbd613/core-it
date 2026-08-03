"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TargetIcon,
  Trash2Icon,
  UserPlusIcon,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { formatBDT } from "@/lib/format"
import {
  isLeadClosed,
  isLeadOverdue,
  leadSourceLabels,
  leadStageLabels,
  leadStageVariant,
  mockLeads,
  pipelineValueBdt,
  type Lead,
  type LeadStage,
} from "@/lib/mock/leads"

export default function AdminLeadsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<LeadStage | "ALL">("ALL")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [, forceRerender] = useState(0)

  const rows = mockLeads.filter((lead) => stageFilter === "ALL" || lead.stage === stageFilter)
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  function handleDelete(lead: Lead) {
    const index = mockLeads.findIndex((l) => l.id === lead.id)
    if (index !== -1) mockLeads.splice(index, 1)
    forceRerender((n) => n + 1)
    toast.success(`Deleted ${lead.contactName}.`)
  }

  function handleBulkDelete() {
    for (const id of selectedIds) {
      const index = mockLeads.findIndex((l) => l.id === id)
      if (index !== -1) mockLeads.splice(index, 1)
    }
    setRowSelection({})
    forceRerender((n) => n + 1)
    toast.success(`Deleted ${selectedIds.length} lead${selectedIds.length > 1 ? "s" : ""}.`)
  }

  const stats = useMemo<DashboardStatItem[]>(() => {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const newThisWeek = mockLeads.filter((lead) => new Date(lead.createdAt) >= startOfWeek).length
    const overdue = mockLeads.filter((lead) => isLeadOverdue(lead)).length
    const won = mockLeads.filter((lead) => lead.stage === "WON").length
    return [
      { label: "Total Leads", value: mockLeads.length, icon: TargetIcon, tone: "primary" },
      { label: "New This Week", value: newThisWeek, icon: UserPlusIcon, tone: "chart2" },
      { label: "Overdue Follow-ups", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
      { label: "Pipeline Value", value: formatBDT(pipelineValueBdt(mockLeads)), icon: WalletIcon, tone: "chart4" },
    ]
  }, [])

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      createSelectionColumn<Lead>(),
      {
        accessorKey: "contactName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Lead" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{row.original.contactName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Link
                href={`/admin/leads/${row.original.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {row.original.contactName}
              </Link>
              <span className="text-xs text-muted-foreground">
                {row.original.companyName ?? row.original.email ?? "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "stage",
        header: "Stage",
        cell: ({ row }) => (
          <Badge variant={leadStageVariant[row.original.stage]}>
            {leadStageLabels[row.original.stage]}
          </Badge>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {leadSourceLabels[row.original.source]}
          </span>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) =>
          row.original.ownerName ? (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px]">
                  {row.original.ownerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground">{row.original.ownerName}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          ),
      },
      {
        id: "estimatedValueBdt",
        accessorFn: (row) => row.estimatedValueBdt ?? 0,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Est. Value" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {row.original.estimatedValueBdt != null ? formatBDT(row.original.estimatedValueBdt) : "—"}
          </span>
        ),
      },
      {
        id: "nextFollowUpAt",
        accessorFn: (row) => row.nextFollowUpAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Next Follow-up" />,
        cell: ({ row }) => {
          if (!row.original.nextFollowUpAt) {
            return <span className="text-sm text-muted-foreground">—</span>
          }
          const overdue = isLeadOverdue(row.original)
          return (
            <span
              className={
                overdue
                  ? "flex items-center gap-1.5 text-sm font-medium text-destructive"
                  : "text-sm text-foreground"
              }
            >
              {overdue && <AlertTriangleIcon className="size-3.5" />}
              {new Date(row.original.nextFollowUpAt).toLocaleDateString()}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const lead = row.original
          const actions: DataTableRowAction[] = [
            {
              label: "View",
              icon: <EyeIcon />,
              onClick: () => router.push(`/admin/leads/${lead.id}`),
            },
            {
              label: "Edit",
              icon: <PencilIcon />,
              onClick: () => router.push(`/admin/leads/${lead.id}/edit`),
            },
          ]

          if (!isLeadClosed(lead)) {
            actions.push({
              label: "Convert to customer",
              icon: <ArrowRightIcon />,
              separatorBefore: true,
              onClick: () => router.push(`/admin/leads/${lead.id}`),
            })
          }

          actions.push({
            label: "Delete",
            icon: <Trash2Icon />,
            destructive: true,
            separatorBefore: true,
            confirm: {
              title: `Delete ${lead.contactName}?`,
              description: "This can't be undone.",
              confirmLabel: "Delete",
            },
            onClick: () => handleDelete(lead),
          })

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
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Track and follow up on inbound leads.</p>
        </div>
        <Button asChild>
          <Link href="/admin/leads/new">
            <PlusIcon />
            New lead
          </Link>
        </Button>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search leads..."
        filters={
          <Select value={stageFilter} onValueChange={(value) => setStageFilter(value as LeadStage | "ALL")}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All stages</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
              <SelectItem value="WON">Won</SelectItem>
              <SelectItem value="LOST">Lost</SelectItem>
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
                    Delete {selectedCount} lead{selectedCount > 1 ? "s" : ""}?
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
        data={rows}
        getRowId={(row) => row.id}
        emptyMessage="No leads yet."
        globalFilter={search}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowClassName={(row) => (isLeadOverdue(row) ? "bg-destructive/5" : undefined)}
      />
    </div>
  )
}
