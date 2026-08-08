"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangleIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { PhoneNumberInput } from "@/components/shared/phone-number-input"
import { useAdminLeads, useCreateLead, useUpdateLead } from "@/hooks/use-leads"
import { INDUSTRIES, leadSourceLabels, type Lead, type LeadSource } from "@/lib/leads"

export function LeadForm({
  mode,
  lead,
}: {
  mode: "create"
  lead?: undefined
} | {
  mode: "edit"
  lead: Lead
}) {
  const router = useRouter()
  const { data: existingLeads = [] } = useAdminLeads()
  const createLead = useCreateLead()
  const updateLead = useUpdateLead(lead?.id ?? "")

  const [contactName, setContactName] = React.useState(lead?.contactName ?? "")
  const [companyName, setCompanyName] = React.useState(lead?.companyName ?? "")
  const [email, setEmail] = React.useState(lead?.email ?? "")
  const [duplicateLead, setDuplicateLead] = React.useState<Lead | undefined>(undefined)
  const [phone, setPhone] = React.useState(lead?.phone ?? "")
  const [industry, setIndustry] = React.useState(lead?.industry ?? "")
  const [source, setSource] = React.useState<LeadSource>(lead?.source ?? "FACEBOOK_ADS")
  const [sourceDetail, setSourceDetail] = React.useState(lead?.sourceDetail ?? "")
  const [estimatedValueBdt, setEstimatedValueBdt] = React.useState(lead?.estimatedValueBdt ?? "")
  const [nextFollowUpAt, setNextFollowUpAt] = React.useState(lead?.nextFollowUpAt?.slice(0, 10) ?? "")
  const [tags, setTags] = React.useState<string[]>(lead?.tags ?? [])
  const [tagInput, setTagInput] = React.useState("")
  const [initialNote, setInitialNote] = React.useState("")

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag])
    }
    setTagInput("")
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function findDuplicate(emailValue: string): Lead | undefined {
    const normalized = emailValue.trim().toLowerCase()
    if (!normalized) return undefined
    return existingLeads.find(
      (l) => l.id !== lead?.id && l.email?.toLowerCase() === normalized
    )
  }

  const isPending = createLead.isPending || updateLead.isPending

  function handleSubmit() {
    if (!contactName.trim()) {
      toast.error("Enter a contact name.")
      return
    }

    if (mode === "edit") {
      updateLead.mutate(
        {
          contactName: contactName.trim(),
          companyName: companyName.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          industry: industry || null,
          source,
          sourceDetail: sourceDetail.trim() || null,
          estimatedValueBdt: estimatedValueBdt ? Number(estimatedValueBdt) : null,
          nextFollowUpAt: nextFollowUpAt || null,
          tags,
        },
        {
          onSuccess: () => {
            toast.success("Lead updated.")
            router.push(`/admin/leads/${lead!.id}`)
          },
          onError: (error) =>
            toast.error(error instanceof Error ? error.message : "Couldn't update this lead."),
        }
      )
      return
    }

    createLead.mutate(
      {
        contactName: contactName.trim(),
        companyName: companyName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        industry: industry || undefined,
        source,
        sourceDetail: sourceDetail.trim() || undefined,
        estimatedValueBdt: estimatedValueBdt ? Number(estimatedValueBdt) : undefined,
        nextFollowUpAt: nextFollowUpAt || undefined,
        tags,
        initialNote: initialNote.trim() || undefined,
      },
      {
        onSuccess: (newLead) => {
          toast.success("Lead created.")
          router.push(`/admin/leads/${newLead.id}`)
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't create this lead."),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{mode === "edit" ? "Edit lead" : "New lead"}</h1>
        <p className="text-muted-foreground">
          {mode === "edit" ? "Update this lead's details." : "Capture a new inbound lead."}
        </p>
      </div>

      <div className="flex max-w-5xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <Field>
                  <FieldLabel htmlFor="lead-contact-name">Contact name</FieldLabel>
                  <Input
                    id="lead-contact-name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lead-company">Company</FieldLabel>
                  <Input
                    id="lead-company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lead-email">Email</FieldLabel>
                  <Input
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setDuplicateLead(undefined)
                    }}
                    onBlur={(e) => {
                      if (mode === "create") {
                        setDuplicateLead(findDuplicate(e.target.value))
                      }
                    }}
                    placeholder="jane@acme.com"
                  />
                  {mode === "create" && duplicateLead && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <AlertTriangleIcon className="size-3.5 shrink-0" />
                      Exists:{" "}
                      <Link href={`/admin/leads/${duplicateLead.id}`} className="underline">
                        {duplicateLead.contactName}
                      </Link>
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="lead-phone">Phone</FieldLabel>
                  <PhoneNumberInput id="lead-phone" value={phone} onChange={setPhone} autoComplete="tel" />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qualification</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="lead-industry">Industry</FieldLabel>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="lead-industry" className="w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="lead-source">Source</FieldLabel>
                  <Select value={source} onValueChange={(value) => setSource(value as LeadSource)}>
                    <SelectTrigger id="lead-source" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(leadSourceLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="lead-source-detail">Source detail</FieldLabel>
                <Input
                  id="lead-source-detail"
                  value={sourceDetail}
                  onChange={(e) => setSourceDetail(e.target.value)}
                  placeholder="e.g. campaign name, referrer, event name"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="lead-value">Estimated value (BDT)</FieldLabel>
                  <Input
                    id="lead-value"
                    type="number"
                    min={0}
                    value={estimatedValueBdt}
                    onChange={(e) => setEstimatedValueBdt(e.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lead-follow-up">Next follow-up</FieldLabel>
                  <DatePickerField id="lead-follow-up" value={nextFollowUpAt} onChange={setNextFollowUpAt} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="lead-tags">Tags</FieldLabel>
                <div
                  className="flex flex-wrap items-center gap-1.5 rounded-md border px-2.5 py-1.5"
                  onClick={() => document.getElementById("lead-tags")?.focus()}
                >
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeTag(tag)
                        }}
                        aria-label={`Remove ${tag}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    id="lead-tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        addTag()
                      } else if (e.key === "Backspace" && !tagInput && tags.length) {
                        removeTag(tags[tags.length - 1])
                      }
                    }}
                    onBlur={addTag}
                    placeholder={tags.length ? "" : "Add tags and press Enter..."}
                    className="min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </Field>
              {mode === "create" && (
                <Field>
                  <FieldLabel htmlFor="lead-initial-note">Initial note</FieldLabel>
                  <Textarea
                    id="lead-initial-note"
                    value={initialNote}
                    onChange={(e) => setInitialNote(e.target.value)}
                    placeholder="Any context from the first conversation..."
                    rows={3}
                  />
                </Field>
              )}
            </FieldGroup>
          </CardContent>
          <CardFooter className="border-t">
            <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
              {mode === "edit" ? "Save changes" : "Create lead"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
