"use client"

import * as React from "react"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { useClientAuth } from "@/contexts/client-auth-context"
import { useCreateDomainOrder, useDomainSearch } from "@/hooks/use-domains"
import { formatBDT, formatUSD } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { CountrySelect } from "@/components/shared/country-select"
import { CitySelect, StateSelect } from "@/components/shared/location-select"
import { PhoneNumberInput } from "@/components/shared/phone-number-input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

const YEAR_OPTIONS = [1, 2, 3, 5, 10]

const registrantSchema = z.object({
  registrantFirstName: z.string().trim().min(1, "Required"),
  registrantLastName: z.string().trim().min(1, "Required"),
  registrantAddress1: z.string().trim().min(1, "Required"),
  registrantAddress2: z.string().trim().optional(),
  registrantCity: z.string().trim().min(1, "Required"),
  registrantStateProvince: z.string().trim().min(1, "Required"),
  registrantPostalCode: z.string().trim().min(1, "Required"),
  registrantCountry: z.string().trim().min(1, "Required"),
  registrantPhone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "Enter a valid phone number"),
  registrantEmail: z.email("Enter a valid email"),
  years: z.coerce.number().int().min(1).max(10),
})

type RegistrantFormInput = z.input<typeof registrantSchema>
type RegistrantFormValues = z.output<typeof registrantSchema>

export function CheckoutForm() {
  const searchParams = useSearchParams()
  const domain = searchParams.get("domain") ?? ""
  const tld = searchParams.get("tld") ?? ""
  const { user } = useClientAuth()

  const { data: results, isFetching } = useDomainSearch(domain)
  const match = results?.find((result) => result.domain === domain)

  const createOrder = useCreateDomainOrder()

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrantFormInput, unknown, RegistrantFormValues>({
    resolver: zodResolver(registrantSchema),
    defaultValues: { years: 1, registrantPhone: "", registrantCountry: "BD" },
  })

  const registrantCountry = watch("registrantCountry") ?? ""
  const registrantStateProvince = watch("registrantStateProvince") ?? ""

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
      { domainName: domain, tld, ...values },
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
            <a href="/portal/domains">View my orders</a>
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
              <div className="font-semibold">{formatBDT(match.priceBdt)}/yr</div>
              <div className="text-xs text-muted-foreground">
                {formatUSD(match.priceUsd)}
              </div>
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
            <Field>
              <FieldLabel htmlFor="years">Registration length</FieldLabel>
              <NativeSelect id="years" {...register("years")}>
                {YEAR_OPTIONS.map((year) => (
                  <NativeSelectOption key={year} value={year}>
                    {year} {year === 1 ? "year" : "years"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Separator />

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
              <FieldLabel htmlFor="registrantAddress1">Address line 1</FieldLabel>
              <Input id="registrantAddress1" {...register("registrantAddress1")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="registrantAddress2">
                Address line 2 (optional)
              </FieldLabel>
              <Input id="registrantAddress2" {...register("registrantAddress2")} />
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

            <Field data-invalid={Boolean(errors.registrantPostalCode)}>
              <FieldLabel htmlFor="registrantPostalCode">Postal code</FieldLabel>
              <Input id="registrantPostalCode" className="max-w-xs" {...register("registrantPostalCode")} />
            </Field>

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
