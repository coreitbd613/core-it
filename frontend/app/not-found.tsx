import Link from "next/link"
import Image from "next/image"

import { DotFieldBackground } from "@/components/shared/dot-field-background"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 text-center md:p-10">
      <div className="absolute inset-0">
        <DotFieldBackground />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <Link href="/" aria-label="CORE IT home">
          <Image
            src="/logo-light.png"
            alt="CORE IT"
            width={527}
            height={135}
            className="h-10 w-auto dark:hidden"
          />
          <Image
            src="/logo-dark.png"
            alt="CORE IT"
            width={527}
            height={135}
            className="hidden h-10 w-auto dark:block"
          />
        </Link>
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Page not found
          </h1>
          <p className="text-balance text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
