import type { ReactNode } from "react"
import Link from "next/link"

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto min-h-svh w-full max-w-3xl px-6 py-16 md:py-24">
      <Link
        href="/"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Back to home
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {lastUpdated}
      </p>
      <div className="mt-10 space-y-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_p]:leading-7 [&_p]:text-muted-foreground [&_li]:leading-7 [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_section]:space-y-3">
        {children}
      </div>
    </div>
  )
}
