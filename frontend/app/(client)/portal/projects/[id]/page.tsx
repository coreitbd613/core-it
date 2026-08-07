"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/tabs"
import { ProjectOverviewTab } from "@/components/shared/projects/project-overview-tab"
import { ProjectRevisionsTab } from "@/components/shared/projects/project-revisions-tab"
import { ProjectSupportTab } from "@/components/shared/projects/project-support-tab"
import { ProjectTimelineTab } from "@/components/shared/projects/project-timeline-tab"
import { useMyProject } from "@/hooks/use-projects"
import { projectStatusLabels, projectStatusVariant } from "@/lib/projects"

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: project, isLoading } = useMyProject(params.id)

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
            <Link href="/portal/projects">Back to projects</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal/projects" aria-label="Back to projects">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge variant={projectStatusVariant[project.status]} className="ml-auto">
          {projectStatusLabels[project.status]}
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="revisions">Revisions</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <ProjectOverviewTab project={project} variant="portal" />
        </TabsContent>
        <TabsContent value="timeline">
          <ProjectTimelineTab project={project} variant="portal" />
        </TabsContent>
        <TabsContent value="revisions">
          <ProjectRevisionsTab project={project} variant="portal" />
        </TabsContent>
        <TabsContent value="support">
          <ProjectSupportTab project={project} variant="portal" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
