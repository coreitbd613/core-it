"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { Building2, Camera, Globe, Mail, MapPin, ScrollText } from "lucide-react"
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa"
import { toast } from "sonner"

import { useMockRole } from "@/contexts/mock-role-context"
import {
  useMyOrganization,
  useUpdateOrganization,
  useUploadOrganizationLogo,
} from "@/hooks/use-organization"
import type { Organization, UpdateOrganizationInput } from "@/lib/organizations"
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
  city: string
  stateProvince: string
  country: string
  tradeLicense: string
  tin: string
  bin: string
  whatsappBusiness: string
  facebookPage: string
  instagramPage: string
  linkedinPage: string
}

const emptyProfile: CompanyProfile = {
  name: "",
  logoUrl: null,
  industry: "",
  description: "",
  email: "",
  phone: "",
  website: "",
  addressLine1: "",
  city: "",
  stateProvince: "",
  country: "BD",
  tradeLicense: "",
  tin: "",
  bin: "",
  whatsappBusiness: "",
  facebookPage: "",
  instagramPage: "",
  linkedinPage: "",
}

function toProfile(organization: Organization): CompanyProfile {
  return {
    name: organization.name,
    logoUrl: organization.logoUrl,
    industry: organization.industry ?? "",
    description: organization.description ?? "",
    email: organization.email ?? "",
    phone: organization.phone ?? "",
    website: organization.website ?? "",
    addressLine1: organization.addressLine1 ?? "",
    city: organization.city ?? "",
    stateProvince: organization.stateProvince ?? "",
    country: organization.country ?? "BD",
    tradeLicense: organization.tradeLicense ?? "",
    tin: organization.tin ?? "",
    bin: organization.bin ?? "",
    whatsappBusiness: organization.whatsappBusiness ?? "",
    facebookPage: organization.facebookPage ?? "",
    instagramPage: organization.instagramPage ?? "",
    linkedinPage: organization.linkedinPage ?? "",
  }
}

// @IsUrl()/@IsEmail() on the backend reject empty strings, so blank optional
// fields are omitted from the payload rather than sent as "".
function toUpdateInput(form: CompanyProfile): UpdateOrganizationInput {
  const input: UpdateOrganizationInput = {
    name: form.name,
    industry: form.industry || undefined,
    description: form.description || undefined,
    email: form.email || undefined,
    phone: form.phone || undefined,
    website: form.website || undefined,
    addressLine1: form.addressLine1 || undefined,
    city: form.city || undefined,
    stateProvince: form.stateProvince || undefined,
    country: form.country || undefined,
    tradeLicense: form.tradeLicense || undefined,
    tin: form.tin || undefined,
    bin: form.bin || undefined,
    whatsappBusiness: form.whatsappBusiness || undefined,
    facebookPage: form.facebookPage || undefined,
    instagramPage: form.instagramPage || undefined,
    linkedinPage: form.linkedinPage || undefined,
  }
  return input
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "C"
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("")
}

export default function CompanySettingsPage() {
  const { canManageCompany } = useMockRole()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: organization, isLoading } = useMyOrganization()
  const updateOrganization = useUpdateOrganization()
  const uploadLogo = useUploadOrganizationLogo()

  const [saved, setSaved] = useState<CompanyProfile>(emptyProfile)
  const [form, setForm] = useState<CompanyProfile>(emptyProfile)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  React.useEffect(() => {
    if (!organization) return
    const profile = toProfile(organization)
    setSaved(profile)
    setForm(profile)
    setHasLoadedOnce(true)
  }, [organization])

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved)

  function update<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleLogoSelect(event: React.ChangeEvent<HTMLInputElement>) {
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

    try {
      const updated = await uploadLogo.mutateAsync(file)
      update("logoUrl", updated.logoUrl)
      setSaved((prev) => ({ ...prev, logoUrl: updated.logoUrl }))
      toast.success("Logo updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't upload your logo.")
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const updated = await updateOrganization.mutateAsync(toUpdateInput(form))
      const profile = toProfile(updated)
      setSaved(profile)
      setForm(profile)
      toast.success("Company profile updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save your company profile.")
    }
  }

  const isSaving = updateOrganization.isPending
  const initials = getInitials(form.name || "Company")

  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Company profile</h1>
          <p className="text-muted-foreground">
            This information appears on proposals, invoices, and statements.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!canManageCompany ? (
            <Badge variant="secondary">View only</Badge>
          ) : (
            <Button type="submit" disabled={!isDirty || isSaving}>
              {isSaving && <Spinner className="size-4" />}
              Save changes
            </Button>
          )}
        </div>
      </div>

      <fieldset disabled={!canManageCompany} className="contents">
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
      <div className="flex flex-col gap-6 lg:col-span-2">
      <Card>
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

      <Card>
        <CardHeader>
          <CardTitle>Billing address</CardTitle>
          <CardDescription>Used on invoices and statements.</CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="company-address1">Address line</FieldLabel>
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
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
      </div>

      <div className="flex flex-col gap-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Legal & tax</CardTitle>
            <CardDescription>Shown on invoices and used for compliance.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="company-trade-license">Trade license number</FieldLabel>
                <div className="relative">
                  <ScrollText className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company-trade-license"
                    value={form.tradeLicense}
                    onChange={(e) => update("tradeLicense", e.target.value)}
                    placeholder="Optional"
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="company-tin">TIN</FieldLabel>
                <Input
                  id="company-tin"
                  value={form.tin}
                  onChange={(e) => update("tin", e.target.value)}
                  placeholder="Taxpayer Identification Number"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-bin">BIN</FieldLabel>
                <Input
                  id="company-bin"
                  value={form.bin}
                  onChange={(e) => update("bin", e.target.value)}
                  placeholder="Business Identification Number"
                />
                <FieldDescription>VAT registration number.</FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social</CardTitle>
            <CardDescription>How clients can find you online.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="company-whatsapp-business">WhatsApp business number</FieldLabel>
                <PhoneNumberInput
                  id="company-whatsapp-business"
                  value={form.whatsappBusiness}
                  onChange={(value) => update("whatsappBusiness", value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-facebook">Facebook page</FieldLabel>
                <div className="relative">
                  <FaFacebook className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company-facebook"
                    type="url"
                    value={form.facebookPage}
                    onChange={(e) => update("facebookPage", e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="company-instagram">Instagram page</FieldLabel>
                <div className="relative">
                  <FaInstagram className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company-instagram"
                    type="url"
                    value={form.instagramPage}
                    onChange={(e) => update("instagramPage", e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="company-linkedin">LinkedIn page</FieldLabel>
                <div className="relative">
                  <FaLinkedin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="company-linkedin"
                    type="url"
                    value={form.linkedinPage}
                    onChange={(e) => update("linkedinPage", e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                    className="pl-9"
                  />
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
      </div>

      </fieldset>
    </form>
  )
}
