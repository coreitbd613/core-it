"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  addForwardingRule,
  getForwardingRules,
  removeForwardingRule,
  type EmailForwardingRule,
} from "@/lib/mock/dns"

export function EmailForwardingView({
  domainId,
  basePath = "/domains",
}: {
  domainId: string
  basePath?: "/domains" | "/portal/domains"
}) {
  const [, forceRerender] = React.useState(0)
  const rules = getForwardingRules(domainId)

  function handleAdd(rule: Omit<EmailForwardingRule, "id">) {
    addForwardingRule(domainId, rule)
    forceRerender((n) => n + 1)
    toast.success("Forwarding rule added.")
  }

  function handleRemove(rule: EmailForwardingRule) {
    removeForwardingRule(domainId, rule.id)
    forceRerender((n) => n + 1)
    toast.success("Forwarding rule removed.")
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-28 sm:px-6 md:py-36 lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`${basePath}/orders`} aria-label="Back to domain orders">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email forwarding</h1>
          <p className="text-muted-foreground">
            Forward mail sent to addresses on this domain to another inbox.
          </p>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Forwarding rules</CardTitle>
            <CardDescription>Mail sent to the address on the left is forwarded to the right.</CardDescription>
          </div>
          <AddForwardingDialog onAdd={handleAdd} />
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No forwarding rules yet.</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{rule.fromAddress}</span>
                    <span className="text-muted-foreground"> → </span>
                    <span className="font-medium">{rule.toAddress}</span>
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Delete rule">
                        <Trash2Icon />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this forwarding rule?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Mail to {rule.fromAddress} will stop being forwarded.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemove(rule)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AddForwardingDialog({
  onAdd,
}: {
  onAdd: (rule: Omit<EmailForwardingRule, "id">) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [fromAddress, setFromAddress] = React.useState("")
  const [toAddress, setToAddress] = React.useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fromAddress.trim() || !toAddress.trim()) return
    onAdd({ fromAddress: fromAddress.trim(), toAddress: toAddress.trim() })
    setFromAddress("")
    setToAddress("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Add rule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a forwarding rule</DialogTitle>
            <DialogDescription>
              e.g. forward hello@yourdomain.com to your personal inbox.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="forward-from">From address</FieldLabel>
              <Input
                id="forward-from"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="hello@yourdomain.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="forward-to">Forward to</FieldLabel>
              <Input
                id="forward-to"
                type="email"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="you@gmail.com"
                required
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add rule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
