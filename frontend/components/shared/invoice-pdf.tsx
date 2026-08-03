"use client"

import * as React from "react"
import { Document, Image, Page, PDFDownloadLink, StyleSheet, Text, View, pdf } from "@react-pdf/renderer"
import { DownloadIcon } from "lucide-react"
import QRCode from "qrcode"

import { Button } from "@/components/ui/button"
import { MOBILE_BANKING_NUMBER } from "@/lib/contact"
import { formatBDT } from "@/lib/format"
import {
  deriveInvoiceStatus,
  invoiceBalanceBdt,
  invoiceGrandTotalBdt,
  invoicePaidBdt,
  invoiceTotalBdt,
  type Invoice,
} from "@/lib/mock/invoices"

const mobileBankingOptions = ["bKash", "Nagad", "Rocket"]

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"

function invoiceViewUrl(invoiceId: string): string {
  return `${SITE_URL}/invoices/view/${invoiceId}`
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 18, fontWeight: 700 },
  invoiceNumber: { fontSize: 10, color: "#666666", marginTop: 4 },
  qrImage: { width: 56, height: 56, marginBottom: 8, alignSelf: "flex-end" },
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
  paymentOptionsRow: { flexDirection: "row", gap: 8 },
  paymentOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 8,
  },
  paymentOptionName: { fontWeight: 700 },
  paymentOptionMeta: { fontSize: 9, color: "#666666", marginTop: 2 },
})

function InvoiceDocument({
  invoice,
  qrCodeDataUrl,
}: {
  invoice: Invoice
  qrCodeDataUrl: string | null
}) {
  const subtotal = invoiceTotalBdt(invoice)
  const discountAmount = subtotal * (invoice.discountPercent / 100)
  const taxAmount = (subtotal - discountAmount) * (invoice.taxPercent / 100)
  const total = invoiceGrandTotalBdt(invoice)
  const paid = invoicePaidBdt(invoice)
  const balance = invoiceBalanceBdt(invoice)
  const status = deriveInvoiceStatus(invoice)
  const canPay = balance > 0 && status !== "CANCELLED" && status !== "DRAFT"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Core IT</Text>
            <Text style={styles.invoiceNumber}>{invoice.number}</Text>
          </View>
          <View>
            {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qrImage} />}
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
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text>{formatBDT(subtotal)}</Text>
            </View>
            {invoice.discountPercent > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount ({invoice.discountPercent}%)</Text>
                <Text>-{formatBDT(discountAmount)}</Text>
              </View>
            )}
            {invoice.taxPercent > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax ({invoice.taxPercent}%)</Text>
                <Text>{formatBDT(taxAmount)}</Text>
              </View>
            )}
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

        {canPay && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How to pay</Text>
            <View style={styles.paymentOptionsRow}>
              {mobileBankingOptions.map((name) => (
                <View key={name} style={styles.paymentOption}>
                  <Text style={styles.paymentOptionName}>{name}</Text>
                  <Text>{MOBILE_BANKING_NUMBER}</Text>
                  <Text style={styles.paymentOptionMeta}>Send Money (Personal)</Text>
                </View>
              ))}
            </View>
            <Text style={styles.paymentOptionMeta}>
              Please reference {invoice.number} when paying.
            </Text>
          </View>
        )}

        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

async function generateQrCodeDataUrl(invoiceId: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(invoiceViewUrl(invoiceId), { margin: 1, width: 200 })
  } catch {
    return null
  }
}

/** Imperative download — for use in dropdown menu items where a render-prop component can't be mounted. */
export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const qrCodeDataUrl = await generateQrCodeDataUrl(invoice.id)
  const blob = await pdf(
    <InvoiceDocument invoice={invoice} qrCodeDataUrl={qrCodeDataUrl} />
  ).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${invoice.number}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export function InvoiceDownloadButton({ invoice }: { invoice: Invoice }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState<string | null>(null)
  const [qrReady, setQrReady] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    generateQrCodeDataUrl(invoice.id).then((url) => {
      if (cancelled) return
      setQrCodeDataUrl(url)
      setQrReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [invoice.id])

  if (!qrReady) {
    return (
      <Button variant="outline" size="sm" disabled>
        <DownloadIcon />
        Download PDF
      </Button>
    )
  }

  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoice} qrCodeDataUrl={qrCodeDataUrl} />}
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
