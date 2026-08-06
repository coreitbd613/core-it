"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectOverviewTab } from "@/components/shared/projects/project-overview-tab"
import { ProjectRevisionsTab } from "@/components/shared/projects/project-revisions-tab"
import { ProjectSupportTab } from "@/components/shared/projects/project-support-tab"
import { ProjectTimelineTab } from "@/components/shared/projects/project-timeline-tab"
import { mockProjects, projectStatusLabels, type ProjectStatus } from "@/lib/mock/projects"

import { ProjectCredentialsTab } from "../_components/project-credentials-tab"
import { ProjectDeliveryConfigTab } from "../_components/project-delivery-config-tab"
import { ProjectRisksTab } from "../_components/project-risks-tab"
import { ProjectTeamTab } from "../_components/project-team-tab"

const projectStatuses: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED"]

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const [, forceRerender] = React.useState(0)

  const project = mockProjects.find((p) => p.id === params.id)

  if (!project) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>Project not found</EmptyTitle>
          <EmptyDescription>
            <Link href="/admin/projects">Back to projects</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function refresh() {
    forceRerender((n) => n + 1)
  }

  function handleStatusChange(status: ProjectStatus) {
    project!.status = status
    project!.updatedAt = new Date().toISOString().slice(0, 10)
    if (status === "COMPLETED" && !project!.completedAt) {
      project!.completedAt = new Date().toISOString().slice(0, 10)
    }
    refresh()
    toast.success("Project status updated.")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects" aria-label="Back to projects">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.organizationName}</p>
        </div>
        <div className="ml-auto">
          <Select
            value={project.status}
            onValueChange={(status) => handleStatusChange(status as ProjectStatus)}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projectStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {projectStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="revisions">Revisions</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Config</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="risks">Risks & Dependencies</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <ProjectOverviewTab project={project} variant="admin" onChange={refresh} />
        </TabsContent>
        <TabsContent value="timeline">
          <ProjectTimelineTab project={project} variant="admin" onChange={refresh} />
        </TabsContent>
        <TabsContent value="revisions">
          <ProjectRevisionsTab project={project} variant="admin" onChange={refresh} />
        </TabsContent>
        <TabsContent value="delivery">
          <ProjectDeliveryConfigTab project={project} onChange={refresh} />
        </TabsContent>
        <TabsContent value="support">
          <ProjectSupportTab project={project} variant="admin" onChange={refresh} />
        </TabsContent>
        <TabsContent value="team">
          <ProjectTeamTab project={project} onChange={refresh} />
        </TabsContent>
        <TabsContent value="credentials">
          <ProjectCredentialsTab project={project} onChange={refresh} />
        </TabsContent>
        <TabsContent value="risks">
          <ProjectRisksTab project={project} onChange={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
