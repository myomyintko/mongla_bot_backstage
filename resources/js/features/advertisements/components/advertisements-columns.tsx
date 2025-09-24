import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type ColumnDef } from '@tanstack/react-table'
import { Calendar, Zap } from 'lucide-react'
import { statuses } from '../data/data'
import { type Advertisement } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { AdvertisementStatusControl } from './advertisement-status-control'

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
      const title = row.getValue('title') as string
      const description = row.original.description as string | null
      const mediaUrl = row.original.media_url as string | null
      
      return (
        <div className='flex items-center space-x-3'>
          {/* Media Preview */}
          <div className='flex-shrink-0'>
            {mediaUrl ? (
              <div className='relative w-10 h-10 rounded-lg overflow-hidden bg-muted group'>
                {(() => {
                  const fullUrl = mediaUrl.startsWith('http') 
                    ? mediaUrl 
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${mediaUrl}`
                  
                  // Check if it's a video file
                  const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?.*)?$/i.test(mediaUrl)
                  
                  if (isVideo) {
                    return (
                      <>
                        <video
                          src={fullUrl}
                          className='w-full h-full object-cover'
                          muted
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        {/* Video Play Icon Overlay */}
                        <div className='absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                          <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clipRule='evenodd' />
                          </svg>
                        </div>
                        {/* Fallback for video error */}
                        <div className='hidden absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground'>
                          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clipRule='evenodd' />
                          </svg>
                        </div>
                      </>
                    )
                  } else {
                    return (
                      <>
                        <img
                          src={fullUrl}
                          alt={title}
                          className='w-full h-full object-cover'
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        {/* Fallback for image error */}
                        <div className='hidden absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground'>
                          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clipRule='evenodd' />
                          </svg>
                        </div>
                      </>
                    )
                  }
                })()}
              </div>
            ) : (
              <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center'>
                <svg className='w-5 h-5 text-muted-foreground' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clipRule='evenodd' />
                </svg>
              </div>
            )}
          </div>
          
          {/* Title and Description */}
          <div className='flex flex-col space-y-1 min-w-0 flex-1'>
            <span className='font-medium text-sm truncate'>
              {title}
            </span>
            {description ? (
              <span className='text-xs text-muted-foreground truncate'>
                {description
                  .replace(/#{1,6}\s+/g, '') // Remove headers
                  .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                  .replace(/\*(.*?)\*/g, '$1') // Remove italic
                  .replace(/`(.*?)`/g, '$1') // Remove inline code
                  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
                  .replace(/\n+/g, ' ') // Replace newlines with spaces
                  .trim()
                  .substring(0, 60) // Truncate to 60 characters
                }
                {description.length > 60 && '...'}
              </span>
            ) : (
              <span className='text-xs text-muted-foreground'>No description</span>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'start_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Operating Date' />
    ),
    cell: ({ row }) => {
      const startDate = row.original.start_date as string | null
      const endDate = row.original.end_date as string | null
      
      return (
        <div className='flex flex-col space-y-1'>
          <span className='font-medium text-sm'>
            {startDate ? new Date(startDate).toLocaleDateString() : 'Not set'}
          </span>
          <span className='text-xs text-muted-foreground'>
            {endDate ? `to ${new Date(endDate).toLocaleDateString()}` : 'No end date'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status & Control' />
    ),
    cell: ({ row }) => {
      const advertisement = row.original
      return <AdvertisementStatusControl advertisement={advertisement} />
    },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)))
    },
  },
  {
    accessorKey: 'store_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Store' />
    ),
    cell: ({ row }) => {
      const store = row.original.store
      
      if (!store?.name) {
        return (
          <Badge variant="outline" className="text-muted-foreground bg-gray-50 dark:bg-gray-800">
            No store
          </Badge>
        )
      }
      
      return (
        <div className='flex items-center space-x-2 max-w-[150px]'>
          <span className='text-sm font-medium truncate'>{store.name}</span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const storeId = row.original.store_id
      
      // Handle "all" filter - show all rows
      if (value.includes('all')) {
        return true
      }
      
      // Handle "none" filter - show rows with no store
      if (value.includes('none')) {
        return storeId === null
      }
      
      // Handle specific store IDs
      return value.includes(String(storeId))
    },
  },
  {
    accessorKey: 'frequency_cap_minutes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Schedule & Frequency' />
    ),
    cell: ({ row }) => {
      const frequency = row.getValue('frequency_cap_minutes') as number | null
      const advertisement = row.original
      const startDate = advertisement.start_date ? new Date(advertisement.start_date) : null
      const endDate = advertisement.end_date ? new Date(advertisement.end_date) : null
      const now = new Date()

      // Calculate schedule status - must consider advertisement status
      const hasStarted = !startDate || now >= startDate
      const hasEnded = endDate && now > endDate
      const isActive = advertisement.status === 1

      return (
        <TooltipProvider>
          <div className='flex flex-col space-y-1'>
            {/* Frequency Display */}
            <div className='flex items-center space-x-1'>
              <Zap className="w-3 h-3 text-blue-500" />
              {frequency ? (
                <span className='text-sm font-medium'>
                  Every {frequency} min{frequency > 1 ? 's' : ''}
                </span>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-xs">
                  Not set
                </Badge>
              )}
            </div>

            {/* Schedule Status */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex items-center space-x-1 cursor-help'>
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className={`text-xs ${
                    hasEnded ? 'text-red-600' :
                    (hasStarted && isActive) ? 'text-green-600' :
                    (hasStarted && !isActive) ? 'text-gray-600' :
                    'text-yellow-600'
                  }`}>
                    {hasEnded ? 'Ended' :
                     (hasStarted && isActive) ? 'Running' :
                     (hasStarted && !isActive) ? 'Paused' :
                     'Scheduled'}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {startDate && (
                    <p>Start: {startDate.toLocaleString()}</p>
                  )}
                  {endDate && (
                    <p>End: {endDate.toLocaleString()}</p>
                  )}
                  {frequency && (
                    <p>Sends every {frequency} minute{frequency > 1 ? 's' : ''}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' className='text-center' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
