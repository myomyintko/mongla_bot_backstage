import { DataTableColumnHeader } from '@/components/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import { type ColumnDef } from '@tanstack/react-table'
import { statuses } from '../data/data'
import { type PinMessage } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const pinMessagesColumns: ColumnDef<PinMessage>[] = [
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
    accessorKey: 'content',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Content' />
    ),
    cell: ({ row }) => {
      const content = row.getValue('content') as string | null
      
      if (!content) {
        return <span className='text-muted-foreground'>No content</span>
      }
      
      // Strip HTML tags for table display
      const plainText = content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim()
      
      return (
        <div className='max-w-[200px] truncate text-sm'>
          {plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText}
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
    accessorKey: 'btn_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Button Name' />
    ),
    cell: ({ row }) => {
      const btnName = row.getValue('btn_name') as string | null
      return (
        <div className='max-w-[100px] truncate'>
          {btnName || 'No button'}
        </div>
      )
    },
  },
  {
    accessorKey: 'btn_link',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Button Link' />
    ),
    cell: ({ row }) => {
      const btnLink = row.getValue('btn_link') as string | null
      return (
        <div className='max-w-[150px] truncate'>
          {btnLink ? (
            <span className='text-blue-600 hover:underline cursor-pointer'>
              {btnLink.length > 20 ? btnLink.substring(0, 20) + '...' : btnLink}
            </span>
          ) : (
            <span className='text-muted-foreground'>No link</span>
          )}
        </div>
      )
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
        <div className='w-[80px]'>
          {sort || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as number | null
      const statusOption = statuses.find((s) => s.value === String(status))
      
      return (
        <div className='flex w-[100px] items-center'>
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            status === 1 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {statusOption?.label || 'Unknown'}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)))
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string
      return (
        <div className='w-[100px]'>
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]