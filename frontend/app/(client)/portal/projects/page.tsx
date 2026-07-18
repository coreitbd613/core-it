"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2Icon, ClockIcon, FolderKanbanIcon, Loader2Icon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import {
  mockProjects,
  projectStatusLabels,
  projectStatusVariant,
  type Project,
} from "@/lib/mock/projects"

const CURRENT_ORG_ID = "org-1"

export default function ProjectsPage() {
  const [search, setSearch] = useState("")
  const projects = useMemo(
    () => mockProjects.filter((p) => p.organizationId === CURRENT_ORG_ID),
    []
  )

  const stats = useMemo<DashboardStatItem[]>(() => {
    const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length
    const review = projects.filter((p) => p.status === "REVIEW").length
    const completed = projects.filter((p) => p.status === "COMPLETED").length
    return [
      { label: "Total Projects", value: projects.length, icon: FolderKanbanIcon, tone: "primary" },
      { label: "In Progress", value: inProgress, icon: Loader2Icon, tone: "chart2" },
      { label: "In Review", value: review, icon: ClockIcon, tone: "chart4" },
      { label: "Completed", value: completed, icon: CheckCircle2Icon, tone: "neutral" },
    ]
  }, [projects])

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />,
        cell: ({ row }) => (
          <Link href={`/portal/projects/${row.original.id}`} className="font-medium text-foreground hover:underline">
            {row.original.name}
          </Link>
        ),
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
        id: "startedAt",
        accessorFn: (row) => row.startedAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Started" />,
        cell: ({ row }) => new Date(row.original.startedAt).toLocaleDateString(),
      },
      {
        id: "updatedAt",
        accessorFn: (row) => row.updatedAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
        cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
      },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground">
          Track delivery progress and request revisions on active work.
        </p>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects..."
      />

      <DataTable
        columns={columns}
        data={projects}
        getRowId={(row) => row.id}
        emptyMessage="No projects yet."
        globalFilter={search}
        enableRowSelection={false}
      />
    </div>
  )
}
