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
        <div className='flex w-[100px] items-center gap-2'>
          <span className='capitalize'>{buttonType}</span>
        </div>
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
        return null
      }

      return (
        <div className='flex w-[100px] items-center gap-2'>
          <span>{status.label}</span>
        </div>
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
        return <Badge variant="outline">Root</Badge>
      }

      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>
            {parent?.name || `ID: ${parentId}`}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'hierarchy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hierarchy' />
    ),
    cell: ({ row }) => {
      const parentId = row.getValue('parent_id') as number | null
      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>
            {parentId ? 'Child' : 'Root'}
          </span>
        </div>
      )
    },
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
        <div className='text-center'>
          {sort ?? 0}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
