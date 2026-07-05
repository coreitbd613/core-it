"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table/DataTable"
import { Badge } from "@/components/ui/badge"

type UserRow = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "USER"
  joinedAt: string
}

// Placeholder until a real users-list endpoint exists on the backend.
const mockUsers: UserRow[] = [
  { id: "1", name: "Amelia Turner", email: "amelia@example.com", role: "USER", joinedAt: "2026-07-04" },
  { id: "2", name: "Rafiq Islam", email: "rafiq@example.com", role: "ADMIN", joinedAt: "2026-07-03" },
  { id: "3", name: "Priya Nair", email: "priya@example.com", role: "USER", joinedAt: "2026-07-02" },
  { id: "4", name: "Diego Alvarez", email: "diego@example.com", role: "USER", joinedAt: "2026-07-01" },
  { id: "5", name: "Sana Malik", email: "sana@example.com", role: "USER", joinedAt: "2026-06-30" },
  { id: "6", name: "Tomasz Nowak", email: "tomasz@example.com", role: "USER", joinedAt: "2026-06-29" },
]

const columns: ColumnDef<UserRow>[] = [
  { accessorKey: "name", header: "Name", enableSorting: true },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "ADMIN" ? "default" : "secondary"}>
        {row.original.role}
      </Badge>
    ),
  },
  { accessorKey: "joinedAt", header: "Joined", enableSorting: true },
]

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Everyone with access to Core IT.</p>
      </div>

      <DataTable columns={columns} data={mockUsers} getRowId={(row) => row.id} />
    </div>
  )
}
