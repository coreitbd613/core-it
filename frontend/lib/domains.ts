import { authFetch } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type DomainOrderStatus = "PENDING" | "COMPLETED" | "REJECTED"

export type DomainSearchResult = {
  domain: string
  tld: string
  available: boolean
  isPremium: boolean
  priceUsd: number
  priceBdt: number
}

export type RegistrantInput = {
  registrantFirstName: string
  registrantLastName: string
  registrantAddress1: string
  registrantAddress2?: string
  registrantCity: string
  registrantStateProvince: string
  registrantPostalCode: string
  registrantCountry: string
  registrantPhone: string
  registrantEmail: string
}

export type CreateDomainOrderInput = RegistrantInput & {
  domainName: string
  tld: string
  years: number
}

export type MyDomainOrder = {
  id: string
  domainName: string
  tld: string
  years: number
  priceUsd: string
  priceBdt: string
  status: DomainOrderStatus
  createdAt: string
}

export type AdminDomainOrder = MyDomainOrder &
  RegistrantInput & {
    exchangeRate: string
    adminNote: string | null
    updatedAt: string
    user: { id: string; name: string | null; email: string }
  }

async function parseErrorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null
  return body?.message ?? fallback
}

export async function searchDomains(query: string): Promise<DomainSearchResult[]> {
  const res = await fetch(`${API_URL}/domains/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't search domains."))
  }
  return (await res.json()) as DomainSearchResult[]
}

export async function createDomainOrder(
  input: CreateDomainOrderInput,
): Promise<MyDomainOrder> {
  const res = await authFetch(
    `${API_URL}/domains/orders`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "client",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't place your order."))
  }
  return (await res.json()) as MyDomainOrder
}

export async function getMyDomainOrders(): Promise<MyDomainOrder[]> {
  const res = await authFetch(`${API_URL}/domains/orders/mine`, {}, "client")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load your orders."))
  }
  return (await res.json()) as MyDomainOrder[]
}

export async function getAllDomainOrders(): Promise<AdminDomainOrder[]> {
  const res = await authFetch(`${API_URL}/domains/admin/orders`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load domain orders."))
  }
  return (await res.json()) as AdminDomainOrder[]
}

export async function getDomainOrder(id: string): Promise<AdminDomainOrder> {
  const res = await authFetch(`${API_URL}/domains/admin/orders/${id}`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load this order."))
  }
  return (await res.json()) as AdminDomainOrder
}

export async function updateDomainOrderStatus(
  id: string,
  input: { status: DomainOrderStatus; adminNote?: string },
): Promise<AdminDomainOrder> {
  const res = await authFetch(
    `${API_URL}/domains/admin/orders/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "admin",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't update this order."))
  }
  return (await res.json()) as AdminDomainOrder
}
