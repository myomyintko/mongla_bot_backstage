import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { type ColumnDef } from '@tanstack/react-table'
import { statuses } from '../data/data'
import { type Store } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const storesColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null
      
      if (!description) {
        return <span className='text-muted-foreground'>No description</span>
      }
      
      // Strip markdown formatting for table display
      const plainText = description
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim()
      
      return (
        <div className='max-w-[200px] truncate text-sm'>
          {plainText}
        </div>
      )
    },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Address' />
    ),
    cell: ({ row }) => {
      const address = row.getValue('address') as string | null
      return (
        <div className='max-w-[150px] truncate'>
          {address || 'No address'}
        </div>
      )
    },
  },
  {
    accessorKey: 'operating_hours',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Operating Hours' />
    ),
    cell: ({ row }) => {
      const openHour = row.original.open_hour
      const closeHour = row.original.close_hour
      
      if (!openHour || !closeHour) {
        return <span className='text-muted-foreground'>Not specified</span>
      }
      
      return <div className='text-sm'>{openHour} - {closeHour}</div>
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
    accessorKey: 'recommand',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Recommended' />
    ),
    cell: ({ row }) => {
      const recommand = row.getValue('recommand') as boolean
      return (
        <Badge variant={recommand ? 'default' : 'outline'}>
          {recommand ? 'Yes' : 'No'}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => {
      const recommand = row.getValue('recommand') as boolean
      if (value === 'all') return true
      return value === String(recommand)
    },
  },
  {
    accessorKey: 'menu_button',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => {
      const menuButton = row.original.menu_button
      return (
        <div className='max-w-[150px] truncate'>
          {menuButton?.name || 'No category'}
        </div>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return <div className='text-sm'>{date.toLocaleDateString()}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
