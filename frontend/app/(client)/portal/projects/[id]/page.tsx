"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectOverviewTab } from "@/components/shared/projects/project-overview-tab"
import { ProjectRevisionsTab } from "@/components/shared/projects/project-revisions-tab"
import { ProjectSupportTab } from "@/components/shared/projects/project-support-tab"
import { ProjectTimelineTab } from "@/components/shared/projects/project-timeline-tab"
import { mockProjects, projectStatusLabels, projectStatusVariant } from "@/lib/mock/projects"

export default function ProjectDetailPage() {
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
            <Link href="/portal/projects">Back to projects</Link>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  function refresh() {
    forceRerender((n) => n + 1)
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
          <ProjectOverviewTab project={project} variant="portal" onChange={refresh} />
        </TabsContent>
        <TabsContent value="timeline">
          <ProjectTimelineTab project={project} variant="portal" onChange={refresh} />
        </TabsContent>
        <TabsContent value="revisions">
          <ProjectRevisionsTab project={project} variant="portal" onChange={refresh} />
        </TabsContent>
        <TabsContent value="support">
          <ProjectSupportTab project={project} variant="portal" onChange={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
