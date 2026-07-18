"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Search, SearchX, Sparkles } from "lucide-react"

import { useClientAuth } from "@/contexts/client-auth-context"
import { useDomainSearch } from "@/hooks/use-domains"
import { formatBDT, formatUSD } from "@/lib/format"
import type { DomainSearchResult } from "@/lib/domains"
import { Badge } from "@/components/ui/badge"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export const DOMAIN_SEARCH_INPUT_ID = "domain-search-input"

export function DomainSearch() {
  const router = useRouter()
  const { user } = useClientAuth()
  const [query, setQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")

  const { data: results, isFetching, isError } = useDomainSearch(submittedQuery)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedQuery(query.trim())
  }

  function handleBuy(result: DomainSearchResult) {
    const checkoutPath = `/domains/checkout?domain=${encodeURIComponent(result.domain)}&tld=${encodeURIComponent(result.tld)}`
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`)
      return
    }
    router.push(checkoutPath)
  }

  return (
    <div className="mt-10">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-input bg-background p-2 transition-shadow focus-within:ring-3 focus-within:ring-ring/30"
      >
        <BorderBeam size={140} duration={7} colorFrom="#FD6005" colorTo="#0A2540" />
        <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
        <Input
          id={DOMAIN_SEARCH_INPUT_ID}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="yourbusiness.com"
          className="h-12 flex-1 border-0 bg-transparent px-1 text-lg shadow-none focus-visible:ring-0"
          autoFocus
        />
        <Button type="submit" size="lg" className="h-12 gap-2 px-6 text-base" disabled={!query.trim()}>
          <Search className="size-4" />
          Search
        </Button>
      </form>

      <div className="mt-8 flex flex-col gap-3">
        {isFetching && <DomainResultsSkeleton />}

        {isError && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <AlertCircle className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t search domains right now. Please try again.
            </p>
          </div>
        )}

        {!isFetching && results?.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <SearchX className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No results found.</p>
          </div>
        )}

        {!isFetching &&
          results?.map((result, index) => {
            const isTopMatch = index === 0 && result.available
            return (
              <Card
                key={result.domain}
                className={
                  isTopMatch
                    ? "rounded-xl border-primary/40 ring-1 ring-primary/15"
                    : "rounded-xl"
                }
              >
                <CardContent className="flex items-center justify-between gap-4 py-5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium">{result.domain}</span>
                    {isTopMatch && (
                      <Badge className="gap-1">
                        <Sparkles className="size-3" />
                        Best match
                      </Badge>
                    )}
                    {!isTopMatch &&
                      (result.available ? (
                        <Badge variant="secondary">Available</Badge>
                      ) : (
                        <Badge variant="outline">Taken</Badge>
                      ))}
                    {result.isPremium && (
                      <Badge variant="secondary">Premium</Badge>
                    )}
                  </div>

                  {result.available ? (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatBDT(result.priceBdt)}
                          <span className="text-muted-foreground font-normal">
                            /yr
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatUSD(result.priceUsd)}
                        </div>
                      </div>
                      <Button size="lg" onClick={() => handleBuy(result)}>Buy</Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}

function DomainResultsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-[68px] w-full rounded-lg" />
      ))}
    </>
  )
}
