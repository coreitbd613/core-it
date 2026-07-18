"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  contractStatusLabels,
  contractStatusVariant,
  mockContracts,
} from "@/lib/mock/contracts"

export default function AdminContractDetailPage() {
  const params = useParams<{ id: string }>()
  const contract = mockContracts.find((c) => c.id === params.id)

  if (!contract) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Contract not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/contracts">Back to contracts</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/contracts" aria-label="Back to contracts">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{contract.title}</h1>
          <p className="text-muted-foreground">{contract.organizationName}</p>
        </div>
        <Badge variant={contractStatusVariant[contract.status]} className="ml-auto">
          {contractStatusLabels[contract.status]}
        </Badge>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Agreement terms</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 font-sans text-sm text-foreground">
            {contract.termsText}
          </pre>

          {contract.status === "SIGNED" && contract.signedByName ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Signed by <span className="font-medium text-foreground">{contract.signedByName}</span> on{" "}
              {new Date(contract.signedAt!).toLocaleDateString()}.
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Sent {new Date(contract.sentAt).toLocaleDateString()} — awaiting the client&apos;s signature.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
