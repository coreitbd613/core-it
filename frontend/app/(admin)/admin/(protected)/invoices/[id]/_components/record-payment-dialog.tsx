"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { paymentMethodLabels, type PaymentMethod } from "@/lib/mock/invoices"

const methods: PaymentMethod[] = ["BANK_TRANSFER", "CASH", "OTHER"]

export function RecordPaymentDialog({
  maxAmount,
  onRecord,
}: {
  maxAmount: number
  onRecord: (amount: number, method: PaymentMethod, note: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState(maxAmount)
  const [method, setMethod] = React.useState<PaymentMethod>("BANK_TRANSFER")
  const [note, setNote] = React.useState("")

  React.useEffect(() => {
    if (open) setAmount(maxAmount)
  }, [open, maxAmount])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (amount <= 0) return
    onRecord(amount, method, note.trim())
    setNote("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record a payment</DialogTitle>
            <DialogDescription>Log a manual payment received outside the system.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="payment-amount">Amount (BDT)</FieldLabel>
              <Input
                id="payment-amount"
                type="number"
                min={1}
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="payment-method">Method</FieldLabel>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger id="payment-method" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {paymentMethodLabels[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="payment-note">Note</FieldLabel>
              <Textarea
                id="payment-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional reference, e.g. transaction ID"
                rows={2}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Record payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
