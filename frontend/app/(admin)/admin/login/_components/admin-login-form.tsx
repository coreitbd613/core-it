"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import type { CurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
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
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
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
        return
      }

      const user = (await res.json()) as CurrentUser
      if (user.role !== "ADMIN") {
        // Valid credentials, but not an admin account: drop the session
        // that login just created instead of leaving stray cookies around.
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        })
        toast.error("This account doesn't have admin access.")
        return
      }

      router.push("/admin/dashboard")
      router.refresh()
    } catch {
      toast.error("Couldn't reach the server. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">Admin sign in</h1>
          <p className="text-balance text-muted-foreground">
            Restricted access — admin accounts only.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner className="size-4" />}
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
