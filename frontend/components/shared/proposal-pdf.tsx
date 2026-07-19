"use client"

import * as React from "react"
import { Document, Page, PDFDownloadLink, StyleSheet, Text, View, pdf } from "@react-pdf/renderer"
import { DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatBDT } from "@/lib/format"
import {
  proposalGrandTotalBdt,
  proposalTotalBdt,
  type Proposal,
} from "@/lib/mock/proposals"

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 18, fontWeight: 700 },
  proposalNumber: { fontSize: 10, color: "#666666", marginTop: 4 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 9, color: "#666666", textTransform: "uppercase", marginBottom: 4 },
  paragraph: { lineHeight: 1.5 },
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

function ProposalDocument({ proposal }: { proposal: Proposal }) {
  const subtotal = proposalTotalBdt(proposal)
  const total = proposalGrandTotalBdt(proposal)
  const discountAmount = subtotal * (proposal.discountPercent / 100)
  const taxAmount = (subtotal - discountAmount) * (proposal.taxPercent / 100)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Core IT</Text>
            <Text style={styles.proposalNumber}>{proposal.proposalNumber}</Text>
          </View>
          <View>
            <Text style={styles.proposalNumber}>Prepared for</Text>
            <Text>{proposal.organizationName}</Text>
          </View>
        </View>

        <Text style={styles.title}>{proposal.title}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Scope</Text>
          <Text style={styles.paragraph}>{stripHtml(proposal.descriptionHtml)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Line items</Text>
          <View style={styles.table}>
            {proposal.lineItems.map((item, index) => (
              <View
                key={item.id}
                style={index === proposal.lineItems.length - 1 ? styles.tableRowLast : styles.tableRow}
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
            {proposal.discountPercent > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount ({proposal.discountPercent}%)</Text>
                <Text>-{formatBDT(discountAmount)}</Text>
              </View>
            )}
            {proposal.taxPercent > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax ({proposal.taxPercent}%)</Text>
                <Text>{formatBDT(taxAmount)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatBDT(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Payment terms</Text>
          <Text style={styles.paragraph}>{proposal.paymentTerms || "—"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Timeline</Text>
          <Text style={styles.paragraph}>{proposal.timeline || "—"}</Text>
        </View>

        {proposal.validUntil && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Valid until</Text>
            <Text>{new Date(proposal.validUntil).toLocaleDateString()}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Terms & Conditions</Text>
          <Text style={styles.paragraph}>{stripHtml(proposal.termsHtml)}</Text>
        </View>
      </Page>
    </Document>
  )
}

/** Imperative download — for use in dropdown menu items where a render-prop component can't be mounted. */
export async function downloadProposalPdf(proposal: Proposal): Promise<void> {
  const blob = await pdf(<ProposalDocument proposal={proposal} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${proposal.proposalNumber}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export function ProposalDownloadButton({ proposal }: { proposal: Proposal }) {
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
      document={<ProposalDocument proposal={proposal} />}
      fileName={`${proposal.proposalNumber}.pdf`}
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
