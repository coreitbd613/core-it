"use client"

import * as React from "react"

import { getCurrentUser, type CurrentUser } from "@/lib/auth"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "U"
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("")
}

export default function AdminProfilePage() {
  const [user, setUser] = React.useState<CurrentUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Your admin account details.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-14">
            {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name ?? user.email} /> : null}
            <AvatarFallback>{getInitials(user?.name ?? user?.email ?? "Admin")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{user?.name ?? "Admin"}</p>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
