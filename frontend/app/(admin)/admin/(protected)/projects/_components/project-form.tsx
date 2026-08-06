"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  FolderIcon,
  KeyRoundIcon,
  PackageIcon,
  PlusIcon,
  RotateCcwIcon,
  ShieldIcon,
  SquareCheckBigIcon,
  Trash2Icon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAdminOrganizations } from "@/hooks/use-organization"
import { LEAD_OWNERS } from "@/lib/mock/leads"
import { mockContracts } from "@/lib/mock/contracts"
import { mockProposals } from "@/lib/mock/proposals"
import {
  DEFAULT_DELIVERY_ITEMS,
  DEFAULT_MILESTONE_TITLES,
  PAYMENT_TERMS_OPTIONS,
  PROJECT_DEPARTMENTS,
  PROJECT_TYPES,
  TEAM_ROLES,
  billingTypeLabels,
  deploymentMethodLabels,
  mockDeliveryConfigItems,
  mockMilestones,
  mockProjectCredentials,
  mockProjectDependencies,
  mockProjectRisks,
  mockProjectTeam,
  mockProjects,
  nextProjectCode,
  riskSeverityLabels,
  supportSlaLabels,
  teamAccessLevelLabels,
  type BillingType,
  type DeploymentMethod,
  type RiskSeverity,
  type SupportSla,
  type TeamAccessLevel,
} from "@/lib/mock/projects"

type MilestoneDraft = { id: string; title: string; dueAt: string }
type DeliveryDraft = { id: string; label: string; included: boolean }
type TeamDraft = { id: string; name: string; role: string; accessLevel: TeamAccessLevel }
type CredentialDraft = {
  id: string
  label: string
  username: string
  password: string
  url: string
  notes: string
}
type RiskDraft = { id: string; description: string; severity: RiskSeverity; mitigation: string }
type DependencyDraft = { id: string; description: string; neededFrom: string; dueAt: string }

const STEPS = [
  { key: "basic", label: "Basic Info", icon: FolderIcon },
  { key: "commercial", label: "Commercial", icon: WalletIcon },
  { key: "timeline", label: "Timeline", icon: CalendarIcon },
  { key: "revisions", label: "Revision Policy", icon: RotateCcwIcon },
  { key: "delivery", label: "Delivery Config", icon: PackageIcon },
  { key: "support", label: "After-Sales Support", icon: ShieldIcon },
  { key: "team", label: "Team & Permissions", icon: UsersIcon },
  { key: "credentials", label: "Credentials", icon: KeyRoundIcon },
  { key: "risks", label: "Risks & Dependencies", icon: AlertTriangleIcon },
  { key: "review", label: "Review & Create", icon: SquareCheckBigIcon },
] as const

function newId() {
  return crypto.randomUUID()
}

export function ProjectForm() {
  const router = useRouter()
  const { data: organizations = [] } = useAdminOrganizations()
  const [stepIndex, setStepIndex] = React.useState(0)
  const [organizationId, setOrganizationId] = React.useState("")
  const effectiveOrganizationId = organizationId || organizations[0]?.id || ""
  const [projectCode] = React.useState(() => nextProjectCode())

  // Basic info
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [clientContact, setClientContact] = React.useState("")
  const [projectType, setProjectType] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [projectManagerName, setProjectManagerName] = React.useState("")

  // Commercial
  const [proposalId, setProposalId] = React.useState("")
  const [contractId, setContractId] = React.useState("")
  const [billingType, setBillingType] = React.useState<BillingType>("FIXED_PRICE")
  const [paymentTerms, setPaymentTerms] = React.useState("")
  const [paymentSchedule, setPaymentSchedule] = React.useState("")
  const [taxPercent, setTaxPercent] = React.useState("0")
  const [discountPercent, setDiscountPercent] = React.useState("0")
  const [estimatedEffortHours, setEstimatedEffortHours] = React.useState("")

  // Timeline
  const [startedAt, setStartedAt] = React.useState(new Date().toISOString().slice(0, 10))
  const [targetEndAt, setTargetEndAt] = React.useState("")
  const [goLiveAt, setGoLiveAt] = React.useState("")
  const [milestoneDrafts, setMilestoneDrafts] = React.useState<MilestoneDraft[]>([])

  // Revision policy
  const [includedRevisions, setIncludedRevisions] = React.useState("2")
  const [revisionWindowDays, setRevisionWindowDays] = React.useState("")
  const [maxDaysPerRevision, setMaxDaysPerRevision] = React.useState("")
  const [extraRevisionPriceBdt, setExtraRevisionPriceBdt] = React.useState("")
  const [revisionNotes, setRevisionNotes] = React.useState("")

  // Delivery config
  const [deliveryDrafts, setDeliveryDrafts] = React.useState<DeliveryDraft[]>([])

  // After-sales support
  const [supportMonths, setSupportMonths] = React.useState("3")
  const [supportSla, setSupportSla] = React.useState<SupportSla>("STANDARD")
  const [supportWorkingHours, setSupportWorkingHours] = React.useState("")
  const [includedSupportTickets, setIncludedSupportTickets] = React.useState("")
  const [supportContactName, setSupportContactName] = React.useState("")
  const [sendRenewalReminder, setSendRenewalReminder] = React.useState(false)

  // Team & permissions
  const [teamDrafts, setTeamDrafts] = React.useState<TeamDraft[]>([])

  // Credentials
  const [domain, setDomain] = React.useState("")
  const [hostingProvider, setHostingProvider] = React.useState("")
  const [serverDetails, setServerDetails] = React.useState("")
  const [repositoryUrl, setRepositoryUrl] = React.useState("")
  const [stagingUrl, setStagingUrl] = React.useState("")
  const [productionUrl, setProductionUrl] = React.useState("")
  const [techStack, setTechStack] = React.useState("")
  const [deploymentMethod, setDeploymentMethod] = React.useState<DeploymentMethod | "">("")
  const [credentialDrafts, setCredentialDrafts] = React.useState<CredentialDraft[]>([])

  // Risks & dependencies
  const [riskDrafts, setRiskDrafts] = React.useState<RiskDraft[]>([])
  const [dependencyDrafts, setDependencyDrafts] = React.useState<DependencyDraft[]>([])

  const organization = organizations.find((org) => org.id === effectiveOrganizationId)
  const orgProposals = mockProposals.filter((p) => p.organizationId === effectiveOrganizationId)
  const orgContracts = mockContracts.filter((c) => c.organizationId === effectiveOrganizationId)

  const canLeaveBasicInfo = Boolean(organization && name.trim())
  const isLastStep = stepIndex === STEPS.length - 1

  function goNext() {
    if (stepIndex === 0 && !canLeaveBasicInfo) {
      toast.error("Fill in a company and project name.")
      return
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  function handleCreate() {
    if (!organization || !name.trim()) {
      toast.error("Fill in a company and project name.")
      setStepIndex(0)
      return
    }

    const id = newId()
    const today = new Date().toISOString().slice(0, 10)

    mockProjects.unshift({
      id,
      organizationId: organization.id,
      organizationName: organization.name,
      name: name.trim(),
      description: description.trim() || null,
      proposalId: proposalId || null,
      contractId: contractId || null,
      status: "PLANNING",
      startedAt: startedAt || today,
      targetEndAt: targetEndAt || null,
      completedAt: null,
      includedRevisions: Number(includedRevisions) || 0,
      supportMonths: Number(supportMonths) || 0,
      updatedAt: today,
      projectCode,
      clientContact: clientContact.trim() || null,
      projectType: projectType || null,
      department: department || null,
      projectManagerName: projectManagerName || null,
      billingType,
      paymentTerms: paymentTerms || null,
      paymentSchedule: paymentSchedule.trim() || null,
      taxPercent: Number(taxPercent) || 0,
      discountPercent: Number(discountPercent) || 0,
      estimatedEffortHours: estimatedEffortHours ? Number(estimatedEffortHours) : null,
      goLiveAt: goLiveAt || null,
      revisionWindowDays: revisionWindowDays ? Number(revisionWindowDays) : null,
      maxDaysPerRevision: maxDaysPerRevision ? Number(maxDaysPerRevision) : null,
      extraRevisionPriceBdt: extraRevisionPriceBdt ? Number(extraRevisionPriceBdt) : null,
      revisionNotes: revisionNotes.trim() || null,
      supportSla,
      supportWorkingHours: supportWorkingHours.trim() || null,
      includedSupportTickets: includedSupportTickets ? Number(includedSupportTickets) : null,
      supportContactName: supportContactName || null,
      sendRenewalReminder,
      domain: domain.trim() || null,
      hostingProvider: hostingProvider.trim() || null,
      serverDetails: serverDetails.trim() || null,
      repositoryUrl: repositoryUrl.trim() || null,
      stagingUrl: stagingUrl.trim() || null,
      productionUrl: productionUrl.trim() || null,
      techStack: techStack.trim() || null,
      deploymentMethod: deploymentMethod || null,
    })

    for (const m of milestoneDrafts) {
      if (!m.title.trim()) continue
      mockMilestones.push({
        id: newId(),
        projectId: id,
        title: m.title.trim(),
        dueAt: m.dueAt || null,
        status: "PENDING",
        completedAt: null,
      })
    }
    for (const d of deliveryDrafts) {
      if (!d.label.trim()) continue
      mockDeliveryConfigItems.push({ id: newId(), projectId: id, label: d.label.trim(), included: d.included })
    }
    for (const t of teamDrafts) {
      if (!t.name.trim()) continue
      mockProjectTeam.push({
        id: newId(),
        projectId: id,
        name: t.name.trim(),
        role: t.role.trim() || "Team member",
        accessLevel: t.accessLevel,
      })
    }
    for (const c of credentialDrafts) {
      if (!c.label.trim()) continue
      mockProjectCredentials.push({
        id: newId(),
        projectId: id,
        label: c.label.trim(),
        username: c.username.trim() || null,
        password: c.password.trim() || null,
        url: c.url.trim() || null,
        notes: c.notes.trim() || null,
      })
    }
    for (const r of riskDrafts) {
      if (!r.description.trim()) continue
      mockProjectRisks.push({
        id: newId(),
        projectId: id,
        description: r.description.trim(),
        severity: r.severity,
        mitigation: r.mitigation.trim() || null,
        status: "OPEN",
      })
    }
    for (const dep of dependencyDrafts) {
      if (!dep.description.trim()) continue
      mockProjectDependencies.push({
        id: newId(),
        projectId: id,
        description: dep.description.trim(),
        neededFrom: dep.neededFrom.trim() || null,
        dueAt: dep.dueAt || null,
        status: "PENDING",
      })
    }

    toast.success("Project created.")
    router.push(`/admin/projects/${id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">New project</h1>
        <p className="text-muted-foreground">Enterprise project onboarding wizard.</p>
      </div>

      <WizardStepper stepIndex={stepIndex} onStepClick={setStepIndex} />

      {stepIndex === 0 && (
        <Card className="max-w-5xl">
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-org">
                    Company <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select value={effectiveOrganizationId} onValueChange={setOrganizationId}>
                    <SelectTrigger id="project-org" className="w-full">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-name">
                    Project name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="project-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Website redesign"
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-code">Project code</FieldLabel>
                  <Input id="project-code" value={projectCode} disabled />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-contact">Client contact</FieldLabel>
                  <Input
                    id="project-contact"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    placeholder="Contact person"
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="project-type">Project type</FieldLabel>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger id="project-type" className="w-full">
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
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-department">Department</FieldLabel>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="project-department" className="w-full">
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
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-manager">Project manager</FieldLabel>
                  <Select value={projectManagerName} onValueChange={setProjectManagerName}>
                    <SelectTrigger id="project-manager" className="w-full">
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
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="project-description">Description</FieldLabel>
                <Textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                  rows={4}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {stepIndex === 1 && (
        <Card className="max-w-5xl">
          <CardHeader>
            <CardTitle>Commercial</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-proposal">Quotation</FieldLabel>
                  <Select value={proposalId} onValueChange={setProposalId}>
                    <SelectTrigger id="project-proposal" className="w-full">
                      <SelectValue placeholder="Select quotation" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgProposals.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-contract">Contract</FieldLabel>
                  <Select value={contractId} onValueChange={setContractId}>
                    <SelectTrigger id="project-contract" className="w-full">
                      <SelectValue placeholder="Select contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgContracts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-billing">Billing type</FieldLabel>
                  <Select value={billingType} onValueChange={(v) => setBillingType(v as BillingType)}>
                    <SelectTrigger id="project-billing" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(billingTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-payment-terms">Payment terms</FieldLabel>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger id="project-payment-terms" className="w-full">
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
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="project-payment-schedule">Payment schedule</FieldLabel>
                <Input
                  id="project-payment-schedule"
                  value={paymentSchedule}
                  onChange={(e) => setPaymentSchedule(e.target.value)}
                  placeholder="e.g. 50% upfront, 50% on delivery"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="project-tax">Tax %</FieldLabel>
                  <Input
                    id="project-tax"
                    type="number"
                    min={0}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-discount">Discount %</FieldLabel>
                  <Input
                    id="project-discount"
                    type="number"
                    min={0}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-effort">Estimated effort (hours)</FieldLabel>
                  <Input
                    id="project-effort"
                    type="number"
                    min={0}
                    value={estimatedEffortHours}
                    onChange={(e) => setEstimatedEffortHours(e.target.value)}
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {stepIndex === 2 && (
        <Card className="max-w-5xl">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="project-started">Start date</FieldLabel>
                <Input
                  id="project-started"
                  type="date"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="project-target">Estimated end date</FieldLabel>
                <Input
                  id="project-target"
                  type="date"
                  value={targetEndAt}
                  onChange={(e) => setTargetEndAt(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="project-golive">Go-live date</FieldLabel>
                <Input
                  id="project-golive"
                  type="date"
                  value={goLiveAt}
                  onChange={(e) => setGoLiveAt(e.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <FieldLabel>Milestones</FieldLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMilestoneDrafts(
                        DEFAULT_MILESTONE_TITLES.map((title) => ({ id: newId(), title, dueAt: "" }))
                      )
                    }
                  >
                    Use standard milestones
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMilestoneDrafts((prev) => [...prev, { id: newId(), title: "", dueAt: "" }])
                    }
                  >
                    <PlusIcon />
                    Add
                  </Button>
                </div>
              </div>
              {milestoneDrafts.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <Input
                    value={m.title}
                    onChange={(e) =>
                      setMilestoneDrafts((prev) =>
                        prev.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x))
                      )
                    }
                    placeholder="Milestone title"
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={m.dueAt}
                    onChange={(e) =>
                      setMilestoneDrafts((prev) =>
                        prev.map((x) => (x.id === m.id ? { ...x, dueAt: e.target.value } : x))
                      )
                    }
                    className="w-40"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove milestone"
                    onClick={() => setMilestoneDrafts((prev) => prev.filter((x) => x.id !== m.id))}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stepIndex === 3 && (
        <Card className="max-w-5xl">
          <CardHeader>
            <CardTitle>Revision Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-included-revisions">Included revisions</FieldLabel>
                  <Input
                    id="project-included-revisions"
                    type="number"
                    min={0}
                    value={includedRevisions}
                    onChange={(e) => setIncludedRevisions(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-revision-window">Revision window (days)</FieldLabel>
                  <Input
                    id="project-revision-window"
                    type="number"
                    min={0}
                    value={revisionWindowDays}
                    onChange={(e) => setRevisionWindowDays(e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-max-days">Max days per revision</FieldLabel>
                  <Input
                    id="project-max-days"
                    type="number"
                    min={0}
                    value={maxDaysPerRevision}
                    onChange={(e) => setMaxDaysPerRevision(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-extra-price">Price per extra revision (BDT)</FieldLabel>
                  <Input
                    id="project-extra-price"
                    type="number"
                    min={0}
                    value={extraRevisionPriceBdt}
                    onChange={(e) => setExtraRevisionPriceBdt(e.target.value)}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="project-revision-notes">Revision notes</FieldLabel>
                <Textarea
                  id="project-revision-notes"
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional revision policy notes"
                />
              </Field>
            </FieldGroup>

            <div className="mt-5 rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">Policy summary</p>
              <p className="mt-1 text-muted-foreground">
                {includedRevisions || 0} included revisions
                {revisionWindowDays ? `, ${revisionWindowDays} day window after delivery` : ""}
                {maxDaysPerRevision ? `, ${maxDaysPerRevision} day turnaround` : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {stepIndex === 4 && (
        <Card className="max-w-5xl">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Delivery Config</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setDeliveryDrafts(
                    DEFAULT_DELIVERY_ITEMS.map((label) => ({ id: newId(), label, included: true }))
                  )
                }
              >
                Use standard checklist
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setDeliveryDrafts((prev) => [...prev, { id: newId(), label: "", included: true }])
                }
              >
                <PlusIcon />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {deliveryDrafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No delivery items yet.</p>
            ) : (
              deliveryDrafts.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input
                    value={item.label}
                    onChange={(e) =>
                      setDeliveryDrafts((prev) =>
                        prev.map((x) => (x.id === item.id ? { ...x, label: e.target.value } : x))
                      )
                    }
                    placeholder="Delivery item"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant={item.included ? "default" : "outline"}
                    size="sm"
                    className="w-16"
                    onClick={() =>
                      setDeliveryDrafts((prev) =>
                        prev.map((x) => (x.id === item.id ? { ...x, included: !x.included } : x))
                      )
                    }
                  >
                    {item.included ? "Yes" : "No"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove item"
                    onClick={() => setDeliveryDrafts((prev) => prev.filter((x) => x.id !== item.id))}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {stepIndex === 5 && (
        <Card className="max-w-5xl">
          <CardHeader>
            <CardTitle>After-Sales Support</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-support-months">Support period</FieldLabel>
                  <Select value={supportMonths} onValueChange={setSupportMonths}>
                    <SelectTrigger id="project-support-months" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 3, 6, 12].map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m} {m === 1 ? "month" : "months"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-sla">SLA</FieldLabel>
                  <Select value={supportSla} onValueChange={(v) => setSupportSla(v as SupportSla)}>
                    <SelectTrigger id="project-sla" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(supportSlaLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-hours">Working hours</FieldLabel>
                  <Input
                    id="project-hours"
                    value={supportWorkingHours}
                    onChange={(e) => setSupportWorkingHours(e.target.value)}
                    placeholder="e.g. 9am–6pm"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-tickets">Included support tickets</FieldLabel>
                  <Input
                    id="project-tickets"
                    type="number"
                    min={0}
                    value={includedSupportTickets}
                    onChange={(e) => setIncludedSupportTickets(e.target.value)}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="project-support-contact">Support contact</FieldLabel>
                <Select value={supportContactName} onValueChange={setSupportContactName}>
                  <SelectTrigger id="project-support-contact" className="w-full sm:w-1/2">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_OWNERS.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="project-renewal-reminder"
                  checked={sendRenewalReminder}
                  onCheckedChange={(checked) => setSendRenewalReminder(checked === true)}
                />
                <FieldLabel htmlFor="project-renewal-reminder" className="font-normal">
                  Send renewal reminder
                </FieldLabel>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {stepIndex === 6 && (
        <Card className="max-w-5xl">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Team & Permissions</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setTeamDrafts((prev) => [...prev, { id: newId(), name: "", role: "", accessLevel: "EDIT" }])
              }
            >
              <PlusIcon />
              Add team member
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {teamDrafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team members added yet.</p>
            ) : (
              teamDrafts.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Select
                    value={member.name}
                    onValueChange={(v) =>
                      setTeamDrafts((prev) => prev.map((x) => (x.id === member.id ? { ...x, name: v } : x)))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Name" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_OWNERS.map((owner) => (
                        <SelectItem key={owner} value={owner}>
                          {owner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={member.role}
                    onValueChange={(v) =>
                      setTeamDrafts((prev) => prev.map((x) => (x.id === member.id ? { ...x, role: v } : x)))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={member.accessLevel}
                    onValueChange={(v) =>
                      setTeamDrafts((prev) =>
                        prev.map((x) => (x.id === member.id ? { ...x, accessLevel: v as TeamAccessLevel } : x))
                      )
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(teamAccessLevelLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove team member"
                    onClick={() => setTeamDrafts((prev) => prev.filter((x) => x.id !== member.id))}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {stepIndex === 7 && (
        <Card className="max-w-5xl">
          <CardHeader>
            <CardTitle>Credentials</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="project-domain">Domain</FieldLabel>
                  <Input
                    id="project-domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-hosting">Hosting</FieldLabel>
                  <Input
                    id="project-hosting"
                    value={hostingProvider}
                    onChange={(e) => setHostingProvider(e.target.value)}
                    placeholder="Hosting provider"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-server">Server</FieldLabel>
                  <Input
                    id="project-server"
                    value={serverDetails}
                    onChange={(e) => setServerDetails(e.target.value)}
                    placeholder="Server details"
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="project-repo">Repository</FieldLabel>
                  <Input
                    id="project-repo"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-staging">Staging URL</FieldLabel>
                  <Input
                    id="project-staging"
                    value={stagingUrl}
                    onChange={(e) => setStagingUrl(e.target.value)}
                    placeholder="https://staging..."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-production">Production URL</FieldLabel>
                  <Input
                    id="project-production"
                    value={productionUrl}
                    onChange={(e) => setProductionUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="project-tech-stack">Technology stack</FieldLabel>
                  <Input
                    id="project-tech-stack"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="e.g. React, Node.js, PostgreSQL"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-deployment">Deployment method</FieldLabel>
                  <Select
                    value={deploymentMethod}
                    onValueChange={(v) => setDeploymentMethod(v as DeploymentMethod)}
                  >
                    <SelectTrigger id="project-deployment" className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(deploymentMethodLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>

            <div className="flex flex-col gap-2.5 border-t pt-5">
              <div className="flex items-center justify-between">
                <FieldLabel>Login credentials</FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCredentialDrafts((prev) => [
                      ...prev,
                      { id: newId(), label: "", username: "", password: "", url: "", notes: "" },
                    ])
                  }
                >
                  <PlusIcon />
                  Add credential
                </Button>
              </div>
              {credentialDrafts.map((c) => (
                <div key={c.id} className="flex flex-col gap-2 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={c.label}
                      onChange={(e) =>
                        setCredentialDrafts((prev) =>
                          prev.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x))
                        )
                      }
                      placeholder="Label, e.g. Hosting (cPanel)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove credential"
                      onClick={() => setCredentialDrafts((prev) => prev.filter((x) => x.id !== c.id))}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      value={c.username}
                      onChange={(e) =>
                        setCredentialDrafts((prev) =>
                          prev.map((x) => (x.id === c.id ? { ...x, username: e.target.value } : x))
                        )
                      }
                      placeholder="Username"
                    />
                    <Input
                      value={c.password}
                      onChange={(e) =>
                        setCredentialDrafts((prev) =>
                          prev.map((x) => (x.id === c.id ? { ...x, password: e.target.value } : x))
                        )
                      }
                      placeholder="Password"
                    />
                  </div>
                  <Input
                    value={c.url}
                    onChange={(e) =>
                      setCredentialDrafts((prev) =>
                        prev.map((x) => (x.id === c.id ? { ...x, url: e.target.value } : x))
                      )
                    }
                    placeholder="URL"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stepIndex === 8 && (
        <div className="flex max-w-5xl flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Risks</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setRiskDrafts((prev) => [
                    ...prev,
                    { id: newId(), description: "", severity: "MEDIUM", mitigation: "" },
                  ])
                }
              >
                <PlusIcon />
                Add risk
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {riskDrafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No risks logged yet.</p>
              ) : (
                riskDrafts.map((risk) => (
                  <div key={risk.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={risk.description}
                        onChange={(e) =>
                          setRiskDrafts((prev) =>
                            prev.map((x) => (x.id === risk.id ? { ...x, description: e.target.value } : x))
                          )
                        }
                        placeholder="What could go wrong?"
                        className="flex-1"
                      />
                      <Select
                        value={risk.severity}
                        onValueChange={(v) =>
                          setRiskDrafts((prev) =>
                            prev.map((x) => (x.id === risk.id ? { ...x, severity: v as RiskSeverity } : x))
                          )
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(riskSeverityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove risk"
                        onClick={() => setRiskDrafts((prev) => prev.filter((x) => x.id !== risk.id))}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                    <Input
                      value={risk.mitigation}
                      onChange={(e) =>
                        setRiskDrafts((prev) =>
                          prev.map((x) => (x.id === risk.id ? { ...x, mitigation: e.target.value } : x))
                        )
                      }
                      placeholder="Mitigation plan (optional)"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Dependencies</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setDependencyDrafts((prev) => [
                    ...prev,
                    { id: newId(), description: "", neededFrom: "", dueAt: "" },
                  ])
                }
              >
                <PlusIcon />
                Add dependency
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {dependencyDrafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dependencies logged yet.</p>
              ) : (
                dependencyDrafts.map((dep) => (
                  <div key={dep.id} className="flex items-center gap-2">
                    <Input
                      value={dep.description}
                      onChange={(e) =>
                        setDependencyDrafts((prev) =>
                          prev.map((x) => (x.id === dep.id ? { ...x, description: e.target.value } : x))
                        )
                      }
                      placeholder="What are we waiting on?"
                      className="flex-1"
                    />
                    <Input
                      value={dep.neededFrom}
                      onChange={(e) =>
                        setDependencyDrafts((prev) =>
                          prev.map((x) => (x.id === dep.id ? { ...x, neededFrom: e.target.value } : x))
                        )
                      }
                      placeholder="Needed from"
                      className="w-40"
                    />
                    <Input
                      type="date"
                      value={dep.dueAt}
                      onChange={(e) =>
                        setDependencyDrafts((prev) =>
                          prev.map((x) => (x.id === dep.id ? { ...x, dueAt: e.target.value } : x))
                        )
                      }
                      className="w-40"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove dependency"
                      onClick={() => setDependencyDrafts((prev) => prev.filter((x) => x.id !== dep.id))}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {stepIndex === 9 && (
        <Card className="max-w-5xl">
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <ReviewRow label="Company" value={organization?.name ?? "—"} />
              <ReviewRow label="Project" value={name || "—"} />
              <ReviewRow label="Code" value={projectCode} />
              <ReviewRow
                label="Type / Department / Manager"
                value={[projectType, department, projectManagerName].filter(Boolean).join(" · ") || "—"}
              />
              <ReviewRow
                label="Commercial"
                value={`${billingTypeLabels[billingType]}${paymentTerms ? ` · ${paymentTerms}` : ""}${
                  estimatedEffortHours ? ` · ${estimatedEffortHours}h estimated` : ""
                }`}
              />
              <ReviewRow
                label="Timeline"
                value={`Starts ${startedAt || "—"}${targetEndAt ? `, ends ${targetEndAt}` : ""}${
                  milestoneDrafts.length ? ` · ${milestoneDrafts.length} milestones` : ""
                }`}
              />
              <ReviewRow
                label="Revision policy"
                value={`${includedRevisions || 0} included${
                  revisionWindowDays ? `, ${revisionWindowDays}-day window` : ""
                }`}
              />
              <ReviewRow
                label="Delivery config"
                value={deliveryDrafts.length ? `${deliveryDrafts.length} items` : "None"}
              />
              <ReviewRow
                label="Support"
                value={`${supportMonths} months · ${supportSlaLabels[supportSla]}`}
              />
              <ReviewRow
                label="Team"
                value={teamDrafts.length ? `${teamDrafts.length} members` : "None"}
              />
              <ReviewRow
                label="Credentials"
                value={credentialDrafts.length ? `${credentialDrafts.length} saved` : "None"}
              />
              <ReviewRow
                label="Risks / Dependencies"
                value={`${riskDrafts.length} risks · ${dependencyDrafts.length} dependencies`}
              />
            </div>

            <Button className="mt-2 w-full" onClick={handleCreate}>
              <CheckIcon />
              Create project
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-0 z-10 flex max-w-5xl items-center justify-between border-t bg-background/95 py-4 backdrop-blur">
        <Button type="button" variant="outline" onClick={goBack} disabled={stepIndex === 0}>
          <ArrowLeftIcon />
          Back
        </Button>
        <span className="text-sm text-muted-foreground">
          Step {stepIndex + 1} of {STEPS.length} — {STEPS[stepIndex].label}
        </span>
        {!isLastStep && (
          <Button type="button" onClick={goNext}>
            Next
            <ArrowRightIcon />
          </Button>
        )}
        {isLastStep && <div />}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-foreground">{value}</p>
    </div>
  )
}

function WizardStepper({
  stepIndex,
  onStepClick,
}: {
  stepIndex: number
  onStepClick: (index: number) => void
}) {
  const percent = Math.round(((stepIndex + 1) / STEPS.length) * 100)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const state = index < stepIndex ? "done" : index === stepIndex ? "active" : "pending"
          return (
            <React.Fragment key={step.key}>
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <span
                  className={
                    "flex size-9 items-center justify-center rounded-full border-2 " +
                    (state === "done"
                      ? "border-primary bg-primary text-primary-foreground"
                      : state === "active"
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground")
                  }
                >
                  {state === "done" ? <CheckIcon className="size-4" /> : <Icon className="size-4" />}
                </span>
                <span
                  className={
                    "w-20 text-center text-[11px] leading-tight " +
                    (state === "pending" ? "text-muted-foreground" : "text-foreground")
                  }
                >
                  {step.label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <span
                  className={"mb-5 h-px flex-1 " + (index < stepIndex ? "bg-primary" : "bg-border")}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div className="h-1.5 w-full max-w-5xl overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <Badge variant="outline" className="w-fit">
        {percent}%
      </Badge>
    </div>
  )
}
