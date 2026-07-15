import { Fragment, useState } from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface DataTableRowAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
  separatorBefore?: boolean
  confirm?: {
    title: string
    description: string
    confirmLabel?: string
  }
}

export function DataTableRowActions({
  actions,
}: {
  actions: DataTableRowAction[]
}) {
  const [pendingAction, setPendingAction] = useState<DataTableRowAction | null>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label="Open row menu"
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuGroup>
            {actions.map((action, index) => (
              <Fragment key={action.label}>
                {action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  variant={action.destructive ? "destructive" : "default"}
                  onSelect={(event) => {
                    if (action.confirm) {
                      event.preventDefault()
                      setPendingAction(action)
                    }
                  }}
                  onClick={() => {
                    if (!action.confirm) {
                      action.onClick()
                    }
                  }}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.confirm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingAction?.destructive ? "destructive" : "default"}
              onClick={() => {
                pendingAction?.onClick()
                setPendingAction(null)
              }}
            >
              {pendingAction?.confirm?.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
