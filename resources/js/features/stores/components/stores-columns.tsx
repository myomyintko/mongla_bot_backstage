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
      const name = row.getValue('name') as string
      const address = row.original.address as string | null
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
                          alt={name}
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
          
          {/* Name and Address */}
          <div className='flex flex-col space-y-1 min-w-0 flex-1'>
            <span className='font-medium text-sm truncate'>
              {name}
            </span>
            <span className='text-xs text-muted-foreground truncate'>
              {address || 'No address'}
            </span>
          </div>
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
    accessorKey: 'recommand',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Recommended' />
    ),
    cell: ({ row }) => {
      const recommand = row.getValue('recommand') as boolean
      return (
        <Badge 
          variant={recommand ? 'default' : 'outline'}
          className={
            recommand 
              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
          }
        >
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
      
      if (!menuButton?.name) {
        return (
          <Badge variant="outline" className="text-muted-foreground bg-gray-50 dark:bg-gray-800">
            No category
          </Badge>
        )
      }
      
      return (
        <div className='flex items-center space-x-2 max-w-[150px]'>
          <span className='text-sm font-medium truncate'>{menuButton.name}</span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const menuButtonId = row.original.menu_button_id
      if (value === 'all') return true
      if (value === 'none') return !menuButtonId
      return value === String(menuButtonId)
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
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
