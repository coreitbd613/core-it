import type { Metadata } from "next"

import { FaqSection } from "@/components/shared/faq-section"
import { HowItWorks } from "./_components/how-it-works"
import { WhyDesignBranding } from "./_components/why-design-branding"

const designBrandingFaqs = [
  {
    question: "What's included in a branding project?",
    answer:
      "Logo design, color palette, typography, and brand guidelines — everything needed to apply your identity consistently across your site, app, and marketing.",
  },
  {
    question: "Can you refresh an existing brand?",
    answer:
      "Yes, we work on both new identities and refreshes of brands you already have.",
  },
  {
    question: "How long does a branding project take?",
    answer:
      "It depends on scope — we'll give you a clear timeline once we understand what you need.",
  },
  {
    question: "What do we receive at the end?",
    answer:
      "Final logo and brand assets in the formats you need, plus a guideline document covering usage, color, and typography.",
  },
]

export const metadata: Metadata = {
  title: "Design & Branding",
  description:
    "Identity and visual design that makes you memorable. Design and branding services from Core IT.",
  alternates: { canonical: "/services/design-branding" },
}

export default function DesignBrandingPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 text-center sm:px-6 md:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Design &amp; branding
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Identity and visual design that makes you memorable, built to
            stay consistent across every touchpoint.
          </p>
        </div>
      </div>

      <WhyDesignBranding />
      <HowItWorks />
      <FaqSection faqs={designBrandingFaqs} />
    </>
  )
}
