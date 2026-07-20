import { Gauge, LayoutTemplate, Search, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: LayoutTemplate,
    title: "Built around your business",
    description: "No templates stretched to fit — pages and flows designed for how you actually work.",
  },
  {
    icon: Gauge,
    title: "Fast by default",
    description: "Modern frameworks and clean code mean pages that load quickly and feel responsive.",
  },
  {
    icon: Search,
    title: "SEO-ready foundation",
    description: "Semantic markup, metadata, and sitemaps set up correctly from day one.",
  },
  {
    icon: ShieldCheck,
    title: "Built to maintain",
    description: "Clean, documented code your team — or ours — can extend without starting over.",
  },
]

export function WhyWebDevelopment() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Why build with Core IT
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-4">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-7" />
              </div>
              <h3 className="text-xl font-medium">{feature.title}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
