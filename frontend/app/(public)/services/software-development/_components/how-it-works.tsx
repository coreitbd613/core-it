const steps = [
  {
    number: "01",
    title: "Discovery",
    description: "We dig into your workflow and requirements before writing a line of code.",
  },
  {
    number: "02",
    title: "Build & iterate",
    description: "We build in stages and check in regularly, so there are no surprises at the end.",
  },
  {
    number: "03",
    title: "Launch & support",
    description: "We ship the software and stay on for support, fixes, and future iterations.",
  },
]

export function HowItWorks() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">How it works</h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-10">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <span className="text-lg font-semibold text-primary">{step.number}</span>
              <h3 className="text-2xl font-medium">{step.title}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
