import type { Metadata } from "next"

import { HostingFaq } from "./_components/hosting-faq"
import { HowItWorks } from "./_components/how-it-works"
import { PlanCards } from "./_components/plan-cards"
import { WhyHost } from "./_components/why-host"

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
      <HostingFaq />
    </>
  )
}
