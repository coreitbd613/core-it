"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, Trash2Icon } from "lucide-react"
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
import { RichTextEditor } from "@/components/shared/rich-text-editor"
import { formatBDT } from "@/lib/format"
import { mockOrganizations } from "@/lib/mock/organizations"
import { mockProposalTemplates } from "@/lib/mock/proposal-templates"
import { defaultProposalTermsHtml } from "@/lib/mock/proposal-terms"
import {
  mockProposals,
  nextProposalNumber,
  proposalGrandTotalBdt,
  proposalTotalBdt,
  type Proposal,
  type ProposalLineItem,
} from "@/lib/mock/proposals"

type DraftLineItem = ProposalLineItem

function newLineItem(): DraftLineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, unitPriceBdt: 0 }
}

function defaultValidUntil() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

export function ProposalForm({
  mode,
  proposal,
}: {
  mode: "create"
  proposal?: undefined
} | {
  mode: "edit"
  proposal: Proposal
}) {
  const router = useRouter()
  const [organizationId, setOrganizationId] = React.useState(
    proposal?.organizationId ?? mockOrganizations[0]?.id ?? ""
  )
  const [proposalNumber] = React.useState(() => proposal?.proposalNumber ?? nextProposalNumber())
  const [title, setTitle] = React.useState(proposal?.title ?? "")
  const [descriptionHtml, setDescriptionHtml] = React.useState(proposal?.descriptionHtml ?? "")
  const [lineItems, setLineItems] = React.useState<DraftLineItem[]>(
    proposal?.lineItems ?? [newLineItem()]
  )
  const [taxPercent, setTaxPercent] = React.useState(proposal?.taxPercent ?? 0)
  const [discountPercent, setDiscountPercent] = React.useState(proposal?.discountPercent ?? 0)
  const [paymentTerms, setPaymentTerms] = React.useState(proposal?.paymentTerms ?? "")
  const [timeline, setTimeline] = React.useState(proposal?.timeline ?? "")
  const [termsHtml, setTermsHtml] = React.useState(proposal?.termsHtml ?? defaultProposalTermsHtml)
  const [validUntil, setValidUntil] = React.useState(proposal?.validUntil ?? defaultValidUntil())
  const [templateId, setTemplateId] = React.useState("blank")

  function applyTemplate(id: string) {
    setTemplateId(id)
    const template = mockProposalTemplates.find((t) => t.id === id)
    if (!template) return

    setDescriptionHtml(template.descriptionHtml)
    setLineItems(template.lineItems.map((item) => ({ ...item, id: crypto.randomUUID() })))
    setTaxPercent(template.taxPercent)
    setDiscountPercent(template.discountPercent)
    setPaymentTerms(template.paymentTerms)
    setTimeline(template.timeline)
  }

  const subtotal = proposalTotalBdt({ lineItems })
  const total = proposalGrandTotalBdt({ lineItems, taxPercent, discountPercent })
  const discountAmount = subtotal * (discountPercent / 100)
  const taxAmount = (subtotal - discountAmount) * (taxPercent / 100)

  function updateLineItem<K extends keyof DraftLineItem>(id: string, key: K, value: DraftLineItem[K]) {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  function removeLineItem(id: string) {
    setLineItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleSubmit(status: "DRAFT" | "SENT") {
    const organization = mockOrganizations.find((org) => org.id === organizationId)
    if (!organization || !title.trim() || lineItems.length === 0) {
      toast.error("Fill in a company, title, and at least one line item.")
      return
    }

    const fields = {
      organizationId: organization.id,
      organizationName: organization.name,
      title: title.trim(),
      descriptionHtml,
      lineItems,
      taxPercent,
      discountPercent,
      paymentTerms: paymentTerms.trim(),
      timeline: timeline.trim(),
      termsHtml,
      validUntil: validUntil || null,
      status,
    }

    if (mode === "edit") {
      Object.assign(proposal!, fields, {
        sentAt: status === "SENT" ? new Date().toISOString().slice(0, 10) : proposal!.sentAt,
      })
      toast.success(status === "SENT" ? "Proposal sent." : "Proposal updated.")
      router.push(`/admin/proposals/${proposal!.id}`)
      return
    }

    const id = crypto.randomUUID()
    mockProposals.unshift({
      id,
      proposalNumber,
      versionGroupId: id,
      version: 1,
      createdBy: "Core IT",
      sentAt: status === "SENT" ? new Date().toISOString().slice(0, 10) : null,
      respondedAt: null,
      viewedAt: null,
      contractId: null,
      convertedInvoiceId: null,
      ...fields,
    })

    toast.success(status === "SENT" ? "Proposal sent." : "Proposal saved as draft.")
    router.push("/admin/proposals")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{mode === "edit" ? "Edit proposal" : "New proposal"}</h1>
        <p className="text-muted-foreground">
          {mode === "edit"
            ? "Update this draft before sending it."
            : "Build a proposal and send it to a company."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Proposal details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {mode === "create" && (
                  <Field>
                    <FieldLabel htmlFor="proposal-template">Start from a template</FieldLabel>
                    <Select value={templateId} onValueChange={applyTemplate}>
                      <SelectTrigger id="proposal-template" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blank">Blank proposal</SelectItem>
                        {mockProposalTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="proposal-org">Company</FieldLabel>
                    <Select value={organizationId} onValueChange={setOrganizationId}>
                      <SelectTrigger id="proposal-org" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockOrganizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="proposal-number">Proposal number</FieldLabel>
                    <Input id="proposal-number" value={proposalNumber} disabled />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field className="sm:col-span-2">
                    <FieldLabel htmlFor="proposal-title">Title</FieldLabel>
                    <Input
                      id="proposal-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E-commerce platform revamp"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="proposal-description">Scope</FieldLabel>
                  <RichTextEditor
                    id="proposal-description"
                    value={descriptionHtml}
                    onChange={setDescriptionHtml}
                    placeholder="Describe the problem, what you'll build, and your approach."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="proposal-terms">Terms & Conditions</FieldLabel>
                  <RichTextEditor
                    id="proposal-terms"
                    value={termsHtml}
                    onChange={setTermsHtml}
                    placeholder="Revision policy, IP clause, cancellation terms..."
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_5rem_8rem_2.5rem]"
                >
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel className="text-xs">Description</FieldLabel>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      placeholder="e.g. Frontend development"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs">Qty</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value) || 1)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs">Unit price (BDT)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPriceBdt}
                      onChange={(e) =>
                        updateLineItem(item.id, "unitPriceBdt", Number(e.target.value) || 0)
                      }
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                    aria-label="Remove line item"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setLineItems((prev) => [...prev, newLineItem()])}
              >
                <PlusIcon />
                Add line item
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & terms</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="proposal-tax">Tax (%)</FieldLabel>
                    <Input
                      id="proposal-tax"
                      type="number"
                      min={0}
                      max={100}
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="proposal-discount">Discount (%)</FieldLabel>
                    <Input
                      id="proposal-discount"
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                    />
                  </Field>
                </div>

                <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatBDT(subtotal)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Discount ({discountPercent}%)</span>
                      <span className="tabular-nums">-{formatBDT(discountAmount)}</span>
                    </div>
                  )}
                  {taxPercent > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Tax ({taxPercent}%)</span>
                      <span className="tabular-nums">{formatBDT(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-1.5 text-sm font-semibold text-foreground">
                    <span>Total</span>
                    <span className="tabular-nums">{formatBDT(total)}</span>
                  </div>
                </div>

                <Field>
                  <FieldLabel htmlFor="proposal-payment-terms">Payment terms</FieldLabel>
                  <Input
                    id="proposal-payment-terms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g. 50% advance, 50% on delivery"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="proposal-timeline">Timeline</FieldLabel>
                  <Input
                    id="proposal-timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. 4-6 weeks from advance payment"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="proposal-valid-until">Valid until</FieldLabel>
                  <Input
                    id="proposal-valid-until"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex-col gap-2 border-t">
              <Button className="w-full" onClick={() => handleSubmit("SENT")}>
                {mode === "edit" ? "Save & send" : "Send to company"}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleSubmit("DRAFT")}
              >
                {mode === "edit" ? "Save changes" : "Save as draft"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
