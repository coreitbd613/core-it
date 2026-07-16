"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export type SearchItem = {
  id: string
  group: string
  label: string
  description?: string
  href: string
  icon?: React.ReactNode
}

export function GlobalSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const groups = React.useMemo(() => {
    const map = new Map<string, SearchItem[]>()
    for (const item of items) {
      const list = map.get(item.group) ?? []
      list.push(item)
      map.set(item.group, list)
    }
    return Array.from(map.entries())
  }, [items])

  function handleSelect(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 justify-between gap-2 px-0 sm:w-48 sm:px-3"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <SearchIcon className="size-4 text-muted-foreground" />
          <span className="hidden text-muted-foreground sm:inline">Search...</span>
        </span>
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          &#8984;K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Jump to anything">
        <Command>
          <CommandInput placeholder="Search proposals, projects, invoices..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {groups.map(([group, groupItems]) => (
              <CommandGroup key={group} heading={group}>
                {groupItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.description ?? ""} ${group}`}
                    onSelect={() => handleSelect(item.href)}
                    className="gap-2"
                  >
                    {item.icon}
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{item.label}</span>
                      {item.description && (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
