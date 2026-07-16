"use client"

import * as React from "react"
import Link from "next/link"
import { BellIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type NotificationItem = {
  id: string
  title: string
  description?: string
  href: string
  createdAt: string
}

export function NotificationsBell({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = React.useState(false)
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set())

  const unreadCount = items.filter((item) => !readIds.has(item.id)).length

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next && items.length > 0) {
      setReadIds(new Set(items.map((item) => item.id)))
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative size-9"
          aria-label="Notifications"
        >
          <BellIcon className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium text-foreground">Notifications</p>
        </div>
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          <div className="flex max-h-80 flex-col divide-y overflow-y-auto">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex flex-col gap-0.5 px-4 py-3 text-sm transition-colors hover:bg-muted/60",
                  !readIds.has(item.id) && "bg-muted/30"
                )}
              >
                <span className="font-medium text-foreground">{item.title}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
