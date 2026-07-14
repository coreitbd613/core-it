import { MyHostingOrders } from "./_components/my-hosting-orders"

export default function MyHostingOrdersPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-28 sm:px-6 md:py-36 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My hosting orders</h1>
        <p className="mt-1 text-muted-foreground">
          Track the VPS plans you&apos;ve ordered through us.
        </p>
      </div>

      <MyHostingOrders />
    </div>
  )
}
