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
import { Textarea } from "@/components/ui/textarea"
import { useAdminOrganizations } from "@/hooks/use-organization"
import { useCreateInvoice } from "@/hooks/use-invoices"
import { formatBDT } from "@/lib/format"
import { mockProposals } from "@/lib/mock/proposals"

type FormLineItem = {
  id: string
  description: string
  quantity: number
  unitPriceBdt: number
}

function newLineItem(): FormLineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, unitPriceBdt: 0 }
}

function subtotalOf(lineItems: FormLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceBdt, 0)
}

function grandTotalOf(lineItems: FormLineItem[], taxPercent: number, discountPercent: number): number {
  const subtotal = subtotalOf(lineItems)
  const afterDiscount = subtotal - subtotal * (discountPercent / 100)
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

  const [organizationId, setOrganizationId] = React.useState(
    sourceProposal?.organizationId ?? ""
  )
  const [dueAt, setDueAt] = React.useState(defaultDueDate())
  const [lineItems, setLineItems] = React.useState<FormLineItem[]>(
    sourceProposal
      ? sourceProposal.lineItems.map((item) => ({ ...item, id: crypto.randomUUID() }))
      : [newLineItem()]
  )
  const [taxPercent, setTaxPercent] = React.useState(sourceProposal?.taxPercent ?? 0)
  const [discountPercent, setDiscountPercent] = React.useState(
    sourceProposal?.discountPercent ?? 0
  )
  const [notes, setNotes] = React.useState("")

  // Falls back to the first loaded org until the admin picks one explicitly —
  // derived at render time instead of synced via effect.
  const effectiveOrganizationId = organizationId || organizations[0]?.id || ""

  const subtotal = subtotalOf(lineItems)
  const discountAmount = subtotal * (discountPercent / 100)
  const taxAmount = (subtotal - discountAmount) * (taxPercent / 100)
  const total = grandTotalOf(lineItems, taxPercent, discountPercent)

  function updateLineItem<K extends keyof FormLineItem>(
    id: string,
    key: K,
    value: FormLineItem[K]
  ) {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  async function handleSubmit(status: "DRAFT" | "SENT") {
    if (!effectiveOrganizationId || lineItems.length === 0) {
      toast.error("Fill in a company and at least one line item.")
      return
    }

    try {
      const invoice = await createInvoice.mutateAsync({
        organizationId: effectiveOrganizationId,
        proposalId: sourceProposal?.id,
        dueAt,
        lineItems: lineItems.map(({ description, quantity, unitPriceBdt }) => ({
          description,
          quantity,
          unitPriceBdt,
        })),
        taxPercent,
        discountPercent,
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
                <div className="grid gap-5 sm:grid-cols-2">
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
                  <Field>
                    <FieldLabel htmlFor="invoice-number">Invoice number</FieldLabel>
                    <Input id="invoice-number" value="Assigned automatically" disabled />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="invoice-due">Due date</FieldLabel>
                    <Input
                      id="invoice-due"
                      type="date"
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                    />
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
                  className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_5rem_8rem_2.5rem]"
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
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="invoice-discount">Discount (%)</FieldLabel>
                    <Input
                      id="invoice-discount"
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
