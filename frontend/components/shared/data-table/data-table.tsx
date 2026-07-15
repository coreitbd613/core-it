"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination"

function globalFilterFn<TData>(
  row: { original: TData },
  _columnId: string,
  filterValue: string
) {
  const search = filterValue.toLowerCase()
  return Object.values(row.original as Record<string, unknown>).some(
    (value) => typeof value === "string" && value.toLowerCase().includes(search)
  )
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  getRowId: (row: TData) => string
  isLoading?: boolean
  skeletonRows?: number
  emptyMessage?: string
  pageSize?: number
  globalFilter?: string
  selectedLabel?: string
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  onRowClick?: (row: TData) => void
  enableRowSelection?: boolean | ((row: TData) => boolean)
  className?: string
  density?: "default" | "compact"
  stickyLastColumn?: boolean
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  isLoading = false,
  skeletonRows = 8,
  emptyMessage = "No records found.",
  pageSize = 10,
  globalFilter = "",
  selectedLabel,
  rowSelection,
  onRowSelectionChange,
  sorting,
  onSortingChange,
  onRowClick,
  enableRowSelection = true,
  className,
  density = "default",
  stickyLastColumn = false,
}: DataTableProps<TData>) {
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>({})
  const activeRowSelection = rowSelection ?? internalRowSelection
  const handleRowSelectionChange = onRowSelectionChange ?? setInternalRowSelection

  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const activeSorting = sorting ?? internalSorting
  const handleSortingChange = onSortingChange ?? setInternalSorting

  // TanStack Table intentionally returns instance functions that React Compiler cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { rowSelection: activeRowSelection, sorting: activeSorting, globalFilter },
    initialState: { pagination: { pageSize } },
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: handleSortingChange,
    enableRowSelection:
      typeof enableRowSelection === "function"
        ? (row) => enableRowSelection(row.original)
        : enableRowSelection,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const visibleColumns = table.getVisibleLeafColumns()

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        density === "compact" ? "px-3 py-2" : "px-4 py-3",
                        stickyLastColumn &&
                          index === headerGroup.headers.length - 1 &&
                          "sticky right-0 z-10 border-l bg-card"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {visibleColumns.map((column, index) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          density === "compact" ? "px-3 py-2" : "px-4 py-4",
                          stickyLastColumn &&
                            index === visibleColumns.length - 1 &&
                            "sticky right-0 z-10 border-l bg-card"
                        )}
                      >
                        <Skeleton className="h-4 w-full max-w-36" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={(event) => {
                      if (!onRowClick) return
                      const target = event.target as HTMLElement
                      if (
                        target.closest(
                          'button,a,input,textarea,select,[role="menuitem"],[data-row-click-ignore]'
                        )
                      ) {
                        return
                      }
                      onRowClick(row.original)
                    }}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          density === "compact" ? "px-3 py-2" : "px-4 py-4",
                          stickyLastColumn &&
                            index === row.getVisibleCells().length - 1 &&
                            "sticky right-0 z-10 border-l bg-card"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length}
                    className="h-28 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DataTablePagination table={table} selectedLabel={selectedLabel} />
    </div>
  )
}
