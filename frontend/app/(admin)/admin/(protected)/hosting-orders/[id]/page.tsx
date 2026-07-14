"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { useHostingOrder, useUpdateHostingOrderStatus } from "@/hooks/use-hosting"
import { formatBDT, formatUSD } from "@/lib/format"
import type { HostingOrderStatus } from "@/lib/hosting"
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
  HostingOrderStatus,
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  COMPLETED: "default",
  REJECTED: "destructive",
}

export default function AdminHostingOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: order, isPending } = useHostingOrder(params.id)
  const updateStatus = useUpdateHostingOrderStatus(params.id)

  const [status, setStatus] = useState<HostingOrderStatus>("PENDING")
  const [adminNote, setAdminNote] = useState("")

  useEffect(() => {
    if (order) {
      setStatus(order.status)
      setAdminNote(order.adminNote ?? "")
    }
  }, [order])

  function handleSave() {
    updateStatus.mutate(
      { status, adminNote },
      {
        onSuccess: () => toast.success("Order updated."),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  if (isPending || !order) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-2xl rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/hosting-orders")}>
            ← Back to hosting orders
          </Button>
          <h1 className="mt-2 text-2xl font-bold">{order.planName}</h1>
        </div>
        <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="Plan" value={order.planName} />
            <Row
              label="Specs"
              value={`${order.vcpu} vCPU · ${order.ramGb} GB RAM · ${order.storageGb} GB SSD · ${order.bandwidthTb} TB bandwidth`}
            />
            <Row label="Price" value={`${formatBDT(Number(order.priceBdt))}/mo (${formatUSD(Number(order.priceUsd))}/mo)`} />
            <Row label="Customer" value={`${order.user.name ?? "—"} · ${order.user.email}`} />
            <Row label="Submitted" value={new Date(order.createdAt).toLocaleString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & requirements</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="Full name" value={order.fullName} />
            <Row label="Email" value={order.email} />
            <Row label="Phone" value={order.phone} />
            <Row label="Company" value={order.company ?? "—"} />
            <Row label="Setup notes" value={order.notes ?? "—"} />
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
                onChange={(event) => setStatus(event.target.value as HostingOrderStatus)}
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
                placeholder="e.g. Provisioned manually on..."
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
