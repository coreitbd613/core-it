import { Mail, MessageCircle } from "lucide-react"

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
]

export function ContactInfo() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Let&apos;s talk about your project
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Whether you have a clear scope or just an idea, tell us what you&apos;re
          trying to build and we&apos;ll get back to you.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {contactPoints.map((point) => (
          <a
            key={point.label}
            href={point.href}
            target={point.href.startsWith("http") ? "_blank" : undefined}
            rel={point.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-start gap-4"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <point.icon className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">{point.label}</span>
              <span className="text-base font-medium">{point.value}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
