"use client"

import * as React from "react"
import type { DataTableFilterField } from "@/types/data-table"
import { Cross2Icon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useTranslations } from 'next-intl'

interface DataTableToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>
  filterFields?: DataTableFilterField<TData>[]
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const tCommon = useTranslations('common');
  const isFiltered = table.getState().columnFilters.length > 0

  // Memoize computation of searchableColumns, filterableColumns, and dateColumns
  const { searchableColumns, filterableColumns, dateColumns } = React.useMemo(() => {
    return {
      searchableColumns: filterFields.filter((field) => !field.options && field.type !== "date"),
      filterableColumns: filterFields.filter((field) => field.options),
      dateColumns: filterFields.filter((field) => field.type === "date"),
    }
  }, [filterFields])

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between space-x-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center space-x-2">
        {searchableColumns.length > 0 &&
          searchableColumns.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : "") && (
                <Input
                  key={String(column.value)}
                  placeholder={column.placeholder}
                  value={
                    (table
                      .getColumn(String(column.value))
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(String(column.value))
                      ?.setFilterValue(event.target.value)
                  }
                  className="h-8 w-40 lg:w-64"
                />
              )
          )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : "") && (
                <DataTableFacetedFilter
                  key={String(column.value)}
                  column={table.getColumn(
                    column.value ? String(column.value) : ""
                  )}
                  title={column.label}
                  options={column.options ?? []}
                />
              )
          )}
        {dateColumns.length > 0 &&
          dateColumns.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : "") && (
                <DateRangePicker
                  key={String(column.value)}
                  value={
                    table
                      .getColumn(String(column.value))
                      ?.getFilterValue() as DateRange | undefined
                  }
                  onChange={(range) =>
                    table
                      .getColumn(String(column.value))
                      ?.setFilterValue(range)
                  }
                  placeholder={column.placeholder || tCommon('placeholders.selectDateRange')}
                />
              )
          )}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            {tCommon('actions.reset')}
            <Cross2Icon className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
