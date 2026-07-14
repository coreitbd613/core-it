"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/ui/border-beam"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/shared/password-input"
import { Spinner } from "@/components/ui/spinner"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export function AdminLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()

  async function adminLoginAction(_state: null, formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string
        } | null
        toast.error(body?.message ?? "Invalid email or password.")
        return null
      }

      router.push("/admin/dashboard")
      router.refresh()
    } catch {
      toast.error("Couldn't reach the server. Please try again.")
    }

    return null
  }

  const [, formAction, isPending] = useActionState(adminLoginAction, null)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="relative overflow-hidden">
        <BorderBeam duration={8} size={220} colorFrom="#FD6005" colorTo="#0A2540" />
        <BorderBeam
          duration={8}
          size={220}
          delay={4}
          colorFrom="#0A2540"
          colorTo="#FD6005"
        />
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">Admin sign in</h1>
          <p className="text-balance text-muted-foreground">
            Restricted access — admin accounts only.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner className="size-4" />}
                  Sign in
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
