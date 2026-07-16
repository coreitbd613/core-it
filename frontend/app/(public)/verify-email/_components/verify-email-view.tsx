"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { currentUserKey } from "@/hooks/use-current-user"
import type { CurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

type Status = "verifying" | "success" | "error"

export function VerifyEmailView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<Status>(token ? "verifying" : "error")
  const [isResending, setIsResending] = useState(false)
  const requestedRef = useRef(false)

  useEffect(() => {
    if (!token || requestedRef.current) {
      return
    }
    requestedRef.current = true

    async function verify() {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (!res.ok) {
          setStatus("error")
          return
        }

        const user = (await res.json()) as CurrentUser
        queryClient.setQueryData(currentUserKey("client"), user)
        setStatus("success")
      } catch {
        setStatus("error")
      }
    }

    void verify()
  }, [token, queryClient])

  useEffect(() => {
    if (status !== "success") {
      return
    }
    const timeout = setTimeout(() => {
      router.push("/onboarding")
      router.refresh()
    }, 1500)
    return () => clearTimeout(timeout)
  }, [status, router])

  async function handleResend(formData: FormData) {
    const email = formData.get("email") as string
    setIsResending(true)
    try {
      await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      toast.success("If that email is registered, a new link is on its way.")
    } catch {
      toast.error("Couldn't reach the server. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        {status === "verifying" && (
          <>
            <Spinner className="size-8 text-primary" />
            <h1 className="text-xl font-semibold">Verifying your email...</h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="size-10 text-green-600 dark:text-green-500" />
            <h1 className="text-xl font-semibold">Email verified</h1>
            <p className="max-w-sm text-muted-foreground">
              Your account is active. Let&apos;s set up your company...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="size-10 text-destructive" />
            <h1 className="text-xl font-semibold">Link invalid or expired</h1>
            <p className="max-w-sm text-muted-foreground">
              This verification link no longer works. Enter your email below to get a new one.
            </p>
            <form
              action={handleResend}
              className="mt-4 flex w-full max-w-xs flex-col gap-3"
            >
              <Input
                name="email"
                type="email"
                required
                placeholder="m@example.com"
              />
              <Button type="submit" disabled={isResending}>
                {isResending && <Spinner className="size-4" />}
                Resend verification email
              </Button>
            </form>
            <Button variant="outline" asChild className="mt-2">
              <Link href="/login">Back to login</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
