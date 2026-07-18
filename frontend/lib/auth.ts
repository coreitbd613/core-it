const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type AuthScope = "client" | "admin"

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

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}

function authPath(scope: AuthScope, path: string): string {
  const prefix = scope === "admin" ? "/auth/admin" : "/auth"
  return `${API_URL}${prefix}${path}`
}

/**
 * Access/refresh tokens are httpOnly cookies, so this request is the only
 * way client code can learn who's logged in (or that no one is). Client and
 * admin sessions use separate cookies/endpoints so both panels can stay
 * signed in at the same time.
 */
export async function getCurrentUser(scope: AuthScope = "client"): Promise<CurrentUser | null> {
  const res = await fetch(authPath(scope, "/me"), { credentials: "include" })
  if (!res.ok) {
    return null
  }
  return (await res.json()) as CurrentUser
}

export async function updateProfile(
  input: UpdateProfileInput,
  scope: AuthScope = "client",
): Promise<CurrentUser> {
  const res = await fetch(authPath(scope, "/me"), {
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

export async function uploadAvatar(file: File, scope: AuthScope = "client"): Promise<CurrentUser> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(authPath(scope, "/me/avatar"), {
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

export async function changePassword(
  input: ChangePasswordInput,
  scope: AuthScope = "client",
): Promise<void> {
  const res = await fetch(authPath(scope, "/me/password"), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? "Couldn't change your password.")
  }
}

export async function logout(scope: AuthScope = "client"): Promise<void> {
  await fetch(authPath(scope, "/logout"), {
    method: "POST",
    credentials: "include",
  })
}
