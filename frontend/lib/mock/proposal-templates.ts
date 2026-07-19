export type ProposalTemplateLineItem = {
  description: string
  quantity: number
  unitPriceBdt: number
}

export type ProposalTemplate = {
  id: string
  name: string
  descriptionHtml: string
  lineItems: ProposalTemplateLineItem[]
  taxPercent: number
  discountPercent: number
  paymentTerms: string
  timeline: string
}

export const mockProposalTemplates: ProposalTemplate[] = [
  {
    id: "template-saas-mvp",
    name: "SaaS MVP package",
    descriptionHtml:
      "<p>Design and build a minimum viable SaaS product, including user authentication, a core dashboard, and one primary workflow, ready for early customers.</p>",
    lineItems: [
      { description: "Product design & UX", quantity: 1, unitPriceBdt: 60000 },
      { description: "Frontend development", quantity: 1, unitPriceBdt: 140000 },
      { description: "Backend & database", quantity: 1, unitPriceBdt: 130000 },
      { description: "Auth & billing integration", quantity: 1, unitPriceBdt: 50000 },
    ],
    taxPercent: 0,
    discountPercent: 0,
    paymentTerms: "50% advance, 50% on delivery",
    timeline: "8-10 weeks from advance payment",
  },
  {
    id: "template-pos-system",
    name: "POS system package",
    descriptionHtml:
      "<p>A point-of-sale system for retail or restaurant use, covering sales, inventory tracking, and daily reporting.</p>",
    lineItems: [
      { description: "System design", quantity: 1, unitPriceBdt: 40000 },
      { description: "POS application development", quantity: 1, unitPriceBdt: 180000 },
      { description: "Inventory & reporting module", quantity: 1, unitPriceBdt: 70000 },
      { description: "Staff training & handover", quantity: 1, unitPriceBdt: 15000 },
    ],
    taxPercent: 0,
    discountPercent: 0,
    paymentTerms: "40% advance, 30% mid-project, 30% on delivery",
    timeline: "10-12 weeks from advance payment",
  },
  {
    id: "template-company-website",
    name: "Company website package",
    descriptionHtml:
      "<p>A modern marketing website with a homepage, service pages, blog, and contact form, built for search visibility and lead generation.</p>",
    lineItems: [
      { description: "Design", quantity: 1, unitPriceBdt: 35000 },
      { description: "Frontend development", quantity: 1, unitPriceBdt: 55000 },
      { description: "SEO setup & content structure", quantity: 1, unitPriceBdt: 15000 },
    ],
    taxPercent: 0,
    discountPercent: 0,
    paymentTerms: "50% advance, 50% on delivery",
    timeline: "4-6 weeks from advance payment",
  },
]
