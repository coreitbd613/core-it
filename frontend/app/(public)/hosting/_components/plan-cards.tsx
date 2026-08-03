import { Check } from "lucide-react"

import { formatBDT } from "@/lib/format"
import { HOSTING_PLANS, type HostingPlan } from "@/lib/hosting"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { GlareHover } from "@/components/ui/glare-hover"
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
    <section>
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HOSTING_PLANS.map((plan) => (
            <div key={plan.slug} className="relative">
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              <GlareHover
                width="100%"
                height="100%"
                background="transparent"
                color="#FD6005"
                opacity={0.3}
                duration={600}
                className="rounded-2xl"
              >
                <Card
                  className={
                    plan.popular
                      ? "w-full rounded-2xl border-primary/50 py-10 ring-1 ring-primary/20"
                      : "w-full rounded-2xl py-10"
                  }
                >
                  <CardContent className="flex flex-col gap-7 px-7">
                    <div>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <p className="mt-2 text-base text-muted-foreground">{plan.tagline}</p>
                    </div>

                    <Separator />

                    <div>
                      {plan.priceBdt === "custom" ? (
                        <span className="text-4xl font-bold">Custom</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">{formatBDT(plan.priceBdt)}</span>
                          <span className="text-lg text-muted-foreground">/mo</span>
                        </>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <p className="text-base font-medium">Key features:</p>
                      <ul className="mt-4 flex flex-col gap-3 text-base text-muted-foreground">
                        {planFeatures(plan).map((feature) => (
                          <li key={feature} className="flex items-center gap-2.5">
                            <Check className="size-5 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </GlareHover>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
