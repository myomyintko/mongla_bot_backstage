import { MultiMediaUploader } from '@/components/multi-media-uploader'
import { InfiniteSearchableSelect } from '@/components/infinite-searchable-select'
import { SelectDropdown } from '@/components/select-dropdown'
import { SocialButtonsField } from '@/components/form/social-buttons-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { menuButtonsService } from '@/services/menu-buttons-service'
import { storesService } from '@/services/stores-service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { TelegramEditor } from '@/components/telegram-editor'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { statuses } from '../data/data'
import { Store } from '../data/schema'
import TimePicker from '@/components/ui/time-picker'

type StoresMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Store
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().nullable().optional(),
  status: z.string().min(1, 'Please select a status.'),
  address: z.string().min(1, 'Address is required.'),
  open_hour: z.string().min(1, 'Opening hour is required.'),
  close_hour: z.string().min(1, 'Closing hour is required.'),
  recommand: z.boolean().optional(),
  media_url: z.array(z.string()).min(1, 'At least one media file is required.'),
  menu_urls: z.array(z.string()).optional(),
  sub_btns: z.array(z.object({
    id: z.string(),
    platform: z.string(),
    label: z.string(),
    url: z.string()
  })).optional(),
  menu_button_id: z.string().min(1, 'Please select a category.'),
})
type StoreForm = z.infer<typeof formSchema>

export function StoresMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: StoresMutateDrawerProps) {
  const isUpdate = !!currentRow
  const { resolvedTheme } = useTheme()
  const queryClient = useQueryClient()
  const [deletedFiles, setDeletedFiles] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // Fetch menu buttons for dropdown (only store type) with infinite scroll
  const {
    data: menuButtonsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['menu-buttons', 'store', 'category-selection'],
    queryFn: ({ pageParam = 1 }) => 
      menuButtonsService.getMenuButtons({ 
        button_type: 'store',
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
  const allMenuButtons = menuButtonsData?.pages.flatMap(page => page.data) || []
  const menuButtonOptions = allMenuButtons.map((button) => ({
    label: button.name,
    value: String(button.id),
  }))

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

  const form = useForm<StoreForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: null,
      status: '1',
      address: '',
      open_hour: '09:00',
      close_hour: '21:00',
      recommand: false,
      media_url: [],
      menu_urls: [],
      sub_btns: [],
      menu_button_id: '',
    },
  })

  // Reset form when drawer opens or currentRow changes
  useEffect(() => {
    if (open) {
      const defaultValues = currentRow ? {
        name: currentRow.name,
        description: currentRow.description,
        status: String(currentRow.status),
        address: currentRow.address || '',
        open_hour: currentRow.open_hour || '',
        close_hour: currentRow.close_hour || '',
        recommand: currentRow.recommand,
        media_url: currentRow.media_url && currentRow.media_url.trim() ? [
          currentRow.media_url.startsWith('http') 
            ? currentRow.media_url 
            : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${currentRow.media_url}`
        ] : [],
        menu_urls: currentRow.menu_urls ? currentRow.menu_urls.map((url: string) => 
          url.startsWith('http') 
            ? url 
            : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${url}`
        ) : [],
        sub_btns: currentRow.sub_btns ? (typeof currentRow.sub_btns === 'string' ? JSON.parse(currentRow.sub_btns) : currentRow.sub_btns) : [],
        menu_button_id: currentRow.menu_button_id ? String(currentRow.menu_button_id) : '',
      } : {
        name: '',
        description: null,
        status: '1',
        address: '',
        open_hour: '09:00',
        close_hour: '21:00',
        recommand: false,
        media_url: [],
        menu_urls: [],
        sub_btns: [],
        menu_button_id: '',
      }
      
      form.reset(defaultValues)
      setDeletedFiles([])
      setUploadedFiles([])
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (data: StoreForm) => storesService.createStore({
      name: data.name,
      description: data.description || undefined,
      status: Number(data.status),
      address: data.address,
      open_hour: data.open_hour,
      close_hour: data.close_hour,
      recommand: data.recommand || false,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      menu_urls: data.menu_urls || undefined,
      sub_btns: data.sub_btns || null,
      menu_button_id: data.menu_button_id ? Number(data.menu_button_id) : null,
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
        toast.success('Store created successfully!')
      // Don't cleanup files on successful save - they should remain
      setDeletedFiles([])
      setUploadedFiles([])
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create store')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: StoreForm) => storesService.updateStore(currentRow!.id, {
      name: data.name,
      description: data.description || undefined,
      status: Number(data.status),
      address: data.address,
      open_hour: data.open_hour,
      close_hour: data.close_hour,
      recommand: data.recommand || false,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      menu_urls: data.menu_urls || null,
      sub_btns: data.sub_btns || null,
      menu_button_id: data.menu_button_id ? Number(data.menu_button_id) : null,
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Store updated successfully!')
      // Clean up only deleted files on successful update
      await cleanupDeletedFiles()
      // Clear uploaded files since they're now saved
      setUploadedFiles([])
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update store')
    },
  })

  const onSubmit = (data: StoreForm) => {
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Store</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the store by providing necessary info.'
              : 'Add a new store by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='stores-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* Basic Information */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter store name' />
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
                      <TelegramEditor
                        value={field.value || ''}
                        onChange={(value) => field.onChange(value || '')}
                        placeholder="Enter store description..."
                        height={300}
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
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select status'
                    items={statuses}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Location & Hours */}
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || ''} 
                      placeholder='Enter store address' 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='open_hour'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Hour <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <TimePicker
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder='Select opening hour'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='close_hour'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Hour <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <TimePicker
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder='Select closing hour'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Category & Settings */}
            <FormField
              control={form.control}
              name='menu_button_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <InfiniteSearchableSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select category'
                      searchPlaceholder='Search categories...'
                      emptyMessage={isLoading ? 'Loading categories...' : 'No categories found.'}
                      options={menuButtonOptions}
                      hasNextPage={hasNextPage}
                      isFetchingNextPage={isFetchingNextPage}
                      onLoadMore={() => fetchNextPage()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='recommand'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Recommended Store</FormLabel>
                  </div>
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
                      uploadPath="stores"
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
            <FormField
              control={form.control}
              name='menu_urls'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu Images</FormLabel>
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
                      maxFiles={10}
                      className="my-2"
                      accept="image/*"
                      listType="picture-card"
                      showUploadList={true}
                      showDownloadButton={false}
                      uploadPath="stores/menu"
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
            form='stores-form' 
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