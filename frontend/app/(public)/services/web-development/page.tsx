import type { Metadata } from "next"

import { FaqSection } from "@/components/shared/faq-section"
import { HowItWorks } from "./_components/how-it-works"
import { WhyWebDevelopment } from "./_components/why-web-development"

const webDevelopmentFaqs = [
  {
    question: "What kind of websites do you build?",
    answer:
      "Marketing sites, web apps, dashboards, and e-commerce storefronts — built with modern frameworks like Next.js and tailored to your business, not a generic template.",
  },
  {
    question: "How long does a website project take?",
    answer:
      "It depends on scope — a marketing site usually takes a few weeks, while a full web app can take longer. We'll give you a clear timeline after understanding your requirements.",
  },
  {
    question: "Do you handle hosting and domains too?",
    answer:
      "Yes. We can handle domain registration, hosting, and ongoing maintenance in addition to building the site, so you have one team for the whole thing.",
  },
  {
    question: "Can you redesign or improve our existing website?",
    answer:
      "Yes, we take on redesigns and rebuilds of existing sites, whether that means a visual refresh or a full rebuild on better technology.",
  },
]

export const metadata: Metadata = {
  title: "Web Development",
  description:
    "Fast, modern websites and web apps built around how your business actually works. Web development services from Core IT.",
  alternates: { canonical: "/services/web-development" },
}

export default function WebDevelopmentPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 text-center sm:px-6 md:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Web development
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Fast, modern websites and web apps that convert visitors — designed
            and built around how your business actually works.
          </p>
        </div>
      </div>

      <WhyWebDevelopment />
      <HowItWorks />
      <FaqSection faqs={webDevelopmentFaqs} />
    </>
  )
}
