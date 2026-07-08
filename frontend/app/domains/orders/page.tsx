import { SiteHeader } from "@/app/_components/site-header"
import { MyDomainOrders } from "./_components/my-domain-orders"

export default function MyDomainOrdersPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-28 sm:px-6 md:py-36 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My domain orders</h1>
            <p className="mt-1 text-muted-foreground">
              Track the domains you&apos;ve ordered through us.
            </p>
          </div>

          <MyDomainOrders />
        </div>
      </main>
    </>
  )
}
