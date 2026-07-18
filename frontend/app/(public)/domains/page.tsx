import type { Metadata } from "next"

import { SparklesText } from "@/components/ui/sparkles-text"
import { DomainFaq } from "./_components/domain-faq"
import { DomainSearch } from "./_components/domain-search"
import { HowItWorks } from "./_components/how-it-works"
import { PopularTlds } from "./_components/popular-tlds"
import { WhyRegister } from "./_components/why-register"

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
      <DomainFaq />
    </>
  )
}
