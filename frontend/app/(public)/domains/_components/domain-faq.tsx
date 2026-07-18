import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
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

export function DomainFaq() {
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
