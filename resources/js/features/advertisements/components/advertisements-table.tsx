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
import { statuses } from '../data/data'
import { type Advertisement } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { advertisementsColumns as columns } from './advertisements-columns'
import { storesService } from '@/services/stores-service'
import { useInfiniteQuery } from '@tanstack/react-query'

const route = getRouteApi('/_authenticated/advertisements/')

type DataTableProps = {
    data: Advertisement[]
    paginationMeta?: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export function AdvertisementsTable({ data, paginationMeta }: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [storeSearchValue, setStoreSearchValue] = useState('')

  // Fetch stores for store filter with infinite query
  const {
    data: storesData,
    fetchNextPage: fetchNextStores,
    hasNextPage: hasNextStoresPage,
    isFetchingNextPage: isFetchingNextStoresPage,
  } = useInfiniteQuery({
    queryKey: ['stores', 'infinite', storeSearchValue],
    queryFn: ({ pageParam = 1 }) => storesService.getStores({
      page: pageParam,
      per_page: 20,
      search: storeSearchValue || undefined,
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })

  // Flatten all pages
  const allStores = storesData?.pages.flatMap(page => page.data) || []
  const storeOptions = [
    { label: 'All Stores', value: 'all' },
    { label: 'No Store', value: 'none' },
    ...allStores.map((store) => ({
      label: store.name,
      value: String(store.id),
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
      { columnId: 'store_id', searchKey: 'store_id', type: 'array' },
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
        searchPlaceholder='Filter by title or description...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: statuses,
          },
          {
            columnId: 'store_id',
            title: 'Store',
            options: storeOptions,
            infinite: true,
            hasNextPage: hasNextStoresPage,
            isFetchingNextPage: isFetchingNextStoresPage,
            onLoadMore: () => fetchNextStores(),
            searchValue: storeSearchValue,
            onSearchChange: setStoreSearchValue,
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
