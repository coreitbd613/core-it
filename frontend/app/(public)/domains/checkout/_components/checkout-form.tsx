"use client"

import * as React from "react"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { useClientAuth } from "@/contexts/client-auth-context"
import { useCreateDomainOrder, useDomainSearch } from "@/hooks/use-domains"
import { formatBDT } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CountrySelect } from "@/components/shared/country-select"
import { CitySelect, StateSelect } from "@/components/shared/location-select"
import { PhoneNumberInput } from "@/components/shared/phone-number-input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

const registrantSchema = z.object({
  registrantFirstName: z.string().trim().min(1, "Required"),
  registrantLastName: z.string().trim().min(1, "Required"),
  registrantAddress1: z.string().trim().min(1, "Required"),
  registrantCity: z.string().trim().min(1, "Required"),
  registrantStateProvince: z.string().trim().min(1, "Required"),
  registrantCountry: z.string().trim().min(1, "Required"),
  registrantPhone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "Enter a valid phone number"),
  registrantEmail: z.email("Enter a valid email"),
})

type RegistrantFormInput = z.input<typeof registrantSchema>
type RegistrantFormValues = z.output<typeof registrantSchema>

export function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const domain = searchParams.get("domain") ?? ""
  const tld = searchParams.get("tld") ?? ""
  const checkoutPath = `/domains/checkout?${searchParams.toString()}`
  const { user, isPending: isAuthPending } = useClientAuth()

  const { data: results, isFetching } = useDomainSearch(domain)
  const match = results?.find((result) => result.domain === domain)

  const createOrder = useCreateDomainOrder()

  const {
    register,
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrantFormInput, unknown, RegistrantFormValues>({
    resolver: zodResolver(registrantSchema),
    defaultValues: { registrantPhone: "", registrantCountry: "BD" },
  })

  const registrantCountry = useWatch({ control, name: "registrantCountry" }) ?? ""
  const registrantStateProvince =
    useWatch({ control, name: "registrantStateProvince" }) ?? ""

  useEffect(() => {
    if (!isAuthPending && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(checkoutPath)}`)
    }
  }, [checkoutPath, isAuthPending, router, user])

  useEffect(() => {
    if (user) {
      const [firstName, ...rest] = (user.name ?? "").split(" ")
      reset((current) => ({
        ...current,
        registrantFirstName: firstName ?? "",
        registrantLastName: rest.join(" "),
        registrantEmail: user.email,
      }))
    }
  }, [user, reset])

  function onSubmit(values: RegistrantFormValues) {
    createOrder.mutate(
      { domainName: domain, tld, years: 1, ...values },
      {
        onError: (error) => toast.error(error.message),
      },
    )
  }

  if (!domain) {
    return (
      <p className="text-center text-muted-foreground">
        No domain selected.{" "}
        <a href="/domains" className="underline">
          Go back to search
        </a>
        .
      </p>
    )
  }

  if (isAuthPending || !user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Checking your session...</p>
        </CardContent>
      </Card>
    )
  }

  if (createOrder.isSuccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2 className="size-10 text-primary" />
          <h1 className="text-xl font-semibold">Order received</h1>
          <p className="max-w-sm text-muted-foreground">
            We&apos;ve received your order for <strong>{domain}</strong>.
            We&apos;ll process your registration and follow up shortly.
          </p>
          <Button asChild className="mt-2">
            <a href="/portal/domains/orders">View my orders</a>
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
          <span className="font-medium">{domain}</span>
          {isFetching ? (
            <Skeleton className="h-5 w-20" />
          ) : match?.available ? (
            <div className="text-right">
              <div className="font-semibold">
                {formatBDT(match.priceBdt)}/year
              </div>
              {match.renewalPriceBdt > 0 && (
                <div className="text-xs text-muted-foreground">
                  Renewal {formatBDT(match.renewalPriceBdt)}/year
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-destructive">No longer available</span>
          )}
        </div>

        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.registrantFirstName)}>
                <FieldLabel htmlFor="registrantFirstName">First name</FieldLabel>
                <Input id="registrantFirstName" {...register("registrantFirstName")} />
              </Field>
              <Field data-invalid={Boolean(errors.registrantLastName)}>
                <FieldLabel htmlFor="registrantLastName">Last name</FieldLabel>
                <Input id="registrantLastName" {...register("registrantLastName")} />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.registrantAddress1)}>
              <FieldLabel htmlFor="registrantAddress1">Address line</FieldLabel>
              <Input id="registrantAddress1" {...register("registrantAddress1")} />
            </Field>

            <Field data-invalid={Boolean(errors.registrantCountry)}>
              <FieldLabel htmlFor="registrantCountry">Country</FieldLabel>
              <Controller
                name="registrantCountry"
                control={control}
                render={({ field }) => (
                  <CountrySelect
                    id="registrantCountry"
                    value={field.value ?? ""}
                    onChange={(isoCode) => {
                      field.onChange(isoCode)
                      setValue("registrantStateProvince", "")
                      setValue("registrantCity", "")
                    }}
                    aria-invalid={Boolean(errors.registrantCountry)}
                  />
                )}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.registrantStateProvince)}>
                <FieldLabel htmlFor="registrantStateProvince">
                  State / Province
                </FieldLabel>
                <Controller
                  name="registrantStateProvince"
                  control={control}
                  render={({ field }) => (
                    <StateSelect
                      id="registrantStateProvince"
                      countryIso={registrantCountry}
                      value={field.value ?? ""}
                      onChange={(value) => {
                        field.onChange(value)
                        setValue("registrantCity", "")
                      }}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(errors.registrantStateProvince)}
                    />
                  )}
                />
              </Field>
              <Field data-invalid={Boolean(errors.registrantCity)}>
                <FieldLabel htmlFor="registrantCity">City</FieldLabel>
                <Controller
                  name="registrantCity"
                  control={control}
                  render={({ field }) => (
                    <CitySelect
                      id="registrantCity"
                      countryIso={registrantCountry}
                      stateName={registrantStateProvince}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(errors.registrantCity)}
                    />
                  )}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.registrantPhone)}>
                <FieldLabel htmlFor="registrantPhone">Phone</FieldLabel>
                <Controller
                  name="registrantPhone"
                  control={control}
                  render={({ field }) => (
                    <PhoneNumberInput
                      id="registrantPhone"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(errors.registrantPhone)}
                    />
                  )}
                />
              </Field>
              <Field data-invalid={Boolean(errors.registrantEmail)}>
                <FieldLabel htmlFor="registrantEmail">Email</FieldLabel>
                <Input id="registrantEmail" type="email" {...register("registrantEmail")} />
              </Field>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          type="submit"
          form="checkout-form"
          
          disabled={createOrder.isPending || match?.available === false}
        >
          {createOrder.isPending && <Spinner className="size-4" />}
          Place order
        </Button>
      </CardFooter>
    </Card>
  )
}
