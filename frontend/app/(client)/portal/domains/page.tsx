import { MyDomainOrders } from "./_components/my-domain-orders"

export default function MyDomainOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Domains</h1>
        <p className="text-muted-foreground">Track the domains you&apos;ve ordered through us.</p>
      </div>

      <MyDomainOrders />
    </div>
  )
}
