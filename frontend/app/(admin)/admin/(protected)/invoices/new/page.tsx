import { Suspense } from "react"

import { InvoiceForm } from "../_components/invoice-form"

export default function NewInvoicePage() {
  return (
    <Suspense>
      <InvoiceForm />
    </Suspense>
  )
}
