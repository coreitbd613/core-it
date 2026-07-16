"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, CheckIcon, XIcon } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatBDT } from "@/lib/format"
import {
  mockProposals,
  proposalStatusLabels,
  proposalStatusVariant,
  proposalTotalBdt,
} from "@/lib/mock/proposals"

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
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
            It may have been removed. <Link href="/proposals">Back to proposals</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function respond(status: "APPROVED" | "REJECTED") {
    proposal!.status = status
    proposal!.respondedAt = new Date().toISOString().slice(0, 10)
    forceRerender((n) => n + 1)
    toast.success(status === "APPROVED" ? "Proposal approved." : "Proposal rejected.")
  }

  const total = proposalTotalBdt(proposal)
  const canRespond = proposal.status === "SENT"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/proposals" aria-label="Back to proposals">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <p className="text-muted-foreground">From {proposal.createdBy}</p>
        </div>
        <Badge variant={proposalStatusVariant[proposal.status]} className="ml-auto">
          {proposalStatusLabels[proposal.status]}
        </Badge>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Scope</CardTitle>
          <CardDescription>{proposal.description}</CardDescription>
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
        </CardContent>
        {canRespond && (
          <CardFooter className="justify-end gap-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <XIcon />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject this proposal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Core IT will be notified. You can ask them to send a revised proposal later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => respond("REJECTED")}>Reject</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => respond("APPROVED")}>
              <CheckIcon />
              Approve
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
