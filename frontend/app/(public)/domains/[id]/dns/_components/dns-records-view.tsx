"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  addDnsRecord,
  getDnsRecords,
  removeDnsRecord,
  type DnsRecord,
  type DnsRecordType,
} from "@/lib/mock/dns"

const recordTypes: DnsRecordType[] = ["A", "CNAME", "TXT", "MX"]

export function DnsRecordsView({ domainId }: { domainId: string }) {
  const [, forceRerender] = React.useState(0)
  const records = getDnsRecords(domainId)

  function handleAdd(record: Omit<DnsRecord, "id">) {
    addDnsRecord(domainId, record)
    forceRerender((n) => n + 1)
    toast.success("DNS record added.")
  }

  function handleRemove(record: DnsRecord) {
    removeDnsRecord(domainId, record.id)
    forceRerender((n) => n + 1)
    toast.success("DNS record removed.")
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-28 sm:px-6 md:py-36 lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/domains/orders" aria-label="Back to domain orders">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DNS records</h1>
          <p className="text-muted-foreground">
            Manage A, CNAME, TXT, and MX records for this domain.
          </p>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Records</CardTitle>
            <CardDescription>Changes may take up to 24 hours to propagate.</CardDescription>
          </div>
          <AddRecordDialog onAdd={handleAdd} />
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No DNS records yet.</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {records.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-14 justify-center">
                      {record.type}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-foreground">{record.host}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.value} · TTL {record.ttl}s
                        {record.priority !== undefined ? ` · Priority ${record.priority}` : ""}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Delete record">
                        <Trash2Icon />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this record?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {record.type} record for {record.host} will be removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemove(record)}>
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

function AddRecordDialog({ onAdd }: { onAdd: (record: Omit<DnsRecord, "id">) => void }) {
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState<DnsRecordType>("A")
  const [host, setHost] = React.useState("")
  const [value, setValue] = React.useState("")
  const [ttl, setTtl] = React.useState(3600)
  const [priority, setPriority] = React.useState(10)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!host.trim() || !value.trim()) return
    onAdd({
      type,
      host: host.trim(),
      value: value.trim(),
      ttl,
      priority: type === "MX" ? priority : undefined,
    })
    setHost("")
    setValue("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Add record
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a DNS record</DialogTitle>
            <DialogDescription>Point this domain to a server or service.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="dns-type">Type</FieldLabel>
              <Select value={type} onValueChange={(v) => setType(v as DnsRecordType)}>
                <SelectTrigger id="dns-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="dns-host">Host</FieldLabel>
                <Input
                  id="dns-host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="@ or www"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="dns-ttl">TTL (seconds)</FieldLabel>
                <Input
                  id="dns-ttl"
                  type="number"
                  min={60}
                  value={ttl}
                  onChange={(e) => setTtl(Number(e.target.value) || 3600)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="dns-value">Value</FieldLabel>
              <Input
                id="dns-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="203.0.113.10"
                required
              />
            </Field>
            {type === "MX" && (
              <Field>
                <FieldLabel htmlFor="dns-priority">Priority</FieldLabel>
                <Input
                  id="dns-priority"
                  type="number"
                  min={0}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value) || 0)}
                />
              </Field>
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
