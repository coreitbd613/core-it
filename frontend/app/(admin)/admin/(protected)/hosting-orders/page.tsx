"use client"

import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { useHostingOrders } from "@/hooks/use-hosting"
import { formatBDT, formatUSD } from "@/lib/format"
import type { AdminHostingOrder, HostingOrderStatus } from "@/lib/hosting"
import { DataTable } from "@/components/shared/data-table/DataTable"
import { Badge } from "@/components/ui/badge"

const STATUS_VARIANT: Record<
  HostingOrderStatus,
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  COMPLETED: "default",
  REJECTED: "destructive",
}

const columns: ColumnDef<AdminHostingOrder>[] = [
  { accessorKey: "planName", header: "Plan", enableSorting: true },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div>{row.original.user.name ?? "—"}</div>
        <div className="text-xs text-muted-foreground">{row.original.user.email}</div>
      </div>
    ),
  },
  {
    id: "price",
    header: "Price",
    cell: ({ row }) => (
      <div>
        <div>{formatBDT(Number(row.original.priceBdt))}/mo</div>
        <div className="text-xs text-muted-foreground">
          {formatUSD(Number(row.original.priceUsd))}/mo
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  {
    id: "createdAt",
    header: "Submitted",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    enableSorting: true,
  },
]

export default function AdminHostingOrdersPage() {
  const router = useRouter()
  const { data: orders, isPending } = useHostingOrders()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Hosting orders</h1>
        <p className="text-muted-foreground">
          VPS plans customers have requested through the hosting page.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={orders ?? []}
        getRowId={(row) => row.id}
        isLoading={isPending}
        emptyMessage="No hosting orders yet."
        onRowClick={(row) => router.push(`/admin/hosting-orders/${row.id}`)}
      />
    </div>
  )
}
