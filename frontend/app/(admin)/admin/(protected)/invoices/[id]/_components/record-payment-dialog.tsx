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
import { DatePickerField } from "@/components/shared/date-picker-field"
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
import { paymentMethodLabels, type PaymentMethod } from "@/lib/invoices"

const methods: PaymentMethod[] = ["BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CASH", "OTHER"]

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function RecordPaymentDialog({
  maxAmount,
  onRecord,
}: {
  maxAmount: number
  onRecord: (
    amount: number,
    method: PaymentMethod,
    note: string,
    paidAt: string,
    transactionId: string
  ) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState(maxAmount)
  const [method, setMethod] = React.useState<PaymentMethod>("BKASH")
  const [note, setNote] = React.useState("")
  const [paidAt, setPaidAt] = React.useState(today)
  const [transactionId, setTransactionId] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setAmount(maxAmount)
      setPaidAt(today())
    }
  }, [open, maxAmount])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (amount <= 0) return
    onRecord(amount, method, note.trim(), paidAt, transactionId.trim())
    setNote("")
    setTransactionId("")
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
            <div className="grid gap-4 sm:grid-cols-2">
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
                <FieldLabel htmlFor="payment-date">Pay date</FieldLabel>
                <DatePickerField id="payment-date" value={paidAt} onChange={setPaidAt} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="payment-transaction-id">Transaction ID (optional)</FieldLabel>
              <Input
                id="payment-transaction-id"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN123456"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="payment-note">Note</FieldLabel>
              <Textarea
                id="payment-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional internal note"
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
