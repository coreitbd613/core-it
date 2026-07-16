"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { Building2, Camera, Globe, Mail, MapPin } from "lucide-react"
import { toast } from "sonner"

import { useMockRole } from "@/contexts/mock-role-context"
import { CountrySelect } from "@/components/shared/country-select"
import { CitySelect, StateSelect } from "@/components/shared/location-select"
import { PhoneNumberInput } from "@/components/shared/phone-number-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024

type CompanyProfile = {
  name: string
  logoUrl: string | null
  industry: string
  description: string
  email: string
  phone: string
  website: string
  addressLine1: string
  addressLine2: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  taxId: string
}

const initialProfile: CompanyProfile = {
  name: "Acme Corp",
  logoUrl: null,
  industry: "Retail & E-commerce",
  description: "",
  email: "hello@acmecorp.com",
  phone: "+8801712345678",
  website: "https://acmecorp.com",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateProvince: "",
  postalCode: "",
  country: "BD",
  taxId: "",
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "C"
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("")
}

export default function CompanySettingsPage() {
  const { canManageCompany } = useMockRole()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState<CompanyProfile>(initialProfile)
  const [form, setForm] = useState<CompanyProfile>(initialProfile)
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved)

  function update<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleLogoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.error("Image must be smaller than 5MB.")
      return
    }

    const url = URL.createObjectURL(file)
    update("logoUrl", url)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    // Mock only — no backend call yet. Once approved, this becomes a real
    // PATCH against the Organization record.
    setTimeout(() => {
      setSaved(form)
      setIsSaving(false)
      toast.success("Company profile updated.")
    }, 400)
  }

  const initials = getInitials(form.name || "Company")

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Company profile</h1>
          <p className="text-muted-foreground">
            This information appears on proposals, invoices, and statements.
          </p>
        </div>
        {!canManageCompany && <Badge variant="secondary">View only</Badge>}
      </div>

      <fieldset disabled={!canManageCompany} className="contents">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Company details</CardTitle>
          <CardDescription>Your logo, name, and how clients/Core IT reach you.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Change company logo"
            >
              <Avatar className="size-20">
                {form.logoUrl ? <AvatarImage src={form.logoUrl} alt={form.name} /> : null}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Camera className="size-5 text-white" />
              </span>
            </button>
            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-fit"
              >
                Change logo
              </Button>
              <p className="text-xs text-muted-foreground">JPG or PNG, up to 5MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />
          </div>

          <Separator />

          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="company-name">Company name</FieldLabel>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company-name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Acme Corp"
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="company-industry">Industry</FieldLabel>
                <Input
                  id="company-industry"
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  placeholder="e.g. Retail, Manufacturing"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="company-description">About</FieldLabel>
              <Textarea
                id="company-description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="A short description of what your company does."
                rows={3}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="company-email">Company email</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="company-phone">Phone</FieldLabel>
                <PhoneNumberInput
                  id="company-phone"
                  value={form.phone}
                  onChange={(value) => update("phone", value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="company-website">Website</FieldLabel>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company-website"
                  type="url"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://"
                  className="pl-9"
                />
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Billing address</CardTitle>
          <CardDescription>Used on invoices and statements.</CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="company-address1">Address line 1</FieldLabel>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company-address1"
                  value={form.addressLine1}
                  onChange={(e) => update("addressLine1", e.target.value)}
                  placeholder="House, road, area"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="company-address2">Address line 2</FieldLabel>
              <Input
                id="company-address2"
                value={form.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
                placeholder="Apartment, suite, unit (optional)"
              />
              <FieldDescription>Optional.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="company-country">Country</FieldLabel>
              <CountrySelect
                id="company-country"
                value={form.country}
                onChange={(isoCode) => {
                  update("country", isoCode)
                  update("stateProvince", "")
                  update("city", "")
                }}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="company-state">State/Division</FieldLabel>
                <StateSelect
                  id="company-state"
                  countryIso={form.country}
                  value={form.stateProvince}
                  onChange={(value) => {
                    update("stateProvince", value)
                    update("city", "")
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-city">City</FieldLabel>
                <CitySelect
                  id="company-city"
                  countryIso={form.country}
                  stateName={form.stateProvince}
                  value={form.city}
                  onChange={(value) => update("city", value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-postal">Postal code</FieldLabel>
                <Input
                  id="company-postal"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="company-tax">Tax/Registration number</FieldLabel>
              <Input
                id="company-tax"
                value={form.taxId}
                onChange={(e) => update("taxId", e.target.value)}
                placeholder="Optional"
                className="max-w-sm"
              />
              <FieldDescription>Shown on invoices if provided.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>

        {canManageCompany && (
          <CardFooter className="justify-end border-t">
            <Button type="submit" disabled={!isDirty || isSaving}>
              {isSaving && <Spinner className="size-4" />}
              Save changes
            </Button>
          </CardFooter>
        )}
      </Card>
      </fieldset>
    </form>
  )
}
