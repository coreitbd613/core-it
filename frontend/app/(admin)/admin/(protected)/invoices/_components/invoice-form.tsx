"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PlusIcon, Trash2Icon } from "lucide-react"
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
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { useAdminOrganizations } from "@/hooks/use-organization"
import { useCreateInvoice } from "@/hooks/use-invoices"
import { formatBDT } from "@/lib/format"
import type { DiscountType } from "@/lib/invoices"
import { mockProposals } from "@/lib/mock/proposals"

type FormLineItem = {
  id: string
  description: string
  quantity: string
  unitPriceBdt: number
}

function newLineItem(): FormLineItem {
  return { id: crypto.randomUUID(), description: "", quantity: "", unitPriceBdt: 0 }
}

/** Each line's unitPriceBdt IS its Amount — quantity is a display-only label. */
function subtotalOf(lineItems: FormLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.unitPriceBdt, 0)
}

/** Clamped to the subtotal — a discount can never make the pre-tax amount negative. */
function discountAmountOf(
  lineItems: FormLineItem[],
  discountType: DiscountType,
  discountPercent: number,
  discountFlatBdt: number
): number {
  const subtotal = subtotalOf(lineItems)
  const raw = discountType === "FLAT" ? discountFlatBdt : subtotal * (discountPercent / 100)
  return Math.min(Math.max(raw, 0), subtotal)
}

function grandTotalOf(
  lineItems: FormLineItem[],
  taxPercent: number,
  discountType: DiscountType,
  discountPercent: number,
  discountFlatBdt: number
): number {
  const subtotal = subtotalOf(lineItems)
  const afterDiscount = subtotal - discountAmountOf(lineItems, discountType, discountPercent, discountFlatBdt)
  return afterDiscount + afterDiscount * (taxPercent / 100)
}

function defaultDueDate() {
  const due = new Date()
  due.setDate(due.getDate() + 14)
  return due.toISOString().slice(0, 10)
}

export function InvoiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const proposalId = searchParams.get("proposalId")
  const sourceProposal = React.useMemo(
    () => (proposalId ? mockProposals.find((p) => p.id === proposalId) ?? null : null),
    [proposalId]
  )

  const { data: organizations = [], isLoading: organizationsLoading } = useAdminOrganizations()
  const createInvoice = useCreateInvoice()

  const [customerMode, setCustomerMode] = React.useState<"organization" | "adhoc">("organization")
  const [organizationId, setOrganizationId] = React.useState(
    sourceProposal?.organizationId ?? ""
  )
  const [customerName, setCustomerName] = React.useState("")
  const [dueAt, setDueAt] = React.useState(defaultDueDate())
  const [lineItems, setLineItems] = React.useState<FormLineItem[]>(
    sourceProposal
      ? sourceProposal.lineItems.map((item) => ({
          id: crypto.randomUUID(),
          description: item.description,
          // Proposal line items still multiply qty*rate — fold that into a
          // single Amount here and keep the qty as a display label.
          quantity: item.quantity > 1 ? String(item.quantity) : "",
          unitPriceBdt: item.quantity * item.unitPriceBdt,
        }))
      : [newLineItem()]
  )
  const [taxPercent, setTaxPercent] = React.useState(sourceProposal?.taxPercent ?? 0)
  const [discountType, setDiscountType] = React.useState<DiscountType>("PERCENT")
  const [discountPercent, setDiscountPercent] = React.useState(
    sourceProposal?.discountPercent ?? 0
  )
  const [discountFlatBdt, setDiscountFlatBdt] = React.useState(0)
  const [notes, setNotes] = React.useState("")

  // Falls back to the first loaded org until the admin picks one explicitly —
  // derived at render time instead of synced via effect.
  const effectiveOrganizationId = organizationId || organizations[0]?.id || ""

  const subtotal = subtotalOf(lineItems)
  const discountAmount = discountAmountOf(lineItems, discountType, discountPercent, discountFlatBdt)
  const taxAmount = (subtotal - discountAmount) * (taxPercent / 100)
  const total = grandTotalOf(lineItems, taxPercent, discountType, discountPercent, discountFlatBdt)

  function updateLineItem<K extends keyof FormLineItem>(
    id: string,
    key: K,
    value: FormLineItem[K]
  ) {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  async function handleSubmit(status: "DRAFT" | "SENT") {
    const trimmedCustomerName = customerName.trim()
    if (customerMode === "organization" && !effectiveOrganizationId) {
      toast.error("Select a company.")
      return
    }
    if (customerMode === "adhoc" && !trimmedCustomerName) {
      toast.error("Enter a customer name.")
      return
    }
    if (lineItems.length === 0) {
      toast.error("Add at least one line item.")
      return
    }

    try {
      const invoice = await createInvoice.mutateAsync({
        organizationId: customerMode === "organization" ? effectiveOrganizationId : undefined,
        customerName: customerMode === "adhoc" ? trimmedCustomerName : undefined,
        proposalId: sourceProposal?.id,
        dueAt,
        lineItems: lineItems.map(({ description, quantity, unitPriceBdt }) => ({
          description,
          quantity: quantity.trim() || undefined,
          unitPriceBdt,
        })),
        taxPercent,
        discountType,
        discountPercent,
        discountFlatBdt,
        notes: notes.trim() || undefined,
        status,
      })

      if (sourceProposal) {
        sourceProposal.convertedInvoiceId = invoice.id
      }

      toast.success(status === "SENT" ? "Invoice sent." : "Invoice saved as draft.")
      router.push(`/admin/invoices/${invoice.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't create this invoice.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">New invoice</h1>
        <p className="text-muted-foreground">Bill a company for work delivered.</p>
      </div>

      {sourceProposal && (
        <div className="flex max-w-3xl items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground lg:max-w-none">
          <Badge variant="secondary">Prefilled</Badge>
          Line items, tax, and discount copied from proposal{" "}
          <span className="font-medium text-foreground">{sourceProposal.proposalNumber}</span>.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Bill to</FieldLabel>
                  <Tabs
                    value={customerMode}
                    onValueChange={(value) => setCustomerMode(value as "organization" | "adhoc")}
                  >
                    <TabsList>
                      <TabsTrigger value="organization">Existing company</TabsTrigger>
                      <TabsTrigger value="adhoc">One-off customer</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  {customerMode === "organization" ? (
                    <Field>
                      <FieldLabel htmlFor="invoice-org">Company</FieldLabel>
                      <Select
                        value={effectiveOrganizationId}
                        onValueChange={setOrganizationId}
                        disabled={organizationsLoading}
                      >
                        <SelectTrigger id="invoice-org" className="w-full">
                          <SelectValue placeholder={organizationsLoading ? "Loading..." : "Select a company"} />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  ) : (
                    <Field>
                      <FieldLabel htmlFor="invoice-customer-name">Customer name</FieldLabel>
                      <Input
                        id="invoice-customer-name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                      />
                    </Field>
                  )}
                  <Field>
                    <FieldLabel htmlFor="invoice-due">Due date</FieldLabel>
                    <DatePickerField id="invoice-due" value={dueAt} onChange={setDueAt} />
                  </Field>
                </div>
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
                  className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_7rem_8rem_2.5rem]"
                >
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel className="text-xs">Description</FieldLabel>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      placeholder="e.g. Development (milestone 1)"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs">Qty</FieldLabel>
                    <Input
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                      placeholder="e.g. 1 year"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-xs">Amount (BDT)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPriceBdt || ""}
                      onChange={(e) =>
                        updateLineItem(item.id, "unitPriceBdt", Number(e.target.value) || 0)
                      }
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setLineItems((prev) => prev.filter((li) => li.id !== item.id))}
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
              <CardTitle>Pricing & notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="invoice-tax">Tax (%)</FieldLabel>
                    <Input
                      id="invoice-tax"
                      type="number"
                      min={0}
                      max={100}
                      value={taxPercent || ""}
                      onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="invoice-discount">
                      Discount {discountType === "PERCENT" ? "(%)" : "(BDT)"}
                    </FieldLabel>
                    {discountType === "PERCENT" ? (
                      <Input
                        id="invoice-discount"
                        type="number"
                        min={0}
                        max={100}
                        value={discountPercent || ""}
                        onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                      />
                    ) : (
                      <Input
                        id="invoice-discount"
                        type="number"
                        min={0}
                        value={discountFlatBdt || ""}
                        onChange={(e) => setDiscountFlatBdt(Number(e.target.value) || 0)}
                      />
                    )}
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Discount type</FieldLabel>
                  <Tabs
                    value={discountType}
                    onValueChange={(value) => setDiscountType(value as DiscountType)}
                  >
                    <TabsList>
                      <TabsTrigger value="PERCENT">Percentage</TabsTrigger>
                      <TabsTrigger value="FLAT">Flat amount</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </Field>

                <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatBDT(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Discount {discountType === "PERCENT" ? `(${discountPercent}%)` : ""}</span>
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
                  <FieldLabel htmlFor="invoice-notes">Notes</FieldLabel>
                  <Textarea
                    id="invoice-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment instructions, thank-you note, or anything else the client should see on the invoice."
                    rows={4}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex-col gap-2 border-t">
              <Button
                className="w-full"
                disabled={createInvoice.isPending}
                onClick={() => handleSubmit("SENT")}
              >
                {createInvoice.isPending && <Spinner className="size-4" />}
                Send to company
              </Button>
              <Button
                className="w-full"
                variant="outline"
                disabled={createInvoice.isPending}
                onClick={() => handleSubmit("DRAFT")}
              >
                Save as draft
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
