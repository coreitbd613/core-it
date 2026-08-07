"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CalendarDaysIcon,
  FolderKanbanIcon,
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"

import { InfoChip } from "@/components/shared/info-chip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/tabs"
import { useAdminInvoices } from "@/hooks/use-invoices"
import { useAdminOrganization } from "@/hooks/use-organization"
import { useAdminProjects } from "@/hooks/use-projects"
import { formatBDT } from "@/lib/format"

import { ClientContractsTab } from "../_components/client-contracts-tab"
import { ClientInvoicesTab } from "../_components/client-invoices-tab"
import { ClientOverviewTab } from "../_components/client-overview-tab"
import { ClientProjectsTab } from "../_components/client-projects-tab"
import { ClientProposalsTab } from "../_components/client-proposals-tab"

function tenureLabel(joinDate: string): string {
  const start = new Date(joinDate)
  const now = new Date()
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  if (now.getDate() < start.getDate()) months -= 1
  months = Math.max(0, months)
  const years = Math.floor(months / 12)
  const remainder = months % 12
  if (years === 0) return `${remainder} mo`
  if (remainder === 0) return `${years} yr`
  return `${years} yr ${remainder} mo`
}

export default function AdminClientDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: organization, isLoading } = useAdminOrganization(params.id)
  const { data: invoices = [] } = useAdminInvoices({ organizationId: params.id })
  const { data: projects = [] } = useAdminProjects({ organizationId: params.id })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!organization) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Client not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/clients">Back to clients</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const lifetimeRevenueBdt = invoices.reduce((sum, inv) => sum + inv.computed.paidBdt, 0)
  const outstandingBdt = invoices
    .filter((inv) => inv.computed.status !== "CANCELLED")
    .reduce((sum, inv) => sum + inv.computed.balanceBdt, 0)
  const activeProjects = projects.filter((p) => p.status !== "COMPLETED").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/clients" aria-label="Back to clients">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground">{organization.industry ?? "No industry set"}</p>
        </div>
      </div>

      <Card className="overflow-hidden pt-0">
        <div className="h-2 bg-gradient-to-r from-primary via-orange-400 to-blue-500" />
        <CardContent className="flex flex-col gap-6 pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                {organization.logoUrl && <AvatarImage src={organization.logoUrl} alt={organization.name} />}
                <AvatarFallback className="bg-gradient-to-br from-primary to-orange-600 text-lg font-semibold text-white">
                  {organization.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">{organization.name}</p>
                  {organization.industry && <Badge variant="secondary">{organization.industry}</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {organization.email && (
                    <span className="flex items-center gap-1.5">
                      <MailIcon className="size-3.5" />
                      {organization.email}
                    </span>
                  )}
                  {organization.phone && (
                    <span className="flex items-center gap-1.5">
                      <PhoneIcon className="size-3.5" />
                      {organization.phone}
                    </span>
                  )}
                  {organization.website && (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-foreground hover:underline"
                    >
                      <GlobeIcon className="size-3.5" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoChip
              icon={BanknoteIcon}
              iconClassName="bg-primary/10 text-primary"
              label="Lifetime revenue"
              value={formatBDT(lifetimeRevenueBdt)}
            />
            <InfoChip
              icon={WalletIcon}
              iconClassName="bg-destructive/10 text-destructive"
              label="Outstanding"
              value={formatBDT(outstandingBdt)}
            />
            <InfoChip
              icon={FolderKanbanIcon}
              iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              label="Active projects"
              value={activeProjects}
            />
            <InfoChip
              icon={CalendarDaysIcon}
              iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              label="Client since"
              value={tenureLabel(organization.createdAt)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <ClientOverviewTab organization={organization} />
        </TabsContent>
        <TabsContent value="proposals" className="mt-4">
          <ClientProposalsTab organizationName={organization.name} />
        </TabsContent>
        <TabsContent value="contracts" className="mt-4">
          <ClientContractsTab organizationName={organization.name} />
        </TabsContent>
        <TabsContent value="projects" className="mt-4">
          <ClientProjectsTab organizationId={organization.id} />
        </TabsContent>
        <TabsContent value="invoices" className="mt-4">
          <ClientInvoicesTab organizationId={organization.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
