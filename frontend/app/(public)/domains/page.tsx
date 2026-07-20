import type { Metadata } from "next"

import { FaqSection } from "@/components/shared/faq-section"
import { SparklesText } from "@/components/ui/sparkles-text"
import { DomainSearch } from "./_components/domain-search"
import { HowItWorks } from "./_components/how-it-works"
import { PopularTlds } from "./_components/popular-tlds"
import { WhyRegister } from "./_components/why-register"

const domainFaqs = [
  {
    question: "How long does registration take?",
    answer:
      "Most domains are active within a few minutes of your order being confirmed. Some extensions may take a little longer to propagate.",
  },
  {
    question: "Is WHOIS privacy included?",
    answer:
      "Yes, WHOIS privacy protection is included at no extra cost on supported extensions, so your personal details aren't publicly listed.",
  },
  {
    question: "Can I transfer a domain I already own?",
    answer:
      "Yes. Reach out with your domain name and current registrar, and we'll guide you through the transfer process.",
  },
  {
    question: "What happens when my domain is close to expiring?",
    answer:
      "You'll get renewal reminders ahead of your expiry date so you can renew from your dashboard before the domain lapses.",
  },
]

export const metadata: Metadata = {
  title: "Domain Registration",
  description:
    "Search for the perfect domain name and register it in minutes with CORE IT. Competitive pricing on popular TLDs.",
  alternates: { canonical: "/domains" },
}

export default function DomainsPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 md:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Find your{" "}
            <SparklesText
              as="span"
              className="inline text-5xl font-bold tracking-tight sm:text-6xl"
              colors={{ first: "#FD6005", second: "#0A2540" }}
              sparklesCount={6}
            >
              domain
            </SparklesText>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Search for the perfect name and register it in minutes.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <DomainSearch />
        </div>
      </div>

      <PopularTlds />
      <WhyRegister />
      <HowItWorks />
      <FaqSection faqs={domainFaqs} />
    </>
  )
}
