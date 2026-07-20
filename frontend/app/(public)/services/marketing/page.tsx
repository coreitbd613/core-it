import type { Metadata } from "next"

import { FaqSection } from "@/components/shared/faq-section"
import { HowItWorks } from "./_components/how-it-works"
import { WhyMarketing } from "./_components/why-marketing"

const marketingFaqs = [
  {
    question: "Which channels do you cover?",
    answer:
      "Social media, search, and paid advertising, chosen based on where your customers actually spend time.",
  },
  {
    question: "Do you need a minimum budget to start?",
    answer:
      "We'll recommend a budget based on your goals and market once we understand what you're trying to achieve — reach out and we can talk specifics.",
  },
  {
    question: "How long until we see results?",
    answer:
      "Paid campaigns can show results within days; organic and brand-building efforts take longer. We'll set expectations upfront based on your channels.",
  },
  {
    question: "Will I get reports on campaign performance?",
    answer:
      "Yes, we send regular reports covering reach, engagement, and results against your goals.",
  },
]

export const metadata: Metadata = {
  title: "Marketing",
  description:
    "Campaigns that bring the right customers to your door. Digital marketing services from Core IT.",
  alternates: { canonical: "/services/marketing" },
}

export default function MarketingPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 text-center sm:px-6 md:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Marketing
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Campaigns that bring the right customers to your door, built
            around data instead of guesswork.
          </p>
        </div>
      </div>

      <WhyMarketing />
      <HowItWorks />
      <FaqSection faqs={marketingFaqs} />
    </>
  )
}
