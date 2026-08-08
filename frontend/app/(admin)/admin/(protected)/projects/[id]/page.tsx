"use client"

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
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/tabs"
import { ProjectOverviewTab } from "@/components/shared/projects/project-overview-tab"
import { ProjectRevisionsTab } from "@/components/shared/projects/project-revisions-tab"
import { ProjectSupportTab } from "@/components/shared/projects/project-support-tab"
import { ProjectTeamTab } from "@/components/shared/projects/project-team-tab"
import { ProjectTimelineTab } from "@/components/shared/projects/project-timeline-tab"
import { useAdminProject, useUpdateProjectStatus } from "@/hooks/use-projects"
import { projectStatusLabels, type ProjectStatus } from "@/lib/projects"

import { ProjectCredentialsTab } from "../_components/project-credentials-tab"

const projectStatuses: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED"]

export default function AdminProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: project, isLoading } = useAdminProject(params.id)
  const updateStatus = useUpdateProjectStatus(params.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-6" />
      </div>
    )
  }

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

  async function handleStatusChange(status: ProjectStatus) {
    try {
      await updateStatus.mutateAsync(status)
      toast.success("Project status updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update this project's status.")
    }
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
          <p className="text-muted-foreground">{project.organization?.name ?? "—"}</p>
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
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <ProjectOverviewTab project={project} variant="admin" />
        </TabsContent>
        <TabsContent value="timeline">
          <ProjectTimelineTab project={project} variant="admin" />
        </TabsContent>
        <TabsContent value="revisions">
          <ProjectRevisionsTab project={project} variant="admin" />
        </TabsContent>
        <TabsContent value="support">
          <ProjectSupportTab project={project} variant="admin" />
        </TabsContent>
        <TabsContent value="team">
          <ProjectTeamTab project={project} variant="admin" />
        </TabsContent>
        <TabsContent value="credentials">
          <ProjectCredentialsTab project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
