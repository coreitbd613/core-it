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
import { Textarea } from "@/components/ui/textarea"
import { formatBDT } from "@/lib/format"
import { mockOrganizations } from "@/lib/mock/organizations"
import { mockProposals, type ProposalLineItem } from "@/lib/mock/proposals"

type DraftLineItem = ProposalLineItem

function newLineItem(): DraftLineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, unitPriceBdt: 0 }
}

export default function NewProposalPage() {
  const router = useRouter()
  const [organizationId, setOrganizationId] = React.useState(mockOrganizations[0]?.id ?? "")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [lineItems, setLineItems] = React.useState<DraftLineItem[]>([newLineItem()])

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceBdt, 0)

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

    mockProposals.unshift({
      id: crypto.randomUUID(),
      organizationId: organization.id,
      organizationName: organization.name,
      title: title.trim(),
      description: description.trim(),
      lineItems,
      status,
      createdBy: "Core IT",
      sentAt: status === "SENT" ? new Date().toISOString().slice(0, 10) : null,
      respondedAt: null,
    })

    toast.success(status === "SENT" ? "Proposal sent." : "Proposal saved as draft.")
    router.push("/admin/proposals")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">New proposal</h1>
        <p className="text-muted-foreground">Build a proposal and send it to a company.</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Who this is for and what it covers.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
              <FieldLabel htmlFor="proposal-title">Title</FieldLabel>
              <Input
                id="proposal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E-commerce platform revamp"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="proposal-description">Scope description</FieldLabel>
              <Textarea
                id="proposal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what's included in this proposal."
                rows={3}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <CardDescription>Add each deliverable and its price.</CardDescription>
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
        <CardFooter className="items-center justify-between border-t">
          <span className="text-sm font-semibold text-foreground">
            Total: {formatBDT(total)}
          </span>
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
