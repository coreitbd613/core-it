"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { LEAD_OWNERS, leadSourceLabels, mockLeads, type Lead, type LeadSource } from "@/lib/mock/leads"

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
  const [contactName, setContactName] = React.useState(lead?.contactName ?? "")
  const [companyName, setCompanyName] = React.useState(lead?.companyName ?? "")
  const [email, setEmail] = React.useState(lead?.email ?? "")
  const [phone, setPhone] = React.useState(lead?.phone ?? "")
  const [source, setSource] = React.useState<LeadSource>(lead?.source ?? "WEBSITE")
  const [ownerName, setOwnerName] = React.useState(lead?.ownerName ?? "unassigned")
  const [estimatedValueBdt, setEstimatedValueBdt] = React.useState(
    lead?.estimatedValueBdt?.toString() ?? ""
  )
  const [nextFollowUpAt, setNextFollowUpAt] = React.useState(lead?.nextFollowUpAt ?? "")

  function handleSubmit() {
    if (!contactName.trim()) {
      toast.error("Enter a contact name.")
      return
    }

    const fields = {
      contactName: contactName.trim(),
      companyName: companyName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      source,
      ownerName: ownerName === "unassigned" ? null : ownerName,
      estimatedValueBdt: estimatedValueBdt ? Number(estimatedValueBdt) : null,
      nextFollowUpAt: nextFollowUpAt || null,
    }

    if (mode === "edit") {
      Object.assign(lead!, fields, { updatedAt: new Date().toISOString() })
      toast.success("Lead updated.")
      router.push(`/admin/leads/${lead!.id}`)
      return
    }

    const id = crypto.randomUUID()
    mockLeads.unshift({
      id,
      stage: "NEW",
      convertedAt: null,
      lostReason: null,
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...fields,
    })

    toast.success("Lead created.")
    router.push(`/admin/leads/${id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{mode === "edit" ? "Edit lead" : "New lead"}</h1>
        <p className="text-muted-foreground">
          {mode === "edit" ? "Update this lead's details." : "Capture a new inbound lead."}
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Lead details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
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
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="lead-email">Email</FieldLabel>
                  <Input
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@acme.com"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lead-phone">Phone</FieldLabel>
                  <Input
                    id="lead-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
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
                <Field>
                  <FieldLabel htmlFor="lead-owner">Owner</FieldLabel>
                  <Select value={ownerName} onValueChange={setOwnerName}>
                    <SelectTrigger id="lead-owner" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {LEAD_OWNERS.map((owner) => (
                        <SelectItem key={owner} value={owner}>
                          {owner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
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
                  <Input
                    id="lead-follow-up"
                    type="date"
                    value={nextFollowUpAt}
                    onChange={(e) => setNextFollowUpAt(e.target.value)}
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
          <CardFooter className="border-t">
            <Button className="w-full" onClick={handleSubmit}>
              {mode === "edit" ? "Save changes" : "Create lead"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
