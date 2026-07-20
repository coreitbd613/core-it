import { Palette, PenTool, Shapes, Sparkles } from "lucide-react"

const features = [
  {
    icon: PenTool,
    title: "Identity systems",
    description: "Logo, color, and typography built to work together as one system.",
  },
  {
    icon: Shapes,
    title: "Consistent everywhere",
    description: "Your brand looks and feels the same across your site, app, and marketing.",
  },
  {
    icon: Sparkles,
    title: "Modern & memorable",
    description: "Design that stands out without chasing every trend.",
  },
  {
    icon: Palette,
    title: "Collaborative process",
    description: "You're involved at every stage, from concept through final delivery.",
  },
]

export function WhyDesignBranding() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Why work with Core IT
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
