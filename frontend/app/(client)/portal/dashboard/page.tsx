"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">No dashboard data yet.</p>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Account activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <p className="text-sm text-muted-foreground">
            Real activity will appear here when it is available.
          </p>
          <Button asChild>
            <Link href="/portal/invoices">View invoices</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
