import type { NotificationItem } from "@/components/shared/dashboard/notifications-bell"
import { mockContracts } from "@/lib/mock/contracts"
import { mockProposals } from "@/lib/mock/proposals"
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

  for (const c of mockContracts.filter((c) => c.organizationId === organizationId)) {
    if (c.status === "SENT") {
      items.push({
        id: `contract-sent-${c.id}`,
        title: "A contract is ready for your signature",
        description: c.title,
        href: `/contracts/${c.id}`,
        createdAt: c.sentAt,
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

  for (const p of mockProposals.filter((p) => p.status === "APPROVED" && !p.contractId)) {
    items.push({
      id: `proposal-approved-${p.id}`,
      title: `Proposal approved — send a contract`,
      description: `${p.title} (${p.organizationName})`,
      href: `/admin/proposals/${p.id}`,
      createdAt: p.respondedAt ?? p.sentAt ?? new Date().toISOString().slice(0, 10),
    })
  }

  for (const c of mockContracts.filter((c) => c.status === "SIGNED")) {
    const relatedProposal = mockProposals.find((p) => p.id === c.proposalId)
    if (relatedProposal?.convertedInvoiceId) continue
    items.push({
      id: `contract-signed-${c.id}`,
      title: `Contract signed — ready to convert to invoice`,
      description: `${c.title} (${c.organizationName})`,
      href: `/admin/proposals/${c.proposalId}`,
      createdAt: c.signedAt ?? c.sentAt,
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
