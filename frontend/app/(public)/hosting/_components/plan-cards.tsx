import { Check } from "lucide-react"

import { formatBDT, formatUSD } from "@/lib/format"
import { HOSTING_PLANS, type HostingPlan } from "@/lib/hosting"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function planFeatures(plan: HostingPlan): string[] {
  return [
    `${plan.vcpu} vCPU`,
    `${plan.ramGb} GB RAM`,
    `${plan.storageGb} GB SSD storage`,
    `${plan.bandwidthTb} TB bandwidth`,
  ]
}

export function PlanCards() {
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
          {HOSTING_PLANS.map((plan) => (
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

                <Separator />

                <div>
                  <span className="text-2xl font-bold">{formatBDT(plan.priceBdt)}</span>
                  <span className="text-muted-foreground">/mo</span>
                  <div className="text-xs text-muted-foreground">
                    {formatUSD(plan.priceUsd)}/mo
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium">Key features:</p>
                  <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                    {planFeatures(plan).map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="size-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
