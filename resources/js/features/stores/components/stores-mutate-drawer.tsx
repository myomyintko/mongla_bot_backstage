import { MultiMediaUploader } from '@/components/multi-media-uploader'
import { SelectDropdown } from '@/components/select-dropdown'
import { SearchableSelect } from '@/components/searchable-select'
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
import { storesService } from '@/lib/stores-service'
import { mediaService } from '@/lib/media-service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import MDEditor from '@uiw/react-md-editor'
import { menuButtonsService } from '@/lib/menu-buttons-service'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { statuses, timeOptions } from '../data/data'
import { Store } from '../data/schema'

type StoresMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Store
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().nullable().optional(),
  status: z.string().min(1, 'Please select a status.'),
  address: z.string().nullable().optional(),
  open_hour: z.string().nullable().optional(),
  close_hour: z.string().nullable().optional(),
  recommand: z.boolean().optional(),
  media_url: z.array(z.string()).optional(),
  sub_btns: z.array(z.string()).nullable().optional(),
  menu_button_id: z.string().optional(),
})
type StoreForm = z.infer<typeof formSchema>

export function StoresMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: StoresMutateDrawerProps) {
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()
  const [deletedFiles, setDeletedFiles] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // Fetch menu buttons for dropdown (only store type)
  const { data: menuButtonsData } = useQuery({
    queryKey: ['menu-buttons', 'store'],
    queryFn: () => menuButtonsService.getMenuButtons({ 
      button_type: 'store',
      per_page: 1000 // Fetch all store-type menu buttons
    }),
    enabled: open, // Only fetch when drawer is open
  })

  const menuButtons = menuButtonsData?.data || []
  const menuButtonOptions = [
    { label: 'No Category', value: 'none' },
    ...menuButtons.map((button) => ({
      label: button.name,
      value: String(button.id),
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

  const form = useForm<StoreForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: null,
      status: '1',
      address: null,
      open_hour: null,
      close_hour: null,
      recommand: false,
      media_url: [],
      sub_btns: null,
      menu_button_id: 'none',
    },
  })

  // Reset form when drawer opens or currentRow changes
  useEffect(() => {
    if (open) {
      const defaultValues = currentRow ? {
        name: currentRow.name,
        description: currentRow.description,
        status: String(currentRow.status),
        address: currentRow.address,
        open_hour: currentRow.open_hour,
        close_hour: currentRow.close_hour,
        recommand: currentRow.recommand,
        media_url: currentRow.media_url && currentRow.media_url.trim() ? [currentRow.media_url] : [],
        sub_btns: currentRow.sub_btns,
        menu_button_id: currentRow.menu_button_id ? String(currentRow.menu_button_id) : 'none',
      } : {
        name: '',
        description: null,
        status: '1',
        address: null,
        open_hour: null,
        close_hour: null,
        recommand: false,
        media_url: [],
        sub_btns: null,
        menu_button_id: 'none',
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
      address: data.address || undefined,
      open_hour: data.open_hour || undefined,
      close_hour: data.close_hour || undefined,
      recommand: data.recommand || false,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      sub_btns: data.sub_btns || undefined,
      menu_button_id: data.menu_button_id && data.menu_button_id !== 'none' ? Number(data.menu_button_id) : undefined,
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
      address: data.address || undefined,
      open_hour: data.open_hour || undefined,
      close_hour: data.close_hour || undefined,
      recommand: data.recommand || false,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      sub_btns: data.sub_btns || undefined,
      menu_button_id: data.menu_button_id && data.menu_button_id !== 'none' ? Number(data.menu_button_id) : undefined,
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
      <SheetContent className='flex flex-col'>
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
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
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
                  <FormLabel>Opening Hour</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value || undefined}
                    onValueChange={field.onChange}
                    placeholder='Select opening hour'
                    items={timeOptions}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='close_hour'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Hour</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value || undefined}
                    onValueChange={field.onChange}
                    placeholder='Select closing hour'
                    items={timeOptions}
                  />
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
            <FormField
              control={form.control}
              name='menu_button_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select category'
                      searchPlaceholder='Search categories...'
                      emptyMessage='No categories found.'
                      options={menuButtonOptions}
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