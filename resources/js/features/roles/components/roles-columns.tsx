import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { type ColumnDef } from '@tanstack/react-table'
import { type Role } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const rolesColumns: ColumnDef<Role>[] = [
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
    accessorKey: 'display_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Display Name' />
    ),
    cell: ({ row }) => {
      const displayName = row.getValue('display_name') as string
      
      if (!displayName) {
        return (
          <Badge variant="outline" className="text-muted-foreground bg-gray-50 dark:bg-gray-800">
            No display name
          </Badge>
        )
      }
      
      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>
            {displayName}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      
      if (!description) {
        return (
          <Badge variant="outline" className="text-muted-foreground bg-gray-50 dark:bg-gray-800">
            No description
          </Badge>
        )
      }
      
      return (
        <div className='max-w-[300px] truncate text-sm text-muted-foreground'>
          {description}
        </div>
      )
    },
  },
  {
    accessorKey: 'permissions_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Permissions' />
    ),
    cell: ({ row }) => {
      const count = row.getValue('permissions_count') as number
      return (
        <Badge 
          variant='secondary'
          className={
            count === 0 ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400' :
            count <= 5 ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200' :
            count <= 10 ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200' :
            'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200'
          }
        >
          {count} permission{count !== 1 ? 's' : ''}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
