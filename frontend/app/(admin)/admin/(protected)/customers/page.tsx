"use client"

import { useMemo, useState } from "react"
import {
  BadgeCheckIcon,
  BanknoteIcon,
  EyeIcon,
  LogInIcon,
  ShoppingBagIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"

import {
  useAdminCustomers,
  useDeleteAdminCustomer,
  useDeleteAdminCustomers,
} from "@/hooks/use-customers"
import { formatBDT } from "@/lib/format"
import { loginAsCustomer, type AdminCustomer } from "@/lib/customers"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

export default function AdminCustomersPage() {
  const { data: customers, isPending } = useAdminCustomers()
  const deleteCustomer = useDeleteAdminCustomer()
  const deleteCustomers = useDeleteAdminCustomers()
  const [search, setSearch] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const rows = customers ?? []
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  // Admin accounts can't be deleted from this page (same rule the backend
  // and the per-row menu enforce) — drop them before a bulk delete.
  const deletableSelectedIds = selectedIds.filter(
    (id) => rows.find((row) => row.id === id)?.role !== "ADMIN"
  )
  const selectedCount = selectedIds.length

  const stats = useMemo<DashboardStatItem[]>(() => {
    const verified = rows.filter((c) => c.emailVerified).length
    const orders = rows.reduce((sum, c) => sum + c.ordersCount, 0)
    const revenue = rows.reduce((sum, c) => sum + c.totalSpentBdt, 0)
    return [
      { label: "Total Customers", value: rows.length, icon: UsersIcon, tone: "primary" },
      { label: "Verified", value: verified, icon: BadgeCheckIcon, tone: "chart2" },
      { label: "Total Orders", value: orders, icon: ShoppingBagIcon, tone: "chart4" },
      { label: "Total Revenue", value: formatBDT(revenue), icon: BanknoteIcon, tone: "chart5" },
    ]
  }, [rows])

  const columns = useMemo<ColumnDef<AdminCustomer>[]>(
    () => [
      createSelectionColumn<AdminCustomer>(),
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar>
              {row.original.avatarUrl && (
                <AvatarImage src={row.original.avatarUrl} alt={row.original.name ?? ""} />
              )}
              <AvatarFallback>
                {(row.original.name ?? row.original.email).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {row.original.name ?? "—"}
              </span>
              <span className="text-xs text-muted-foreground">{row.original.email}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "contactNumber",
        header: "Contact",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.contactNumber ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "ordersCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {row.original.ordersCount}
          </span>
        ),
      },
      {
        accessorKey: "totalSpentBdt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Spent" />,
        cell: ({ row }) => (
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatBDT(row.original.totalSpentBdt)}
          </span>
        ),
      },
      {
        accessorKey: "emailVerified",
        header: "Verified",
        cell: ({ row }) => (
          <Badge variant={row.original.emailVerified ? "default" : "secondary"}>
            {row.original.emailVerified ? "Verified" : "Unverified"}
          </Badge>
        ),
      },
      {
        id: "createdAt",
        accessorFn: (row) => row.createdAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const displayName = row.original.name ?? row.original.email
          const actions: DataTableRowAction[] = [
            {
              label: "View",
              icon: <EyeIcon />,
              onClick: () => toast.info(`Viewing ${displayName}`),
            },
          ]

          if (row.original.role !== "ADMIN") {
            actions.push({
              label: "Login as",
              icon: <LogInIcon />,
              separatorBefore: true,
              confirm: {
                title: `Log in as ${displayName}?`,
                description:
                  "This opens their dashboard in a new tab, signed in as their account. Your admin session stays active here.",
                confirmLabel: "Log in as",
              },
              onClick: async () => {
                try {
                  await loginAsCustomer(row.original.id)
                  window.open("/portal/dashboard", "_blank")
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Couldn't log in as this customer."
                  )
                }
              },
            })

            actions.push({
              label: "Delete",
              icon: <Trash2Icon />,
              destructive: true,
              separatorBefore: true,
              confirm: {
                title: `Delete ${displayName}?`,
                description:
                  "This can't be undone. Their account and order history would be permanently removed.",
                confirmLabel: "Delete",
              },
              onClick: () => {
                deleteCustomer.mutate(row.original.id, {
                  onSuccess: () => toast.success(`Deleted ${displayName}.`),
                  onError: (error) =>
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Couldn't delete this customer."
                    ),
                })
              },
            })
          }

          return <DataTableRowActions actions={actions} />
        },
        size: 40,
      },
    ],
    [deleteCustomer]
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground">Everyone who has signed up on the Core IT website.</p>
      </div>

      <DashboardStatsGrid items={stats} loading={isPending} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customers..."
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
                    Delete {selectedCount} customer{selectedCount > 1 ? "s" : ""}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This can&apos;t be undone. Their account and order history would be
                    permanently removed.
                    {deletableSelectedIds.length < selectedCount && (
                      <>
                        {" "}
                        Admin accounts in your selection will be skipped.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => {
                      deleteCustomers.mutate(deletableSelectedIds, {
                        onSuccess: () =>
                          toast.success(`Deleted ${deletableSelectedIds.length} customers.`),
                        onError: (error) =>
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Couldn't delete these customers."
                          ),
                      })
                      setRowSelection({})
                    }}
                  >
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
        isLoading={isPending}
        emptyMessage="No customers yet."
        globalFilter={search}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  )
}
