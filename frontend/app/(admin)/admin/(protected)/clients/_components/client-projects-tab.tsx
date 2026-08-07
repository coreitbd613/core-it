import Link from "next/link"
import { FolderKanbanIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useAdminProjects } from "@/hooks/use-projects"
import { formatDate } from "@/lib/format"
import { projectStatusLabels, projectStatusVariant } from "@/lib/projects"

export function ClientProjectsTab({ organizationId }: { organizationId: string }) {
  const { data: projects = [], isPending } = useAdminProjects({ organizationId })

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderKanbanIcon />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>Projects delivered for this client will show up here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Card>
      <CardContent className="flex flex-col divide-y p-0">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/admin/projects/${project.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
              <p className="text-xs text-muted-foreground">
                Started {formatDate(project.startedAt)}
                {project.targetEndAt ? ` · Target ${formatDate(project.targetEndAt)}` : ""}
              </p>
            </div>
            <Badge variant={projectStatusVariant[project.status]}>
              {projectStatusLabels[project.status]}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
