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
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import MDEditor from '@uiw/react-md-editor'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { statuses, frequencyOptions } from '../data/data'
import { Advertisement } from '../data/schema'
import { advertisementsService } from '@/services/advertisements-service'
import { storesService } from '@/services/stores-service'
import { mediaService } from '@/services/media-service'

type AdvertisementsMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Advertisement
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().nullable().optional(),
  status: z.string().min(1, 'Please select a status.'),
  store_id: z.string().optional(),
  media_url: z.array(z.string()).optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  frequency_cap_minutes: z.string().nullable().optional(),
})
type AdvertisementForm = z.infer<typeof formSchema>

export function AdvertisementsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: AdvertisementsMutateDrawerProps) {
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()
  const [deletedFiles, setDeletedFiles] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // Fetch stores for dropdown
  const { data: storesData } = useQuery({
    queryKey: ['stores', 'all'],
    queryFn: () => storesService.getStores({ 
      per_page: 1000 // Fetch all stores
    }),
    enabled: open, // Only fetch when drawer is open
  })

  const stores = storesData?.data || []
  const storeOptions = [
    { label: 'No Store', value: 'none' },
    ...stores.map((store) => ({
      label: store.name,
      value: String(store.id),
    })),
  ]

  // Handle files that were deleted from the UI
  const handleFilesDeleted = (files: string[]) => {
    setDeletedFiles(prev => [...prev, ...files])
  }

  // Handle files that were uploaded during this session
  const handleFilesUploaded = (files: string[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  // Clean up files from server when form is saved or cancelled
  const cleanupFiles = async () => {
    const filesToCleanup = [...deletedFiles, ...uploadedFiles]
    if (filesToCleanup.length === 0) return

    try {
      // Delete files from server
      for (const fileUrl of filesToCleanup) {
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
      setDeletedFiles([])
      setUploadedFiles([])
    }
  }

  const cleanupDeletedFiles = async () => {
    if (deletedFiles.length === 0) return

    try {
      // Delete only the files that were removed from UI
      for (const fileUrl of deletedFiles) {
        const cleanUrl = fileUrl.split('#')[0]
        const filePath = mediaService.extractPathFromUrl(cleanUrl)

        if (filePath && !cleanUrl.startsWith('blob:')) {
          await mediaService.deleteFile(filePath)
        }
      }
    } catch (error) {
      console.error('Failed to cleanup deleted files:', error)
      // Don't show error to user as the main operation succeeded
    } finally {
      setDeletedFiles([])
    }
  }

  const form = useForm<AdvertisementForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: null,
      status: '1',
      store_id: 'none',
      media_url: [],
      start_date: null,
      end_date: null,
      frequency_cap_minutes: null,
    },
  })

  // Reset form when drawer opens or currentRow changes
  useEffect(() => {
    if (open) {
      const defaultValues = currentRow ? {
        title: currentRow.title,
        description: currentRow.description,
        status: String(currentRow.status),
        store_id: currentRow.store_id ? String(currentRow.store_id) : 'none',
        media_url: currentRow.media_url && currentRow.media_url.trim() ? [currentRow.media_url] : [],
        start_date: currentRow.start_date ? new Date(currentRow.start_date).toISOString().slice(0, 16) : null,
        end_date: currentRow.end_date ? new Date(currentRow.end_date).toISOString().slice(0, 16) : null,
        frequency_cap_minutes: currentRow.frequency_cap_minutes ? String(currentRow.frequency_cap_minutes) : null,
      } : {
        title: '',
        description: null,
        status: '1',
        store_id: 'none',
        media_url: [],
        start_date: null,
        end_date: null,
        frequency_cap_minutes: null,
      }

      form.reset(defaultValues)
      setDeletedFiles([])
      setUploadedFiles([])
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (data: AdvertisementForm) => advertisementsService.createAdvertisement({
      title: data.title,
      description: data.description || undefined,
      status: Number(data.status),
      store_id: data.store_id && data.store_id !== 'none' ? Number(data.store_id) : undefined,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
      end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined,
      frequency_cap_minutes: data.frequency_cap_minutes ? Number(data.frequency_cap_minutes) : undefined,
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success('Advertisement created successfully!')
      // Don't cleanup files on successful save - they should remain
      setDeletedFiles([])
      setUploadedFiles([])
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create advertisement')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: AdvertisementForm) => advertisementsService.updateAdvertisement(currentRow!.id, {
      title: data.title,
      description: data.description || undefined,
      status: Number(data.status),
      store_id: data.store_id && data.store_id !== 'none' ? Number(data.store_id) : undefined,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
      end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined,
      frequency_cap_minutes: data.frequency_cap_minutes ? Number(data.frequency_cap_minutes) : undefined,
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      toast.success('Advertisement updated successfully!')
      // Clean up only deleted files on successful update
      await cleanupDeletedFiles()
      // Clear uploaded files since they're now saved
      setUploadedFiles([])
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update advertisement')
    },
  })

  const onSubmit = (data: AdvertisementForm) => {
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Advertisement</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the advertisement by providing necessary info.'
              : 'Add a new advertisement by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='advertisements-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter advertisement title' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      <MDEditor
                        value={field.value || ''}
                        onChange={(value) => field.onChange(value || '')}
                        data-color-mode="light"
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
              name='store_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select store'
                      searchPlaceholder='Search stores...'
                      emptyMessage='No stores found.'
                      options={storeOptions}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='start_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='end_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='frequency_cap_minutes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency Cap (minutes)</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      placeholder='Select frequency cap'
                      searchPlaceholder='Search frequency...'
                      emptyMessage='No frequency found.'
                      options={frequencyOptions}
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
                      onChange={field.onChange}
                      maxFiles={1}
                      className="my-2"
                      accept="image/*,video/*"
                      listType="picture-card"
                      showUploadList={true}
                      showDownloadButton={false}
                      uploadPath="advertisements"
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
            form='advertisements-form'
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