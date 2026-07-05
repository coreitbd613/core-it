"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { getCurrentUser, logout, type CurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = React.useState<CurrentUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await logout()
    router.push("/admin/login")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin dashboard</h1>
          <p className="text-muted-foreground">
            Signed in as {user?.name ?? user?.email}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </div>
  )
}
