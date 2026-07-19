"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { XCircle } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/ui/border-beam"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/shared/password-input"
import { Spinner } from "@/components/ui/spinner"
import { roleLabels, type MemberRole } from "@/app/(client)/portal/settings/team/_components/team-mock-data"

// Mock only — no backend lookup yet. Once approved, this becomes a real
// GET against the pending Membership by invite token.
type MockInvite = {
  email: string
  companyName: string
  role: MemberRole
}

function resolveMockInvite(token: string): MockInvite | null {
  if (token === "expired" || token === "invalid") return null
  return {
    email: "teammate@example.com",
    companyName: "Acme Corp",
    role: "MEMBER",
  }
}

export function AcceptInviteView({ token }: { token: string }) {
  const router = useRouter()
  const invite = resolveMockInvite(token)

  const [name, setName] = React.useState("")
  const [isPending, setIsPending] = React.useState(false)

  if (!invite) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <XCircle className="size-10 text-destructive" />
          <h1 className="text-xl font-semibold">Invite invalid or expired</h1>
          <p className="max-w-sm text-muted-foreground">
            Ask your company admin to send you a new invite.
          </p>
          <Button variant="outline" asChild className="mt-2">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast.error("Passwords don't match.")
      return
    }

    setIsPending(true)
    setTimeout(() => {
      toast.success(`Welcome to ${invite!.companyName}.`)
      router.push("/portal/dashboard")
    }, 400)
  }

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-6")}>
      <Link href="/" className="flex h-10 items-center justify-center" aria-label="CORE IT home">
        <Image
          src="/logo-light.png"
          alt="CORE IT"
          width={527}
          height={135}
          priority
          className="h-10 w-auto dark:hidden"
        />
        <Image
          src="/logo-dark.png"
          alt="CORE IT"
          width={527}
          height={135}
          priority
          className="hidden h-10 w-auto dark:block"
        />
      </Link>
      <Card className="relative overflow-hidden p-0">
        <BorderBeam duration={8} size={220} colorFrom="#FD6005" colorTo="#0A2540" />
        <BorderBeam
          duration={8}
          size={220}
          delay={4}
          colorFrom="#0A2540"
          colorTo="#FD6005"
        />
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Join {invite.companyName}</h1>
                <p className="text-balance text-muted-foreground">
                  You&apos;ve been invited as{" "}
                  <Badge variant="secondary">{roleLabels[invite.role]}</Badge>
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input id="invite-email" value={invite.email} disabled />
              </Field>
              <Field>
                <FieldLabel htmlFor="invite-name">Your name</FieldLabel>
                <Input
                  id="invite-name"
                  name="name"
                  placeholder="Jane Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    disabled={isPending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    disabled={isPending}
                  />
                </Field>
              </Field>
              <FieldDescription>Must be at least 8 characters long.</FieldDescription>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner className="size-4" />}
                  Accept invite
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
