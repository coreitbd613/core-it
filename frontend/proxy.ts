import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

async function isAdminRequest(request: NextRequest): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    })
    if (!res.ok) {
      return false
    }
    const user = (await res.json()) as { role?: string }
    return user.role === "ADMIN"
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const admin = await isAdminRequest(request)

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

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
