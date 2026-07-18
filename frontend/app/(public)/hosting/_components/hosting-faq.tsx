import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
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

export function HostingFaq() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Frequently asked questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
