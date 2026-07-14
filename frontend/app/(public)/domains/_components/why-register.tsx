import { ArrowLeftRight, HeadphonesIcon, Settings2, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Free WHOIS privacy",
    description: "Your personal details stay off the public WHOIS record, at no extra cost.",
  },
  {
    icon: Settings2,
    title: "Easy DNS management",
    description: "Point your domain to any host or app in minutes from your dashboard.",
  },
  {
    icon: ArrowLeftRight,
    title: "Simple transfers",
    description: "Moving a domain in or out is a guided, low-friction process.",
  },
  {
    icon: HeadphonesIcon,
    title: "Human support",
    description: "Reach a real person when something needs a hand, not a bot.",
  },
]

export function WhyRegister() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Why register with Core IT
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
