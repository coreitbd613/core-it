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
  invoiceStatusLabels,
  invoiceTotalBdt,
  type Invoice,
} from "@/lib/mock/invoices"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "")

function invoiceViewUrl(invoiceId: string): string {
  return `${SITE_URL}/invoices/view/${invoiceId}`
}

function signed(amount: number, sign: "+" | "-" = "+"): string {
  return `${sign}${formatBDT(amount)}`
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { width: 120, height: 31 },
  invoiceTitle: { fontSize: 20, fontWeight: 700, textAlign: "right" },
  invoiceNumber: { fontSize: 10, color: "#FD6005", marginTop: 4, textAlign: "right" },
  invoiceStatus: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#c0392b",
    marginTop: 2,
    textAlign: "right",
  },
  qrImage: { width: 56, height: 56, marginTop: 6, alignSelf: "flex-end" },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 20,
    paddingTop: 16,
  },
  sectionLabel: { fontSize: 8, color: "#666666", textTransform: "uppercase", marginBottom: 4 },
  metaRow: { flexDirection: "row", gap: 4, marginTop: 2 },
  metaLabel: { color: "#666666" },
  section: { marginTop: 20 },
  table: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableHeaderText: { fontSize: 8, color: "#666666", textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 8,
  },
  tableRowLast: { flexDirection: "row", padding: 8 },
  cellIndex: { width: 20, color: "#666666" },
  cellDescription: { flex: 3 },
  cellQty: { flex: 1, textAlign: "right", color: "#666666" },
  cellRate: { flex: 1, textAlign: "right", color: "#666666" },
  cellAmount: { flex: 1, textAlign: "right", fontWeight: 700 },
  totalsBlock: { marginTop: 12, alignItems: "flex-end", gap: 4 },
  totalsRow: { flexDirection: "row", gap: 16 },
  totalsLabel: { color: "#666666" },
  grandTotalRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  grandTotalLabel: { fontWeight: 700 },
  grandTotalValue: { fontWeight: 700 },
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
          <Image src={`${SITE_URL}/logo-light.png`} style={styles.logo} />
          <View>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
            <Text style={styles.invoiceStatus}>{invoiceStatusLabels[status]}</Text>
            {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qrImage} />}
          </View>
        </View>

        <View style={styles.metaSection}>
          <View>
            <Text style={styles.sectionLabel}>Bill to</Text>
            <Text style={{ fontWeight: 700 }}>{invoice.organizationName}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice date:</Text>
              <Text>{new Date(invoice.issuedAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due date:</Text>
              <Text>{new Date(invoice.dueAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontWeight: 700 }}>Core IT</Text>
            <Text style={styles.metaLabel}>{SITE_HOST}</Text>
            <Text style={styles.metaLabel}>info@coreitbd.com</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderText, styles.cellIndex]}>#</Text>
              <Text style={[styles.tableHeaderText, styles.cellDescription]}>Item</Text>
              <Text style={[styles.tableHeaderText, styles.cellQty]}>Qty</Text>
              <Text style={[styles.tableHeaderText, styles.cellRate]}>Rate</Text>
              <Text style={[styles.tableHeaderText, styles.cellAmount]}>Amount</Text>
            </View>
            {invoice.lineItems.map((item, index) => (
              <View
                key={item.id}
                style={index === invoice.lineItems.length - 1 ? styles.tableRowLast : styles.tableRow}
              >
                <Text style={styles.cellIndex}>{index + 1}</Text>
                <Text style={styles.cellDescription}>{item.description}</Text>
                <Text style={styles.cellQty}>{item.quantity}</Text>
                <Text style={styles.cellRate}>{signed(item.unitPriceBdt)}</Text>
                <Text style={styles.cellAmount}>
                  {signed(item.quantity * item.unitPriceBdt)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Sub total</Text>
              <Text>{signed(subtotal)}</Text>
            </View>
            {invoice.discountPercent > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount ({invoice.discountPercent}%)</Text>
                <Text>{signed(discountAmount, "-")}</Text>
              </View>
            )}
            {invoice.taxPercent > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax ({invoice.taxPercent}%)</Text>
                <Text>{signed(taxAmount)}</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total</Text>
              <Text>{signed(total)}</Text>
            </View>
            {paid > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Paid</Text>
                <Text>{signed(paid, "-")}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Amount due</Text>
              <Text style={styles.grandTotalValue}>{signed(balance)}</Text>
            </View>
          </View>
        </View>

        {canPay && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Offline payment</Text>
            <Text>bKash / Nagad / Rocket</Text>
            <Text>Send Money to {MOBILE_BANKING_NUMBER} (Personal)</Text>
            <Text style={[styles.metaLabel, { marginTop: 4, fontSize: 8 }]}>
              Please add {invoice.number} as the reference.
            </Text>
          </View>
        )}

        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Terms &amp; conditions</Text>
          <Text style={[styles.metaLabel, { fontSize: 8 }]}>
            By proceeding with this invoice and/or payment, the client acknowledges and agrees to
            the Terms of Service and Privacy Policy available at {SITE_HOST}/terms.
          </Text>
        </View>
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
