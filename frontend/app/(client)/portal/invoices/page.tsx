"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangleIcon, ReceiptIcon, WalletIcon } from "lucide-react"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMyInvoices } from "@/hooks/use-invoices"
import { formatBDT } from "@/lib/format"
import {
  invoiceStatusLabels,
  invoiceStatusVariant,
  type InvoiceStatus,
} from "@/lib/invoices"

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL")
  const { data: orgInvoices = [] } = useMyInvoices()
  const invoices = useMemo(
    () =>
      orgInvoices.filter((inv) => {
        if (statusFilter !== "ALL" && inv.computed.status !== statusFilter) return false
        return true
      }),
    [orgInvoices, statusFilter]
  )

  const stats = useMemo<DashboardStatItem[]>(() => {
    const activeInvoices = orgInvoices.filter((inv) => inv.computed.status !== "CANCELLED")
    const outstanding = activeInvoices.reduce((sum, inv) => sum + inv.computed.balanceBdt, 0)
    const overdue = activeInvoices.filter((inv) => inv.computed.status === "OVERDUE").length
    return [
      { label: "Total Invoices", value: orgInvoices.length, icon: ReceiptIcon, tone: "primary" },
      { label: "Outstanding Balance", value: formatBDT(outstanding), icon: WalletIcon, tone: "chart4" },
      { label: "Overdue", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
    ]
  }, [orgInvoices])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">Track what you owe and what&apos;s been paid.</p>
      </div>

      <DashboardStatsGrid items={stats} />

      <div className="flex justify-end">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as InvoiceStatus | "ALL")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {(Object.keys(invoiceStatusLabels) as InvoiceStatus[]).map((key) => (
              <SelectItem key={key} value={key}>
                {invoiceStatusLabels[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {invoices.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptIcon />
            </EmptyMedia>
            <EmptyTitle>No invoices yet</EmptyTitle>
            <EmptyDescription>Invoices from Core IT will show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {invoices.map((invoice) => (
            <Link key={invoice.id} href={`/portal/invoices/${invoice.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{invoice.number}</span>
                    <span className="text-sm text-muted-foreground">
                      Due {new Date(invoice.dueAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        {formatBDT(invoice.computed.grandTotalBdt)}
                      </span>
                      {invoice.computed.balanceBdt > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {formatBDT(invoice.computed.balanceBdt)} due
                        </span>
                      )}
                    </div>
                    <Badge variant={invoiceStatusVariant[invoice.computed.status]}>
                      {invoiceStatusLabels[invoice.computed.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
