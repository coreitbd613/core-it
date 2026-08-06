"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { deliveryConfigForProject, mockDeliveryConfigItems, type Project } from "@/lib/mock/projects"

export function ProjectDeliveryConfigTab({
  project,
  onChange,
}: {
  project: Project
  onChange?: () => void
}) {
  const items = deliveryConfigForProject(project.id)

  function handleAdd() {
    mockDeliveryConfigItems.push({
      id: crypto.randomUUID(),
      projectId: project.id,
      label: "",
      included: true,
    })
    onChange?.()
  }

  function handleLabelChange(id: string, label: string) {
    const item = mockDeliveryConfigItems.find((d) => d.id === id)
    if (!item) return
    item.label = label
    onChange?.()
  }

  function handleToggle(id: string) {
    const item = mockDeliveryConfigItems.find((d) => d.id === id)
    if (!item) return
    item.included = !item.included
    onChange?.()
  }

  function handleRemove(id: string) {
    const index = mockDeliveryConfigItems.findIndex((d) => d.id === id)
    if (index === -1) return
    mockDeliveryConfigItems.splice(index, 1)
    onChange?.()
    toast.success("Delivery item removed.")
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Delivery config</CardTitle>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon />
          Add item
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No delivery items yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Input
                  defaultValue={item.label}
                  onBlur={(e) => handleLabelChange(item.id, e.target.value)}
                  placeholder="Delivery item"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant={item.included ? "default" : "outline"}
                  size="sm"
                  className="w-16"
                  onClick={() => handleToggle(item.id)}
                >
                  {item.included ? "Yes" : "No"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove item"
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
