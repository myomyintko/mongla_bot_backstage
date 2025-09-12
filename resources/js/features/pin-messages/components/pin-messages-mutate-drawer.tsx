import { MultiMediaUploader } from '@/components/multi-media-uploader'
import { SelectDropdown } from '@/components/select-dropdown'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useTheme } from '@/context/theme-provider'
import { type MediaLibraryItem } from '@/services/media-library-service'
import { pinMessagesService } from '@/services/pin-messages-service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import MDEditor from '@uiw/react-md-editor'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { statuses } from '../data/data'
import { PinMessage } from '../data/schema'

type PinMessagesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: PinMessage
}

const formSchema = z.object({
  content: z.string().min(1, 'Content is required.'),
  status: z.string().min(1, 'Please select a status.'),
  sort: z.number().nullable().optional(),
  media_url: z.array(z.string()).optional(),
  btn_name: z.string().nullable().optional(),
  btn_link: z.string().nullable().optional(),
})
type PinMessageForm = z.infer<typeof formSchema>

export function PinMessagesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  }: PinMessagesMutateDrawerProps) {
  const { resolvedTheme } = useTheme()
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // Handle files that were deleted from the UI
  const handleFilesDeleted = (_files: (string | MediaLibraryItem)[]) => {
    // For pin messages, we don't need to track deleted files separately
    // since we only have uploaded files to clean up
  }

  // Handle files that were uploaded during this session
  const handleFilesUploaded = (files: MediaLibraryItem[]) => {
    // Convert MediaLibraryItem objects to URL strings for tracking
    const urlStrings = files.map(file => file.url || file.file_path)
    setUploadedFiles(prev => [...prev, ...urlStrings])
  }

  // Clean up files from server when form is cancelled
  const cleanupFiles = async () => {
    if (uploadedFiles.length === 0) return

    try {
      // For URL strings, we can't delete them through the media library API
      // They'll be cleaned up by the server's file cleanup process
      console.log('Files to cleanup:', uploadedFiles)
    } catch (error) {
      console.error('Failed to cleanup files:', error)
      // Don't show error to user as the main operation succeeded
    } finally {
      setUploadedFiles([])
    }
  }

  const form = useForm<PinMessageForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      status: '1',
      sort: null,
      media_url: [],
      btn_name: null,
      btn_link: null,
    },
  })

  // Reset form when drawer opens or currentRow changes
  useEffect(() => {
    if (open) {
      const defaultValues = currentRow ? {
        content: currentRow.content || '',
        status: String(currentRow.status),
        sort: currentRow.sort ? Number(currentRow.sort) : null,
        media_url: currentRow.media_url && currentRow.media_url.trim() ? [
          currentRow.media_url.startsWith('http') 
            ? currentRow.media_url 
            : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${currentRow.media_url}`
        ] : [],
        btn_name: currentRow.btn_name,
        btn_link: currentRow.btn_link,
      } : {
        content: '',
        status: '1',
        sort: null,
        media_url: [],
        btn_name: null,
        btn_link: null,
      }

      form.reset(defaultValues)
      setUploadedFiles([])
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
      mutationFn: (data: PinMessageForm) => pinMessagesService.createPinMessage({
      content: data.content,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      status: Number(data.status),
      sort: data.sort ? Number(data.sort) : undefined,
      btn_name: data.btn_name || undefined,
      btn_link: data.btn_link || undefined,
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['pin-messages'] })
      toast.success('Pin message created successfully!')
      // Clear uploaded files since they're now saved
      setUploadedFiles([])
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create pin message')
    },
  })

  const updateMutation = useMutation({
      mutationFn: (data: PinMessageForm) => pinMessagesService.updatePinMessage(currentRow!.id, {
      content: data.content,
      btn_name: data.btn_name || undefined,
      status: Number(data.status),
      sort: data.sort ? Number(data.sort) : undefined,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      btn_link: data.btn_link || undefined,
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['pin-messages'] })
      toast.success('Pin message updated successfully!')
      // Clear uploaded files since they're now saved
      setUploadedFiles([])
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update pin message')
    },
  })

  const onSubmit = (data: PinMessageForm) => {
    if (isUpdate) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={async (v) => {
        if (!v) {
          // Cleanup files when drawer is closed without saving
          await cleanupFiles()
        }
        onOpenChange(v)
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Pin Message</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the pin message by providing necessary info.'
              : 'Add a new pin message by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='pin-messages-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
             {/* Content */}
             <FormField
               control={form.control}
               name='content'
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Content <span className="text-red-500">*</span></FormLabel>
                   <FormControl>
                     <div className="mt-2">
                       <MDEditor
                         value={field.value || ''}
                         onChange={(value) => field.onChange(value || '')}
                         data-color-mode={resolvedTheme}
                         height={300}
                         preview="edit"
                         hideToolbar={false}
                       />
                     </div>
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
             {/* Button Configuration */}
             <FormField
               control={form.control}
               name='btn_name'
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Button Name</FormLabel>
                   <FormControl>
                     <Input 
                       {...field} 
                       value={field.value || ''} 
                       placeholder='Enter button name' 
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
            {/* Status & Organization */}
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select status'
                      items={statuses}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
               control={form.control}
               name='sort'
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Sort Order</FormLabel>
                   <FormControl>
                     <Input
                       {...field}
                       type='number'
                       placeholder='Enter sort order'
                       value={field.value || ''}
                       onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
             <FormField
               control={form.control}
               name='btn_link'
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Button Link</FormLabel>
                   <FormControl>
                     <Input 
                       {...field} 
                       value={field.value || ''} 
                       placeholder='Enter button link (URL)' 
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
            {/* Media */}
            <FormField
              control={form.control}
              name='media_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media Files</FormLabel>
                  <FormControl>
                     <MultiMediaUploader
                       value={field.value || []}
                       onChange={(files) => {
                         // Convert MediaLibraryItem objects to URL strings
                         const urlStrings = files.map(file => 
                           typeof file === 'string' ? file : file.url || file.file_path
                         )
                         field.onChange(urlStrings)
                       }}
                       maxFiles={1}
                       accept="image/*,video/*"
                       listType="picture-card"
                       showUploadList={true}
                       showDownloadButton={false}
                       uploadPath="pin-messages"
                       onFilesDeleted={handleFilesDeleted}
                       onFilesUploaded={handleFilesUploaded}
                       onPreview={(file) => {
                         if (file.url) {
                           window.open(file.url, '_blank');
                         }
                       }}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='flex flex-row justify-end gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={createMutation.isPending || updateMutation.isPending}>
              Cancel
            </Button>
          </SheetClose>
           <Button
             form='pin-messages-form'
             type='submit'
             disabled={createMutation.isPending || updateMutation.isPending}
           >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : isUpdate ? 'Update' : 'Create'
            }
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}