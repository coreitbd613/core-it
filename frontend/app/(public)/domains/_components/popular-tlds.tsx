"use client"

import * as React from "react"
import { useState } from "react"

import { useDomainSearch } from "@/hooks/use-domains"
import { formatBDT } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DOMAIN_SEARCH_INPUT_ID } from "./domain-search"

const TLD_ORDER = ["com", "net", "org", "io", "co", "xyz", "info"] as const

function focusSearch() {
  const input = document.getElementById(DOMAIN_SEARCH_INPUT_ID)
  input?.scrollIntoView({ behavior: "smooth", block: "center" })
  ;(input as HTMLInputElement | null)?.focus()
}

export function PopularTlds() {
  // A random, essentially-never-registered seed so every extension resolves
  // as available and shows real live pricing rather than a "taken" gap.
  const [seed] = useState(() => `price-check-${Math.random().toString(36).slice(2, 8)}`)
  const { data: results, isFetching, isError } = useDomainSearch(seed)

  const priced = TLD_ORDER.map((tld) => ({
    tld,
    result: results?.find((result) => result.tld === tld),
  }))

  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Popular extensions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Live pricing, straight from the registry.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {priced.map(({ tld, result }) => (
            <button
              key={tld}
              type="button"
              onClick={focusSearch}
              className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/50"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-lg font-semibold">.{tld}</span>
                {tld === "com" && (
                  <Badge variant="secondary" className="text-[10px]">
                    Popular
                  </Badge>
                )}
              </div>

              {isFetching ? (
                <Skeleton className="h-5 w-16" />
              ) : isError || !result || !result.available ? (
                <span className="text-sm text-muted-foreground">Search to see price</span>
              ) : (
                <div>
                  <span className="font-medium">{formatBDT(result.priceBdt)}</span>
                  <span className="text-muted-foreground"> /yr</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
