"use client"

import { useParams, useRouter } from "next/navigation"
import { LogInIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { useAdminCustomer, useDeleteAdminCustomer } from "@/hooks/use-customers"
import { formatBDT } from "@/lib/format"
import { loginAsCustomer } from "@/lib/customers"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminCustomerDetail } from "@/lib/customers"

const ORDER_STATUS_VARIANT: Record<
  AdminCustomerDetail["domainOrders"][number]["status"],
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  COMPLETED: "default",
  REJECTED: "destructive",
}

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: customer, isPending } = useAdminCustomer(params.id)

  if (isPending || !customer) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-2xl rounded-lg" />
      </div>
    )
  }

  return <AdminCustomerDetailView customer={customer} />
}

function AdminCustomerDetailView({ customer }: { customer: AdminCustomerDetail }) {
  const router = useRouter()
  const deleteCustomer = useDeleteAdminCustomer()
  const displayName = customer.name ?? customer.email

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/customers")}>
            ← Back to customers
          </Button>
          <div className="mt-2 flex items-center gap-3">
            <Avatar className="size-12">
              {customer.avatarUrl && <AvatarImage src={customer.avatarUrl} alt={displayName} />}
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={customer.emailVerified ? "default" : "secondary"}>
            {customer.emailVerified ? "Verified" : "Unverified"}
          </Badge>
          {customer.role !== "ADMIN" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await loginAsCustomer(customer.id)
                    window.open("/portal/dashboard", "_blank")
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Couldn't log in as this customer."
                    )
                  }
                }}
              >
                <LogInIcon />
                Log in as
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2Icon />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {displayName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This can&apos;t be undone. Their account and order history would be
                      permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => {
                        deleteCustomer.mutate(customer.id, {
                          onSuccess: () => {
                            toast.success(`Deleted ${displayName}.`)
                            router.push("/admin/customers")
                          },
                          onError: (error) =>
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "Couldn't delete this customer."
                            ),
                        })
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="Role" value={customer.role} />
            <Row label="Contact number" value={customer.contactNumber ?? "—"} />
            <Row label="WhatsApp number" value={customer.whatsappNumber ?? "—"} />
            <Row label="Joined" value={new Date(customer.createdAt).toLocaleString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain orders summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="Total orders" value={String(customer.ordersCount)} />
            <Row label="Total spent" value={formatBDT(customer.totalSpentBdt)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domain orders</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.domainOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No domain orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Length</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.domainOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/domain-orders/${order.id}`)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {order.domainName}
                    </TableCell>
                    <TableCell>
                      {order.years} {order.years === 1 ? "year" : "years"}
                    </TableCell>
                    <TableCell>{formatBDT(Number(order.priceBdt))}</TableCell>
                    <TableCell>
                      <Badge variant={ORDER_STATUS_VARIANT[order.status]}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div>{value}</div>
      <Separator className="mt-3" />
    </div>
  )
}
