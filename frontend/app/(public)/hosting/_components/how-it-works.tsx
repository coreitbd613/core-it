const steps = [
  {
    number: "01",
    title: "Choose a plan",
    description: "Pick the VPS tier that matches your workload.",
  },
  {
    number: "02",
    title: "Place your order",
    description: "Share your contact details and any setup requirements.",
  },
  {
    number: "03",
    title: "Get your server",
    description: "We provision your VPS and hand over root access.",
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
