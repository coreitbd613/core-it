import { Cpu, GitBranch, Layers, Users } from "lucide-react"

const features = [
  {
    icon: Layers,
    title: "Built around your workflow",
    description: "Custom software modeled on how your team actually operates, not a rigid off-the-shelf tool.",
  },
  {
    icon: Cpu,
    title: "Modern, scalable stack",
    description: "Architecture that handles today's needs and grows with your business tomorrow.",
  },
  {
    icon: GitBranch,
    title: "Clean, maintainable code",
    description: "Well-structured code and documentation, so it stays easy to extend long after launch.",
  },
  {
    icon: Users,
    title: "A team, not a vendor",
    description: "We stay involved through planning, build, and support — not just a one-off delivery.",
  },
]

export function WhySoftwareDevelopment() {
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
