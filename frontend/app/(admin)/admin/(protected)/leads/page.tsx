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
import { FaWhatsapp } from "react-icons/fa6"
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
import { useAdminLeads, useConvertLead, useDeleteLead, useUpdateLeadStage } from "@/hooks/use-leads"
import { formatBDT } from "@/lib/format"
import {
  isLeadClosed,
  isLeadOverdue,
  leadSourceLabels,
  leadStageLabels,
  leadStageVariant,
  pipelineValueBdt,
  waLink,
  type Lead,
  type LeadSource,
  type LeadStage,
} from "@/lib/leads"

import { LeadBoard } from "./_components/lead-board"

export default function AdminLeadsPage() {
  const router = useRouter()
  const { data: leads = [] } = useAdminLeads()
  const deleteLead = useDeleteLead()
  const convertLead = useConvertLead()
  const updateStage = useUpdateLeadStage()

  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<LeadStage | "ALL">("ALL")
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "ALL">("ALL")
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [view, setView] = useState<"table" | "board">("table")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkLostDialogOpen, setBulkLostDialogOpen] = useState(false)
  const [bulkLostReason, setBulkLostReason] = useState("")

  const rows = leads.filter(
    (lead) =>
      (stageFilter === "ALL" || lead.stage === stageFilter) &&
      (sourceFilter === "ALL" || lead.source === sourceFilter) &&
      (!overdueOnly || isLeadOverdue(lead))
  )
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  function handleDelete(lead: Lead) {
    deleteLead.mutate(lead.id, {
      onSuccess: () => toast.success(`Deleted ${lead.contactName}.`),
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Couldn't delete this lead."),
    })
  }

  async function handleBulkDelete() {
    try {
      await Promise.all(selectedIds.map((id) => deleteLead.mutateAsync(id)))
      setRowSelection({})
      toast.success(`Deleted ${selectedIds.length} lead${selectedIds.length > 1 ? "s" : ""}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't delete those leads.")
    }
  }

  function handleConvert(lead: Lead) {
    convertLead.mutate(lead.id, {
      onSuccess: () =>
        toast.success("Lead converted — create their account under Customers to finish onboarding."),
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Couldn't convert this lead."),
    })
  }

  async function handleBulkStageChange(stage: LeadStage) {
    if (stage === "LOST") {
      setBulkLostReason("")
      setBulkLostDialogOpen(true)
      return
    }
    try {
      await Promise.all(
        selectedIds.map((id) => updateStage.mutateAsync({ id, input: { stage } }))
      )
      setRowSelection({})
      toast.success(`Updated ${selectedIds.length} lead${selectedIds.length > 1 ? "s" : ""}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update those leads.")
    }
  }

  async function confirmBulkLost() {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateStage.mutateAsync({
            id,
            input: { stage: "LOST", lostReason: bulkLostReason.trim() || undefined },
          })
        )
      )
      setBulkLostDialogOpen(false)
      setRowSelection({})
      toast.success(`Updated ${selectedIds.length} lead${selectedIds.length > 1 ? "s" : ""}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update those leads.")
    }
  }

  const stats = useMemo<DashboardStatItem[]>(() => {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const newThisWeek = leads.filter((lead) => new Date(lead.createdAt) >= startOfWeek).length
    const overdue = leads.filter((lead) => isLeadOverdue(lead)).length
    return [
      { label: "Total Leads", value: leads.length, icon: TargetIcon, tone: "primary" },
      { label: "New This Week", value: newThisWeek, icon: UserPlusIcon, tone: "chart2" },
      { label: "Overdue Follow-ups", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
      { label: "Pipeline Value", value: formatBDT(pipelineValueBdt(leads)), icon: WalletIcon, tone: "chart4" },
    ]
  }, [leads])

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
          </div>
        ),
      },
      {
        id: "whatsapp",
        accessorFn: (row) => row.phone ?? "",
        header: ({ column }) => <DataTableColumnHeader column={column} title="WhatsApp" />,
        cell: ({ row }) => {
          const link = waLink(row.original.phone)
          if (!link) return <span className="text-sm text-muted-foreground">—</span>
          return (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
            >
              <FaWhatsapp className="size-4 text-[#25D366]" />
              {row.original.phone}
            </a>
          )
        },
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
        id: "estimatedValueBdt",
        accessorFn: (row) => (row.estimatedValueBdt ? Number(row.estimatedValueBdt) : 0),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Est. Value" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {row.original.estimatedValueBdt != null
              ? formatBDT(Number(row.original.estimatedValueBdt))
              : "—"}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
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
        <LeadBoard leads={rows} />
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
