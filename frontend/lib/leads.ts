import { authFetch } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export type LeadSource =
  | "FACEBOOK_ADS"
  | "WHATSAPP"
  | "WEBSITE"
  | "REFERRAL"
  | "COLD_OUTREACH"
  | "SOCIAL_MEDIA"
  | "EVENT"
  | "OTHER"

export type LeadStage = "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST"

export type LeadActivityType = "NOTE" | "STAGE_CHANGE" | "FOLLOW_UP_SCHEDULED" | "CONVERTED"

export const LEAD_STAGE_ORDER: LeadStage[] = ["NEW", "CONTACTED", "QUALIFIED", "WON"]

export const INDUSTRIES = [
  "Retail & E-commerce",
  "Food & Beverage",
  "Manufacturing",
  "Logistics & Transport",
  "Healthcare & Pharma",
  "Textiles & Garments",
  "Real Estate",
  "Professional Services",
  "Other",
]

export const leadStageLabels: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  WON: "Won",
  LOST: "Lost",
}

export const leadStageVariant: Record<
  LeadStage,
  "default" | "secondary" | "outline" | "destructive"
> = {
  NEW: "outline",
  CONTACTED: "secondary",
  QUALIFIED: "secondary",
  WON: "default",
  LOST: "destructive",
}

export const leadSourceLabels: Record<LeadSource, string> = {
  FACEBOOK_ADS: "Facebook Ads",
  WHATSAPP: "WhatsApp",
  WEBSITE: "Website",
  REFERRAL: "Referral",
  COLD_OUTREACH: "Cold outreach",
  SOCIAL_MEDIA: "Social media",
  EVENT: "Event",
  OTHER: "Other",
}

export type LeadActivity = {
  id: string
  leadId: string
  type: LeadActivityType
  message: string
  authorName: string
  createdAt: string
}

export type Lead = {
  id: string
  contactName: string
  companyName: string | null
  email: string | null
  phone: string | null
  source: LeadSource
  sourceDetail: string | null
  stage: LeadStage
  // Decimal fields serialize as strings over the wire — parse with Number() when doing math.
  estimatedValueBdt: string | null
  nextFollowUpAt: string | null
  convertedAt: string | null
  lostReason: string | null
  industry: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  activities: LeadActivity[]
}

export function isLeadClosed(lead: Pick<Lead, "stage">): boolean {
  return lead.stage === "WON" || lead.stage === "LOST"
}

export function isLeadOverdue(lead: Pick<Lead, "nextFollowUpAt" | "stage">): boolean {
  if (!lead.nextFollowUpAt || isLeadClosed(lead)) return false
  return new Date(lead.nextFollowUpAt) < new Date(new Date().toDateString())
}

export function pipelineValueBdt(leads: Lead[]): number {
  return leads
    .filter((lead) => !isLeadClosed(lead))
    .reduce((sum, lead) => sum + (lead.estimatedValueBdt ? Number(lead.estimatedValueBdt) : 0), 0)
}

export function waLink(phone: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  return digits ? `https://wa.me/${digits}` : null
}

export type CreateLeadInput = {
  contactName: string
  companyName?: string
  email?: string
  phone?: string
  source: LeadSource
  sourceDetail?: string
  estimatedValueBdt?: number
  nextFollowUpAt?: string
  industry?: string
  tags?: string[]
  initialNote?: string
}

export type UpdateLeadInput = {
  contactName?: string
  companyName?: string | null
  email?: string | null
  phone?: string | null
  source?: LeadSource
  sourceDetail?: string | null
  estimatedValueBdt?: number | null
  nextFollowUpAt?: string | null
  industry?: string | null
  tags?: string[]
}

export type UpdateLeadStageInput = { stage: LeadStage; lostReason?: string }
export type UpdateFollowUpInput = { nextFollowUpAt?: string | null }
export type CreateLeadActivityInput = { message: string }

async function parseErrorMessage(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null
  return body?.message ?? fallback
}

export async function getAdminLeads(filters?: {
  stage?: LeadStage
  source?: LeadSource
}): Promise<Lead[]> {
  const params = new URLSearchParams()
  if (filters?.stage) params.set("stage", filters.stage)
  if (filters?.source) params.set("source", filters.source)
  const query = params.toString() ? `?${params.toString()}` : ""

  const res = await authFetch(`${API_URL}/leads/admin${query}`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load leads."))
  }
  return (await res.json()) as Lead[]
}

export async function getAdminLead(id: string): Promise<Lead> {
  const res = await authFetch(`${API_URL}/leads/admin/${id}`, {}, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't load this lead."))
  }
  return (await res.json()) as Lead
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const res = await authFetch(
    `${API_URL}/leads/admin`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't create this lead."))
  }
  return (await res.json()) as Lead
}

export async function updateLead(id: string, input: UpdateLeadInput): Promise<Lead> {
  const res = await authFetch(
    `${API_URL}/leads/admin/${id}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't save this lead."))
  }
  return (await res.json()) as Lead
}

export async function deleteLead(id: string): Promise<void> {
  const res = await authFetch(`${API_URL}/leads/admin/${id}`, { method: "DELETE" }, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't delete this lead."))
  }
}

export async function updateLeadStage(id: string, input: UpdateLeadStageInput): Promise<Lead> {
  const res = await authFetch(
    `${API_URL}/leads/admin/${id}/stage`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't update this lead's stage."))
  }
  return (await res.json()) as Lead
}

export async function convertLead(id: string): Promise<Lead> {
  const res = await authFetch(`${API_URL}/leads/admin/${id}/convert`, { method: "POST" }, "admin")
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't convert this lead."))
  }
  return (await res.json()) as Lead
}

export async function updateFollowUp(id: string, input: UpdateFollowUpInput): Promise<Lead> {
  const res = await authFetch(
    `${API_URL}/leads/admin/${id}/follow-up`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't update the follow-up date."))
  }
  return (await res.json()) as Lead
}

export async function addLeadActivity(id: string, input: CreateLeadActivityInput): Promise<Lead> {
  const res = await authFetch(
    `${API_URL}/leads/admin/${id}/activities`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) },
    "admin"
  )
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Couldn't add this note."))
  }
  return (await res.json()) as Lead
}
