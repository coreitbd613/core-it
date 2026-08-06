"use client"

import * as React from "react"
import { CopyIcon, Eye, EyeOff, KeyRoundIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  deploymentMethodLabels,
  mockProjectCredentials,
  type CredentialEntry,
  type DeploymentMethod,
  type Project,
} from "@/lib/mock/projects"

export function ProjectCredentialsTab({
  project,
  onChange,
}: {
  project: Project
  onChange?: () => void
}) {
  const credentials = mockProjectCredentials.filter((c) => c.projectId === project.id)

  function saveField<K extends keyof Project>(key: K, value: Project[K]) {
    project[key] = value
    project.updatedAt = new Date().toISOString().slice(0, 10)
    onChange?.()
  }

  function handleAdd(fields: Omit<CredentialEntry, "id" | "projectId">) {
    mockProjectCredentials.push({ id: crypto.randomUUID(), projectId: project.id, ...fields })
    onChange?.()
    toast.success("Credential added.")
  }

  function handleEdit(id: string, fields: Omit<CredentialEntry, "id" | "projectId">) {
    const entry = mockProjectCredentials.find((c) => c.id === id)
    if (!entry) return
    Object.assign(entry, fields)
    onChange?.()
    toast.success("Credential updated.")
  }

  function handleDelete(id: string) {
    const index = mockProjectCredentials.findIndex((c) => c.id === id)
    if (index === -1) return
    mockProjectCredentials.splice(index, 1)
    onChange?.()
    toast.success("Credential deleted.")
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Technical details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Domain</p>
              <Input
                defaultValue={project.domain ?? ""}
                className="h-8"
                placeholder="example.com"
                onBlur={(e) => {
                  const next = e.target.value.trim() || null
                  if (next === project.domain) return
                  saveField("domain", next)
                  toast.success("Domain updated.")
                }}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hosting</p>
              <Input
                defaultValue={project.hostingProvider ?? ""}
                className="h-8"
                placeholder="Hosting provider"
                onBlur={(e) => {
                  const next = e.target.value.trim() || null
                  if (next === project.hostingProvider) return
                  saveField("hostingProvider", next)
                  toast.success("Hosting updated.")
                }}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Server</p>
              <Input
                defaultValue={project.serverDetails ?? ""}
                className="h-8"
                placeholder="Server details"
                onBlur={(e) => {
                  const next = e.target.value.trim() || null
                  if (next === project.serverDetails) return
                  saveField("serverDetails", next)
                  toast.success("Server details updated.")
                }}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Repository</p>
              <Input
                defaultValue={project.repositoryUrl ?? ""}
                className="h-8"
                placeholder="https://github.com/..."
                onBlur={(e) => {
                  const next = e.target.value.trim() || null
                  if (next === project.repositoryUrl) return
                  saveField("repositoryUrl", next)
                  toast.success("Repository updated.")
                }}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Staging URL</p>
              <Input
                defaultValue={project.stagingUrl ?? ""}
                className="h-8"
                placeholder="https://staging..."
                onBlur={(e) => {
                  const next = e.target.value.trim() || null
                  if (next === project.stagingUrl) return
                  saveField("stagingUrl", next)
                  toast.success("Staging URL updated.")
                }}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Production URL</p>
              <Input
                defaultValue={project.productionUrl ?? ""}
                className="h-8"
                placeholder="https://..."
                onBlur={(e) => {
                  const next = e.target.value.trim() || null
                  if (next === project.productionUrl) return
                  saveField("productionUrl", next)
                  toast.success("Production URL updated.")
                }}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Technology stack</p>
              <Input
                defaultValue={project.techStack ?? ""}
                className="h-8"
                placeholder="e.g. React, Node.js, PostgreSQL"
                onBlur={(e) => {
                  const next = e.target.value.trim() || null
                  if (next === project.techStack) return
                  saveField("techStack", next)
                  toast.success("Tech stack updated.")
                }}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Deployment method</p>
              <Select
                value={project.deploymentMethod ?? ""}
                onValueChange={(v) => {
                  saveField("deploymentMethod", (v || null) as DeploymentMethod | null)
                  toast.success("Deployment method updated.")
                }}
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(deploymentMethodLabels).map(([v, label]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Login credentials</CardTitle>
          <CredentialFormDialog
            onSubmit={handleAdd}
            trigger={
              <Button size="sm">
                <PlusIcon />
                Add credential
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <KeyRoundIcon />
                </EmptyMedia>
                <EmptyTitle>No credentials saved</EmptyTitle>
                <EmptyDescription>
                  Store hosting, domain, or CMS access here for internal reference.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {credentials.map((credential) => (
                <CredentialRow
                  key={credential.id}
                  credential={credential}
                  onEdit={(fields) => handleEdit(credential.id, fields)}
                  onDelete={() => handleDelete(credential.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CredentialRow({
  credential,
  onEdit,
  onDelete,
}: {
  credential: CredentialEntry
  onEdit: (fields: Omit<CredentialEntry, "id" | "projectId">) => void
  onDelete: () => void
}) {
  const [visible, setVisible] = React.useState(false)

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value)
    toast.success(`${label} copied.`)
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{credential.label}</span>
          {credential.url && (
            <a
              href={credential.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground underline"
            >
              {credential.url}
            </a>
          )}
        </div>
        <div className="flex items-center gap-1">
          <CredentialFormDialog
            credential={credential}
            onSubmit={onEdit}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label="Edit credential">
                <PencilIcon />
              </Button>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Delete credential">
                <Trash2Icon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this credential?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes &quot;{credential.label}&quot; permanently.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {credential.username && (
          <div className="flex items-center justify-between rounded-md border bg-muted/30 px-2.5 py-1.5">
            <span className="truncate font-mono text-xs text-foreground">{credential.username}</span>
            <button
              type="button"
              onClick={() => copy(credential.username!, "Username")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Copy username"
            >
              <CopyIcon className="size-3.5" />
            </button>
          </div>
        )}
        {credential.password && (
          <div className="flex items-center justify-between rounded-md border bg-muted/30 px-2.5 py-1.5">
            <span className="truncate font-mono text-xs text-foreground">
              {visible ? credential.password : "•".repeat(Math.min(credential.password.length, 12))}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                className="hover:text-foreground"
              >
                {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => copy(credential.password!, "Password")}
                className="hover:text-foreground"
                aria-label="Copy password"
              >
                <CopyIcon className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {credential.notes && <p className="text-xs text-muted-foreground">{credential.notes}</p>}
    </div>
  )
}

function CredentialFormDialog({
  credential,
  onSubmit,
  trigger,
}: {
  credential?: CredentialEntry
  onSubmit: (fields: Omit<CredentialEntry, "id" | "projectId">) => void
  trigger: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [label, setLabel] = React.useState(credential?.label ?? "")
  const [username, setUsername] = React.useState(credential?.username ?? "")
  const [password, setPassword] = React.useState(credential?.password ?? "")
  const [url, setUrl] = React.useState(credential?.url ?? "")
  const [notes, setNotes] = React.useState(credential?.notes ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    onSubmit({
      label: label.trim(),
      username: username.trim() || null,
      password: password.trim() || null,
      url: url.trim() || null,
      notes: notes.trim() || null,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{credential ? "Edit credential" : "Add credential"}</DialogTitle>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="cred-label">Label</FieldLabel>
              <Input
                id="cred-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Hosting (cPanel)"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="cred-username">Username</FieldLabel>
                <Input
                  id="cred-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cred-password">Password</FieldLabel>
                <Input
                  id="cred-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="cred-url">URL</FieldLabel>
              <Input
                id="cred-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cred-notes">Notes</FieldLabel>
              <Textarea id="cred-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{credential ? "Save changes" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
