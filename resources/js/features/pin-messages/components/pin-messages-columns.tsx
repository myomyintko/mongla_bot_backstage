import { DataTableColumnHeader } from '@/components/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import { type ColumnDef } from '@tanstack/react-table'
import { statuses } from '../data/data'
import { type PinMessage } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/components/ui/badge'

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
      const mediaUrl = row.original.media_url as string | null
      
      if (!content) {
        return <span className='text-muted-foreground'>No content</span>
      }
      
      // Strip HTML tags for table display
      const plainText = content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim()
      
      return (
        <div className='flex items-start space-x-3'>
          {/* Media Preview */}
          {mediaUrl && (
            <div className='w-10 h-10 flex-shrink-0 relative overflow-hidden rounded'>
              {/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/i.test(mediaUrl) ? (
                <video
                  src={mediaUrl}
                  className='w-full h-full object-cover'
                  muted
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Media preview"
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              )}
              {/* Fallback for failed media */}
              <div 
                className='w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 hidden'
                style={{ display: 'none' }}
              >
                📎
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='text-sm font-medium'>
              {plainText.length > 40 ? plainText.substring(0, 40) + '...' : plainText}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'btn_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Button' />
    ),
    cell: ({ row }) => {
      const btnName = row.getValue('btn_name') as string | null
      const btnLink = row.original.btn_link as string | null
      
      if (!btnName && !btnLink) {
        return (
          <Badge variant="outline" className="text-muted-foreground bg-gray-50 dark:bg-gray-800">
            No button
          </Badge>
        )
      }
      
      return (
        <div className='flex flex-col space-y-1'>
          <span className='font-medium text-sm'>
            {btnName || 'No name'}
          </span>
          <span className='text-xs text-muted-foreground'>
            {btnLink ? (
              <span className='text-blue-600 hover:underline cursor-pointer'>
                {btnLink.length > 30 ? btnLink.substring(0, 30) + '...' : btnLink}
              </span>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-xs">
                No link
              </Badge>
            )}
          </span>
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]