import type { Metadata } from "next"

import { FaqSection } from "@/components/shared/faq-section"
import { HowItWorks } from "./_components/how-it-works"
import { PlanCards } from "./_components/plan-cards"
import { WhyHost } from "./_components/why-host"

const hostingFaqs = [
  {
    question: "How long does provisioning take?",
    answer:
      "Most VPS orders are set up shortly after we confirm your requirements. We'll reach out if anything needs clarifying first.",
  },
  {
    question: "Can I change OS or add extra software?",
    answer:
      "Yes, add your requirements in the notes field when ordering, or reach out afterward and we'll help set it up.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Yes. Contact us when you're ready to scale up and we'll move you to a bigger plan.",
  },
  {
    question: "Do you offer support after setup?",
    answer:
      "Yes, our team is reachable for server issues and configuration help after your VPS is live.",
  },
]

export const metadata: Metadata = {
  title: "Dedicated VPS Hosting",
  description:
    "Full root access, dedicated resources, and a team that answers when something needs a hand. Fast, reliable VPS hosting from CORE IT.",
  alternates: { canonical: "/hosting" },
}

export default function HostingPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 text-center sm:px-6 md:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Dedicated VPS hosting
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Full root access, dedicated resources, and a team that answers when
            something needs a hand.
          </p>
        </div>
      </div>

      <PlanCards />
      <WhyHost />
      <HowItWorks />
      <FaqSection faqs={hostingFaqs} />
    </>
  )
}
