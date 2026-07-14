const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type HostingOrderStatus = "PENDING" | "COMPLETED" | "REJECTED"

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

export type CreateHostingOrderInput = {
  planSlug: string
  fullName: string
  email: string
  phone: string
  company?: string
  notes?: string
}

export type MyHostingOrder = {
  id: string
  planSlug: string
  planName: string
  vcpu: number
  ramGb: number
  storageGb: number
  bandwidthTb: number
  priceUsd: string
  priceBdt: string
  status: HostingOrderStatus
  createdAt: string
}

export type AdminHostingOrder = MyHostingOrder & {
  fullName: string
  email: string
  phone: string
  company: string | null
  notes: string | null
  adminNote: string | null
  updatedAt: string
  user: { id: string; name: string | null; email: string }
}

async function parseErrorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null
  return body?.message ?? fallback
}

export async function getHostingPlans(): Promise<HostingPlan[]> {
  const res = await fetch(`${API_URL}/hosting/plans`)
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load hosting plans."))
  }
  return (await res.json()) as HostingPlan[]
}

export async function createHostingOrder(
  input: CreateHostingOrderInput,
): Promise<MyHostingOrder> {
  const res = await fetch(`${API_URL}/hosting/orders`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't place your order."))
  }
  return (await res.json()) as MyHostingOrder
}

export async function getMyHostingOrders(): Promise<MyHostingOrder[]> {
  const res = await fetch(`${API_URL}/hosting/orders/mine`, { credentials: "include" })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load your orders."))
  }
  return (await res.json()) as MyHostingOrder[]
}

export async function getAllHostingOrders(): Promise<AdminHostingOrder[]> {
  const res = await fetch(`${API_URL}/hosting/admin/orders`, { credentials: "include" })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load hosting orders."))
  }
  return (await res.json()) as AdminHostingOrder[]
}

export async function getHostingOrder(id: string): Promise<AdminHostingOrder> {
  const res = await fetch(`${API_URL}/hosting/admin/orders/${id}`, {
    credentials: "include",
  })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load this order."))
  }
  return (await res.json()) as AdminHostingOrder
}

export async function updateHostingOrderStatus(
  id: string,
  input: { status: HostingOrderStatus; adminNote?: string },
): Promise<AdminHostingOrder> {
  const res = await fetch(`${API_URL}/hosting/admin/orders/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't update this order."))
  }
  return (await res.json()) as AdminHostingOrder
}
