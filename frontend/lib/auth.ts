const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  contactNumber: string | null
  whatsappNumber: string | null
  role: "USER" | "ADMIN"
}

export type UpdateProfileInput = {
  name?: string
  contactNumber?: string
  whatsappNumber?: string
}

/**
 * Access/refresh tokens are httpOnly cookies, so this request is the only
 * way client code can learn who's logged in (or that no one is).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" })
  if (!res.ok) {
    return null
  }
  return (await res.json()) as CurrentUser
}

export async function updateProfile(input: UpdateProfileInput): Promise<CurrentUser> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? "Couldn't update your profile.")
  }
  return (await res.json()) as CurrentUser
}

export async function uploadAvatar(file: File): Promise<CurrentUser> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${API_URL}/auth/me/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData,
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? "Couldn't upload your photo.")
  }
  return (await res.json()) as CurrentUser
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}
