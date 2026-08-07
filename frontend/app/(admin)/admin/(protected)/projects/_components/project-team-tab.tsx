"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAddTeamMember, useDeleteTeamMember, useUpdateTeamMember } from "@/hooks/use-projects"
import { LEAD_OWNERS } from "@/lib/mock/leads"
import {
  TEAM_ROLES,
  teamAccessLevelLabels,
  type Project,
  type TeamAccessLevel,
  type UpdateTeamMemberInput,
} from "@/lib/projects"

export function ProjectTeamTab({ project }: { project: Project }) {
  const addTeamMember = useAddTeamMember(project.id)
  const updateTeamMember = useUpdateTeamMember(project.id)
  const deleteTeamMember = useDeleteTeamMember(project.id)

  const team = project.teamMembers

  function handleAdd() {
    addTeamMember.mutate(
      { name: LEAD_OWNERS[0] ?? "", role: TEAM_ROLES[0], accessLevel: "EDIT" },
      {
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't add this team member."),
      }
    )
  }

  function handleUpdate(id: string, input: UpdateTeamMemberInput) {
    updateTeamMember.mutate(
      { teamMemberId: id, input },
      {
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't update this team member."),
      }
    )
  }

  function handleRemove(id: string) {
    deleteTeamMember.mutate(id, {
      onSuccess: () => toast.success("Team member removed."),
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Couldn't remove this team member."),
    })
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Team & permissions</CardTitle>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon />
          Add team member
        </Button>
      </CardHeader>
      <CardContent>
        {team.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team members assigned yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {team.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <Select
                  value={member.name}
                  onValueChange={(v) => handleUpdate(member.id, { name: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_OWNERS.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={member.role}
                  onValueChange={(v) => handleUpdate(member.id, { role: v })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={member.accessLevel}
                  onValueChange={(v) => handleUpdate(member.id, { accessLevel: v as TeamAccessLevel })}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(teamAccessLevelLabels).map(([v, label]) => (
                      <SelectItem key={v} value={v}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove team member"
                  onClick={() => handleRemove(member.id)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
