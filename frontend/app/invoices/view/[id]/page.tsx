"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { MessageCircleIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InvoiceDocument } from "@/components/shared/invoice-document"
import { WHATSAPP_URL } from "@/lib/contact"
import { deriveInvoiceStatus, invoiceBalanceBdt, mockInvoices } from "@/lib/mock/invoices"

export default function PublicInvoiceViewPage() {
  const params = useParams<{ id: string }>()
  const invoice = mockInvoices.find((inv) => inv.id === params.id)

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <XIcon />
            </EmptyMedia>
            <EmptyTitle>Invoice not found</EmptyTitle>
            <EmptyDescription>
              This link may be incorrect, or the invoice is no longer available.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const status = deriveInvoiceStatus(invoice)
  const balance = invoiceBalanceBdt(invoice)
  const canPay = balance > 0 && status !== "CANCELLED" && status !== "DRAFT"

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4">
        <Link href="/" className="flex h-8 w-fit items-center self-center" aria-label="CORE IT home">
          <Image
            src="/logo-light.png"
            alt="CORE IT"
            width={527}
            height={135}
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src="/logo-dark.png"
            alt="CORE IT"
            width={527}
            height={135}
            className="hidden h-8 w-auto dark:block"
          />
        </Link>

        <InvoiceDocument invoice={invoice} />

        {canPay ? (
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">
              Questions about this invoice? Message us and reference{" "}
              <span className="font-medium text-foreground">{invoice.number}</span>.
            </p>
            <Button asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircleIcon />
                Message on WhatsApp
              </a>
            </Button>
          </div>
        ) : status === "PAID" ? (
          <p className="text-center text-sm text-muted-foreground">
            This invoice has been paid in full. Thank you!
          </p>
        ) : null}
      </div>
    </div>
  )
}
