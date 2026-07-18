"use client"

import * as React from "react"
import { SendIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  mockProposalComments,
  type ProposalCommentAuthorRole,
} from "@/lib/mock/proposal-comments"

export function ProposalComments({
  proposalId,
  authorName,
  authorRole,
  onAdded,
}: {
  proposalId: string
  authorName: string
  authorRole: ProposalCommentAuthorRole
  onAdded?: () => void
}) {
  const [message, setMessage] = React.useState("")

  const comments = mockProposalComments
    .filter((c) => c.proposalId === proposalId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    mockProposalComments.push({
      id: crypto.randomUUID(),
      proposalId,
      authorName,
      authorRole,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    })
    setMessage("")
    onAdded?.()
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "rounded-lg border px-4 py-3",
                comment.authorRole === "ADMIN" ? "bg-primary/5" : "bg-muted/30"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{comment.authorName}</span>
                {comment.authorRole === "ADMIN" && (
                  <Badge variant="secondary" className="text-[10px]">
                    Core IT
                  </Badge>
                )}
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground">{comment.message}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex flex-col gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question or leave a comment..."
          rows={3}
        />
        <Button type="submit" size="sm" className="self-end" disabled={!message.trim()}>
          <SendIcon />
          Send
        </Button>
      </form>
    </div>
  )
}
