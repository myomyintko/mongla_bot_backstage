import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { type ColumnDef } from '@tanstack/react-table'
import { statuses } from '../data/data'
import { type MenuButton } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const menuButtonsColumns: ColumnDef<MenuButton>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'button_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const buttonType = row.getValue('button_type') as string
      return (
        <Badge 
          variant="outline"
          className={
            buttonType === 'store' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200' :
            buttonType === 'url' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200' :
            'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
          }
        >
          {buttonType.charAt(0).toUpperCase() + buttonType.slice(1)}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => {
      return value.includes(row.getValue('button_type'))
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === String(row.getValue('status'))
      )

      if (!status) {
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Unknown
          </Badge>
        )
      }

      return (
        <Badge 
          variant={
            status.value === '1' ? 'default' : 
            status.value === '2' ? 'secondary' : 
            'destructive'
          }
          className={
            status.value === '1' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200' :
            status.value === '2' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
          }
        >
          {status.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)))
    },
  },
  {
    accessorKey: 'parent_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Parent' />
    ),
    cell: ({ row }) => {
      const parentId = row.getValue('parent_id') as number | null
      const parent = row.original.parent

      if (!parentId) {
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200">
            Root
          </Badge>
        )
      }

      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-muted-foreground'>
            {parent?.name || `ID: ${parentId}`}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'hierarchy',
    header: () => null,
    cell: () => null,
    enableHiding: false,
    enableSorting: false,
    filterFn: (row, _id, value) => {
      const parentId = row.getValue('parent_id') as number | null
      const hierarchyType = parentId ? 'child' : 'root'
      return value.includes(hierarchyType)
    },
  },
  {
    accessorKey: 'sort',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sort Order' />
    ),
    cell: ({ row }) => {
      const sort = row.getValue('sort') as number | null
      return (
        <div className='flex items-center space-x-1'>
          <span className='text-sm font-medium'>{sort ?? 0}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
