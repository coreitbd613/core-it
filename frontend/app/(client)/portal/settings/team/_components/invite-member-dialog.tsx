"use client"

import * as React from "react"
import { UserPlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type MemberRole,
  roleDescriptions,
  roleLabels,
} from "./team-mock-data"

const invitableRoles: MemberRole[] = ["ADMIN", "MANAGER", "MEMBER", "BILLING"]

export function InviteMemberDialog({
  onInvite,
}: {
  onInvite: (email: string, role: MemberRole) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<MemberRole>("MEMBER")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    onInvite(email.trim(), role)
    setEmail("")
    setRole("MEMBER")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlusIcon />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>
              They&apos;ll get an email invite to join your company workspace.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {invitableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabels[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>{roleDescriptions[role]}</FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
