import { Mail, MapPin, MessageCircle } from "lucide-react"

import { BUSINESS_ADDRESS, MAPS_URL } from "@/lib/contact"

const contactPoints = [
  {
    icon: Mail,
    label: "Email",
    value: "info@coreitbd.com",
    href: "mailto:info@coreitbd.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+880 1581 633810",
    href: "https://wa.me/8801581633810",
  },
  {
    icon: MapPin,
    label: "Location",
    value: BUSINESS_ADDRESS,
    href: MAPS_URL,
  },
]

export function ContactInfo() {
  return (
    <div className="flex h-full flex-col justify-center gap-10">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Let&apos;s talk about your project
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Whether you have a clear scope or just an idea, tell Core IT what
          you&apos;re trying to build and Core IT will get back to you.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {contactPoints.map((point) => (
          <a
            key={point.label}
            href={point.href}
            target={point.href.startsWith("http") ? "_blank" : undefined}
            rel={point.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-start gap-4"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <point.icon className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{point.label}</span>
              <span className="text-lg font-medium">{point.value}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
