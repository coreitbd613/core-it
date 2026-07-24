"use client"

import * as React from "react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { useDomainOrder, useUpdateDomainOrderStatus } from "@/hooks/use-domains"
import { formatBDT } from "@/lib/format"
import type { AdminDomainOrder, DomainOrderStatus } from "@/lib/domains"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

const STATUS_VARIANT: Record<
  DomainOrderStatus,
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  COMPLETED: "default",
  REJECTED: "destructive",
}

export default function AdminDomainOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: order, isPending } = useDomainOrder(params.id)

  if (isPending || !order) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-2xl rounded-lg" />
      </div>
    )
  }

  return <AdminDomainOrderDetail order={order} />
}

function AdminDomainOrderDetail({ order }: { order: AdminDomainOrder }) {
  const router = useRouter()
  const updateStatus = useUpdateDomainOrderStatus(order.id)

  const [status, setStatus] = useState<DomainOrderStatus>(order.status)
  const [adminNote, setAdminNote] = useState(order.adminNote ?? "")

  function handleSave() {
    updateStatus.mutate(
      { status, adminNote },
      {
        onSuccess: () => toast.success("Order updated."),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/domain-orders")}>
            ← Back to domain orders
          </Button>
          <h1 className="mt-2 text-2xl font-bold">{order.domainName}</h1>
        </div>
        <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="Domain" value={order.domainName} />
            <Row label="Registration length" value={`${order.years} ${order.years === 1 ? "year" : "years"}`} />
            <Row label="Price" value={`${formatBDT(Number(order.priceBdt))}/year`} />
            <Row label="Exchange rate used" value={`1 USD = ${order.exchangeRate} BDT`} />
            <Row label="Customer" value={`${order.user.name ?? "—"} · ${order.user.email}`} />
            <Row label="Submitted" value={new Date(order.createdAt).toLocaleString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrant contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="Name" value={`${order.registrantFirstName} ${order.registrantLastName}`} />
            <Row
              label="Address"
              value={[order.registrantAddress1, order.registrantAddress2]
                .filter(Boolean)
                .join(", ")}
            />
            <Row
              label="City / State"
              value={`${order.registrantCity}, ${order.registrantStateProvince}`}
            />
            <Row label="Country" value={order.registrantCountry} />
            <Row label="Phone" value={order.registrantPhone} />
            <Row label="Email" value={order.registrantEmail} />
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Review</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <NativeSelect
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value as DomainOrderStatus)}
              >
                <NativeSelectOption value="PENDING">Pending</NativeSelectOption>
                <NativeSelectOption value="COMPLETED">Completed</NativeSelectOption>
                <NativeSelectOption value="REJECTED">Rejected</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="adminNote">Admin note (internal only)</FieldLabel>
              <Textarea
                id="adminNote"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="e.g. Registered manually via Namecheap on..."
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button onClick={handleSave} disabled={updateStatus.isPending}>
            {updateStatus.isPending && <Spinner className="size-4" />}
            Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div>{value}</div>
      <Separator className="mt-3" />
    </div>
  )
}
