"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBDT } from "@/lib/format"
import { mockInvoices, type InvoiceLineItem } from "@/lib/mock/invoices"
import { mockOrganizations } from "@/lib/mock/organizations"

function newLineItem(): InvoiceLineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, unitPriceBdt: 0 }
}

function nextInvoiceNumber() {
  return `INV-2026-${String(mockInvoices.length + 1).padStart(3, "0")}`
}

function defaultDueDate() {
  const due = new Date()
  due.setDate(due.getDate() + 14)
  return due.toISOString().slice(0, 10)
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [organizationId, setOrganizationId] = React.useState(mockOrganizations[0]?.id ?? "")
  const [dueAt, setDueAt] = React.useState(defaultDueDate())
  const [lineItems, setLineItems] = React.useState<InvoiceLineItem[]>([newLineItem()])

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceBdt, 0)

  function updateLineItem<K extends keyof InvoiceLineItem>(
    id: string,
    key: K,
    value: InvoiceLineItem[K]
  ) {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  function handleSubmit(status: "DRAFT" | "SENT") {
    const organization = mockOrganizations.find((org) => org.id === organizationId)
    if (!organization || lineItems.length === 0) {
      toast.error("Fill in a company and at least one line item.")
      return
    }

    const invoiceId = crypto.randomUUID()
    mockInvoices.unshift({
      id: invoiceId,
      number: nextInvoiceNumber(),
      organizationId: organization.id,
      organizationName: organization.name,
      lineItems,
      payments: [],
      status,
      issuedAt: new Date().toISOString().slice(0, 10),
      dueAt,
    })

    toast.success(status === "SENT" ? "Invoice sent." : "Invoice saved as draft.")
    router.push(`/admin/invoices/${invoiceId}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">New invoice</h1>
        <p className="text-muted-foreground">Bill a company for work delivered.</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Who this is billed to and when it&apos;s due.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="invoice-org">Company</FieldLabel>
                <Select value={organizationId} onValueChange={setOrganizationId}>
                  <SelectTrigger id="invoice-org" className="w-full">
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

      <Card className="max-w-3xl">
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
        <CardFooter className="items-center justify-between border-t">
          <span className="text-sm font-semibold text-foreground">Total: {formatBDT(total)}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSubmit("DRAFT")}>
              Save as draft
            </Button>
            <Button onClick={() => handleSubmit("SENT")}>Send to company</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
