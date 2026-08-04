"use client"

import * as React from "react"
import { Document, Font, Image, Link, Page, PDFDownloadLink, StyleSheet, Text, View, pdf } from "@react-pdf/renderer"
import { DownloadIcon } from "lucide-react"
import QRCode from "qrcode"

import { Button } from "@/components/ui/button"
import { BUSINESS_ADDRESS, MAPS_URL, MOBILE_BANKING_NUMBER, PRIVACY_URL, TERMS_URL } from "@/lib/contact"
import { formatBDT, formatDate } from "@/lib/format"
import {
  deriveInvoiceStatus,
  invoiceBalanceBdt,
  invoiceGrandTotalBdt,
  invoicePaidBdt,
  invoiceStatusLabels,
  invoiceTotalBdt,
  paymentMethodLabels,
  type Invoice,
} from "@/lib/mock/invoices"
import { mockOrganizations } from "@/lib/mock/organizations"

// react-pdf's default fonts (Helvetica) have no Bengali Taka glyph ("৳"), so the whole
// document uses Noto Sans Bengali instead — it covers both Bengali and Latin/ASCII text.
Font.register({
  family: "NotoSansBengali",
  fonts: [
    { src: "/fonts/NotoSansBengali-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/NotoSansBengali-Bold.ttf", fontWeight: 700 },
  ],
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "")

function invoiceViewUrl(invoiceId: string): string {
  return `${SITE_URL}/invoices/view/${invoiceId}`
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#1a1a1a", fontFamily: "NotoSansBengali" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { width: 150, height: 39 },
  invoiceTitle: { fontSize: 20, fontWeight: 700, textAlign: "right" },
  invoiceNumber: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.3,
    color: "#FD6005",
    marginTop: 4,
    textAlign: "right",
  },
  invoiceStatus: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#c0392b",
    marginTop: 2,
    textAlign: "right",
  },
  invoiceStatusPaid: { color: "#16a34a" },
  qrImage: { width: 56, height: 56, marginBottom: 6 },
  metaSection: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 20,
    paddingTop: 16,
  },
  metaColumn: { flex: 1 },
  metaColumnRight: { flex: 1, alignItems: "flex-end" },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  metaRow: { flexDirection: "row", gap: 4, marginTop: 2 },
  metaLabel: { color: "#1a1a1a" },
  section: { marginTop: 20 },
  table: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "#1a1a1a",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 8,
  },
  tableRowLast: { flexDirection: "row", padding: 8 },
  cellIndex: { width: 20, color: "#1a1a1a" },
  cellDescription: { flex: 3, fontWeight: 700 },
  cellQty: { flex: 1, textAlign: "right", color: "#1a1a1a" },
  cellRate: { flex: 1, textAlign: "right", color: "#1a1a1a" },
  cellAmount: { flex: 1, textAlign: "right", fontWeight: 700 },
  totalsBlock: { marginTop: 12, alignItems: "flex-end", gap: 4 },
  totalsRow: { flexDirection: "row", gap: 16 },
  totalsLabel: { color: "#1a1a1a" },
  grandTotalRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  grandTotalLabel: { fontWeight: 700 },
  grandTotalValue: { fontWeight: 700 },
  txCellNumber: { width: 50, color: "#1a1a1a" },
  txCellMethod: { flex: 1 },
  txCellDate: { flex: 1, color: "#1a1a1a" },
  txCellAmount: { flex: 1, textAlign: "right", fontWeight: 700 },
})

function InvoiceDocument({
  invoice,
  qrCodeDataUrl,
  logoDataUrl,
}: {
  invoice: Invoice
  qrCodeDataUrl: string | null
  logoDataUrl: string | null
}) {
  const subtotal = invoiceTotalBdt(invoice)
  const discountAmount = subtotal * (invoice.discountPercent / 100)
  const taxAmount = (subtotal - discountAmount) * (invoice.taxPercent / 100)
  const total = invoiceGrandTotalBdt(invoice)
  const paid = invoicePaidBdt(invoice)
  const balance = invoiceBalanceBdt(invoice)
  const status = deriveInvoiceStatus(invoice)
  const canPay = balance > 0 && status !== "CANCELLED" && status !== "DRAFT"
  const contactName = mockOrganizations.find((org) => org.id === invoice.organizationId)?.contactName

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoDataUrl && <Image src={logoDataUrl} style={styles.logo} />}
          <View>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
            <Text
              style={[styles.invoiceStatus, status === "PAID" ? styles.invoiceStatusPaid : {}]}
            >
              {invoiceStatusLabels[status]}
            </Text>
          </View>
        </View>

        <View style={styles.metaSection}>
          <View style={styles.metaColumn}>
            <Text style={styles.sectionLabel}>Bill to</Text>
            {contactName && (
              <Text style={{ fontWeight: 700, color: "#1a1a1a" }}>{contactName}</Text>
            )}
            <Text style={contactName ? styles.metaLabel : { fontWeight: 700, color: "#1a1a1a" }}>
              {invoice.organizationName}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice date:</Text>
              <Text>{formatDate(invoice.issuedAt)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due date:</Text>
              <Text>{formatDate(invoice.dueAt)}</Text>
            </View>
          </View>
          <View style={styles.metaColumnRight}>
            {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qrImage} />}
            <Text style={{ fontWeight: 700, color: "#1a1a1a" }}>Core IT</Text>
            <Text style={styles.metaLabel}>{SITE_HOST}</Text>
            <Text style={styles.metaLabel}>info@coreitbd.com</Text>
            <Link
              src={MAPS_URL}
              style={[styles.metaLabel, { textAlign: "right", color: "#1a1a1a", textDecoration: "none" }]}
            >
              {BUSINESS_ADDRESS}
            </Link>
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
                <Text style={styles.cellRate}>{formatBDT(item.unitPriceBdt)}</Text>
                <Text style={styles.cellAmount}>
                  {formatBDT(item.quantity * item.unitPriceBdt)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Sub total</Text>
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
              <Text style={styles.grandTotalLabel}>Amount due</Text>
              <Text style={styles.grandTotalValue}>{formatBDT(balance)}</Text>
            </View>
          </View>
        </View>

        {invoice.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Transactions</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderText, styles.txCellNumber]}>Payment</Text>
                <Text style={[styles.tableHeaderText, styles.txCellMethod]}>Method</Text>
                <Text style={[styles.tableHeaderText, styles.txCellDate]}>Date</Text>
                <Text style={[styles.tableHeaderText, styles.txCellAmount]}>Amount</Text>
              </View>
              {invoice.payments.map((payment, index) => (
                <View
                  key={payment.id}
                  style={index === invoice.payments.length - 1 ? styles.tableRowLast : styles.tableRow}
                >
                  <Text style={styles.txCellNumber}>#{index + 1}</Text>
                  <Text style={styles.txCellMethod}>{paymentMethodLabels[payment.method]}</Text>
                  <Text style={styles.txCellDate}>{formatDate(payment.paidAt)}</Text>
                  <Text style={styles.txCellAmount}>{formatBDT(payment.amountBdt)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {canPay && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Offline payment</Text>
            <Text>bKash / Nagad / Rocket</Text>
            <Text>Send Money to {MOBILE_BANKING_NUMBER} (Personal)</Text>
            <Text style={{ marginTop: 4, fontSize: 8, color: "#1a1a1a" }}>
              Please add{" "}
              <Text style={{ fontWeight: 700, color: "#1a1a1a" }}>{invoice.number}</Text> as the
              reference.
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
          <Text style={{ fontSize: 8, color: "#1a1a1a" }}>
            By proceeding with this invoice and/or payment, the client acknowledges and agrees to
            the Terms of Service ({TERMS_URL}) and Privacy Policy ({PRIVACY_URL}).
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

// react-pdf's <Image> can't reliably load a network URL, so the logo is fetched once and
// reused as a base64 data URI — the same trick already works for the QR code above.
// Fetched by relative path (not SITE_URL) so it always matches the origin actually serving
// the page, even when NEXT_PUBLIC_SITE_URL is misconfigured (e.g. wrong protocol locally).
let logoDataUrlPromise: Promise<string | null> | null = null
function getLogoDataUrl(): Promise<string | null> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch("/logo-light.png")
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string | null>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = () => resolve(null)
            reader.readAsDataURL(blob)
          })
      )
      .catch(() => null)
    logoDataUrlPromise.then((result) => {
      if (!result) logoDataUrlPromise = null
    })
  }
  return logoDataUrlPromise
}

/** Imperative download — for use in dropdown menu items where a render-prop component can't be mounted. */
export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const [qrCodeDataUrl, logoDataUrl] = await Promise.all([
    generateQrCodeDataUrl(invoice.id),
    getLogoDataUrl(),
  ])
  const blob = await pdf(
    <InvoiceDocument invoice={invoice} qrCodeDataUrl={qrCodeDataUrl} logoDataUrl={logoDataUrl} />
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
  const [logoDataUrl, setLogoDataUrl] = React.useState<string | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    Promise.all([generateQrCodeDataUrl(invoice.id), getLogoDataUrl()]).then(([qr, logo]) => {
      if (cancelled) return
      setQrCodeDataUrl(qr)
      setLogoDataUrl(logo)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [invoice.id])

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
      document={
        <InvoiceDocument invoice={invoice} qrCodeDataUrl={qrCodeDataUrl} logoDataUrl={logoDataUrl} />
      }
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
