import { useState, useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, File, Image, Video, FileText, AlertCircle } from 'lucide-react'
import { mediaLibraryService } from '@/services/media-library-service'
import { toast } from 'sonner'

interface MediaLibraryUploadDialogProps {
  children?: React.ReactNode
}

interface FileWithPreview extends File {
  preview?: string
  error?: string
}

export function MediaLibraryUploadDialog({ children }: MediaLibraryUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => mediaLibraryService.uploadFiles(files, {}),
        onSuccess: (response) => {
          toast.success(`Successfully uploaded ${response.data.length} file(s)`)
          // Invalidate all media library queries including summary
          queryClient.invalidateQueries({ queryKey: ['media-library'] })
          queryClient.invalidateQueries({ queryKey: ['media-library-infinite'] })
          queryClient.invalidateQueries({ queryKey: ['media-library-summary'] })
          handleClose()
        },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Upload failed')
    },
  })

  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    // Check total file count limit (50 files)
    if (files.length + selectedFiles.length > 50) {
      toast.error('Maximum 50 files allowed. Please select fewer files.')
      return
    }

    const newFiles: FileWithPreview[] = selectedFiles.map(file => {
      const fileWithPreview: FileWithPreview = file
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        fileWithPreview.error = 'File size exceeds 10MB limit'
        return fileWithPreview
      }

      // Validate file type
      const allowedTypes = ['image/', 'video/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/']
      const isValidType = allowedTypes.some(type => file.type.startsWith(type))
      
      if (!isValidType) {
        fileWithPreview.error = 'File type not supported'
        return fileWithPreview
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }

      return fileWithPreview
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [files.length])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    handleFileSelect(selectedFiles)
    // Reset the input value so the same file can be selected again
    if (event.target) {
      event.target.value = ''
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileSelect(droppedFiles)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleRemoveFile = (index: number) => {
    const file = files[index]
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    const validFiles = files.filter(file => !file.error)
    
    if (validFiles.length === 0) {
      toast.error('Please select at least one valid file to upload')
      return
    }

    setIsUploading(true)
    
    try {
      await uploadMutation.mutateAsync(validFiles)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    // Clean up preview URLs
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    
    setOpen(false)
    setFiles([])
    setIsDragOver(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type.startsWith('video/')) return Video
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) return FileText
    return File
  }

  const validFiles = files.filter(file => !file.error)
  const hasErrors = files.some(file => file.error)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Upload className='mr-2 h-4 w-4' />
            Upload Files
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Upload Media Files</DialogTitle>
          <DialogDescription>
            Upload images, videos, and other media files to your library. Drag and drop files or click to select.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
          >
            <Upload className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
            <div className='space-y-2'>
              <p className='text-lg font-medium'>
                {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className='text-sm text-muted-foreground'>
                or click anywhere to browse files
              </p>
            </div>
            
            <Input
              ref={fileInputRef}
              type='file'
              multiple
              accept='image/*,video/*,.pdf,.doc,.docx,.txt'
              onChange={handleInputChange}
              className='hidden'
            />
            
            <p className='text-xs text-muted-foreground mt-4'>
              Supported: Images, Videos, PDF, DOC, DOCX, TXT (Max 10MB per file, up to 50 files)
            </p>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label className='text-base font-medium'>
                  Selected Files ({validFiles.length}{hasErrors ? `, ${files.length - validFiles.length} errors` : ''})
                </Label>
                {files.length > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      files.forEach(file => {
                        if (file.preview) URL.revokeObjectURL(file.preview)
                      })
                      setFiles([])
                    }}
                    className='text-muted-foreground hover:text-foreground'
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto'>
                {files.map((file, index) => {
                  const IconComponent = getFileIcon(file)
                  const isValid = !file.error
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        isValid ? 'border-border' : 'border-destructive/50 bg-destructive/5'
                      }`}
                    >
                      {/* File Preview/Icon */}
                      <div className='flex-shrink-0'>
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className='w-12 h-12 object-cover rounded-md'
                          />
                        ) : (
                          <div className='w-12 h-12 bg-muted rounded-md flex items-center justify-center'>
                            <IconComponent className='h-6 w-6 text-muted-foreground' />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate'>{file.name}</p>
                        <p className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</p>
                        {file.error && (
                          <p className='text-xs text-destructive flex items-center mt-1'>
                            <AlertCircle className='h-3 w-3 mr-1' />
                            {file.error}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveFile(index)}
                        className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={validFiles.length === 0 || isUploading}
            className='min-w-[120px]'
          >
            {isUploading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                Uploading...
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                Upload {validFiles.length} file{validFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
