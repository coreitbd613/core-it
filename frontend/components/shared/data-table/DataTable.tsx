"use client";

import * as React from "react";
import { useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTablePagination = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: DataTablePagination;
  selectedLabel?: string;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean | ((row: TData) => boolean);
  className?: string;
  density?: "default" | "compact";
  stickyLastColumn?: boolean;
};

export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  isLoading = false,
  emptyMessage = "No records found.",
  pagination,
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
    useState<RowSelectionState>({});
  const activeRowSelection = rowSelection ?? internalRowSelection;
  const handleRowSelectionChange =
    onRowSelectionChange ?? setInternalRowSelection;
  const [internalSorting, setInternalSorting] =
    useState<SortingState>([]);
  const activeSorting = sorting ?? internalSorting;
  const handleSortingChange = onSortingChange ?? setInternalSorting;

  // TanStack Table intentionally returns instance functions that React Compiler cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { rowSelection: activeRowSelection, sorting: activeSorting },
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: typeof enableRowSelection === "function"
      ? (row) => enableRowSelection(row.original)
      : enableRowSelection,
    manualPagination: true,
    manualSorting: true,
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const label =
    selectedLabel ||
    `${selectedRows} of ${data.length} row(s) selected.`;
  const limitOptions = pagination?.limitOptions || [10, 20, 50, 100];

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
                      stickyLastColumn && index === headerGroup.headers.length - 1 && "sticky right-0 z-10 border-l bg-card",
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      header.column.columnDef.enableSorting === true ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="-ml-2 h-8 gap-1 px-2"
                          onClick={() =>
                            header.column.toggleSorting(
                              header.column.getIsSorted() === "asc",
                            )
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {visibleColumns.map((column, index) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        density === "compact" ? "px-3 py-2" : "px-4 py-4",
                        stickyLastColumn && index === visibleColumns.length - 1 && "sticky right-0 z-10 border-l bg-card",
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
                    if (!onRowClick) return;
                    const target = event.target as HTMLElement;
                    if (
                      target.closest(
                        'button,a,input,textarea,select,[role="menuitem"],[data-row-click-ignore]',
                      )
                    ) {
                      return;
                    }
                    onRowClick(row.original);
                  }}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        density === "compact" ? "px-3 py-2" : "px-4 py-4",
                        stickyLastColumn && index === row.getVisibleCells().length - 1 && "sticky right-0 z-10 border-l bg-card",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {pagination ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Showing
              </span>
              <Select
                value={String(pagination.limit)}
                onValueChange={(value) => pagination.onLimitChange?.(Number(value))}
                disabled={!pagination.onLimitChange || isLoading}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {limitOptions.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <p>{label}</p>
        </div>
        {pagination ? (
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                <ChevronLeft />
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
