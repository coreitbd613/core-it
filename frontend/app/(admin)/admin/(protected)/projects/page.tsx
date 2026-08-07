"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircleIcon, FolderKanbanIcon, Loader2Icon, PlusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAdminProjects } from "@/hooks/use-projects"
import { formatDate } from "@/lib/format"
import { projectStatusLabels, projectStatusVariant, type Project } from "@/lib/projects"

export default function AdminProjectsPage() {
  const [search, setSearch] = useState("")
  const { data: projects = [], isPending } = useAdminProjects()

  const stats = useMemo<DashboardStatItem[]>(() => {
    const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length
    const openRevisions = projects.reduce(
      (sum, p) => sum + p.revisionRequests.filter((r) => r.status !== "DONE").length,
      0
    )
    return [
      { label: "Total Projects", value: projects.length, icon: FolderKanbanIcon, tone: "primary" },
      { label: "In Progress", value: inProgress, icon: Loader2Icon, tone: "chart2" },
      { label: "Open Revisions", value: openRevisions, icon: AlertCircleIcon, tone: "chart4" },
    ]
  }, [projects])

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />,
        cell: ({ row }) => (
          <Link
            href={`/admin/projects/${row.original.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        id: "organizationName",
        accessorFn: (row) => row.organization?.name ?? "—",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={projectStatusVariant[row.original.status]}>
            {projectStatusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "openRevisions",
        accessorFn: (row) => row.revisionRequests.filter((r) => r.status !== "DONE").length,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Open Revisions" />,
      },
      {
        id: "updatedAt",
        accessorFn: (row) => row.updatedAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Delivery status across every company.</p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <PlusIcon />
            New project
          </Link>
        </Button>
      </div>

      <DashboardStatsGrid items={stats} loading={isPending} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects..."
      />

      <DataTable
        columns={columns}
        data={projects}
        getRowId={(row) => row.id}
        isLoading={isPending}
        emptyMessage="No projects yet."
        globalFilter={search}
        enableRowSelection={false}
      />
    </div>
  )
}
