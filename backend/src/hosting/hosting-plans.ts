// PLACEHOLDER PRICING — replace vcpu/ramGb/storageGb/bandwidthTb/priceUsd
// with your real VPS tiers before launch. priceBdt is derived from priceUsd
// using the same USD_TO_BDT_RATE the domains module uses.
export interface HostingPlan {
  slug: string;
  name: string;
  tagline: string;
  vcpu: number;
  ramGb: number;
  storageGb: number;
  bandwidthTb: number;
  priceUsd: number;
  popular?: boolean;
}

export const HOSTING_PLANS: HostingPlan[] = [
  {
    slug: 'starter',
    name: 'Starter',
    tagline: 'Small sites and side projects',
    vcpu: 1,
    ramGb: 2,
    storageGb: 40,
    bandwidthTb: 1,
    priceUsd: 6,
  },
  {
    slug: 'standard',
    name: 'Standard',
    tagline: 'Growing apps and small teams',
    vcpu: 2,
    ramGb: 4,
    storageGb: 80,
    bandwidthTb: 2,
    priceUsd: 12,
    popular: true,
  },
  {
    slug: 'performance',
    name: 'Performance',
    tagline: 'Production workloads',
    vcpu: 4,
    ramGb: 8,
    storageGb: 160,
    bandwidthTb: 4,
    priceUsd: 24,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    tagline: 'High-traffic, resource-heavy apps',
    vcpu: 8,
    ramGb: 16,
    storageGb: 320,
    bandwidthTb: 8,
    priceUsd: 48,
  },
];

export function findHostingPlan(slug: string): HostingPlan | undefined {
  return HOSTING_PLANS.find((plan) => plan.slug === slug);
}
