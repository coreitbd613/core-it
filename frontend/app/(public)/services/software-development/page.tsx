import type { Metadata } from "next"

import { FaqSection } from "@/components/shared/faq-section"
import { HowItWorks } from "./_components/how-it-works"
import { WhySoftwareDevelopment } from "./_components/why-software-development"

const softwareDevelopmentFaqs = [
  {
    question: "What kind of software do you build?",
    answer:
      "Custom internal tools, CRM/ERP systems, dashboards, and business automation software — built around how your team actually works, not a rigid off-the-shelf package.",
  },
  {
    question: "Do you work with existing systems or start from scratch?",
    answer:
      "Both. We can build new software from the ground up, or extend and integrate with systems you already have in place.",
  },
  {
    question: "How involved will we be during the build?",
    answer:
      "As involved as you want. We check in at regular stages so you can review progress and give feedback before we move on.",
  },
  {
    question: "Do you provide support after launch?",
    answer:
      "Yes, we stay on for bug fixes, updates, and future iterations after the software goes live.",
  },
]

export const metadata: Metadata = {
  title: "Software Development",
  description:
    "Custom software built around how your business actually works. Software development services from Core IT.",
  alternates: { canonical: "/services/software-development" },
}

export default function SoftwareDevelopmentPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 text-center sm:px-6 md:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Software development
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Custom software built around how your business actually works —
            from internal tools to full CRM/ERP systems.
          </p>
        </div>
      </div>

      <WhySoftwareDevelopment />
      <HowItWorks />
      <FaqSection faqs={softwareDevelopmentFaqs} />
    </>
  )
}
