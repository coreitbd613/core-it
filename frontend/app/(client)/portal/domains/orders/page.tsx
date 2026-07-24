import { MyDomainOrders } from "@/app/(public)/domains/orders/_components/my-domain-orders"

export default function PortalDomainOrdersPage() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My domain orders</h1>
        <p className="mt-1 text-muted-foreground">
          Track the domains you&apos;ve ordered through us.
        </p>
      </div>

      <MyDomainOrders basePath="/portal/domains" />
    </div>
  )
}
