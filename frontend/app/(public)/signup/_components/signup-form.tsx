"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { Spinner } from "@/components/ui/spinner"
import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords don't match.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string
        } | null
        toast.error(body?.message ?? "Couldn't create your account.")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      toast.error("Couldn't reach the server. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Enter your details below to create your account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={8}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      minLength={8}
                      required
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner className="size-4" />}
                  Create Account
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <Button variant="outline" type="button" className="w-full" asChild>
                  <a href={`${API_URL}/auth/google`}>
                    <GoogleIcon className="size-4" />
                    Continue with Google
                  </a>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/login">Sign in</Link>
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
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.31A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.58.38-2.31v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.6l4.01 3.1c.94-2.83 3.59-4.95 6.71-4.95Z"
      />
    </svg>
  )
}
