"use client"

import * as React from "react"
import { useActionState, useState } from "react"
import Link from "next/link"
import { MailCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  async function forgotPasswordAction(_state: null, formData: FormData) {
    const email = formData.get("email") as string

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        toast.error("Couldn't send the reset link. Please try again.")
        return null
      }

      setSubmittedEmail(email)
    } catch {
      toast.error("Couldn't reach the server. Please try again.")
    }

    return null
  }

  const [, formAction, isPending] = useActionState(forgotPasswordAction, null)

  if (submittedEmail) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <MailCheck className="size-10 text-primary" />
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="max-w-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{submittedEmail}</span>, we&apos;ve
            sent a link to reset your password.
          </p>
          <Button asChild className="mt-2">
            <Link href="/login">Back to login</Link>
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
              <h1 className="text-2xl font-bold">Forgot your password?</h1>
              <p className="text-sm text-balance text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner className="size-4" />}
                Send reset link
              </Button>
            </Field>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login">Back to login</Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
