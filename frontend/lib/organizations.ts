import { authFetch } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type Organization = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  industry: string | null
  description: string | null
  email: string | null
  phone: string | null
  website: string | null
  addressLine1: string | null
  city: string | null
  stateProvince: string | null
  country: string | null
  tradeLicense: string | null
  tin: string | null
  bin: string | null
  whatsappBusiness: string | null
  facebookPage: string | null
  instagramPage: string | null
  linkedinPage: string | null
  billingEmail: string | null
  billingPhone: string | null
  billingAddress: string | null
  createdAt: string
  updatedAt: string
}

export type UpdateOrganizationInput = Partial<
  Omit<
    Organization,
    "id" | "slug" | "logoUrl" | "billingEmail" | "billingPhone" | "billingAddress" | "createdAt" | "updatedAt"
  >
>

async function parseErrorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null
  return body?.message ?? fallback
}

export async function createOrganization(name: string): Promise<Organization> {
  const res = await authFetch(
    `${API_URL}/organizations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    },
    "client",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't create your company workspace."))
  }
  return (await res.json()) as Organization
}

export async function getMyOrganization(): Promise<Organization> {
  const res = await authFetch(`${API_URL}/organizations/mine`, {}, "client")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load your company profile."))
  }
  return (await res.json()) as Organization
}

export async function updateMyOrganization(input: UpdateOrganizationInput): Promise<Organization> {
  const res = await authFetch(
    `${API_URL}/organizations/mine`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "client",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't save your company profile."))
  }
  return (await res.json()) as Organization
}

export async function uploadOrganizationLogo(file: File): Promise<Organization> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await authFetch(
    `${API_URL}/organizations/mine/logo`,
    { method: "POST", body: formData },
    "client",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't upload your logo."))
  }
  return (await res.json()) as Organization
}

export async function getAdminOrganizations(): Promise<Organization[]> {
  const res = await authFetch(`${API_URL}/organizations/admin`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load companies."))
  }
  return (await res.json()) as Organization[]
}

export async function getAdminOrganization(id: string): Promise<Organization> {
  const res = await authFetch(`${API_URL}/organizations/admin/${id}`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load this company."))
  }
  return (await res.json()) as Organization
}

export async function updateAdminOrganization(
  id: string,
  input: UpdateOrganizationInput,
): Promise<Organization> {
  const res = await authFetch(
    `${API_URL}/organizations/admin/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "admin",
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't save this company."))
  }
  return (await res.json()) as Organization
}
