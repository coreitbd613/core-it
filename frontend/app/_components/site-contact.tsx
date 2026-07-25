import { Card, CardContent } from "@/components/ui/card"
import { ContactForm } from "@/components/shared/contact-form"
import { ContactInfo } from "@/components/shared/contact-info"
import { cn } from "@/lib/utils"

interface SiteContactProps {
  className?: string
}

const SiteContact = ({ className }: SiteContactProps) => {
  return (
    <section
      id="contact-us"
      className={cn("relative z-10 scroll-mt-16 bg-background py-24", className)}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-medium text-foreground md:text-6xl">
            Contact us
          </h2>
          <p className="mt-4 max-w-xl text-base tracking-tight text-muted-foreground">
            Have a project in mind? Core IT would love to hear about it.
          </p>
        </div>

        <Card className="mt-16 w-full">
          <CardContent className="grid grid-cols-1 gap-12 p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:p-10">
            <ContactInfo />
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export { SiteContact }
