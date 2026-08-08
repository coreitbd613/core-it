"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2Icon, ClockIcon, FolderKanbanIcon, Loader2Icon, XIcon } from "lucide-react"

import DashboardStatsGrid, {
  type DashboardStatItem,
} from "@/components/shared/dashboard/DashboardStatsGrid"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { useMyProjects } from "@/hooks/use-projects"
import { formatDate } from "@/lib/format"
import { milestoneProgress, projectStatusLabels, projectStatusVariant } from "@/lib/projects"

export default function ProjectsPage() {
  const router = useRouter()
  const { data: projects = [], isPending } = useMyProjects()

  useEffect(() => {
    if (!isPending && projects.length === 1) {
      router.replace(`/portal/projects/${projects[0].projectCode}`)
    }
  }, [isPending, projects, router])

  const stats = useMemo<DashboardStatItem[]>(() => {
    const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length
    const review = projects.filter((p) => p.status === "REVIEW").length
    const completed = projects.filter((p) => p.status === "COMPLETED").length
    return [
      { label: "Total Projects", value: projects.length, icon: FolderKanbanIcon, tone: "primary" },
      { label: "In Progress", value: inProgress, icon: Loader2Icon, tone: "chart2" },
      { label: "In Review", value: review, icon: ClockIcon, tone: "chart4" },
      { label: "Completed", value: completed, icon: CheckCircle2Icon, tone: "chart3" },
    ]
  }, [projects])

  if (isPending || projects.length === 1) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <XIcon />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Once Core IT kicks off a project for you, it&apos;ll show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>

      <DashboardStatsGrid items={stats} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const progress = milestoneProgress(project.milestones)
          return (
            <Link key={project.id} href={`/portal/projects/${project.projectCode}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                  <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
                  <Badge variant={projectStatusVariant[project.status]} className="shrink-0">
                    {projectStatusLabels[project.status]}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {progress.total > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Milestones</span>
                        <span>
                          {progress.done}/{progress.total}
                        </span>
                      </div>
                      <Progress value={progress.percent} />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Started {formatDate(project.startedAt)}</span>
                    <span>Updated {formatDate(project.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
