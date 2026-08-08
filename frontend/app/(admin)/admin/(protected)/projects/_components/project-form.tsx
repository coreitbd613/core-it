"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  FolderIcon,
  PlusIcon,
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
import { DatePickerField } from "@/components/shared/date-picker-field"
import { useAdminOrganizations } from "@/hooks/use-organization"
import { useCreateProject } from "@/hooks/use-projects"
import { STAFF_MEMBERS } from "@/lib/staff"
import { mockProposals } from "@/lib/mock/proposals"
import {
  DEFAULT_MILESTONE_TITLES,
  PAYMENT_TERMS_OPTIONS,
  PROJECT_DEPARTMENTS,
  PROJECT_TYPES,
  TEAM_ROLES,
  teamAccessLevelLabels,
  type TeamAccessLevel,
} from "@/lib/projects"

type MilestoneDraft = { id: string; title: string; dueAt: string }
type TeamDraft = { id: string; name: string; role: string; accessLevel: TeamAccessLevel }
type CredentialDraft = {
  id: string
  label: string
  username: string
  password: string
  url: string
  notes: string
}
const STEPS = [
  { key: "basic", label: "Basic Info", icon: FolderIcon },
  { key: "commercial", label: "Commercial & Policies", icon: WalletIcon },
  { key: "timeline", label: "Timeline & Delivery", icon: CalendarIcon },
  { key: "team", label: "Team & Credentials", icon: UsersIcon },
  { key: "review", label: "Review & Create", icon: SquareCheckBigIcon },
] as const

function newId() {
  return crypto.randomUUID()
}

export function ProjectForm() {
  const router = useRouter()
  const { data: organizations = [] } = useAdminOrganizations()
  const createProject = useCreateProject()
  const [stepIndex, setStepIndex] = React.useState(0)
  const [organizationId, setOrganizationId] = React.useState("")
  const effectiveOrganizationId = organizationId || organizations[0]?.id || ""

  // Basic info
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [projectType, setProjectType] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [projectManagerName, setProjectManagerName] = React.useState("")

  // Commercial
  const [proposalId, setProposalId] = React.useState("")
  const [paymentTerms, setPaymentTerms] = React.useState("")
  const [paymentSchedule, setPaymentSchedule] = React.useState("")
  const [contractValueBdt, setContractValueBdt] = React.useState("")

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

  // After-sales support
  const [supportMonths, setSupportMonths] = React.useState("3")
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
  const [credentialsNotes, setCredentialsNotes] = React.useState("")
  const [credentialDrafts, setCredentialDrafts] = React.useState<CredentialDraft[]>([])

  const organization = organizations.find((org) => org.id === effectiveOrganizationId)
  const orgProposals = mockProposals.filter((p) => p.organizationId === effectiveOrganizationId)

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

  async function handleCreate() {
    if (!organization || !name.trim()) {
      toast.error("Fill in a company and project name.")
      setStepIndex(0)
      return
    }

    try {
      const project = await createProject.mutateAsync({
        organizationId: organization.id,
        name: name.trim(),
        description: description.trim() || undefined,
        proposalId: proposalId || undefined,
        startedAt: startedAt || new Date().toISOString().slice(0, 10),
        targetEndAt: targetEndAt || undefined,
        includedRevisions: Number(includedRevisions) || 0,
        supportMonths: Number(supportMonths) || 0,
        projectType: projectType || undefined,
        department: department || undefined,
        projectManagerName: projectManagerName || undefined,
        paymentTerms: paymentTerms || undefined,
        paymentSchedule: paymentSchedule.trim() || undefined,
        contractValueBdt: contractValueBdt ? Number(contractValueBdt) : undefined,
        goLiveAt: goLiveAt || undefined,
        revisionWindowDays: revisionWindowDays ? Number(revisionWindowDays) : undefined,
        maxDaysPerRevision: maxDaysPerRevision ? Number(maxDaysPerRevision) : undefined,
        extraRevisionPriceBdt: extraRevisionPriceBdt ? Number(extraRevisionPriceBdt) : undefined,
        revisionNotes: revisionNotes.trim() || undefined,
        includedSupportTickets: includedSupportTickets ? Number(includedSupportTickets) : undefined,
        supportContactName: supportContactName || undefined,
        sendRenewalReminder,
        domain: domain.trim() || undefined,
        hostingProvider: hostingProvider.trim() || undefined,
        serverDetails: serverDetails.trim() || undefined,
        repositoryUrl: repositoryUrl.trim() || undefined,
        stagingUrl: stagingUrl.trim() || undefined,
        productionUrl: productionUrl.trim() || undefined,
        techStack: techStack.trim() || undefined,
        credentialsNotes: credentialsNotes.trim() || undefined,
        milestones: milestoneDrafts
          .filter((m) => m.title.trim())
          .map((m) => ({ title: m.title.trim(), dueAt: m.dueAt || undefined })),
        teamMembers: teamDrafts
          .filter((t) => t.name.trim())
          .map((t) => ({
            name: t.name.trim(),
            role: t.role.trim() || "Team member",
            accessLevel: t.accessLevel,
          })),
        credentials: credentialDrafts
          .filter((c) => c.label.trim())
          .map((c) => ({
            label: c.label.trim(),
            username: c.username.trim() || undefined,
            password: c.password.trim() || undefined,
            url: c.url.trim() || undefined,
            notes: c.notes.trim() || undefined,
          })),
      })
      toast.success("Project created.")
      router.push(`/admin/projects/${project.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't create this project.")
    }
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
                      {STAFF_MEMBERS.map((owner) => (
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
        <div className="flex max-w-5xl flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Commercial</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="project-proposal">Proposal</FieldLabel>
                    <Select value={proposalId} onValueChange={setProposalId}>
                      <SelectTrigger id="project-proposal" className="w-full">
                        <SelectValue placeholder="Select proposal" />
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
                <Field>
                  <FieldLabel htmlFor="project-contract-value">Contract value (BDT)</FieldLabel>
                  <Input
                    id="project-contract-value"
                    type="number"
                    min={0}
                    value={contractValueBdt}
                    onChange={(e) => setContractValueBdt(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revision policy</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>After-sales support</CardTitle>
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
                      {STAFF_MEMBERS.map((owner) => (
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
        </div>
      )}

      {stepIndex === 2 && (
        <div className="flex max-w-5xl flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="project-started">Start date</FieldLabel>
                  <DatePickerField id="project-started" value={startedAt} onChange={setStartedAt} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-target">Estimated end date</FieldLabel>
                  <DatePickerField id="project-target" value={targetEndAt} onChange={setTargetEndAt} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-golive">Go-live date</FieldLabel>
                  <DatePickerField id="project-golive" value={goLiveAt} onChange={setGoLiveAt} />
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
                    <div className="w-40">
                      <DatePickerField
                        value={m.dueAt}
                        onChange={(v) =>
                          setMilestoneDrafts((prev) =>
                            prev.map((x) => (x.id === m.id ? { ...x, dueAt: v } : x))
                          )
                        }
                      />
                    </div>
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
        </div>
      )}

      {stepIndex === 3 && (
        <div className="flex max-w-5xl flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Team & permissions</CardTitle>
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
                        {STAFF_MEMBERS.map((owner) => (
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

          <Card>
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
                <Field>
                  <FieldLabel htmlFor="project-tech-stack">Technology stack</FieldLabel>
                  <Input
                    id="project-tech-stack"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="e.g. React, Node.js, PostgreSQL"
                  />
                </Field>
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

              <Field>
                <FieldLabel htmlFor="project-credentials-notes">Notes</FieldLabel>
                <Textarea
                  id="project-credentials-notes"
                  value={credentialsNotes}
                  onChange={(e) => setCredentialsNotes(e.target.value)}
                  placeholder="Anything else about access/credentials that doesn't fit above..."
                  rows={3}
                />
              </Field>
            </CardContent>
          </Card>
        </div>
      )}

      {stepIndex === 4 && (
        <Card className="max-w-5xl">
          <CardHeader>
            <CardTitle>Review & Create</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <ReviewRow label="Company" value={organization?.name ?? "—"} />
              <ReviewRow label="Project" value={name || "—"} />
              <ReviewRow
                label="Type / Department / Manager"
                value={[projectType, department, projectManagerName].filter(Boolean).join(" · ") || "—"}
              />
              <ReviewRow
                label="Commercial"
                value={`${paymentTerms || "—"}${
                  contractValueBdt ? ` · ৳${Number(contractValueBdt).toLocaleString()}` : ""
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
                label="Support"
                value={`${supportMonths} months`}
              />
              <ReviewRow
                label="Team"
                value={teamDrafts.length ? `${teamDrafts.length} members` : "None"}
              />
              <ReviewRow
                label="Credentials"
                value={credentialDrafts.length ? `${credentialDrafts.length} saved` : "None"}
              />
            </div>

            <Button className="mt-2 w-full" onClick={handleCreate} disabled={createProject.isPending}>
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
    <div className="flex max-w-5xl flex-col gap-3">
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
                    "w-24 text-center text-[11px] leading-tight " +
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
