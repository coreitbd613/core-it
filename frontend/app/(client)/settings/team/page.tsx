"use client"

import { useMemo, useState } from "react"
import { ClockIcon, CrownIcon, ShieldAlertIcon, Trash2Icon, UsersIcon } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { useMockRole } from "@/contexts/mock-role-context"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import {
  DataTableRowActions,
  type DataTableRowAction,
} from "@/components/shared/data-table/data-table-row-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { InviteMemberDialog } from "./_components/invite-member-dialog"
import {
  mockTeamMembers,
  roleLabels,
  type MemberRole,
  type TeamMember,
} from "./_components/team-mock-data"

const assignableRoles: MemberRole[] = ["ADMIN", "MANAGER", "MEMBER", "BILLING"]

export default function TeamSettingsPage() {
  const { canManageTeam } = useMockRole()
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [search, setSearch] = useState("")

  const stats = useMemo<DashboardStatItem[]>(() => {
    const active = members.filter((m) => m.status === "ACTIVE").length
    const pending = members.filter((m) => m.status === "PENDING").length
    return [
      { label: "Total Members", value: members.length, icon: UsersIcon, tone: "primary" },
      { label: "Active", value: active, icon: CrownIcon, tone: "chart2" },
      { label: "Pending Invites", value: pending, icon: ClockIcon, tone: "chart4" },
    ]
  }, [members])

  function handleInvite(email: string, role: MemberRole) {
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: email.split("@")[0],
      email,
      role,
      status: "PENDING",
      joinedAt: new Date().toISOString().slice(0, 10),
    }
    setMembers((prev) => [newMember, ...prev])
    toast.success(`Invite sent to ${email}.`, {
      description: `Mock link: /invite/${newMember.id}`,
    })
  }

  function handleRoleChange(id: string, role: MemberRole) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
    toast.success("Role updated.")
  }

  function handleRemove(member: TeamMember) {
    setMembers((prev) => prev.filter((m) => m.id !== member.id))
    toast.success(`Removed ${member.name} from the team.`)
  }

  const columns = useMemo<ColumnDef<TeamMember>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Member" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar>
              {row.original.avatarUrl && (
                <AvatarImage src={row.original.avatarUrl} alt={row.original.name} />
              )}
              <AvatarFallback>{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{row.original.name}</span>
              <span className="text-xs text-muted-foreground">{row.original.email}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          if (row.original.role === "OWNER") {
            return (
              <Badge variant="default" className="gap-1">
                <CrownIcon className="size-3" />
                Owner
              </Badge>
            )
          }
          return (
            <Select
              value={row.original.role}
              onValueChange={(value) => handleRoleChange(row.original.id, value as MemberRole)}
            >
              <SelectTrigger size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "ACTIVE" ? "secondary" : "outline"}>
            {row.original.status === "ACTIVE" ? "Active" : "Pending"}
          </Badge>
        ),
      },
      {
        id: "joinedAt",
        accessorFn: (row) => row.joinedAt,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
        cell: ({ row }) => new Date(row.original.joinedAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (row.original.role === "OWNER") return null
          const actions: DataTableRowAction[] = [
            {
              label: "Remove",
              icon: <Trash2Icon />,
              destructive: true,
              confirm: {
                title: `Remove ${row.original.name}?`,
                description:
                  "They'll immediately lose access to this company's workspace.",
                confirmLabel: "Remove",
              },
              onClick: () => handleRemove(row.original),
            },
          ]
          return <DataTableRowActions actions={actions} />
        },
        size: 40,
      },
    ],
    []
  )

  if (!canManageTeam) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlertIcon />
          </EmptyMedia>
          <EmptyTitle>You don&apos;t have access to Team settings</EmptyTitle>
          <EmptyDescription>
            Only Owners and Admins can view and manage team members.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-muted-foreground">
          Manage who has access to your company workspace and what they can do.
        </p>
      </div>

      <DashboardStatsGrid items={stats} />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search members..."
        actions={<InviteMemberDialog onInvite={handleInvite} />}
      />

      <DataTable
        columns={columns}
        data={members}
        getRowId={(row) => row.id}
        emptyMessage="No team members yet."
        globalFilter={search}
        enableRowSelection={false}
      />
    </div>
  )
}
