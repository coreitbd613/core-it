"use client"

import * as React from "react"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  addEmployeeDocument,
  employeeDocumentTypeLabels,
  type Employee,
  type EmployeeDocumentType,
} from "@/lib/mock/employees"

const DOCUMENT_TYPES = Object.keys(employeeDocumentTypeLabels) as EmployeeDocumentType[]

export function DocumentUploadDialog({
  employee,
  onUploaded,
}: {
  employee: Employee
  onUploaded: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState<EmployeeDocumentType>("OTHER")
  const [fileName, setFileName] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fileName.trim()) {
      toast.error("Choose a file to upload.")
      return
    }
    addEmployeeDocument(employee, type, fileName.trim())
    toast.success("Document uploaded.")
    setFileName("")
    setOpen(false)
    onUploaded()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UploadIcon />
          Upload document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>Attach a document to {employee.name}&apos;s profile.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="document-type">Type</FieldLabel>
              <Select value={type} onValueChange={(v) => setType(v as EmployeeDocumentType)}>
                <SelectTrigger id="document-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {employeeDocumentTypeLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="document-file">File</FieldLabel>
              <Button
                id="document-file"
                type="button"
                variant="outline"
                className="w-full justify-start font-normal"
                onClick={() => fileInputRef.current?.click()}
              >
                {fileName || "Choose a file..."}
              </Button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Upload</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
