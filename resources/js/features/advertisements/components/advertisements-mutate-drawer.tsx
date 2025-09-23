import { MultiMediaUploader } from '@/components/multi-media-uploader'
import { InfiniteSearchableSelect } from '@/components/infinite-searchable-select'
import { SelectDropdown } from '@/components/select-dropdown'
import { SocialButtonsField } from '@/components/form/social-buttons-field'
import { TelegramEditor } from '@/components/telegram-editor'
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
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { statuses, frequencyOptions } from '../data/data'
import { Advertisement } from '../data/schema'
import { advertisementsService } from '@/services/advertisements-service'
import { storesService } from '@/services/stores-service'
import { type MediaLibraryItem } from '@/services/media-library-service'

type AdvertisementsMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Advertisement
}


const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  status: z.string().min(1, 'Please select a status.'),
  store_id: z.string().nullable().optional(),
  media_url: z.array(z.string()).min(1, 'At least one media file is required.'), 
  start_date: z.string().min(1, 'Start date is required.'),
  end_date: z.string().min(1, 'End date is required.'),
  frequency_cap_minutes: z.string().min(1, 'Please select frequency cap.'),
  sub_btns: z.array(z.object({
    id: z.string(),
    platform: z.string(),
    label: z.string().nullable().optional(),
    url: z.string().nullable().optional()
  })).optional().refine(
    (subBtns) => {
      if (!subBtns || subBtns.length === 0) return true
      // Check if any button has both label and url filled
      return subBtns.every(btn => {
        const hasLabel = btn.label && btn.label !== null && btn.label.trim() !== ''
        const hasUrl = btn.url && btn.url !== null && btn.url.trim() !== ''
        // Either both are empty/null (valid) or both are filled (valid)
        return (!hasLabel && !hasUrl) || (hasLabel && hasUrl)
      })
    },
    {
      message: "Social media buttons must have both label and URL filled, or be left empty"
    }
  ),
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

  // Fetch stores for dropdown with infinite scroll
  const {
    data: storesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['stores', 'advertisement-selection'],
    queryFn: ({ pageParam = 1 }) => 
      storesService.getStores({ 
        page: pageParam,
        per_page: 20
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    enabled: open, // Only fetch when drawer is open
  })

  // Flatten all pages
  const allStores = storesData?.pages.flatMap(page => page.data) || []
  const storeOptions = [
    { label: 'No Store', value: 'none' },
    ...allStores.map((store) => ({
      label: store.name,
      value: String(store.id),
    }))
  ]

  // Handle files that were deleted from the UI
  const handleFilesDeleted = (files: (string | MediaLibraryItem)[]) => {
    // Convert MediaLibraryItem objects to URL strings for tracking
    const urlStrings = files.map(file => 
      typeof file === 'string' ? file : file.url || file.file_path
    )
    setDeletedFiles(prev => [...prev, ...urlStrings])
  }

  // Handle files that were uploaded during this session
  const handleFilesUploaded = (files: MediaLibraryItem[]) => {
    // Convert MediaLibraryItem objects to URL strings for tracking
    const urlStrings = files.map(file => file.url || file.file_path)
    setUploadedFiles(prev => [...prev, ...urlStrings])
  }

  // Clean up files from server when form is saved or cancelled
  const cleanupFiles = async () => {
    const filesToCleanup = [...deletedFiles, ...uploadedFiles]
    if (filesToCleanup.length === 0) return

    try {
      // For URL strings, we can't delete them through the media library API
      // They'll be cleaned up by the server's file cleanup process
      console.log('Files to cleanup:', filesToCleanup)
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
      // For URL strings, we can't delete them through the media library API
      console.log('Deleted files to cleanup:', deletedFiles)
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
      description: '',
      status: '1',
      store_id: '',
      media_url: [],
      start_date: '',
      end_date: '',
      frequency_cap_minutes: '',
      sub_btns: [],
    },
  })

  // Reset form when drawer opens or currentRow changes
  useEffect(() => {
    if (open) {
      const defaultValues = currentRow ? {
        title: currentRow.title,
        description: currentRow.description || '',
        status: String(currentRow.status),
        store_id: currentRow.store_id ? String(currentRow.store_id) : 'none',
        media_url: currentRow.media_url && currentRow.media_url.trim() ? [
          currentRow.media_url.startsWith('http') 
            ? currentRow.media_url 
            : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${currentRow.media_url}`
        ] : [],
        start_date: currentRow.start_date ? new Date(currentRow.start_date).toISOString().slice(0, 16) : '',
        end_date: currentRow.end_date ? new Date(currentRow.end_date).toISOString().slice(0, 16) : '',
        frequency_cap_minutes: currentRow.frequency_cap_minutes ? String(currentRow.frequency_cap_minutes) : '',
        sub_btns: (currentRow.sub_btns || []).filter(btn => 
          btn.label && btn.label !== null && btn.label.trim() !== '' && 
          btn.url && btn.url !== null && btn.url.trim() !== ''
        ),
      } : {
        title: '',
        description: '',
        status: '1',
        store_id: 'none',
        media_url: [],
        start_date: '',
        end_date: '',
        frequency_cap_minutes: '',
        sub_btns: [],
      }

      form.reset(defaultValues)
      setDeletedFiles([])
      setUploadedFiles([])
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (data: AdvertisementForm) => {
      const allSubBtns = data.sub_btns || []
      const validSubBtns = allSubBtns
        .filter(btn => {
          const hasLabel = btn.label && btn.label !== null && btn.label.trim() !== ''
          const hasUrl = btn.url && btn.url !== null && btn.url.trim() !== ''
          return hasLabel && hasUrl
        })
        .map(btn => ({
          id: btn.id,
          platform: btn.platform,
          label: btn.label?.trim() || '',
          url: btn.url?.trim() || ''
        }))
      
      console.log('Creating advertisement - Social media buttons filtering:', {
        total: allSubBtns.length,
        valid: validSubBtns.length,
        filtered: allSubBtns.length - validSubBtns.length,
        allButtons: allSubBtns,
        validButtons: validSubBtns
      })

      return advertisementsService.createAdvertisement({
        title: data.title,
        description: data.description,
        status: Number(data.status),
        store_id: data.store_id && data.store_id !== 'none' ? Number(data.store_id) : null,
        media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined,
        frequency_cap_minutes: data.frequency_cap_minutes ? Number(data.frequency_cap_minutes) : undefined,
        sub_btns: validSubBtns,
      })
    },
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
    mutationFn: (data: AdvertisementForm) => {
      const allSubBtns = data.sub_btns || []
      const validSubBtns = allSubBtns
        .filter(btn => {
          const hasLabel = btn.label && btn.label !== null && btn.label.trim() !== ''
          const hasUrl = btn.url && btn.url !== null && btn.url.trim() !== ''
          return hasLabel && hasUrl
        })
        .map(btn => ({
          id: btn.id,
          platform: btn.platform,
          label: btn.label?.trim() || '',
          url: btn.url?.trim() || ''
        }))
      
      console.log('Updating advertisement - Social media buttons filtering:', {
        total: allSubBtns.length,
        valid: validSubBtns.length,
        filtered: allSubBtns.length - validSubBtns.length,
        allButtons: allSubBtns,
        validButtons: validSubBtns
      })

      return advertisementsService.updateAdvertisement(currentRow!.id, {
        title: data.title,
        description: data.description,
        status: Number(data.status),
        store_id: data.store_id && data.store_id !== 'none' ? Number(data.store_id) : null,
        media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined,
        frequency_cap_minutes: data.frequency_cap_minutes ? Number(data.frequency_cap_minutes) : undefined,
        sub_btns: validSubBtns,
      })
    },
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
    console.log('Form submitted with data:', data)
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
      <SheetContent className='flex flex-col w-full sm:w-3/4 sm:max-w-2xl'>
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
            {/* Basic Information */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="mt-2">
                      <TelegramEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Enter advertisement description..."
                        height={200}
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

            {/* Store Association */}
            <FormField
              control={form.control}
              name='store_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store</FormLabel>
                  <FormControl>
                    <InfiniteSearchableSelect
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      placeholder='Select store'
                      searchPlaceholder='Search stores...'
                      emptyMessage={isLoading ? 'Loading stores...' : 'No stores found.'}
                      options={storeOptions}
                      hasNextPage={hasNextPage}
                      isFetchingNextPage={isFetchingNextPage}
                      onLoadMore={() => fetchNextPage()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scheduling */}
            <FormField
              control={form.control}
              name='start_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>End Date <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Frequency Cap (minutes) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <SelectDropdown
                      defaultValue={field.value || ''}
                      onValueChange={field.onChange}
                      placeholder='Select frequency cap'
                      items={frequencyOptions}
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
                  <FormLabel>Media Files <span className="text-red-500">*</span></FormLabel>
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

            {/* Social Media Buttons */}
            <SocialButtonsField
              name="sub_btns"
              label="Social Media Buttons"
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