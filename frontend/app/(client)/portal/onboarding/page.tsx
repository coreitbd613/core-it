"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/ui/border-beam"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export default function OnboardingPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = React.useState("")
  const [isPending, setIsPending] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!companyName.trim()) return

    setIsPending(true)
    // Mock only — no backend call yet. Once approved, this becomes a
    // real POST that creates the Organization + Membership(OWNER).
    await new Promise((resolve) => setTimeout(resolve, 400))
    toast.success(`${companyName} is ready.`)
    router.push("/portal/dashboard")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className={cn("flex w-full max-w-md flex-col gap-6")}>
        <Image
          src="/logo-light.png"
          alt="CORE IT"
          width={527}
          height={135}
          priority
          className="mx-auto h-10 w-auto dark:hidden"
        />
        <Image
          src="/logo-dark.png"
          alt="CORE IT"
          width={527}
          height={135}
          priority
          className="mx-auto hidden h-10 w-auto dark:block"
        />
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
                  <h1 className="text-2xl font-bold">Name your company</h1>
                  <p className="text-balance text-muted-foreground">
                    This is your company workspace — you&apos;ll be its owner and can
                    invite your team next.
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="companyName">Company name</FieldLabel>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Acme Corp"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isPending}
                    autoFocus
                  />
                  <FieldDescription>
                    You can change this later in company settings.
                  </FieldDescription>
                </Field>
                <Field>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Spinner className="size-4" />}
                    Continue
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
