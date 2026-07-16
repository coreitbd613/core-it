"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { AlertTriangleIcon, FileTextIcon, SendIcon, WalletIcon } from "lucide-react"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { formatBDT } from "@/lib/format"
import { mockProposals } from "@/lib/mock/proposals"
import { mockQuotations } from "@/lib/mock/quotations"
import { deriveInvoiceStatus, invoiceBalanceBdt, mockInvoices } from "@/lib/mock/invoices"

const CURRENT_ORG_ID = "org-1"

type ActivityRow = {
  id: string
  activity: string
  status: string
  statusVariant: "default" | "secondary" | "outline" | "destructive"
  updatedAt: string
  href: string
}

const columns: ColumnDef<ActivityRow>[] = [
  {
    accessorKey: "activity",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" />,
    cell: ({ row }) => (
      <Link href={row.original.href} className="font-medium text-foreground hover:underline">
        {row.original.activity}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={row.original.statusVariant}>{row.original.status}</Badge>,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
  },
]

export default function UserDashboardPage() {
  const proposals = useMemo(
    () => mockProposals.filter((p) => p.organizationId === CURRENT_ORG_ID),
    []
  )
  const quotations = useMemo(
    () => mockQuotations.filter((q) => q.organizationId === CURRENT_ORG_ID),
    []
  )
  const invoices = useMemo(
    () => mockInvoices.filter((inv) => inv.organizationId === CURRENT_ORG_ID),
    []
  )

  const stats = useMemo<DashboardStatItem[]>(() => {
    const openProposals = proposals.filter((p) => p.status === "SENT").length
    const openQuotations = quotations.filter((q) => q.status === "SENT").length
    const outstanding = invoices.reduce((sum, inv) => sum + invoiceBalanceBdt(inv), 0)
    const overdue = invoices.filter((inv) => deriveInvoiceStatus(inv) === "OVERDUE").length
    return [
      { label: "Open Proposals", value: openProposals, icon: FileTextIcon, tone: "primary" },
      { label: "Pending Quotations", value: openQuotations, icon: SendIcon, tone: "chart2" },
      { label: "Outstanding Balance", value: formatBDT(outstanding), icon: WalletIcon, tone: "chart4" },
      { label: "Overdue Invoices", value: overdue, icon: AlertTriangleIcon, tone: "destructive" },
    ]
  }, [proposals, quotations, invoices])

  const activity = useMemo<ActivityRow[]>(() => {
    const rows: ActivityRow[] = []

    for (const p of proposals) {
      if (p.sentAt) {
        rows.push({
          id: `proposal-sent-${p.id}`,
          activity: `Proposal sent: ${p.title}`,
          status: p.status === "SENT" ? "Awaiting response" : p.status,
          statusVariant: p.status === "SENT" ? "secondary" : "outline",
          updatedAt: p.respondedAt ?? p.sentAt,
          href: `/proposals/${p.id}`,
        })
      }
    }
    for (const q of quotations) {
      if (q.sentAt) {
        rows.push({
          id: `quotation-sent-${q.id}`,
          activity: `Quotation sent: ${q.title}`,
          status: q.status === "SENT" ? "Awaiting response" : q.status,
          statusVariant: q.status === "SENT" ? "secondary" : "outline",
          updatedAt: q.respondedAt ?? q.sentAt,
          href: `/quotations/${q.id}`,
        })
      }
    }
    for (const inv of invoices) {
      rows.push({
        id: `invoice-${inv.id}`,
        activity: `Invoice ${inv.number} issued`,
        status: deriveInvoiceStatus(inv),
        statusVariant: deriveInvoiceStatus(inv) === "OVERDUE" ? "destructive" : "secondary",
        updatedAt: inv.issuedAt,
        href: `/invoices/${inv.id}`,
      })
      for (const payment of inv.payments) {
        rows.push({
          id: `payment-${payment.id}`,
          activity: `Payment recorded on ${inv.number}`,
          status: "Paid",
          statusVariant: "default",
          updatedAt: payment.paidAt,
          href: `/invoices/${inv.id}`,
        })
      }
    }

    return rows
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8)
  }, [proposals, quotations, invoices])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your activity at a glance.</p>
      </div>

      <DashboardStatsGrid items={stats} />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <DataTable
          columns={columns}
          data={activity}
          getRowId={(row) => row.id}
          emptyMessage="No activity yet."
          enableRowSelection={false}
        />
      </div>
    </div>
  )
}
