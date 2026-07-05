import { redirect } from "next/navigation"

// The proxy (frontend/proxy.ts) always intercepts /admin and
// redirects to /admin/login or /admin/dashboard before this ever renders.
// This is just a safety net in case that matcher is ever bypassed.
export default function AdminIndexPage() {
  redirect("/admin/login")
}
