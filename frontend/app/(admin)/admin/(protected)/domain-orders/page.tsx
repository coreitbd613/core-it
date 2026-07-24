"use client"

import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { useDomainOrders } from "@/hooks/use-domains"
import { formatBDT } from "@/lib/format"
import type { AdminDomainOrder, DomainOrderStatus } from "@/lib/domains"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"

const STATUS_VARIANT: Record<
  DomainOrderStatus,
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  COMPLETED: "default",
  REJECTED: "destructive",
}

const columns: ColumnDef<AdminDomainOrder>[] = [
  {
    accessorKey: "domainName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Domain" />,
  },
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
      <span>{formatBDT(Number(row.original.priceBdt))}/year</span>
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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
]

export default function AdminDomainOrdersPage() {
  const router = useRouter()
  const { data: orders, isPending } = useDomainOrders()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Domain orders</h1>
        <p className="text-muted-foreground">
          Domains customers have requested through the search page.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={orders ?? []}
        getRowId={(row) => row.id}
        isLoading={isPending}
        emptyMessage="No domain orders yet."
        onRowClick={(row) => router.push(`/admin/domain-orders/${row.id}`)}
      />
    </div>
  )
}
