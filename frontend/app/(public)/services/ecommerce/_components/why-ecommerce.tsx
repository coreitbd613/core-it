import { CreditCard, Package, ShoppingCart, TrendingUp } from "lucide-react"

const features = [
  {
    icon: ShoppingCart,
    title: "Built to sell",
    description: "Storefronts designed around conversion, from product pages to checkout.",
  },
  {
    icon: CreditCard,
    title: "Payment ready",
    description: "Integrated with the payment gateways your customers actually use.",
  },
  {
    icon: Package,
    title: "Inventory & fulfillment",
    description: "Stock, orders, and fulfillment managed from one connected system.",
  },
  {
    icon: TrendingUp,
    title: "Built to scale",
    description: "Handles growth in products, traffic, and orders without a rebuild.",
  },
]

export function WhyEcommerce() {
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
