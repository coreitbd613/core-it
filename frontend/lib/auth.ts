const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: "USER" | "ADMIN"
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

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}
