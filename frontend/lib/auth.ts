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

async function refreshSession(scope: AuthScope): Promise<boolean> {
  const res = await fetch(authPath(scope, "/refresh"), {
    method: "POST",
    credentials: "include",
  })
  return res.ok
}

/**
 * Wraps `fetch` so a request that fails with 401 (expired access token)
 * silently exchanges the refresh-token cookie for a new access token and
 * retries once, instead of surfacing a logout to the user every ~1 day.
 */
export async function authFetch(
  input: string,
  init: RequestInit,
  scope: AuthScope,
): Promise<Response> {
  const res = await fetch(input, { ...init, credentials: "include" })
  if (res.status !== 401) {
    return res
  }

  const refreshed = await refreshSession(scope)
  if (!refreshed) {
    return res
  }

  return fetch(input, { ...init, credentials: "include" })
}

/**
 * Access/refresh tokens are httpOnly cookies, so this request is the only
 * way client code can learn who's logged in (or that no one is). Client and
 * admin sessions use separate cookies/endpoints so both panels can stay
 * signed in at the same time.
 */
export async function getCurrentUser(scope: AuthScope = "client"): Promise<CurrentUser | null> {
  const res = await authFetch(authPath(scope, "/me"), {}, scope)
  if (!res.ok) {
    return null
  }
  return (await res.json()) as CurrentUser
}

export async function updateProfile(
  input: UpdateProfileInput,
  scope: AuthScope = "client",
): Promise<CurrentUser> {
  const res = await authFetch(
    authPath(scope, "/me"),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    scope,
  )
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? "Couldn't update your profile.")
  }
  return (await res.json()) as CurrentUser
}

export async function uploadAvatar(file: File, scope: AuthScope = "client"): Promise<CurrentUser> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await authFetch(
    authPath(scope, "/me/avatar"),
    {
      method: "POST",
      body: formData,
    },
    scope,
  )
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
  const res = await authFetch(
    authPath(scope, "/me/password"),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    scope,
  )
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
