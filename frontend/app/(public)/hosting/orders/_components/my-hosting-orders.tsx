"use client"

import { useMyHostingOrders } from "@/hooks/use-hosting"
import { formatBDT } from "@/lib/format"
import type { HostingOrderStatus, MyHostingOrder } from "@/lib/hosting"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_LABEL: Record<HostingOrderStatus, string> = {
  PENDING: "Processing",
  COMPLETED: "Active",
  REJECTED: "Needs attention — contact support",
}

const STATUS_VARIANT: Record<
  HostingOrderStatus,
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  COMPLETED: "default",
  REJECTED: "destructive",
}

export function MyHostingOrders() {
  const { data: orders, isPending } = useMyHostingOrders()

  if (isPending) {
    return (
      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[68px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!orders?.length) {
    return (
      <p className="mt-10 text-center text-sm text-muted-foreground">
        You haven&apos;t ordered any VPS plans yet.
      </p>
    )
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {orders.map((order: MyHostingOrder) => (
        <Card key={order.id} className="rounded-lg">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div>
              <div className="font-medium">{order.planName}</div>
              <div className="text-xs text-muted-foreground">
                {order.vcpu} vCPU · {order.ramGb} GB RAM · {formatBDT(Number(order.priceBdt))}/mo
              </div>
            </div>
            <Badge variant={STATUS_VARIANT[order.status]}>
              {STATUS_LABEL[order.status]}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
