import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { statuses, recommendationTypes } from '../data/data'
import { type Store } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { storesColumns as columns } from './stores-columns'
import { menuButtonsService } from '@/lib/menu-buttons-service'
import { useQuery } from '@tanstack/react-query'

const route = getRouteApi('/_authenticated/stores/')

type DataTableProps = {
    data: Store[]
    paginationMeta?: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export function StoresTable({ data, paginationMeta }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Fetch menu buttons for category filter
  const { data: menuButtonsData } = useQuery({
    queryKey: ['menu-buttons', 'store', 'all'],
    queryFn: () => menuButtonsService.getMenuButtons({ 
      button_type: 'store',
      per_page: 1000 // Fetch all store-type menu buttons
    }),
  })

  const menuButtons = menuButtonsData?.data || []
  const menuButtonOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'No Category', value: 'none' },
    ...menuButtons.map((button) => ({
      label: button.name,
      value: String(button.id),
    })),
  ]
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { 
      defaultPage: 1, 
      defaultPageSize: 10,
      pageKey: 'page',
      pageSizeKey: 'per_page'
    },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'recommand', searchKey: 'recommand', type: 'array' },
      { columnId: 'menu_button_id', searchKey: 'menu_button_id', type: 'array' },
    ],
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    // Server-side pagination and filtering
    manualPagination: true,
    manualFiltering: true,
    pageCount: paginationMeta ? paginationMeta.last_page : -1,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by name or ID...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: statuses,
          },
          {
            columnId: 'recommand',
            title: 'Recommended',
            options: recommendationTypes,
          },
          {
            columnId: 'menu_button_id',
            title: 'Category',
            options: menuButtonOptions,
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} />
    </div>
  )
}
