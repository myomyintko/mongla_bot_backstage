import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useQueryClient } from '@tanstack/react-query'
import {
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    FileText,
    Image as ImageIcon,
    Paperclip,
    Play,
    RotateCw,
    Trash2,
    Video as VideoIcon,
    X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { type MediaLibrary } from '../data/schema'
import { mediaLibraryService } from '@/services/media-library-service'

interface MediaLibraryPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  media: MediaLibrary[]
  currentIndex: number
  onIndexChange: (index: number) => void
}

export function MediaLibraryPreviewDialog({
  isOpen,
  onClose,
  media,
  currentIndex,
  onIndexChange
}: MediaLibraryPreviewDialogProps) {
  const [imageScale, setImageScale] = useState(1)
  const [imageRotation, setImageRotation] = useState(0)
  const queryClient = useQueryClient()

  const currentMedia = media[currentIndex]

  // Reset image transformations when media changes
  useEffect(() => {
    setImageScale(1)
    setImageRotation(0)
  }, [currentIndex])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }


  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return ImageIcon
      case 'video':
        return VideoIcon
      case 'document':
        return FileText
      default:
        return Paperclip
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < media.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }

  const handleZoomIn = () => {
    setImageScale(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setImageScale(prev => Math.max(prev / 1.2, 0.1))
  }

  const handleRotate = () => {
    setImageRotation(prev => (prev + 90) % 360)
  }

  const handleReset = () => {
    setImageScale(1)
    setImageRotation(0)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentMedia.url || currentMedia.file_path)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = currentMedia.url || currentMedia.file_path
    link.download = currentMedia.original_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async () => {
    if (!currentMedia.id) return
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${currentMedia.original_name}"? This action cannot be undone.`
    )
    
    if (!confirmed) return
    
    try {
      // Use the media library service to delete the item
      await mediaLibraryService.deleteMediaLibraryItem(currentMedia.id)
      
            // Invalidate all media library queries including summary
            queryClient.invalidateQueries({ queryKey: ['media-library'] })
            queryClient.invalidateQueries({ queryKey: ['media-library-infinite'] })
            queryClient.invalidateQueries({ queryKey: ['media-library-summary'] })
      
      // Close the preview dialog
      onClose()
      
      // You could add a success toast notification here
      console.log('Media item deleted successfully')
      
    } catch (error) {
      console.error('Error deleting media item:', error)
      // You could add an error toast notification here
      alert('Failed to delete media item. Please try again.')
    }
  }


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNext()
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleRotate()
          break
        case '0':
          e.preventDefault()
          handleReset()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, media.length])

  if (!currentMedia) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="!max-w-none !w-screen !h-screen !max-h-none !p-0 overflow-hidden !m-0 !rounded-none !top-0 !left-0 !translate-x-0 !translate-y-0 !gap-0 !border-0 !shadow-none bg-black/80 dark:bg-black/80 bg-white/90"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>Media Preview</DialogTitle>
          <DialogDescription>
            Previewing {currentMedia.original_name} ({currentIndex + 1} of {media.length})
          </DialogDescription>
        </VisuallyHidden>
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-50 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white border-0"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Main Carousel Container */}
        <div 
          className="relative w-full h-full flex flex-col"
          onClick={(e) => {
            // Close dialog if clicking on the background (not on buttons or media)
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                className="absolute left-8 top-1/2 -translate-y-1/2 z-40 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white border-0 h-16 w-16 rounded-full"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="absolute right-8 top-1/2 -translate-y-1/2 z-40 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white border-0 h-16 w-16 rounded-full"
                onClick={handleNext}
                disabled={currentIndex === media.length - 1}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Main Content Area */}
          <div 
            className="flex-1 flex items-center justify-center p-4 pt-16"
            onClick={(e) => {
              // Close dialog if clicking on empty space around media
              if (e.target === e.currentTarget) {
                onClose()
              }
            }}
          >
            <div className="w-full max-w-none">
              {/* Media Preview */}
              <div 
                className="relative mb-8"
                onClick={(e) => {
                  // Close dialog if clicking on the media container (but not the media itself)
                  if (e.target === e.currentTarget) {
                    onClose()
                  }
                }}
              >
                {currentMedia.file_type === 'image' ? (
                  <div className="relative">
                    <img
                      src={currentMedia.url || currentMedia.file_path}
                      alt={currentMedia.original_name}
                      className="w-full h-auto max-h-[70vh] object-contain select-none "
                      style={{
                        transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
                        transition: 'transform 0.2s ease'
                      }}
                      draggable={false}
                      onClick={onClose}
                    />
                  </div>
                ) : currentMedia.file_type === 'video' ? (
                  <div className="relative">
                    <video
                      src={currentMedia.url || currentMedia.file_path}
                      controls
                      className="w-full h-auto max-h-[70vh] object-contain "
                      autoPlay
                      onClick={onClose}
                    />
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-32 h-32 mx-auto mb-6 bg-white/10 rounded-lg flex items-center justify-center">
                      {(() => {
                        const IconComponent = getFileIcon(currentMedia.file_type)
                        return <IconComponent className="h-16 w-16 text-white/60" />
                      })()}
                    </div>
                    <p className="text-xl font-medium mb-2 text-white">{currentMedia.original_name}</p>
                    <p className="text-white/60">Preview not available for this file type</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Theme-aware Footer */}
          <div className="bg-black/90 dark:bg-black/90 bg-white/95 backdrop-blur-sm border-t border-white/10 dark:border-white/10 border-black/10">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left Section - File Info */}
              <div className="flex flex-col">
                <div className="text-gray-900 dark:text-white text-sm font-medium">
                  {currentMedia.file_type === 'image' ? 'Photo' : currentMedia.file_type === 'video' ? 'Video' : 'File'} {currentIndex + 1} of {media.length}
                </div>
                <div className="text-gray-600 dark:text-white/70 text-xs">
                  {currentMedia.original_name} • {formatDate(currentMedia.created_at)}
                </div>
              </div>

              {/* Right Section - Action Menu */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border-0"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border-0"
                  onClick={handleCopyUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border-0"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {currentMedia.file_type === 'image' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border-0"
                    onClick={handleRotate}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
