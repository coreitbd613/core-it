import type { Metadata } from "next"

import { Card, CardContent } from "@/components/ui/card"
import { ContactForm } from "./_components/contact-form"
import { ContactInfo } from "./_components/contact-info"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Core IT about your website, software, or hosting project.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 md:py-36 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Contact us
        </h1>
        <p className="mt-6 text-xl text-muted-foreground">
          Have a project in mind? We&apos;d love to hear about it.
        </p>
      </div>

      <Card className="mx-auto mt-16 max-w-4xl">
        <CardContent className="grid grid-cols-1 gap-12 p-8 md:grid-cols-2 md:p-10">
          <ContactInfo />
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  )
}
