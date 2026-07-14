export type HostingPlan = {
  slug: string
  name: string
  tagline: string
  vcpu: number
  ramGb: number
  storageGb: number
  bandwidthTb: number
  priceUsd: number
  priceBdt: number
  popular?: boolean
}

// Static VPS pricing shown as-is, no backend/third-party lookup.
const USD_TO_BDT_RATE = 122

function usdToBdt(usd: number): number {
  return Math.round(usd * USD_TO_BDT_RATE)
}

type StaticHostingPlan = Omit<HostingPlan, "priceBdt">

const STATIC_HOSTING_PLANS: StaticHostingPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "Small sites and side projects",
    vcpu: 1,
    ramGb: 2,
    storageGb: 40,
    bandwidthTb: 1,
    priceUsd: 6,
  },
  {
    slug: "standard",
    name: "Standard",
    tagline: "Growing apps and small teams",
    vcpu: 2,
    ramGb: 4,
    storageGb: 80,
    bandwidthTb: 2,
    priceUsd: 12,
    popular: true,
  },
  {
    slug: "performance",
    name: "Performance",
    tagline: "Production workloads",
    vcpu: 4,
    ramGb: 8,
    storageGb: 160,
    bandwidthTb: 4,
    priceUsd: 24,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    tagline: "High-traffic, resource-heavy apps",
    vcpu: 8,
    ramGb: 16,
    storageGb: 320,
    bandwidthTb: 8,
    priceUsd: 48,
  },
]

export const HOSTING_PLANS: HostingPlan[] = STATIC_HOSTING_PLANS.map((plan) => ({
  ...plan,
  priceBdt: usdToBdt(plan.priceUsd),
}))
