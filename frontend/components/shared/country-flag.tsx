import * as React from "react"
import * as FlagIcons from "country-flag-icons/react/3x2"

import { cn } from "@/lib/utils"

/** Renders a bundled SVG flag for an ISO 3166-1 alpha-2 country code — no CDN/network request. */
export function Flag({ isoCode, className }: { isoCode: string; className?: string }) {
  const FlagComponent = (FlagIcons as Record<string, React.ComponentType<{ className?: string }>>)[
    isoCode
  ]
  if (!FlagComponent) return <span className={cn("inline-block", className)} />
  return <FlagComponent className={cn("rounded-[2px]", className)} />
}
