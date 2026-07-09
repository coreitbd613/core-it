import { Suspense } from "react"
import { CheckoutForm } from "./_components/checkout-form"

export default function DomainCheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-28 sm:px-6 md:py-36 lg:px-8">
      <Suspense>
        <CheckoutForm />
      </Suspense>
    </div>
  )
}
