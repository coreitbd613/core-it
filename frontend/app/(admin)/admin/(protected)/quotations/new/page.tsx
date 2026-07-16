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
import { mockOrganizations } from "@/lib/mock/organizations"
import { mockQuotations, type QuotationLineItem } from "@/lib/mock/quotations"

function newLineItem(): QuotationLineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, unitPriceBdt: 0 }
}

export default function NewQuotationPage() {
  const router = useRouter()
  const [organizationId, setOrganizationId] = React.useState(mockOrganizations[0]?.id ?? "")
  const [title, setTitle] = React.useState("")
  const [lineItems, setLineItems] = React.useState<QuotationLineItem[]>([newLineItem()])

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceBdt, 0)

  function updateLineItem<K extends keyof QuotationLineItem>(
    id: string,
    key: K,
    value: QuotationLineItem[K]
  ) {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  function handleSubmit(status: "DRAFT" | "SENT") {
    const organization = mockOrganizations.find((org) => org.id === organizationId)
    if (!organization || !title.trim() || lineItems.length === 0) {
      toast.error("Fill in a company, title, and at least one line item.")
      return
    }

    mockQuotations.unshift({
      id: crypto.randomUUID(),
      organizationId: organization.id,
      organizationName: organization.name,
      title: title.trim(),
      lineItems,
      status,
      sentAt: status === "SENT" ? new Date().toISOString().slice(0, 10) : null,
      respondedAt: null,
      convertedInvoiceId: null,
    })

    toast.success(status === "SENT" ? "Quotation sent." : "Quotation saved as draft.")
    router.push("/admin/quotations")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">New quotation</h1>
        <p className="text-muted-foreground">Quote a price for a company to accept or decline.</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Who this is for.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="quotation-org">Company</FieldLabel>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger id="quotation-org" className="w-full">
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
              <FieldLabel htmlFor="quotation-title">Title</FieldLabel>
              <Input
                id="quotation-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Q3 hosting & maintenance"
              />
            </Field>
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
                  placeholder="e.g. VPS hosting (quarterly)"
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
