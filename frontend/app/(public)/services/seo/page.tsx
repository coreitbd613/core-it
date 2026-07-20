import type { Metadata } from "next"

import { FaqSection } from "@/components/shared/faq-section"
import { HowItWorks } from "./_components/how-it-works"
import { WhySeo } from "./_components/why-seo"

const seoFaqs = [
  {
    question: "How long does it take to see SEO results?",
    answer:
      "SEO is a longer-term investment — most sites start seeing meaningful movement within a few months, with results building over time as content and technical fixes take effect.",
  },
  {
    question: "What's included in your SEO service?",
    answer:
      "A technical audit, on-page and content optimization, and ongoing monitoring with regular reporting on rankings and traffic.",
  },
  {
    question: "Is this a one-time project or ongoing?",
    answer:
      "Both are available — a one-time technical audit and fix, or ongoing SEO as ranking and content needs evolve.",
  },
  {
    question: "Will I get reports on progress?",
    answer:
      "Yes, we send regular reports covering rankings, traffic, and the work completed.",
  },
]

export const metadata: Metadata = {
  title: "Search Engine Optimization",
  description:
    "Get found on Google with technical and content SEO. Search engine optimization services from Core IT.",
  alternates: { canonical: "/services/seo" },
}

export default function SeoPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 text-center sm:px-6 md:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Search engine optimization
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Get found on Google with technical and content SEO built around
            the searches your customers are actually making.
          </p>
        </div>
      </div>

      <WhySeo />
      <HowItWorks />
      <FaqSection faqs={seoFaqs} />
    </>
  )
}
