import { DomainFaq } from "./_components/domain-faq"
import { DomainSearch } from "./_components/domain-search"
import { HowItWorks } from "./_components/how-it-works"
import { PopularTlds } from "./_components/popular-tlds"
import { WhyRegister } from "./_components/why-register"

export default function DomainsPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-28 sm:px-6 md:py-36 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find your domain
          </h1>
          <p className="mt-3 text-muted-foreground">
            Search for the perfect name and register it in minutes.
          </p>
        </div>

        <DomainSearch />
      </div>

      <PopularTlds />
      <WhyRegister />
      <HowItWorks />
      <DomainFaq />
    </>
  )
}
