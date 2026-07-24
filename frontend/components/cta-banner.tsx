import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CtaBannerProps {
  className?: string
}

const CtaBanner = ({ className }: CtaBannerProps) => {
  return (
    <section className={cn("relative z-10 border-t border-border bg-background", className)}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-medium text-foreground md:text-4xl">
          Let&apos;s build something together
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          Tell us about your project and we&apos;ll get back to you shortly.
        </p>
        <Button size="lg" className="mt-2 h-12 rounded-lg px-8 text-base" asChild>
          <Link href="/contact">Get in touch</Link>
        </Button>
      </div>
    </section>
  )
}

export { CtaBanner }
