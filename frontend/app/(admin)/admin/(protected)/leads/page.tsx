"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  EyeIcon,
  KanbanIcon,
  PencilIcon,
  PlusIcon,
  TableIcon,
  TargetIcon,
  Trash2Icon,
  UserPlusIcon,
  WalletIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"

import { useAdminAuth } from "@/contexts/admin-auth-context"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { formatBDT } from "@/lib/format"
import {
  LEAD_OWNERS,
  isLeadClosed,
  isLeadOverdue,
  leadSourceLabels,
  leadStageLabels,
  leadStageVariant,
  logLeadActivity,
  mockLeads,
  pipelineValueBdt,
  type Lead,
  type LeadSource,
  type LeadStage,
} from "@/lib/mock/leads"

import { LeadBoard } from "./_components/lead-board"
import { LeadQuickActions } from "./_components/lead-quick-actions"

export default function AdminLeadsPage() {
  const router = useRouter()
  const { user } = useAdminAuth()
  const authorName = user?.name ?? "Core IT"
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<LeadStage | "ALL">("ALL")
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL")
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "ALL">("ALL")
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [view, setView] = useState<"table" | "board">("table")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkLostDialogOpen, setBulkLostDialogOpen] = useState(false)
  const [bulkLostReason, setBulkLostReason] = useState("")
  const [, forceRerender] = useState(0)

  const rows = mockLeads.filter(
    (lead) =>
      (stageFilter === "ALL" || lead.stage === stageFilter) &&
      (ownerFilter === "ALL" ||
        (ownerFilter === "UNASSIGNED" ? !lead.ownerName : lead.ownerName === ownerFilter)) &&
      (sourceFilter === "ALL" || lead.source === sourceFilter) &&
      (!overdueOnly || isLeadOverdue(lead))
  )
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

  function handleConvert(lead: Lead) {
    lead.stage = "WON"
    lead.convertedAt = new Date().toISOString()
    logLeadActivity(lead, "CONVERTED", "Converted to customer", authorName)
    toast.success("Lead converted — create their account under Customers to finish onboarding.")
    forceRerender((n) => n + 1)
  }

  function handleBulkStageChange(stage: LeadStage) {
    if (stage === "LOST") {
      setBulkLostReason("")
      setBulkLostDialogOpen(true)
      return
    }
    for (const id of selectedIds) {
      const lead = mockLeads.find((l) => l.id === id)
      if (!lead || lead.stage === stage) continue
      lead.stage = stage
      logLeadActivity(lead, "STAGE_CHANGE", `Stage changed to ${leadStageLabels[stage]}`, authorName)
    }
    setRowSelection({})
    forceRerender((n) => n + 1)
    toast.success(`Updated ${selectedIds.length} lead${selectedIds.length > 1 ? "s" : ""}.`)
  }

  function confirmBulkLost() {
    for (const id of selectedIds) {
      const lead = mockLeads.find((l) => l.id === id)
      if (!lead) continue
      lead.stage = "LOST"
      lead.lostReason = bulkLostReason.trim() || null
      logLeadActivity(
        lead,
        "STAGE_CHANGE",
        `Stage changed to Lost${bulkLostReason.trim() ? ` — ${bulkLostReason.trim()}` : ""}`,
        authorName
      )
    }
    setBulkLostDialogOpen(false)
    setRowSelection({})
    forceRerender((n) => n + 1)
    toast.success(`Updated ${selectedIds.length} lead${selectedIds.length > 1 ? "s" : ""}.`)
  }

  function handleBulkReassign(owner: string) {
    const ownerName = owner === "unassigned" ? null : owner
    for (const id of selectedIds) {
      const lead = mockLeads.find((l) => l.id === id)
      if (!lead) continue
      lead.ownerName = ownerName
      logLeadActivity(lead, "NOTE", ownerName ? `Reassigned to ${ownerName}` : "Unassigned", authorName)
    }
    setRowSelection({})
    forceRerender((n) => n + 1)
    toast.success(`Reassigned ${selectedIds.length} lead${selectedIds.length > 1 ? "s" : ""}.`)
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
            <div className="flex min-w-0 flex-col">
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
            <div className="ml-auto shrink-0">
              <LeadQuickActions lead={row.original} />
            </div>
          </div>
        ),
      },
      {
        id: "stage",
        accessorFn: (row) => row.stage,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stage" />,
        cell: ({ row }) => (
          <Badge variant={leadStageVariant[row.original.stage]}>
            {leadStageLabels[row.original.stage]}
          </Badge>
        ),
      },
      {
        accessorKey: "source",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {leadSourceLabels[row.original.source]}
          </span>
        ),
      },
      {
        id: "owner",
        accessorFn: (row) => row.ownerName ?? "",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
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
              confirm: {
                title: `Convert ${lead.contactName} to a customer?`,
                description:
                  "This marks the lead as Won. Create their account under Customers to finish onboarding.",
                confirmLabel: "Convert",
              },
              onClick: () => handleConvert(lead),
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
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={view}
            onValueChange={(value) => value && setView(value as "table" | "board")}
          >
            <ToggleGroupItem value="table" aria-label="Table view">
              <TableIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="board" aria-label="Board view">
              <KanbanIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button asChild>
            <Link href="/admin/leads/new">
              <PlusIcon />
              New lead
            </Link>
          </Button>
        </div>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search leads..."
        filters={
          <>
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
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All owners</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                {LEAD_OWNERS.map((owner) => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | "ALL")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All sources</SelectItem>
                {Object.entries(leadSourceLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={overdueOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setOverdueOnly((value) => !value)}
            >
              <AlertTriangleIcon />
              Overdue only
            </Button>
          </>
        }
        bulkActions={
          view === "table" &&
          selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Select
                key={`stage-${selectedIds.join(",")}`}
                onValueChange={(value) => handleBulkStageChange(value as LeadStage)}
              >
                <SelectTrigger className="w-40" size="sm">
                  <SelectValue placeholder="Change stage..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="QUALIFIED">Qualified</SelectItem>
                  <SelectItem value="WON">Won</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select key={`owner-${selectedIds.join(",")}`} onValueChange={handleBulkReassign}>
                <SelectTrigger className="w-40" size="sm">
                  <SelectValue placeholder="Assign owner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {LEAD_OWNERS.map((owner) => (
                    <SelectItem key={owner} value={owner}>
                      {owner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            </div>
          )
        }
      />

      {view === "table" ? (
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
      ) : (
        <LeadBoard
          leads={rows}
          authorName={authorName}
          onChange={() => forceRerender((n) => n + 1)}
        />
      )}

      <Dialog open={bulkLostDialogOpen} onOpenChange={setBulkLostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark {selectedCount} lead{selectedCount > 1 ? "s" : ""} as lost?</DialogTitle>
            <DialogDescription>
              Optionally note why — this reason is applied to all selected leads.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={bulkLostReason}
            onChange={(e) => setBulkLostReason(e.target.value)}
            placeholder="e.g. Went with a competitor, budget fell through..."
            rows={3}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmBulkLost}>
              Mark as lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
