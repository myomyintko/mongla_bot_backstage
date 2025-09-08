import { MultiMediaUploader } from '@/components/multi-media-uploader'
import { SearchableSelect } from '@/components/searchable-select'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import MDEditor from '@uiw/react-md-editor'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTheme } from '@/context/theme-provider'
import { statuses, sortOptions } from '../data/data'
import { PinMessage } from '../data/schema'
import { pinMessagesService } from '@/services/pin-messages-service'
import { mediaService } from '@/services/media-service'

type PinMessagesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: PinMessage
}

const formSchema = z.object({
  content: z.string().nullable().optional(),
  status: z.string().min(1, 'Please select a status.'),
  sort: z.string().nullable().optional(),
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


  // Clean up files from server when form is cancelled
  const cleanupFiles = async () => {
    if (uploadedFiles.length === 0) return

    try {
      // Delete files from server
      for (const fileUrl of uploadedFiles) {
        const cleanUrl = fileUrl.split('#')[0]
        const filePath = mediaService.extractPathFromUrl(cleanUrl)

        if (filePath && !cleanUrl.startsWith('blob:')) {
          await mediaService.deleteFile(filePath)
        }
      }
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
      content: null,
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
        content: currentRow.content,
        status: String(currentRow.status),
        sort: currentRow.sort ? String(currentRow.sort) : null,
        media_url: currentRow.media_url && currentRow.media_url.trim() ? [currentRow.media_url] : [],
        btn_name: currentRow.btn_name,
        btn_link: currentRow.btn_link,
      } : {
        content: null,
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
             <FormField
               control={form.control}
               name='content'
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Content</FormLabel>
                   <FormControl>
                     <div className="mt-2">
                       <MDEditor
                         value={field.value || ''}
                         onChange={(value) => field.onChange(value || null)}
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
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select status'
                      searchPlaceholder='Search status...'
                      emptyMessage='No status found.'
                      options={statuses}
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
                     <SearchableSelect
                       options={[
                         { label: 'No sort order', value: '' },
                         ...sortOptions,
                       ]}
                       value={field.value || ''}
                       onValueChange={(value) => field.onChange(value || null)}
                       placeholder='Select sort order'
                       searchPlaceholder='Search sort order...'
                       emptyMessage='No sort order found.'
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
                         field.onChange(files)
                         setUploadedFiles(files)
                       }}
                       maxFiles={1}
                       accept="image/*,video/*"
                       showDownloadButton={false}
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