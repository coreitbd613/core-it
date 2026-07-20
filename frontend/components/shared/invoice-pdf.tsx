"use client"

import * as React from "react"
import { Document, Page, PDFDownloadLink, StyleSheet, Text, View, pdf } from "@react-pdf/renderer"
import { DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatBDT } from "@/lib/format"
import {
  invoiceBalanceBdt,
  invoicePaidBdt,
  invoiceTotalBdt,
  type Invoice,
} from "@/lib/mock/invoices"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 18, fontWeight: 700 },
  invoiceNumber: { fontSize: 10, color: "#666666", marginTop: 4 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 9, color: "#666666", textTransform: "uppercase", marginBottom: 4 },
  metaRow: { flexDirection: "row", gap: 16 },
  table: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 4 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 8,
  },
  tableRowLast: { flexDirection: "row", padding: 8 },
  cellDescription: { flex: 3 },
  cellQty: { flex: 1, textAlign: "right" },
  cellAmount: { flex: 1, textAlign: "right" },
  totalsBlock: { marginTop: 12, alignItems: "flex-end", gap: 4 },
  totalsRow: { flexDirection: "row", gap: 16 },
  totalsLabel: { color: "#666666" },
  grandTotalRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  grandTotalLabel: { fontWeight: 700 },
  grandTotalValue: { fontWeight: 700 },
})

function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const total = invoiceTotalBdt(invoice)
  const paid = invoicePaidBdt(invoice)
  const balance = invoiceBalanceBdt(invoice)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Core IT</Text>
            <Text style={styles.invoiceNumber}>{invoice.number}</Text>
          </View>
          <View>
            <Text style={styles.invoiceNumber}>Billed to</Text>
            <Text>{invoice.organizationName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.sectionLabel}>Issued</Text>
              <Text>{new Date(invoice.issuedAt).toLocaleDateString()}</Text>
            </View>
            <View>
              <Text style={styles.sectionLabel}>Due</Text>
              <Text>{new Date(invoice.dueAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Line items</Text>
          <View style={styles.table}>
            {invoice.lineItems.map((item, index) => (
              <View
                key={item.id}
                style={index === invoice.lineItems.length - 1 ? styles.tableRowLast : styles.tableRow}
              >
                <Text style={styles.cellDescription}>{item.description}</Text>
                <Text style={styles.cellQty}>Qty {item.quantity}</Text>
                <Text style={styles.cellAmount}>
                  {formatBDT(item.quantity * item.unitPriceBdt)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total</Text>
              <Text>{formatBDT(total)}</Text>
            </View>
            {paid > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Paid</Text>
                <Text>-{formatBDT(paid)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Balance due</Text>
              <Text style={styles.grandTotalValue}>{formatBDT(balance)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

/** Imperative download — for use in dropdown menu items where a render-prop component can't be mounted. */
export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const blob = await pdf(<InvoiceDocument invoice={invoice} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${invoice.number}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export function InvoiceDownloadButton({ invoice }: { invoice: Invoice }) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <Button variant="outline" size="sm" disabled>
        <DownloadIcon />
        Download PDF
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoice} />}
      fileName={`${invoice.number}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          <DownloadIcon />
          {loading ? "Preparing..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
