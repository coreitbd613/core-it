"use client"

import Link from "next/link"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateProject } from "@/hooks/use-projects"
import { formatBDT, formatDate } from "@/lib/format"
import { LEAD_OWNERS } from "@/lib/mock/leads"
import { mockContracts } from "@/lib/mock/contracts"
import { proposalTotalBdt, mockProposals } from "@/lib/mock/proposals"
import {
  PAYMENT_TERMS_OPTIONS,
  PROJECT_DEPARTMENTS,
  PROJECT_TYPES,
  type Project,
  type UpdateProjectInput,
} from "@/lib/projects"

export function ProjectOverviewTab({
  project,
  variant,
}: {
  project: Project
  variant: "admin" | "portal"
}) {
  const updateProject = useUpdateProject(project.id)

  const linkedProposal = project.proposalId
    ? mockProposals.find((p) => p.id === project.proposalId)
    : null
  const linkedContract = project.contractId
    ? mockContracts.find((c) => c.id === project.contractId)
    : null
  const contractProposal = linkedContract?.proposalId
    ? mockProposals.find((p) => p.id === linkedContract.proposalId)
    : null
  const valueProposal = linkedProposal ?? contractProposal
  const linkedValue = valueProposal ? proposalTotalBdt(valueProposal) : null
  const value = linkedValue ?? (project.contractValueBdt ? Number(project.contractValueBdt) : null)
  const basePath = variant === "admin" ? "/admin" : "/portal"

  function saveField<K extends keyof UpdateProjectInput>(
    key: K,
    value: UpdateProjectInput[K],
    successMessage: string
  ) {
    updateProject.mutate(
      { [key]: value } as UpdateProjectInput,
      {
        onSuccess: () => toast.success(successMessage),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Couldn't save this project."),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {variant === "admin" ? (
              <Textarea
                defaultValue={project.description ?? ""}
                placeholder="What is this project about?"
                rows={5}
                onBlur={(e) => {
                  const next = e.target.value.trim() || null
                  if (next === project.description) return
                  saveField("description", next, "Description updated.")
                }}
              />
            ) : (
              <p className="text-sm text-foreground">
                {project.description ?? "No description yet."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Company</p>
              <p className="text-sm text-foreground">{project.organization?.name ?? "—"}</p>
            </div>

            {linkedProposal && (
              <div>
                <p className="text-xs text-muted-foreground">Proposal</p>
                <Link
                  href={`${basePath}/proposals/${linkedProposal.id}`}
                  className="text-sm text-foreground underline"
                >
                  {linkedProposal.title}
                </Link>
              </div>
            )}

            {linkedContract && (
              <div>
                <p className="text-xs text-muted-foreground">Contract</p>
                <Link
                  href={`${basePath}/contracts/${linkedContract.id}`}
                  className="text-sm text-foreground underline"
                >
                  {linkedContract.title}
                </Link>
              </div>
            )}

            {value != null && (
              <div>
                <p className="text-xs text-muted-foreground">Contract value</p>
                <p className="text-sm text-foreground">{formatBDT(value)}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="text-sm text-foreground">{formatDate(project.startedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Target end</p>
                {variant === "admin" ? (
                  <Input
                    type="date"
                    defaultValue={project.targetEndAt?.slice(0, 10) ?? ""}
                    className="h-8"
                    onBlur={(e) => {
                      const next = e.target.value || null
                      if (next === project.targetEndAt?.slice(0, 10)) return
                      saveField("targetEndAt", next, "Target end date updated.")
                    }}
                  />
                ) : (
                  <p className="text-sm text-foreground">
                    {project.targetEndAt ? formatDate(project.targetEndAt) : "—"}
                  </p>
                )}
              </div>
            </div>

            {project.completedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-sm text-foreground">{formatDate(project.completedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {variant === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Business details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Project type</p>
                <Select
                  value={project.projectType ?? ""}
                  onValueChange={(v) => saveField("projectType", v || null, "Project type updated.")}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Department</p>
                <Select
                  value={project.department ?? ""}
                  onValueChange={(v) => saveField("department", v || null, "Department updated.")}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Project manager</p>
                <Select
                  value={project.projectManagerName ?? ""}
                  onValueChange={(v) =>
                    saveField("projectManagerName", v || null, "Project manager updated.")
                  }
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_OWNERS.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Payment terms</p>
                <Select
                  value={project.paymentTerms ?? ""}
                  onValueChange={(v) => saveField("paymentTerms", v || null, "Payment terms updated.")}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS_OPTIONS.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payment schedule</p>
                <Input
                  defaultValue={project.paymentSchedule ?? ""}
                  className="h-8"
                  placeholder="e.g. 50/50 split"
                  onBlur={(e) => {
                    const next = e.target.value.trim() || null
                    if (next === project.paymentSchedule) return
                    saveField("paymentSchedule", next, "Payment schedule updated.")
                  }}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contract value (BDT)</p>
                <Input
                  type="number"
                  min={0}
                  defaultValue={project.contractValueBdt ?? ""}
                  className="h-8"
                  onBlur={(e) => {
                    const next = e.target.value ? Number(e.target.value) : null
                    if (next === (project.contractValueBdt ? Number(project.contractValueBdt) : null)) return
                    saveField("contractValueBdt", next, "Contract value updated.")
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
