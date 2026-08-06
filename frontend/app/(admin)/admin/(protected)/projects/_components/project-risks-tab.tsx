"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  dependenciesForProject,
  dependencyStatusLabels,
  mockProjectDependencies,
  mockProjectRisks,
  riskSeverityLabels,
  riskStatusLabels,
  risksForProject,
  type DependencyStatus,
  type Project,
  type RiskSeverity,
  type RiskStatus,
} from "@/lib/mock/projects"

export function ProjectRisksTab({
  project,
  onChange,
}: {
  project: Project
  onChange?: () => void
}) {
  const risks = risksForProject(project.id)
  const dependencies = dependenciesForProject(project.id)

  function addRisk() {
    mockProjectRisks.push({
      id: crypto.randomUUID(),
      projectId: project.id,
      description: "",
      severity: "MEDIUM",
      mitigation: null,
      status: "OPEN",
    })
    onChange?.()
  }

  function updateRisk(id: string, fields: Partial<(typeof risks)[number]>) {
    const risk = mockProjectRisks.find((r) => r.id === id)
    if (!risk) return
    Object.assign(risk, fields)
    onChange?.()
  }

  function removeRisk(id: string) {
    const index = mockProjectRisks.findIndex((r) => r.id === id)
    if (index === -1) return
    mockProjectRisks.splice(index, 1)
    onChange?.()
    toast.success("Risk removed.")
  }

  function addDependency() {
    mockProjectDependencies.push({
      id: crypto.randomUUID(),
      projectId: project.id,
      description: "",
      neededFrom: null,
      dueAt: null,
      status: "PENDING",
    })
    onChange?.()
  }

  function updateDependency(id: string, fields: Partial<(typeof dependencies)[number]>) {
    const dependency = mockProjectDependencies.find((d) => d.id === id)
    if (!dependency) return
    Object.assign(dependency, fields)
    onChange?.()
  }

  function removeDependency(id: string) {
    const index = mockProjectDependencies.findIndex((d) => d.id === id)
    if (index === -1) return
    mockProjectDependencies.splice(index, 1)
    onChange?.()
    toast.success("Dependency removed.")
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Risks</CardTitle>
          <Button size="sm" onClick={addRisk}>
            <PlusIcon />
            Add risk
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {risks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No risks logged yet.</p>
          ) : (
            risks.map((risk) => (
              <div key={risk.id} className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    defaultValue={risk.description}
                    onBlur={(e) => updateRisk(risk.id, { description: e.target.value })}
                    placeholder="What could go wrong?"
                    className="flex-1"
                  />
                  <Select
                    value={risk.severity}
                    onValueChange={(v) => updateRisk(risk.id, { severity: v as RiskSeverity })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(riskSeverityLabels).map(([v, label]) => (
                        <SelectItem key={v} value={v}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={risk.status}
                    onValueChange={(v) => updateRisk(risk.id, { status: v as RiskStatus })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(riskStatusLabels).map(([v, label]) => (
                        <SelectItem key={v} value={v}>
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
                    onClick={() => removeRisk(risk.id)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
                <Input
                  defaultValue={risk.mitigation ?? ""}
                  onBlur={(e) => updateRisk(risk.id, { mitigation: e.target.value.trim() || null })}
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
          <Button size="sm" onClick={addDependency}>
            <PlusIcon />
            Add dependency
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {dependencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No dependencies logged yet.</p>
          ) : (
            dependencies.map((dependency) => (
              <div key={dependency.id} className="flex items-center gap-2">
                <Input
                  defaultValue={dependency.description}
                  onBlur={(e) => updateDependency(dependency.id, { description: e.target.value })}
                  placeholder="What are we waiting on?"
                  className="flex-1"
                />
                <Input
                  defaultValue={dependency.neededFrom ?? ""}
                  onBlur={(e) =>
                    updateDependency(dependency.id, { neededFrom: e.target.value.trim() || null })
                  }
                  placeholder="Needed from"
                  className="w-40"
                />
                <Input
                  type="date"
                  defaultValue={dependency.dueAt ?? ""}
                  onBlur={(e) => updateDependency(dependency.id, { dueAt: e.target.value || null })}
                  className="w-40"
                />
                <Select
                  value={dependency.status}
                  onValueChange={(v) => updateDependency(dependency.id, { status: v as DependencyStatus })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dependencyStatusLabels).map(([v, label]) => (
                      <SelectItem key={v} value={v}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove dependency"
                  onClick={() => removeDependency(dependency.id)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
