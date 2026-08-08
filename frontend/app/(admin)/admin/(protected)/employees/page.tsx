"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersRoundIcon,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/format"
import {
  DEPARTMENTS,
  activeEmployees,
  employeeStatusLabels,
  employeeStatusVariant,
  employmentTypeLabels,
  mockEmployees,
  type Department,
  type Employee,
  type EmployeeStatus,
} from "@/lib/mock/employees"

export default function AdminEmployeesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<Department | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "ALL">("ALL")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [, forceRerender] = useState(0)

  const rows = mockEmployees.filter(
    (employee) =>
      (departmentFilter === "ALL" || employee.department === departmentFilter) &&
      (statusFilter === "ALL" || employee.status === statusFilter)
  )
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedCount = selectedIds.length

  function handleDelete(employee: Employee) {
    const index = mockEmployees.findIndex((e) => e.id === employee.id)
    if (index !== -1) mockEmployees.splice(index, 1)
    forceRerender((n) => n + 1)
    toast.success(`Removed ${employee.name}.`)
  }

  function handleBulkDelete() {
    for (const id of selectedIds) {
      const index = mockEmployees.findIndex((e) => e.id === id)
      if (index !== -1) mockEmployees.splice(index, 1)
    }
    setRowSelection({})
    forceRerender((n) => n + 1)
    toast.success(`Removed ${selectedIds.length} employee${selectedIds.length > 1 ? "s" : ""}.`)
  }

  const stats = useMemo<DashboardStatItem[]>(() => {
    const active = activeEmployees(mockEmployees)
    const onLeave = mockEmployees.filter((e) => e.status === "ON_LEAVE").length
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const newThisMonth = mockEmployees.filter((e) => new Date(e.joinDate) >= startOfMonth).length
    return [
      { label: "Headcount", value: active.length, icon: UsersRoundIcon, tone: "primary" },
      { label: "On Leave", value: onLeave, icon: UsersRoundIcon, tone: "chart2" },
      { label: "New This Month", value: newThisMonth, icon: UserPlusIcon, tone: "chart3" },
      { label: "Departments", value: DEPARTMENTS.length, icon: UsersRoundIcon, tone: "chart4" },
    ]
  }, [])

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      createSelectionColumn<Employee>(),
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <Link
                href={`/admin/employees/${row.original.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {row.original.name}
              </Link>
              <span className="text-xs text-muted-foreground">{row.original.employeeCode}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "department",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.department}</span>,
      },
      {
        accessorKey: "designation",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Designation" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.designation}</span>
        ),
      },
      {
        id: "employmentType",
        accessorFn: (row) => row.employmentType,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {employmentTypeLabels[row.original.employmentType]}
          </span>
        ),
      },
      {
        id: "joinDate",
        accessorFn: (row) => row.joinDate,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Join Date" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{formatDate(row.original.joinDate)}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={employeeStatusVariant[row.original.status]}>
            {employeeStatusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const employee = row.original
          const actions: DataTableRowAction[] = [
            {
              label: "View",
              icon: <EyeIcon />,
              onClick: () => router.push(`/admin/employees/${employee.id}`),
            },
            {
              label: "Edit",
              icon: <PencilIcon />,
              onClick: () => router.push(`/admin/employees/${employee.id}/edit`),
            },
            {
              label: "Remove",
              icon: <Trash2Icon />,
              destructive: true,
              separatorBefore: true,
              confirm: {
                title: `Remove ${employee.name}?`,
                description: "This can't be undone.",
                confirmLabel: "Remove",
              },
              onClick: () => handleDelete(employee),
            },
          ]
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
          <h1 className="text-2xl font-bold">Employees</h1>
        </div>
        <Button asChild>
          <Link href="/admin/employees/new">
            <PlusIcon />
            Add employee
          </Link>
        </Button>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employees..."
        showReset={departmentFilter !== "ALL" || statusFilter !== "ALL"}
        onReset={() => {
          setDepartmentFilter("ALL")
          setStatusFilter("ALL")
        }}
        filters={
          <>
            <Select
              value={departmentFilter}
              onValueChange={(value) => setDepartmentFilter(value as Department | "ALL")}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All departments</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as EmployeeStatus | "ALL")}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {(Object.keys(employeeStatusLabels) as EmployeeStatus[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {employeeStatusLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        bulkActions={
          selectedCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2Icon />
                  Remove ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Remove {selectedCount} employee{selectedCount > 1 ? "s" : ""}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={handleBulkDelete}>
                    Remove
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
        emptyMessage={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersRoundIcon />
              </EmptyMedia>
              <EmptyTitle>No employees yet</EmptyTitle>
              <EmptyDescription>Add your first team member to get started.</EmptyDescription>
            </EmptyHeader>
            <Button asChild>
              <Link href="/admin/employees/new">
                <PlusIcon />
                Add employee
              </Link>
            </Button>
          </Empty>
        }
        globalFilter={search}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </div>
  )
}
