"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  CalendarIcon,
  FlagIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  ListChecksIcon,
  RefreshCwIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { InfoChip } from "@/components/shared/info-chip"
import { ProjectOverviewTab } from "@/components/shared/projects/project-overview-tab"
import { ProjectRevisionsTab } from "@/components/shared/projects/project-revisions-tab"
import { ProjectSupportTab } from "@/components/shared/projects/project-support-tab"
import { ProjectTeamTab } from "@/components/shared/projects/project-team-tab"
import { ProjectTimelineTab } from "@/components/shared/projects/project-timeline-tab"
import { useMyProject, useMyProjects } from "@/hooks/use-projects"
import { formatDate } from "@/lib/format"
import {
  milestoneProgress,
  projectStatusLabels,
  projectStatusVariant,
  revisionStats,
  supportStatus,
} from "@/lib/projects"

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboardIcon },
  { id: "timeline", label: "Timeline", icon: CalendarClockIcon },
  { id: "revisions", label: "Revisions", icon: RefreshCwIcon },
  { id: "support", label: "Support", icon: LifeBuoyIcon },
  { id: "team", label: "Team", icon: UsersIcon },
]

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: project, isLoading } = useMyProject(params.id)
  const { data: allProjects = [] } = useMyProjects()
  const hasMultipleProjects = allProjects.length > 1

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

  const progress = milestoneProgress(project.milestones)
  const revStats = revisionStats(project)
  const support = supportStatus(project)

  const supportTint =
    support.state === "ACTIVE"
      ? "bg-chart-3/10 text-chart-3"
      : support.state === "EXPIRED"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground"

  const supportValue =
    support.state === "ACTIVE"
      ? `${support.daysRemaining} day${support.daysRemaining === 1 ? "" : "s"} left`
      : support.state === "EXPIRED"
        ? "Expired"
        : "Not started"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        {hasMultipleProjects && (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/portal/projects" aria-label="Back to projects">
              <ArrowLeftIcon />
            </Link>
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{project.name}</h1>
          <p className="text-xs text-muted-foreground">{project.projectCode}</p>
        </div>
        <Badge variant={projectStatusVariant[project.status]} className="ml-auto shrink-0">
          {projectStatusLabels[project.status]}
        </Badge>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5">
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <InfoChip
              icon={CalendarIcon}
              iconClassName="bg-muted text-muted-foreground"
              label="Started"
              value={formatDate(project.startedAt)}
            />
            <InfoChip
              icon={FlagIcon}
              iconClassName="bg-primary/10 text-primary"
              label={project.completedAt ? "Completed" : "Target end"}
              value={
                project.completedAt
                  ? formatDate(project.completedAt)
                  : project.targetEndAt
                    ? formatDate(project.targetEndAt)
                    : "—"
              }
            />
            <InfoChip
              icon={ListChecksIcon}
              iconClassName="bg-chart-1/10 text-chart-1"
              label="Milestones"
              value={progress.total > 0 ? `${progress.done}/${progress.total} done` : "None yet"}
            />
            <InfoChip
              icon={RefreshCwIcon}
              iconClassName="bg-chart-5/10 text-chart-5"
              label="Revisions"
              value={`${revStats.remaining} of ${revStats.included} left`}
            />
            <InfoChip
              icon={LifeBuoyIcon}
              iconClassName={supportTint}
              label="Support"
              value={supportValue}
            />
          </div>
        </CardContent>
      </Card>

      <nav className="sticky top-14 z-30 -mx-3 overflow-x-auto border-b bg-background/95 px-3 py-2 backdrop-blur md:top-16 md:mx-0 md:rounded-lg md:border md:bg-muted/40 md:px-2">
        <div className="flex w-fit items-center gap-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground whitespace-nowrap transition-colors hover:bg-background hover:text-foreground"
            >
              <Icon className="size-4" />
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="flex flex-col gap-8">
        <div id="overview" className="scroll-mt-28">
          <ProjectOverviewTab project={project} variant="portal" />
        </div>
        <div id="timeline" className="scroll-mt-28">
          <ProjectTimelineTab project={project} variant="portal" />
        </div>
        <div id="revisions" className="scroll-mt-28">
          <ProjectRevisionsTab project={project} variant="portal" />
        </div>
        <div id="support" className="scroll-mt-28">
          <ProjectSupportTab project={project} variant="portal" />
        </div>
        <div id="team" className="scroll-mt-28">
          <ProjectTeamTab project={project} variant="portal" />
        </div>
      </div>
    </div>
  )
}
