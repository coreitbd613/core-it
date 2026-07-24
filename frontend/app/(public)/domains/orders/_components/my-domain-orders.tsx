"use client"

import Link from "next/link"

import { useMyDomainOrders } from "@/hooks/use-domains"
import { formatBDT } from "@/lib/format"
import type { DomainOrderStatus, MyDomainOrder } from "@/lib/domains"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_LABEL: Record<DomainOrderStatus, string> = {
  PENDING: "Processing",
  COMPLETED: "Active",
  REJECTED: "Needs attention — contact support",
}

const STATUS_VARIANT: Record<
  DomainOrderStatus,
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  COMPLETED: "default",
  REJECTED: "destructive",
}

export function MyDomainOrders({
  basePath = "/domains",
}: {
  basePath?: "/domains" | "/portal/domains"
}) {
  const { data: orders, isPending } = useMyDomainOrders()

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
        You haven&apos;t ordered any domains yet.
      </p>
    )
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      {orders.map((order: MyDomainOrder) => (
        <Card key={order.id} className="rounded-lg">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <div className="font-medium">{order.domainName}</div>
              <div className="text-xs text-muted-foreground">
                {order.years} {order.years === 1 ? "year" : "years"} ·{" "}
                {formatBDT(Number(order.priceBdt))}/yr
              </div>
            </div>
            <div className="flex items-center gap-2">
              {order.status === "COMPLETED" && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`${basePath}/${order.id}/dns`}>Manage DNS</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`${basePath}/${order.id}/email-forwarding`}>Email forwarding</Link>
                  </Button>
                </>
              )}
              <Badge variant={STATUS_VARIANT[order.status]}>
                {STATUS_LABEL[order.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
