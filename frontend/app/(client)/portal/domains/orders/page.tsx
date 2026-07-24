import { DomainSearch } from "@/app/(public)/domains/_components/domain-search"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MyDomainOrders } from "./_components/my-domain-orders"

export default function PortalDomainOrdersPage() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Domains</h1>
        <p className="mt-1 text-muted-foreground">
          Search for a new domain and track the domains you&apos;ve ordered through us.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find a domain</CardTitle>
          <CardDescription>
            Search availability and register from your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DomainSearch variant="panel" />
        </CardContent>
      </Card>

      <section>
        <h2 className="text-lg font-semibold tracking-tight">My domain orders</h2>
        <MyDomainOrders />
      </section>
    </div>
  )
}
