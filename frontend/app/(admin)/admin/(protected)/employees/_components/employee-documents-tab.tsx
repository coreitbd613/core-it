"use client"

import { useState } from "react"
import { FileIcon, Trash2Icon } from "lucide-react"
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatDate } from "@/lib/format"
import { employeeDocumentTypeLabels, removeEmployeeDocument, type Employee } from "@/lib/mock/employees"

import { DocumentUploadDialog } from "./document-upload-dialog"

export function EmployeeDocumentsTab({ employee }: { employee: Employee }) {
  const [, forceRerender] = useState(0)

  function handleRemove(documentId: string, fileName: string) {
    removeEmployeeDocument(employee, documentId)
    toast.success(`Removed ${fileName}.`)
    forceRerender((n) => n + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Documents</h3>
        <DocumentUploadDialog employee={employee} onUploaded={() => forceRerender((n) => n + 1)} />
      </div>

      {employee.documents.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileIcon />
            </EmptyMedia>
            <EmptyTitle>No documents yet</EmptyTitle>
            <EmptyDescription>Upload an NID, resume, contract, or certificate.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          {employee.documents.map((doc, index) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between px-4 py-3 ${index > 0 ? "border-t" : ""}`}
            >
              <div className="flex items-center gap-3">
                <FileIcon className="size-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{doc.fileName}</span>
                  <span className="text-xs text-muted-foreground">
                    {employeeDocumentTypeLabels[doc.type]} · Uploaded {formatDate(doc.uploadedAt)}
                  </span>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Remove document">
                    <Trash2Icon />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {doc.fileName}?</AlertDialogTitle>
                    <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={() => handleRemove(doc.id, doc.fileName)}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
