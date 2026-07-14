const steps = [
  {
    number: "01",
    title: "Search",
    description: "Check any name across popular extensions for live availability and pricing.",
  },
  {
    number: "02",
    title: "Register",
    description: "Pick your domain, fill in registrant details, and complete checkout.",
  },
  {
    number: "03",
    title: "Manage",
    description: "Point DNS, renew, or transfer your domain anytime from your dashboard.",
  },
]

export function HowItWorks() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-primary">{step.number}</span>
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
