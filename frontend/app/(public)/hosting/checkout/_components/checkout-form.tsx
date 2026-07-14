"use client"

import * as React from "react"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { useClientAuth } from "@/contexts/client-auth-context"
import { useCreateHostingOrder, useHostingPlans } from "@/hooks/use-hosting"
import { formatBDT, formatUSD } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/

const orderSchema = z.object({
  fullName: z.string().trim().min(1, "Required"),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number").regex(PHONE_REGEX, "Enter a valid phone number"),
  company: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

type OrderFormValues = z.infer<typeof orderSchema>

export function CheckoutForm() {
  const searchParams = useSearchParams()
  const planSlug = searchParams.get("plan") ?? ""
  const { user } = useClientAuth()

  const { data: plans, isPending: plansPending } = useHostingPlans()
  const plan = plans?.find((item) => item.slug === planSlug)

  const createOrder = useCreateHostingOrder()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
  })

  useEffect(() => {
    if (user) {
      reset((current) => ({
        ...current,
        fullName: user.name ?? "",
        email: user.email,
      }))
    }
  }, [user, reset])

  function onSubmit(values: OrderFormValues) {
    createOrder.mutate(
      { planSlug, ...values },
      {
        onError: (error) => toast.error(error.message),
      },
    )
  }

  if (!planSlug) {
    return (
      <p className="text-center text-muted-foreground">
        No plan selected.{" "}
        <a href="/hosting" className="underline">
          Go back to plans
        </a>
        .
      </p>
    )
  }

  if (createOrder.isSuccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2 className="size-10 text-primary" />
          <h1 className="text-xl font-semibold">Order received</h1>
          <p className="max-w-sm text-muted-foreground">
            We&apos;ve received your VPS order. We&apos;ll set up your server
            and follow up shortly.
          </p>
          <Button asChild className="mt-2">
            <a href="/hosting/orders">View my orders</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm your order</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          {plansPending ? (
            <Skeleton className="h-5 w-32" />
          ) : plan ? (
            <>
              <div>
                <span className="font-medium">{plan.name}</span>
                <div className="text-xs text-muted-foreground">
                  {plan.vcpu} vCPU · {plan.ramGb} GB RAM · {plan.storageGb} GB SSD
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatBDT(plan.priceBdt)}/mo</div>
                <div className="text-xs text-muted-foreground">
                  {formatUSD(plan.priceUsd)}/mo
                </div>
              </div>
            </>
          ) : (
            <span className="text-sm text-destructive">Plan not found</span>
          )}
        </div>

        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.fullName)}>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input id="fullName" {...register("fullName")} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" {...register("email")} />
              </Field>
              <Field data-invalid={Boolean(errors.phone)}>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+880 1XXX-XXXXXX"
                  {...register("phone")}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="company">Company (optional)</FieldLabel>
              <Input id="company" {...register("company")} />
            </Field>

            <Separator />

            <Field>
              <FieldLabel htmlFor="notes">
                Setup requirements (optional)
              </FieldLabel>
              <Textarea
                id="notes"
                placeholder="Preferred OS, control panel, use case, etc."
                {...register("notes")}
              />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          type="submit"
          form="checkout-form"
          disabled={createOrder.isPending || !plan}
        >
          {createOrder.isPending && <Spinner className="size-4" />}
          Place order
        </Button>
      </CardFooter>
    </Card>
  )
}
