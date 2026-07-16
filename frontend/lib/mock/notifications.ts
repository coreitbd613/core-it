import type { NotificationItem } from "@/components/shared/dashboard/notifications-bell"
import { mockProposals } from "@/lib/mock/proposals"
import { mockQuotations } from "@/lib/mock/quotations"
import { deriveInvoiceStatus, mockInvoices } from "@/lib/mock/invoices"
import { mockRevisionRequests, mockProjects } from "@/lib/mock/projects"

export function getClientNotifications(organizationId: string): NotificationItem[] {
  const items: NotificationItem[] = []

  for (const p of mockProposals.filter((p) => p.organizationId === organizationId)) {
    if (p.status === "SENT" && p.sentAt) {
      items.push({
        id: `proposal-${p.id}`,
        title: "New proposal awaiting your response",
        description: p.title,
        href: `/proposals/${p.id}`,
        createdAt: p.sentAt,
      })
    }
  }

  for (const q of mockQuotations.filter((q) => q.organizationId === organizationId)) {
    if (q.status === "SENT" && q.sentAt) {
      items.push({
        id: `quotation-${q.id}`,
        title: "New quotation awaiting your response",
        description: q.title,
        href: `/quotations/${q.id}`,
        createdAt: q.sentAt,
      })
    }
  }

  for (const inv of mockInvoices.filter((inv) => inv.organizationId === organizationId)) {
    const status = deriveInvoiceStatus(inv)
    if (status === "OVERDUE") {
      items.push({
        id: `invoice-overdue-${inv.id}`,
        title: "Invoice overdue",
        description: `${inv.number} was due ${new Date(inv.dueAt).toLocaleDateString()}`,
        href: `/invoices/${inv.id}`,
        createdAt: inv.dueAt,
      })
    }
  }

  const orgProjectIds = new Set(
    mockProjects.filter((p) => p.organizationId === organizationId).map((p) => p.id)
  )
  for (const r of mockRevisionRequests.filter((r) => orgProjectIds.has(r.projectId))) {
    if (r.status === "DONE" && r.respondedAt) {
      items.push({
        id: `revision-done-${r.id}`,
        title: "Your revision request was completed",
        description: r.description,
        href: `/projects/${r.projectId}`,
        createdAt: r.respondedAt,
      })
    }
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getAdminNotifications(): NotificationItem[] {
  const items: NotificationItem[] = []

  for (const r of mockRevisionRequests.filter((r) => r.status === "OPEN")) {
    const project = mockProjects.find((p) => p.id === r.projectId)
    items.push({
      id: `revision-open-${r.id}`,
      title: `New revision request${project ? ` — ${project.organizationName}` : ""}`,
      description: r.description,
      href: `/admin/projects/${r.projectId}`,
      createdAt: r.requestedAt,
    })
  }

  for (const q of mockQuotations.filter((q) => q.status === "ACCEPTED")) {
    items.push({
      id: `quotation-accepted-${q.id}`,
      title: `Quotation accepted — ready to convert`,
      description: `${q.title} (${q.organizationName})`,
      href: `/admin/quotations/${q.id}`,
      createdAt: q.respondedAt ?? q.sentAt ?? new Date().toISOString().slice(0, 10),
    })
  }

  for (const inv of mockInvoices) {
    if (deriveInvoiceStatus(inv) === "OVERDUE") {
      items.push({
        id: `invoice-overdue-admin-${inv.id}`,
        title: `Invoice overdue — ${inv.organizationName}`,
        description: `${inv.number} was due ${new Date(inv.dueAt).toLocaleDateString()}`,
        href: `/admin/invoices/${inv.id}`,
        createdAt: inv.dueAt,
      })
    }
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
