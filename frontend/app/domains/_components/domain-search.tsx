"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { useClientAuth } from "@/contexts/client-auth-context"
import { useDomainSearch } from "@/hooks/use-domains"
import { formatBDT, formatUSD } from "@/lib/format"
import type { DomainSearchResult } from "@/lib/domains"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

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
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="yourbusiness.com"
          className="h-12 flex-1 text-base"
          autoFocus
        />
        <Button type="submit"  className="gap-2" disabled={!query.trim()}>
          <Search className="size-4" />
          Search
        </Button>
      </form>

      <div className="mt-8 flex flex-col gap-3">
        {isFetching && <DomainResultsSkeleton />}

        {isError && (
          <p className="text-center text-sm text-muted-foreground">
            Couldn&apos;t search domains right now. Please try again.
          </p>
        )}

        {!isFetching && results?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No results found.
          </p>
        )}

        {!isFetching &&
          results?.map((result) => (
            <Card key={result.domain} className="rounded-lg">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{result.domain}</span>
                  {result.available ? (
                    <Badge>Available</Badge>
                  ) : (
                    <Badge variant="outline">Taken</Badge>
                  )}
                  {result.isPremium && (
                    <Badge variant="secondary">Premium</Badge>
                  )}
                </div>

                {result.available ? (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatBDT(result.priceBdt)}
                        <span className="text-muted-foreground font-normal">
                          /yr
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatUSD(result.priceUsd)}
                      </div>
                    </div>
                    <Button onClick={() => handleBuy(result)}>Buy</Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
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
