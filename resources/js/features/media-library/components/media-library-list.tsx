import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar, Copy, Download, Eye, MoreHorizontal, Trash2, Image, Video, FileText, Paperclip, Folder } from 'lucide-react'
import { type MediaLibrary } from '../data/schema'
import { useMediaLibrary } from './media-library-provider'
import { MediaLibraryUploadDialog } from './media-library-upload-dialog'
import { MediaLibraryPreviewDialog } from './media-library-preview-dialog'
import { MediaLibraryPagination } from './media-library-pagination'
import { mediaLibraryService } from '@/services/media-library-service'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'

interface MediaLibraryListProps {}

export function MediaLibraryList({}: MediaLibraryListProps) {
  const { selectedMedia, setSelectedMedia, setCurrentPage, sortBy, filterByType, searchQuery, currentPage, perPage } = useMediaLibrary()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const queryClient = useQueryClient()

  // Parse sort parameters
  const [sortField, sortOrder] = sortBy.split(':')

  // Regular query for list view
  const { data: mediaResponse, isLoading, error } = useQuery({
    queryKey: ['media-library', { 
      search: searchQuery, 
      file_type: filterByType, 
      sort_by: sortField, 
      sort_order: sortOrder,
      page: currentPage,
      per_page: perPage
    }],
    queryFn: () => mediaLibraryService.getMediaLibrary({
      search: searchQuery || undefined,
      file_type: filterByType !== 'all' ? filterByType : undefined,
      sort_by: sortField,
      sort_order: sortOrder as 'asc' | 'desc',
      page: currentPage,
      per_page: perPage,
    }),
  })

  // Get media data and pagination from response
  const media = mediaResponse?.data || []
  const pagination = mediaResponse?.meta

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading media library...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2">Failed to load media library</h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred while loading media files.'}
          </p>
        </div>
      </div>
    )
  }

  const handleSelectMedia = (mediaItem: MediaLibrary, checked: boolean) => {
    if (checked) {
      setSelectedMedia([...selectedMedia, mediaItem])
    } else {
      setSelectedMedia(selectedMedia.filter(item => item.id !== mediaItem.id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMedia(media)
    } else {
      setSelectedMedia([])
    }
  }

  const isSelected = (mediaItem: MediaLibrary) => {
    return selectedMedia.some(item => item.id === mediaItem.id)
  }

  const handlePreview = (mediaItem: MediaLibrary) => {
    const index = media.findIndex(item => item.id === mediaItem.id)
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  const handlePreviewIndexChange = (index: number) => {
    setPreviewIndex(index)
  }

  const handleDelete = async (mediaItem: MediaLibrary) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${mediaItem.original_name}"? This action cannot be undone.`
    )
    
    if (!confirmed) return
    
    try {
      await mediaLibraryService.deleteMediaLibraryItem(mediaItem.id)
      
      // Invalidate all media library queries including summary
      queryClient.invalidateQueries({ queryKey: ['media-library'] })
      queryClient.invalidateQueries({ queryKey: ['media-library-infinite'] })
      queryClient.invalidateQueries({ queryKey: ['media-library-summary'] })
      
      toast.success('Media item deleted successfully')
    } catch (error) {
      console.error('Error deleting media item:', error)
      toast.error('Failed to delete media item. Please try again.')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return Image
      case 'video':
        return Video
      case 'document':
        return FileText
      default:
        return Paperclip
    }
  }

  return (
    <div className='space-y-2'>
      {/* Header */}
      <div className='grid grid-cols-12 gap-4 p-3 text-sm font-medium text-muted-foreground border-b'>
        <div className='col-span-1'>
          <Checkbox
            checked={selectedMedia.length === media.length && media.length > 0}
            onCheckedChange={handleSelectAll}
          />
        </div>
        <div className='col-span-4'>Name</div>
        <div className='col-span-2'>Type</div>
        <div className='col-span-2'>Size</div>
        <div className='col-span-2'>Created</div>
        <div className='col-span-1'>Actions</div>
      </div>

      {/* List Items */}
      {media.map((item) => (
        <div
          key={item.id}
          className={`grid grid-cols-12 gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer ${
            isSelected(item) ? 'bg-primary/5 border-primary' : ''
          }`}
          onClick={() => handlePreview(item)}
        >
          {/* Selection */}
          <div className='col-span-1 flex items-center' onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected(item)}
              onCheckedChange={(checked) => handleSelectMedia(item, checked as boolean)}
            />
          </div>

          {/* Name and Preview */}
          <div className='col-span-4 flex items-center space-x-3'>
            <div className='w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 relative'>
              {item.file_type === 'image' ? (
                <img
                  src={item.url || item.file_path}
                  alt={item.original_name}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : item.file_type === 'video' ? (
                <>
                  <video
                    src={item.url || item.file_path}
                    className='w-full h-full object-cover'
                    muted
                    loop
                    preload="metadata"
                    // onMouseEnter={(e) => {
                    //   e.currentTarget.play().catch(console.error)
                    // }}
                    // onMouseLeave={(e) => {
                    //   e.currentTarget.pause()
                    //   e.currentTarget.currentTime = 0
                    // }}
                  />
                </>
              ) : (
                (() => {
                  const IconComponent = getFileIcon(item.file_type)
                  return <IconComponent className='h-5 w-5 text-muted-foreground' />
                })()
              )}
              
              {/* Fallback for broken images */}
              {(() => {
                const IconComponent = getFileIcon(item.file_type)
                return <IconComponent className='hidden h-5 w-5 text-muted-foreground' />
              })()}
            </div>
            
            <div className='min-w-0 flex-1'>
              <h3 className='font-medium truncate' title={item.original_name}>
                {item.original_name}
              </h3>
            </div>
          </div>

          {/* Type */}
          <div className='col-span-2 flex items-center'>
            <Badge variant='secondary' className='capitalize'>
              {item.file_type}
            </Badge>
          </div>

          {/* Size */}
          <div className='col-span-2 flex items-center text-sm text-muted-foreground'>
            <div>
              <div>{formatFileSize(item.file_size)}</div>
              {item.file_type === 'video' && item.duration && (
                <div className='text-xs'>{formatDuration(item.duration)}</div>
              )}
            </div>
          </div>

          {/* Created Date */}
          <div className='col-span-2 flex items-center text-sm text-muted-foreground'>
            <Calendar className='mr-1 h-3 w-3' />
            {formatDate(item.created_at)}
          </div>


          {/* Actions */}
          <div className='col-span-1 flex items-center justify-start' onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => handlePreview(item)}>
                  <Eye className='mr-2 h-4 w-4' />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className='mr-2 h-4 w-4' />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className='mr-2 h-4 w-4' />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className='text-destructive'
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      {media.length === 0 && (
        <div className='text-center py-12'>
          <Folder className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
          <h3 className='text-lg font-medium mb-2'>No media files found</h3>
          <p className='text-muted-foreground mb-4'>
            Upload your first media file to get started.
          </p>
          <MediaLibraryUploadDialog />
        </div>
      )}

      {/* Pagination */}
      {media.length > 0 && (
        <MediaLibraryPagination 
          pagination={pagination} 
          onPageChange={setCurrentPage} 
        />
      )}

      {/* Preview Dialog */}
      <MediaLibraryPreviewDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        media={media}
        currentIndex={previewIndex}
        onIndexChange={handlePreviewIndexChange}
      />
    </div>
  )
}
