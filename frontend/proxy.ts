import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

async function getCurrentRole(
  request: NextRequest,
  scope: "client" | "admin" = "client",
): Promise<string | null> {
  try {
    const path = scope === "admin" ? "/auth/admin/me" : "/auth/me"
    const res = await fetch(`${API_URL}${path}`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    })
    if (!res.ok) {
      return null
    }
    const user = (await res.json()) as { role?: string }
    return user.role ?? null
  } catch {
    return null
  }
}

// Never let search engines index the private CRM/ERP portals — everything this
// proxy matches lives behind a login, so it has no business showing up in
// search results.
function withNoIndex(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const admin = (await getCurrentRole(request, "admin")) === "ADMIN"

    if (pathname === "/admin") {
      return withNoIndex(
        NextResponse.redirect(
          new URL(admin ? "/admin/dashboard" : "/admin/login", request.url),
        ),
      )
    }

    if (pathname === "/admin/login") {
      return withNoIndex(
        admin
          ? NextResponse.redirect(new URL("/admin/dashboard", request.url))
          : NextResponse.next(),
      )
    }

    if (!admin) {
      return withNoIndex(NextResponse.redirect(new URL("/admin/login", request.url)))
    }

    return withNoIndex(NextResponse.next())
  }

  // Invite acceptance is how a brand-new teammate creates their account —
  // they aren't logged in yet, so it can't require a session like the rest
  // of the portal. Still noindexed since it's a private, token-gated page.
  if (pathname.startsWith("/portal/invite")) {
    return withNoIndex(NextResponse.next())
  }

  // Everything else under /portal just requires any logged-in user (ADMIN or USER).
  const role = await getCurrentRole(request)
  if (!role) {
    return withNoIndex(NextResponse.redirect(new URL("/login", request.url)))
  }

  return withNoIndex(NextResponse.next())
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/portal", "/portal/:path*"],
}
