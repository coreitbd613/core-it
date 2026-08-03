export type HostingPlan = {
  slug: string
  name: string
  tagline: string
  vcpu: number
  ramGb: number
  storageGb: number
  bandwidthTb: number
  priceBdt: number | "custom"
  popular?: boolean
}

// Static VPS pricing shown as-is, no backend/third-party lookup.
export const HOSTING_PLANS: HostingPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "Small sites and side projects",
    vcpu: 1,
    ramGb: 2,
    storageGb: 40,
    bandwidthTb: 1,
    priceBdt: 1500,
  },
  {
    slug: "standard",
    name: "Standard",
    tagline: "Growing apps and small teams",
    vcpu: 2,
    ramGb: 4,
    storageGb: 80,
    bandwidthTb: 2,
    priceBdt: 2500,
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
    priceBdt: 4000,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    tagline: "High-traffic, resource-heavy apps",
    vcpu: 8,
    ramGb: 16,
    storageGb: 320,
    bandwidthTb: 8,
    priceBdt: "custom",
  },
]
