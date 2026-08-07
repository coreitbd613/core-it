import Link from "next/link"
import { FileSignatureIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatDate } from "@/lib/format"
import { mockContracts, contractStatusLabels, contractStatusVariant } from "@/lib/mock/contracts"

export function ClientContractsTab({ organizationName }: { organizationName: string }) {
  const contracts = mockContracts.filter((c) => c.organizationName === organizationName)

  if (contracts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileSignatureIcon />
          </EmptyMedia>
          <EmptyTitle>No contracts yet</EmptyTitle>
          <EmptyDescription>Contracts signed with this client will show up here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col divide-y p-0">
        {contracts.map((contract) => (
          <Link
            key={contract.id}
            href={`/admin/contracts/${contract.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{contract.title}</p>
              <p className="text-xs text-muted-foreground">
                Sent {formatDate(contract.sentAt)}
                {contract.signedAt ? ` · Signed ${formatDate(contract.signedAt)}` : ""}
              </p>
            </div>
            <Badge variant={contractStatusVariant[contract.status]}>
              {contractStatusLabels[contract.status]}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
