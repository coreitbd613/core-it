"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useMyOrganization } from "@/hooks/use-organization"
import { useCreateMyProject } from "@/hooks/use-projects"
import {
  contractStatusLabels,
  contractStatusVariant,
  mockContracts,
} from "@/lib/mock/contracts"

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [fullName, setFullName] = React.useState("")
  const [agreed, setAgreed] = React.useState(false)
  const [isSigning, setIsSigning] = React.useState(false)
  const { data: organization } = useMyOrganization()
  const createProject = useCreateMyProject()

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
            <Link href="/portal/contracts">Back to contracts</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  async function handleSign(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !agreed) return
    if (!organization) {
      toast.error("Couldn't find your company profile — try reloading the page.")
      return
    }

    setIsSigning(true)

    const signedAt = new Date().toISOString().slice(0, 10)
    contract!.status = "SIGNED"
    contract!.signedByName = fullName.trim()
    contract!.signedAt = signedAt

    try {
      // contract.organizationId is a mock-phase id and won't match a real
      // Organization row — use the signer's own (real) org instead, since
      // that's what "start a project for my company" actually means here.
      const project = await createProject.mutateAsync({
        organizationId: organization.id,
        name: contract!.title,
        contractId: contract!.id,
        startedAt: signedAt,
        includedRevisions: 2,
        supportMonths: 3,
      })
      toast.success("Contract signed — your project has started.")
      router.push(`/portal/projects/${project.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't start this project.")
      setIsSigning(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal/contracts" aria-label="Back to contracts">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{contract.title}</h1>
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

          {contract.status === "SIGNED" && contract.signedByName && (
            <p className="mt-4 text-sm text-muted-foreground">
              Signed by <span className="font-medium text-foreground">{contract.signedByName}</span> on{" "}
              {new Date(contract.signedAt!).toLocaleDateString()}.
            </p>
          )}
        </CardContent>

        {contract.status === "SENT" && (
          <form onSubmit={handleSign}>
            <CardFooter className="flex-col items-stretch gap-4 border-t pt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="signer-name">Full name</FieldLabel>
                  <Input
                    id="signer-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Type your full name to sign"
                    required
                  />
                </Field>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="signer-agree"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked === true)}
                  />
                  <FieldLabel htmlFor="signer-agree" className="font-normal">
                    I agree to the terms above
                  </FieldLabel>
                </div>
              </FieldGroup>
              <Button type="submit" disabled={!fullName.trim() || !agreed || isSigning} className="self-end">
                Sign contract
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
