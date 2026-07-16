"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, SendIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatBDT } from "@/lib/format"
import {
  mockProposals,
  proposalStatusLabels,
  proposalStatusVariant,
  proposalTotalBdt,
} from "@/lib/mock/proposals"

export default function AdminProposalDetailPage() {
  const params = useParams<{ id: string }>()
  const [, forceRerender] = React.useState(0)

  const proposal = mockProposals.find((p) => p.id === params.id)

  if (!proposal) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Proposal not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/proposals">Back to proposals</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function handleSend() {
    proposal!.status = "SENT"
    proposal!.sentAt = new Date().toISOString().slice(0, 10)
    forceRerender((n) => n + 1)
    toast.success(`Sent to ${proposal!.organizationName}.`)
  }

  const total = proposalTotalBdt(proposal)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/proposals" aria-label="Back to proposals">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <p className="text-muted-foreground">{proposal.organizationName}</p>
        </div>
        <Badge variant={proposalStatusVariant[proposal.status]} className="ml-auto">
          {proposalStatusLabels[proposal.status]}
        </Badge>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Scope</CardTitle>
          <CardDescription>{proposal.description || "No description provided."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y rounded-lg border">
            {proposal.lineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {formatBDT(item.quantity * item.unitPriceBdt)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 bg-muted/40 px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatBDT(total)}
              </span>
            </div>
          </div>

          {proposal.respondedAt && (
            <p className="mt-4 text-sm text-muted-foreground">
              Company responded on {new Date(proposal.respondedAt).toLocaleDateString()}.
            </p>
          )}
        </CardContent>
        {proposal.status === "DRAFT" && (
          <CardFooter className="justify-end border-t">
            <Button onClick={handleSend}>
              <SendIcon />
              Send to company
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
