"use client"

import * as React from "react"
import { useActionState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/components/shared/password-input"
import { Spinner } from "@/components/ui/spinner"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  async function resetPasswordAction(_state: null, formData: FormData) {
    if (!token) {
      toast.error("This reset link is invalid or has expired.")
      return null
    }

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast.error("Passwords don't match.")
      return null
    }

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string
        } | null
        toast.error(body?.message ?? "Couldn't reset your password.")
        return null
      }

      toast.success("Password updated. Please log in again.")
      router.push("/login")
    } catch {
      toast.error("Couldn't reach the server. Please try again.")
    }

    return null
  }

  const [, formAction, isPending] = useActionState(resetPasswordAction, null)

  if (!token) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <h1 className="text-xl font-semibold">Link invalid or expired</h1>
          <p className="max-w-sm text-muted-foreground">
            Request a new password reset link and try again.
          </p>
          <Button asChild className="mt-2">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <form action={formAction}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="size-6 text-primary" />
              <h1 className="text-2xl font-bold">Set a new password</h1>
            </div>
            <Field>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <FieldDescription>Must be at least 8 characters long.</FieldDescription>
            </Field>
            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner className="size-4" />}
                Reset password
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
