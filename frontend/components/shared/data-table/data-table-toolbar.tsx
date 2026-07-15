"use client"

import { RotateCcwIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  onReset,
  showReset = false,
  filters,
  actions,
  bulkActions,
}: {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  onReset?: () => void
  showReset?: boolean
  filters?: React.ReactNode
  actions?: React.ReactNode
  bulkActions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-nowrap items-center gap-2">
        <InputGroup className="max-w-xs shrink sm:max-w-sm">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </InputGroup>
        {bulkActions && <div className="shrink-0">{bulkActions}</div>}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {filters}
        {showReset && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcwIcon />
            Reset
          </Button>
        )}
        {actions}
      </div>
    </div>
  )
}
