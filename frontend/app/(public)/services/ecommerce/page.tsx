import type { Metadata } from "next"

import { FaqSection } from "@/components/shared/faq-section"
import { HowItWorks } from "./_components/how-it-works"
import { WhyEcommerce } from "./_components/why-ecommerce"

const ecommerceFaqs = [
  {
    question: "Which payment gateways do you support?",
    answer:
      "We integrate with the payment gateways available in your market, including local options for Bangladesh, so customers can check out the way they expect.",
  },
  {
    question: "Can you migrate our existing store?",
    answer:
      "Yes, we can migrate products, orders, and customer data from your existing platform to a new storefront.",
  },
  {
    question: "How long does an e-commerce build take?",
    answer:
      "It depends on catalog size and features — we'll give you a clear timeline once we understand your requirements.",
  },
  {
    question: "Do you support the store after launch?",
    answer:
      "Yes, we're reachable for updates, fixes, and new features as your store grows.",
  },
]

export const metadata: Metadata = {
  title: "E-Commerce Development",
  description:
    "Online stores built to sell, from checkout to fulfillment. E-commerce development services from Core IT.",
  alternates: { canonical: "/services/ecommerce" },
}

export default function EcommercePage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 text-center sm:px-6 md:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            E-commerce development
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Online stores built to sell, from product pages and checkout
            through to fulfillment.
          </p>
        </div>
      </div>

      <WhyEcommerce />
      <HowItWorks />
      <FaqSection faqs={ecommerceFaqs} />
    </>
  )
}
