import { HostingFaq } from "./_components/hosting-faq"
import { HowItWorks } from "./_components/how-it-works"
import { PlanCards } from "./_components/plan-cards"
import { WhyHost } from "./_components/why-host"

export default function HostingPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-28 text-center sm:px-6 md:py-36 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Dedicated VPS hosting
        </h1>
        <p className="mt-3 text-muted-foreground">
          Full root access, dedicated resources, and a team that answers when
          something needs a hand.
        </p>
      </div>

      <PlanCards />
      <WhyHost />
      <HowItWorks />
      <HostingFaq />
    </>
  )
}
