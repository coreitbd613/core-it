import { BarChart3, FileSearch, MapPin, Search } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Technical SEO",
    description: "Site speed, structure, and metadata fixed so search engines can crawl and rank you.",
  },
  {
    icon: FileSearch,
    title: "Content strategy",
    description: "Content built around the searches your customers are actually making.",
  },
  {
    icon: MapPin,
    title: "Local search",
    description: "Get found by customers searching in Bangladesh and wherever your business operates.",
  },
  {
    icon: BarChart3,
    title: "Measurable results",
    description: "Regular reporting so you can see rankings and traffic move over time.",
  },
]

export function WhySeo() {
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
