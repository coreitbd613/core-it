export type LeadStage = "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST"

export type LeadSource =
  | "FACEBOOK_ADS"
  | "WHATSAPP"
  | "WEBSITE"
  | "REFERRAL"
  | "COLD_OUTREACH"
  | "SOCIAL_MEDIA"
  | "EVENT"
  | "OTHER"

export type LeadActivityType = "NOTE" | "STAGE_CHANGE" | "FOLLOW_UP_SCHEDULED" | "CONVERTED"

export type LeadActivity = {
  id: string
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
  estimatedValueBdt: number | null
  ownerName: string | null
  nextFollowUpAt: string | null
  convertedAt: string | null
  lostReason: string | null
  industry: string | null
  companySize: string | null
  tags: string[]
  temperatureOverride: LeadTemperature | null
  activities: LeadActivity[]
  createdAt: string
  updatedAt: string
}

export const LEAD_STAGE_ORDER: LeadStage[] = ["NEW", "CONTACTED", "QUALIFIED", "WON"]

export const LEAD_OWNERS = ["Rafiq Islam", "Nusrat Jahan"]

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

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"]

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
    .reduce((sum, lead) => sum + (lead.estimatedValueBdt ?? 0), 0)
}

export type LeadTemperature = "HOT" | "WARM" | "COOL"

export const leadTemperatureLabels: Record<LeadTemperature, string> = {
  HOT: "Hot",
  WARM: "Warm",
  COOL: "Cool",
}

export const leadTemperatureVariant: Record<
  LeadTemperature,
  "default" | "secondary" | "outline"
> = {
  HOT: "default",
  WARM: "secondary",
  COOL: "outline",
}

export function leadTemperature(
  lead: Pick<Lead, "estimatedValueBdt" | "temperatureOverride">
): LeadTemperature {
  if (lead.temperatureOverride) return lead.temperatureOverride
  const value = lead.estimatedValueBdt ?? 0
  if (value >= 200000) return "HOT"
  if (value >= 80000) return "WARM"
  return "COOL"
}

export function waLink(phone: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  return digits ? `https://wa.me/${digits}` : null
}

export function findLeadByEmail(email: string, excludeId?: string): Lead | undefined {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return undefined
  return mockLeads.find(
    (lead) => lead.id !== excludeId && lead.email?.toLowerCase() === normalized
  )
}

export function logLeadActivity(
  lead: Lead,
  type: LeadActivityType,
  message: string,
  authorName: string
): void {
  lead.activities.unshift({
    id: crypto.randomUUID(),
    type,
    message,
    authorName,
    createdAt: new Date().toISOString(),
  })
  lead.updatedAt = new Date().toISOString()
}

export const mockLeads: Lead[] = [
  {
    id: "lead-1",
    contactName: "Tanvir Ahmed",
    companyName: "Green Valley Foods",
    email: "tanvir@greenvalleyfoods.com",
    phone: "+880 1711-223344",
    source: "WEBSITE",
    sourceDetail: null,
    stage: "QUALIFIED",
    estimatedValueBdt: 180000,
    ownerName: "Rafiq Islam",
    nextFollowUpAt: "2026-07-28",
    convertedAt: null,
    lostReason: null,
    industry: "Food & Beverage",
    companySize: "11-50",
    tags: ["priority", "delivery-app"],
    temperatureOverride: null,
    activities: [
      {
        id: "act-1-3",
        type: "STAGE_CHANGE",
        message: "Stage changed to Qualified",
        authorName: "Rafiq Islam",
        createdAt: "2026-07-24T10:20:00",
      },
      {
        id: "act-1-2",
        type: "NOTE",
        message: "Had a discovery call — they need an online ordering system with delivery zones.",
        authorName: "Rafiq Islam",
        createdAt: "2026-07-22T14:00:00",
      },
      {
        id: "act-1-1",
        type: "STAGE_CHANGE",
        message: "Stage changed to Contacted",
        authorName: "Rafiq Islam",
        createdAt: "2026-07-20T09:00:00",
      },
    ],
    createdAt: "2026-07-18T08:30:00",
    updatedAt: "2026-07-24T10:20:00",
  },
  {
    id: "lead-2",
    contactName: "Nusrat Jahan",
    companyName: "Bay Traders Ltd",
    email: "nusrat@baytraders.com",
    phone: "+880 1812-556677",
    source: "REFERRAL",
    sourceDetail: null,
    stage: "CONTACTED",
    estimatedValueBdt: 260000,
    ownerName: "Nusrat Jahan",
    nextFollowUpAt: "2026-08-05",
    convertedAt: null,
    lostReason: null,
    industry: null,
    companySize: null,
    tags: [],
    temperatureOverride: null,
    activities: [
      {
        id: "act-2-1",
        type: "NOTE",
        message: "Referred by Acme Corp. Interested in an inventory management system.",
        authorName: "Nusrat Jahan",
        createdAt: "2026-07-30T11:15:00",
      },
    ],
    createdAt: "2026-07-30T11:00:00",
    updatedAt: "2026-07-30T11:15:00",
  },
  {
    id: "lead-3",
    contactName: "Shafiqul Karim",
    companyName: "Karim Textiles",
    email: "shafiqul@karimtextiles.com",
    phone: "+880 1913-778899",
    source: "FACEBOOK_ADS",
    sourceDetail: "Summer promo campaign",
    stage: "NEW",
    estimatedValueBdt: 90000,
    ownerName: null,
    nextFollowUpAt: "2026-08-06",
    convertedAt: null,
    lostReason: null,
    industry: null,
    companySize: null,
    tags: [],
    temperatureOverride: null,
    activities: [],
    createdAt: "2026-08-01T09:00:00",
    updatedAt: "2026-08-01T09:00:00",
  },
  {
    id: "lead-4",
    contactName: "Farhana Chowdhury",
    companyName: "Coastal Logistics",
    email: "farhana@coastallogistics.com",
    phone: "+880 1714-990011",
    source: "EVENT",
    sourceDetail: "Dhaka Logistics Expo 2026",
    stage: "QUALIFIED",
    estimatedValueBdt: 340000,
    ownerName: "Rafiq Islam",
    nextFollowUpAt: "2026-07-30",
    convertedAt: null,
    lostReason: null,
    industry: "Logistics & Transport",
    companySize: "51-200",
    tags: [],
    temperatureOverride: null,
    activities: [
      {
        id: "act-4-2",
        type: "NOTE",
        message: "Sent a proposal draft for their fleet-tracking dashboard. Waiting on budget sign-off.",
        authorName: "Rafiq Islam",
        createdAt: "2026-07-26T13:40:00",
      },
      {
        id: "act-4-1",
        type: "STAGE_CHANGE",
        message: "Stage changed to Qualified",
        authorName: "Rafiq Islam",
        createdAt: "2026-07-25T10:00:00",
      },
    ],
    createdAt: "2026-07-15T10:00:00",
    updatedAt: "2026-07-26T13:40:00",
  },
  {
    id: "lead-5",
    contactName: "Imran Hossain",
    companyName: "Dhaka Pharma Supplies",
    email: "imran@dhakapharma.com",
    phone: "+880 1615-334455",
    source: "FACEBOOK_ADS",
    sourceDetail: "Lead-gen ad — Eid campaign",
    stage: "WON",
    estimatedValueBdt: 210000,
    ownerName: "Nusrat Jahan",
    nextFollowUpAt: null,
    convertedAt: "2026-07-10T09:00:00",
    lostReason: null,
    industry: null,
    companySize: null,
    tags: [],
    temperatureOverride: null,
    activities: [
      {
        id: "act-5-2",
        type: "CONVERTED",
        message: "Converted to customer",
        authorName: "Nusrat Jahan",
        createdAt: "2026-07-10T09:00:00",
      },
      {
        id: "act-5-1",
        type: "STAGE_CHANGE",
        message: "Stage changed to Qualified",
        authorName: "Nusrat Jahan",
        createdAt: "2026-07-05T09:00:00",
      },
    ],
    createdAt: "2026-06-28T09:00:00",
    updatedAt: "2026-07-10T09:00:00",
  },
  {
    id: "lead-6",
    contactName: "Sabrina Yasmin",
    companyName: "Yasmin Interiors",
    email: "sabrina@yasmininteriors.com",
    phone: "+880 1516-112233",
    source: "REFERRAL",
    sourceDetail: null,
    stage: "LOST",
    estimatedValueBdt: 60000,
    ownerName: "Rafiq Islam",
    nextFollowUpAt: null,
    convertedAt: null,
    lostReason: "Went with an in-house solution instead.",
    industry: null,
    companySize: null,
    tags: [],
    temperatureOverride: null,
    activities: [
      {
        id: "act-6-1",
        type: "STAGE_CHANGE",
        message: "Stage changed to Lost — Went with an in-house solution instead.",
        authorName: "Rafiq Islam",
        createdAt: "2026-07-08T09:00:00",
      },
    ],
    createdAt: "2026-06-20T09:00:00",
    updatedAt: "2026-07-08T09:00:00",
  },
  {
    id: "lead-7",
    contactName: "Mahmudul Hasan",
    companyName: null,
    email: "mahmudul.hasan@gmail.com",
    phone: "+880 1317-667788",
    source: "WHATSAPP",
    sourceDetail: "Messaged directly after seeing a Facebook post",
    stage: "NEW",
    estimatedValueBdt: null,
    ownerName: null,
    nextFollowUpAt: "2026-08-04",
    convertedAt: null,
    lostReason: null,
    industry: null,
    companySize: null,
    tags: [],
    temperatureOverride: null,
    activities: [],
    createdAt: "2026-08-02T15:20:00",
    updatedAt: "2026-08-02T15:20:00",
  },
  {
    id: "lead-8",
    contactName: "Ruma Akter",
    companyName: "Akter Beauty Care",
    email: "ruma@akterbeauty.com",
    phone: "+880 1418-889900",
    source: "OTHER",
    sourceDetail: null,
    stage: "CONTACTED",
    estimatedValueBdt: 45000,
    ownerName: "Nusrat Jahan",
    nextFollowUpAt: "2026-07-29",
    convertedAt: null,
    lostReason: null,
    industry: null,
    companySize: null,
    tags: [],
    temperatureOverride: null,
    activities: [
      {
        id: "act-8-1",
        type: "NOTE",
        message: "Wants a simple booking page for her salon. Sending a quote this week.",
        authorName: "Nusrat Jahan",
        createdAt: "2026-07-24T12:00:00",
      },
    ],
    createdAt: "2026-07-23T10:00:00",
    updatedAt: "2026-07-24T12:00:00",
  },
]
