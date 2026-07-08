"use client"

import * as React from "react"
import { useActionState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/shared/password-input"
import { Spinner } from "@/components/ui/spinner"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  async function loginAction(_state: null, formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

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
        return null
      }

      router.push(redirect ?? "/dashboard")
      router.refresh()
    } catch {
      toast.error("Couldn't reach the server. Please try again.")
    }

    return null
  }

  const [, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Link href="/" className="flex h-10 items-center justify-center" aria-label="CORE IT home">
        <Image
          src="/logo-light.png"
          alt="CORE IT"
          width={160}
          height={101}
          priority
          className="h-32 w-auto dark:hidden"
        />
        <Image
          src="/logo-dark.png"
          alt="CORE IT"
          width={160}
          height={101}
          priority
          className="hidden h-32 w-auto dark:block"
        />
      </Link>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" action={formAction}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your CORE IT account
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
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit"  disabled={isPending}>
                  {isPending && <Spinner className="size-4" />}
                  Login
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <Button variant="outline"  type="button" className="w-full" asChild>
                  <a href={`${API_URL}/auth/google`}>
                    <FcGoogle className="size-4" />
                    Continue with Google
                  </a>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href="/signup">Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden md:block">
            <Image
              src="/Login.svg"
              alt="CORE IT"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 0px"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <Link href="/terms">Terms of Service</Link>{" "}
        and <Link href="/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
