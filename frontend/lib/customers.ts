const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type AdminCustomer = {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  contactNumber: string | null
  role: "USER" | "ADMIN"
  emailVerified: boolean
  createdAt: string
  ordersCount: number
  totalSpentBdt: number
}

async function parseErrorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null
  return body?.message ?? fallback
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const res = await fetch(`${API_URL}/users/admin/customers`, { credentials: "include" })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load customers."))
  }
  return (await res.json()) as AdminCustomer[]
}

export async function deleteAdminCustomer(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/admin/customers/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't delete this customer."))
  }
}

export async function loginAsCustomer(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/admin/login-as/${id}`, {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't log in as this customer."))
  }
}
