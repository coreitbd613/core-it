"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/shared/data-table/data-table"
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBDT } from "@/lib/format"
import { invoiceTotalBdt, mockInvoices } from "@/lib/mock/invoices"

const CURRENT_ORG_ID = "org-1"

type LedgerEntry = {
  id: string
  date: string
  description: string
  invoiceId: string | null
  debit: number
  credit: number
  balance: number
}

export default function StatementsPage() {
  const entries = useMemo<LedgerEntry[]>(() => {
    const invoices = mockInvoices.filter((inv) => inv.organizationId === CURRENT_ORG_ID)

    const rows: Omit<LedgerEntry, "balance">[] = []
    for (const invoice of invoices) {
      rows.push({
        id: `charge-${invoice.id}`,
        date: invoice.issuedAt,
        description: `Invoice ${invoice.number} issued`,
        invoiceId: invoice.id,
        debit: invoiceTotalBdt(invoice),
        credit: 0,
      })
      for (const payment of invoice.payments) {
        rows.push({
          id: `payment-${payment.id}`,
          date: payment.paidAt,
          description: `Payment for ${invoice.number}`,
          invoiceId: invoice.id,
          debit: 0,
          credit: payment.amountBdt,
        })
      }
    }

    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let running = 0
    return rows.map((row) => {
      running += row.debit - row.credit
      return { ...row, balance: running }
    })
  }, [])

  const currentBalance = entries.at(-1)?.balance ?? 0

  const columns = useMemo<ColumnDef<LedgerEntry>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) =>
          row.original.invoiceId ? (
            <Link href={`/portal/invoices/${row.original.invoiceId}`} className="hover:underline">
              {row.original.description}
            </Link>
          ) : (
            row.original.description
          ),
      },
      {
        accessorKey: "debit",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Charged" />,
        cell: ({ row }) =>
          row.original.debit > 0 ? (
            <span className="tabular-nums">{formatBDT(row.original.debit)}</span>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "credit",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Paid" />,
        cell: ({ row }) =>
          row.original.credit > 0 ? (
            <span className="tabular-nums">{formatBDT(row.original.credit)}</span>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "balance",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-foreground">
            {formatBDT(row.original.balance)}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Statements</h1>
        <p className="text-muted-foreground">Your running balance across all invoices and payments.</p>
      </div>

      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold text-foreground">{formatBDT(currentBalance)}</span>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={entries}
        getRowId={(row) => row.id}
        emptyMessage="No transactions yet."
        enableRowSelection={false}
      />
    </div>
  )
}
