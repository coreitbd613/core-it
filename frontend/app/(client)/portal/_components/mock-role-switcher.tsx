"use client"

import { FlaskConicalIcon } from "lucide-react"

import { useMockRole } from "@/contexts/mock-role-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { roleLabels, type MemberRole } from "@/app/(client)/portal/settings/team/_components/team-mock-data"

const allRoles: MemberRole[] = ["OWNER", "ADMIN", "MANAGER", "MEMBER", "BILLING"]

/**
 * Dev-only widget to preview how the client panel looks under each fixed
 * role, before real RBAC exists on the backend. Not part of the final
 * product — remove once role comes from the authenticated session.
 */
export function MockRoleSwitcher() {
  const { role, setRole } = useMockRole()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
      <FlaskConicalIcon className="size-4 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">Preview as</span>
      <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
        <SelectTrigger size="sm" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allRoles.map((r) => (
            <SelectItem key={r} value={r}>
              {roleLabels[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
