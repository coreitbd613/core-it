"use client"

import { useRouter } from "next/navigation"
import { Cpu, Database, Gauge, MemoryStick } from "lucide-react"

import { useClientAuth } from "@/contexts/client-auth-context"
import { useHostingPlans } from "@/hooks/use-hosting"
import { formatBDT, formatUSD } from "@/lib/format"
import type { HostingPlan } from "@/lib/hosting"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PlanCards() {
  const router = useRouter()
  const { user } = useClientAuth()
  const { data: plans, isPending } = useHostingPlans()

  function handleOrder(plan: HostingPlan) {
    const checkoutPath = `/hosting/checkout?plan=${encodeURIComponent(plan.slug)}`
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`)
      return
    }
    router.push(checkoutPath)
  }

  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">VPS plans</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dedicated resources, no noisy neighbors.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isPending &&
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-80 w-full rounded-xl" />
            ))}

          {plans?.map((plan) => (
            <Card
              key={plan.slug}
              className={
                plan.popular
                  ? "relative rounded-xl border-primary/50 ring-1 ring-primary/20"
                  : "relative rounded-xl"
              }
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              <CardContent className="flex flex-col gap-6 py-2">
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                </div>

                <div>
                  <span className="text-2xl font-bold">{formatBDT(plan.priceBdt)}</span>
                  <span className="text-muted-foreground">/mo</span>
                  <div className="text-xs text-muted-foreground">
                    {formatUSD(plan.priceUsd)}/mo
                  </div>
                </div>

                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Cpu className="size-4 text-primary" />
                    {plan.vcpu} vCPU
                  </li>
                  <li className="flex items-center gap-2">
                    <MemoryStick className="size-4 text-primary" />
                    {plan.ramGb} GB RAM
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="size-4 text-primary" />
                    {plan.storageGb} GB SSD
                  </li>
                  <li className="flex items-center gap-2">
                    <Gauge className="size-4 text-primary" />
                    {plan.bandwidthTb} TB bandwidth
                  </li>
                </ul>

                <Button
                  className="mt-auto"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleOrder(plan)}
                >
                  Order now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
