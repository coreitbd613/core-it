import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

async function getCurrentRole(request: NextRequest): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const admin = (await getCurrentRole(request)) === "ADMIN"

    if (pathname === "/admin") {
      return NextResponse.redirect(
        new URL(admin ? "/admin/dashboard" : "/admin/login", request.url),
      )
    }

    if (pathname === "/admin/login") {
      return admin
        ? NextResponse.redirect(new URL("/admin/dashboard", request.url))
        : NextResponse.next()
    }

    if (!admin) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    return NextResponse.next()
  }

  // /dashboard and /profile just require any logged-in user (ADMIN or USER).
  const role = await getCurrentRole(request)
  if (!role) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
  ],
}
