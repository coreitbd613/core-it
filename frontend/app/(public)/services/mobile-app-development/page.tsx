import type { Metadata } from "next"

import { FaqSection } from "@/components/shared/faq-section"
import { HowItWorks } from "./_components/how-it-works"
import { WhyMobileAppDevelopment } from "./_components/why-mobile-app-development"

const mobileAppFaqs = [
  {
    question: "Do you build for iOS, Android, or both?",
    answer:
      "Both — either native apps for each platform or a single cross-platform codebase, depending on your budget, timeline, and feature needs.",
  },
  {
    question: "Do you handle app store submission?",
    answer:
      "Yes, we handle the build, testing, and submission process for the App Store and Google Play.",
  },
  {
    question: "Can you build the backend for the app too?",
    answer:
      "Yes, we build the APIs, databases, and admin tools your app needs alongside the mobile app itself.",
  },
  {
    question: "Do you support the app after launch?",
    answer:
      "Yes, we're reachable for bug fixes, updates, and new features as your app and user base grow.",
  },
]

export const metadata: Metadata = {
  title: "Mobile App Development",
  description:
    "Native and cross-platform apps for iOS and Android, built around your business. Mobile app development services from Core IT.",
  alternates: { canonical: "/services/mobile-app-development" },
}

export default function MobileAppDevelopmentPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 text-center sm:px-6 md:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Mobile app development
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Native and cross-platform apps for iOS and Android, built around
            how your business and your users actually work.
          </p>
        </div>
      </div>

      <WhyMobileAppDevelopment />
      <HowItWorks />
      <FaqSection faqs={mobileAppFaqs} />
    </>
  )
}
