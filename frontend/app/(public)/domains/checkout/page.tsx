import { Suspense } from "react"
import { SiteHeader } from "@/app/_components/site-header"
import { CheckoutForm } from "./_components/checkout-form"

export default function DomainCheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto w-full max-w-2xl px-4 py-28 sm:px-6 md:py-36 lg:px-8">
          <Suspense>
            <CheckoutForm />
          </Suspense>
        </div>
      </main>
    </>
  )
}
