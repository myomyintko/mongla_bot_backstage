import { DataTableColumnHeader } from '@/components/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import { type ColumnDef } from '@tanstack/react-table'
import { statuses } from '../data/data'
import { type Advertisement } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const advertisementsColumns: ColumnDef<Advertisement>[] = [
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
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('title')}
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
    accessorKey: 'media_url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Media' />
    ),
    cell: ({ row }) => {
      const mediaUrl = row.getValue('media_url') as string | null
      
      if (!mediaUrl) {
        return <span className='text-muted-foreground'>No media</span>
      }

      return (
        <div className='w-[80px] h-[80px] flex items-center justify-center relative overflow-hidden'>
          {/* Try to show as image first */}
          <img
            src={mediaUrl}
            alt="Media preview"
            className='w-full h-full object-cover rounded cursor-pointer hover:opacity-80 transition-opacity'
            onClick={() => window.open(mediaUrl, '_blank')}
            onError={(e) => {
              // If image fails to load, try video
              e.currentTarget.style.display = 'none'
              const videoElement = e.currentTarget.nextElementSibling as HTMLVideoElement
              if (videoElement) {
                videoElement.style.display = 'block'
                videoElement.onerror = () => {
                  // If video also fails, show button
                  videoElement.style.display = 'none'
                  const buttonElement = videoElement.nextElementSibling as HTMLButtonElement
                  if (buttonElement) {
                    buttonElement.style.display = 'block'
                  }
                }
              }
            }}
          />
          
          {/* Try to show as video if image fails */}
          <video
            src={mediaUrl}
            className='w-full h-full object-cover rounded cursor-pointer hidden'
            controls={false}
            muted
            onClick={() => window.open(mediaUrl, '_blank')}
          />
          
          {/* Fallback button - hidden by default */}
          <button
            onClick={() => window.open(mediaUrl, '_blank')}
            className='text-blue-600 hover:underline cursor-pointer text-sm hidden'
            style={{ display: 'none' }}
          >
            View File
          </button>
        </div>
      )
    },
  },
  {
    accessorKey: 'start_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Start Date' />
    ),
    cell: ({ row }) => {
      const startDate = row.getValue('start_date') as string | null
      
      if (!startDate) {
        return <span className='text-muted-foreground'>Not set</span>
      }
      
      return <div className='text-sm'>{new Date(startDate).toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: 'end_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='End Date' />
    ),
    cell: ({ row }) => {
      const endDate = row.getValue('end_date') as string | null
      
      if (!endDate) {
        return <span className='text-muted-foreground'>Not set</span>
      }
      
      return <div className='text-sm'>{new Date(endDate).toLocaleDateString()}</div>
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
    accessorKey: 'store_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store ID' />
    ),
    cell: ({ row }) => {
      const storeId = row.getValue('store_id')
      return (
        <div className='max-w-[100px] truncate'>
          {storeId ? String(storeId) : 'No store'}
        </div>
      )
    },
  },
  {
    accessorKey: 'store',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store' />
    ),
    cell: ({ row }) => {
      const store = row.original.store
      return (
        <div className='max-w-[150px] truncate'>
          {store?.name || 'No store'}
        </div>
      )
    },
  },
  {
    accessorKey: 'frequency_cap_minutes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Frequency Cap' />
    ),
    cell: ({ row }) => {
      const frequency = row.getValue('frequency_cap_minutes') as number | null
      
      if (!frequency) {
        return <span className='text-muted-foreground'>Not set</span>
      }
      
      return <div className='text-sm'>{frequency} minutes</div>
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
