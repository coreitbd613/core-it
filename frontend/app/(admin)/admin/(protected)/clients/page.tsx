"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BanknoteIcon, Building2Icon, TrendingUpIcon, WalletIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAdminOrganizations } from "@/hooks/use-organization"
import { useAdminInvoices } from "@/hooks/use-invoices"
import { useAdminProjects } from "@/hooks/use-projects"
import { formatBDT, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Organization } from "@/lib/organizations"

type ClientRow = Organization & {
  projectCount: number
  activeProjectCount: number
  lifetimeRevenueBdt: number
  outstandingBdt: number
}

export default function AdminClientsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const { data: organizations = [], isPending } = useAdminOrganizations()
  const { data: invoices = [] } = useAdminInvoices()
  const { data: projects = [] } = useAdminProjects()

  const rows = useMemo<ClientRow[]>(() => {
    const byOrg = new Map<string, { revenue: number; outstanding: number }>()
    for (const invoice of invoices) {
      if (!invoice.organizationId) continue
      const entry = byOrg.get(invoice.organizationId) ?? { revenue: 0, outstanding: 0 }
      entry.revenue += invoice.computed.paidBdt
      if (invoice.computed.status !== "CANCELLED") entry.outstanding += invoice.computed.balanceBdt
      byOrg.set(invoice.organizationId, entry)
    }

    return organizations.map((org) => {
      const orgProjects = projects.filter((p) => p.organizationId === org.id)
      const financials = byOrg.get(org.id) ?? { revenue: 0, outstanding: 0 }
      return {
        ...org,
        projectCount: orgProjects.length,
        activeProjectCount: orgProjects.filter((p) => p.status !== "COMPLETED").length,
        lifetimeRevenueBdt: financials.revenue,
        outstandingBdt: financials.outstanding,
      }
    })
  }, [organizations, invoices, projects])

  const stats = useMemo<DashboardStatItem[]>(() => {
    const totalRevenue = rows.reduce((sum, r) => sum + r.lifetimeRevenueBdt, 0)
    const totalOutstanding = rows.reduce((sum, r) => sum + r.outstandingBdt, 0)
    const activeClients = rows.filter((r) => r.activeProjectCount > 0 || r.outstandingBdt > 0).length
    return [
      { label: "Total Clients", value: rows.length, icon: Building2Icon, tone: "primary" },
      { label: "Active Clients", value: activeClients, icon: TrendingUpIcon, tone: "chart3" },
      { label: "Lifetime Revenue", value: formatBDT(totalRevenue), icon: BanknoteIcon, tone: "chart4" },
      { label: "Outstanding", value: formatBDT(totalOutstanding), icon: WalletIcon, tone: "destructive" },
    ]
  }, [rows])

  const columns = useMemo<ColumnDef<ClientRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              {row.original.logoUrl && <AvatarImage src={row.original.logoUrl} alt={row.original.name} />}
              <AvatarFallback className="bg-gradient-to-br from-primary to-orange-600 text-xs font-semibold text-white">
                {row.original.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{row.original.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.original.industry ?? "No industry set"}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="text-foreground">{row.original.email ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{row.original.phone ?? ""}</p>
          </div>
        ),
      },
      {
        id: "projects",
        accessorFn: (row) => row.projectCount,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Projects" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">{row.original.projectCount}</span>
        ),
      },
      {
        id: "revenue",
        accessorFn: (row) => row.lifetimeRevenueBdt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Lifetime Revenue" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(row.original.lifetimeRevenueBdt)}
          </span>
        ),
      },
      {
        id: "outstanding",
        accessorFn: (row) => row.outstandingBdt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Outstanding" />,
        cell: ({ row }) => {
          const { lifetimeRevenueBdt, outstandingBdt } = row.original
          const total = lifetimeRevenueBdt + outstandingBdt
          return (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatBDT(outstandingBdt)}
              </span>
              {outstandingBdt > 0 && total > 0 && (
                <Progress value={(lifetimeRevenueBdt / total) * 100} className="h-1 w-24" />
              )}
            </div>
          )
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const active = row.original.activeProjectCount > 0 || row.original.outstandingBdt > 0
          return (
            <span className="flex items-center gap-1.5 rounded-full border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground")} />
              {active ? "Active" : "Inactive"}
            </span>
          )
        },
      },
      {
        id: "joined",
        accessorFn: (row) => row.createdAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
      </div>

      <DashboardStatsGrid items={stats} loading={isPending} />

      <DataTableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search clients..." />

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isPending}
        globalFilter={search}
        onRowClick={(row) => router.push(`/admin/clients/${row.id}`)}
        emptyMessage="No clients yet."
      />
    </div>
  )
}
