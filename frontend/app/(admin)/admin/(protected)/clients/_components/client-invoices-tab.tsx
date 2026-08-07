"use client"

import Link from "next/link"
import { ReceiptTextIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useAdminInvoices } from "@/hooks/use-invoices"
import { formatBDT, formatDate } from "@/lib/format"
import { invoiceStatusLabels, invoiceStatusVariant } from "@/lib/invoices"

export function ClientInvoicesTab({ organizationId }: { organizationId: string }) {
  const { data: invoices = [], isPending } = useAdminInvoices({ organizationId })

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ReceiptTextIcon />
          </EmptyMedia>
          <EmptyTitle>No invoices yet</EmptyTitle>
          <EmptyDescription>Invoices billed to this client will show up here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col divide-y p-0">
        {invoices.map((invoice) => (
          <Link
            key={invoice.id}
            href={`/admin/invoices/${invoice.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{invoice.number}</p>
              <p className="text-xs text-muted-foreground">
                Issued {formatDate(invoice.issuedAt)} · Due {formatDate(invoice.dueAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium tabular-nums text-foreground">
                  {formatBDT(invoice.computed.grandTotalBdt)}
                </p>
                {invoice.computed.balanceBdt > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatBDT(invoice.computed.balanceBdt)} due
                  </p>
                )}
              </div>
              <Badge variant={invoiceStatusVariant[invoice.computed.status]}>
                {invoiceStatusLabels[invoice.computed.status]}
              </Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
