import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function InfoChip({
  icon: Icon,
  iconClassName,
  label,
  value,
  href,
}: {
  icon: LucideIcon
  iconClassName: string
  label: string
  value: React.ReactNode
  href?: string
}) {
  const className = cn(
    "flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 transition-colors",
    href && "hover:border-primary/40 hover:bg-primary/5"
  )
  const content = (
    <>
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md", iconClassName)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] leading-none text-muted-foreground">{label}</p>
        <p className="mt-1.5 truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </>
  )
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}
