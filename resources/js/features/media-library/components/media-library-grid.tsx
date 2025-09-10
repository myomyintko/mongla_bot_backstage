import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Copy, Download, MoreHorizontal, Trash2, Image, Video, FileText, Paperclip, Eye, Loader2 } from 'lucide-react'
import { type MediaLibrary } from '../data/schema'
import { useMediaLibrary } from './media-library-provider'
import { MediaLibraryUploadDialog } from './media-library-upload-dialog'
import { MediaLibraryPreviewDialog } from './media-library-preview-dialog'
import { mediaLibraryService } from '@/services/media-library-service'
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState, useEffect, useRef } from 'react'

interface MediaLibraryGridProps {}


export function MediaLibraryGrid({}: MediaLibraryGridProps) {
  const { selectedMedia, setSelectedMedia, sortBy, filterByType, searchQuery } = useMediaLibrary()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Parse sort parameters
  const [sortField, sortOrder] = sortBy.split(':')

  // Infinite query for grid view
  const {
    data: infiniteData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['media-library-infinite', { 
      search: searchQuery, 
      file_type: filterByType, 
      sort_by: sortField, 
      sort_order: sortOrder 
    }],
    queryFn: ({ pageParam }) => mediaLibraryService.getMediaLibrary({
      search: searchQuery || undefined,
      file_type: filterByType !== 'all' ? filterByType : undefined,
      sort_by: sortField,
      sort_order: sortOrder as 'asc' | 'desc',
      page: pageParam as number,
      per_page: 20, // Fixed per page for infinite scroll
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const meta = lastPage.meta
      if (!meta) return undefined
      return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined
    },
  })

  // Infinite scroll effect - MUST be called before any early returns
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && fetchNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Get media data from infinite query
  const media = infiniteData?.pages.flatMap((page: any) => page.data) || []

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
    <div className='space-y-6'>
      {/* Select All Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='select-all'
            checked={media.length > 0 && selectedMedia.length === media.length}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor='select-all' className='text-sm font-medium'>
            Select all ({selectedMedia.length}/{media.length})
          </label>
        </div>
      </div>

      {/* Pinterest-style Masonry Grid */}
      <div 
        className='columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-6 gap-6'
        style={{
          columnGap: '1.5rem',
          columnFill: 'balance'
        }}
      >
        {media.map((item, index) => {
          // Calculate dynamic height based on content (Pinterest-style)
          const getDynamicHeight = () => {
            if (item.file_type === 'image' && item.height && item.width) {
              // Use actual image aspect ratio for images
              const aspectRatio = item.height / item.width
              const baseWidth = 280 // Base width for calculation
              const calculatedHeight = baseWidth * aspectRatio
              
              // Add some variation and ensure reasonable bounds
              const variation = (Math.random() - 0.5) * 40 // ±20px variation
              return Math.max(180, Math.min(600, calculatedHeight + variation))
            }
            
            // For videos, use varied heights
            if (item.file_type === 'video') {
              const videoHeights = [240, 280, 320, 260, 300]
              return videoHeights[index % videoHeights.length]
            }
            
            // For documents and other files, use smaller varied heights
            if (item.file_type === 'document') {
              const docHeights = [160, 180, 200, 170, 190]
              return docHeights[index % docHeights.length]
            }
            
            // Default height with more variation for Pinterest effect
            const heights = [200, 240, 280, 220, 260, 300, 180, 320, 250, 290]
            return heights[index % heights.length]
          }
          
          const dynamicHeight = getDynamicHeight()
          
          return (
            <div
              key={item.id}
              className='group relative overflow-hidden rounded-lg transition-all duration-500 hover:shadow-xl break-inside-avoid mb-6'
              style={{ height: `${dynamicHeight}px` }}
            >
              {/* Selection Checkbox */}
              <div className='absolute top-3 left-3 z-20'>
                <Checkbox
                  checked={isSelected(item)}
                  onCheckedChange={(checked) => handleSelectMedia(item, checked as boolean)}
                  className='bg-white/90 backdrop-blur-sm border-white/20'
                />
              </div>

              {/* Actions Dropdown */}
              <div className='absolute top-3 right-3 z-20'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant='ghost' 
                      size='sm' 
                      className='h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                    >
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => handlePreview(item)}>
                      <Eye className='mr-2 h-4 w-4' />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.url || item.file_path)}>
                      <Copy className='mr-2 h-4 w-4' />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className='mr-2 h-4 w-4' />
                      Download
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

              {/* Media Preview Container - Full Height for Masonry */}
              <div className='relative w-full h-full'>
                {/* Media Preview */}
                <div 
                  className='w-full h-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer'
                  onClick={() => handlePreview(item)}
                >
                  {item.file_type === 'image' ? (
                    <img
                      src={item.url || item.file_path}
                      alt={item.original_name}
                      className='w-full h-full object-cover transition-transform duration-500'
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : item.file_type === 'video' ? (
                    <>
                      <video
                        src={item.url || item.file_path}
                        className='w-full h-full object-cover transition-transform duration-500'
                        muted
                        loop
                        preload="metadata"
                        onMouseEnter={(e) => {
                          const video = e.currentTarget
                          if (video.paused) {
                            video.play().catch(() => {
                              // Silently handle play errors
                            })
                          }
                        }}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget
                          if (!video.paused) {
                            video.pause()
                            video.currentTime = 0
                          }
                        }}
                      />
                      {/* Video Duration Overlay */}
                      {item.duration && (
                        <div className='absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium'>
                          {formatDuration(item.duration)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50'>
                      {(() => {
                        const IconComponent = getFileIcon(item.file_type)
                        return <IconComponent className='h-16 w-16 text-muted-foreground' />
                      })()}
                    </div>
                  )}
                  
                  {/* Fallback for broken images */}
                  {item.file_type === 'image' && (
                    <div className='hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50'>
                      {(() => {
                        const IconComponent = getFileIcon(item.file_type)
                        return <IconComponent className='h-16 w-16 text-muted-foreground' />
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Info Bar (visible on non-hover) - Compact for Masonry */}
              <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 opacity-100 group-hover:opacity-0 transition-opacity duration-300'>
                <div className='text-white'>
                  <h4 className='font-medium text-xs truncate mb-1 leading-tight'>
                    {item.original_name}
                  </h4>
                  <div className='flex items-center justify-between text-xs text-white/80'>
                    <span className='truncate'>{formatFileSize(item.file_size)}</span>
                    <span className='text-xs opacity-75'>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {media.length === 0 && (
        <div className='text-center py-12'>
          <Paperclip className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
          <h3 className='text-lg font-medium mb-2'>No media files found</h3>
          <p className='text-muted-foreground mb-4'>
            Upload your first media file to get started.
          </p>
          <MediaLibraryUploadDialog />
        </div>
      )}

      {/* Infinite scroll loading indicator */}
      {media.length > 0 && (
        <div ref={loadMoreRef} className='flex justify-center py-8'>
          {isFetchingNextPage ? (
            <div className='flex items-center space-x-2 text-muted-foreground'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span>Loading more...</span>
            </div>
          ) : hasNextPage ? (
            <div className='text-muted-foreground text-sm'>
              Scroll down to load more
            </div>
          ) : (
            <div className='text-muted-foreground text-sm'>
              You've reached the end
            </div>
          )}
        </div>
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