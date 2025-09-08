import { MultiMediaUploader } from '@/components/multi-media-uploader'
import { SelectDropdown } from '@/components/select-dropdown'
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
import { menuButtonsService } from '@/services/menu-buttons-service'
import { mediaService } from '@/services/media-service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import MDEditor from '@uiw/react-md-editor'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { buttonTypes, statuses } from '../data/data'
import { type MenuButton } from '../data/schema'

type MenuButtonsMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: MenuButton
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  button_type: z.string().min(1, 'Please select a button type.'),
  status: z.string().min(1, 'Please select a status.'),
  parent_id: z.number().nullable().optional(),
  sort: z.number().nullable().optional(),
  media_url: z.array(z.string()).optional(),
  enable_template: z.boolean().optional(),
  template_content: z.string().nullable().optional(),
  sub_btns: z.array(z.string()).nullable().optional(),
})
type MenuButtonForm = z.infer<typeof formSchema>

export function MenuButtonsMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: MenuButtonsMutateDrawerProps) {
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()
  const [deletedFiles, setDeletedFiles] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

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

  const form = useForm<MenuButtonForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      button_type: 'store',
      status: '1',
      parent_id: null,
      sort: null,
      media_url: [],
      enable_template: false,
      template_content: null,
      sub_btns: null,
    },
  })

  // Reset form when drawer opens or currentRow changes
  useEffect(() => {
    if (open) {
      const defaultValues = currentRow ? {
        name: currentRow.name,
        button_type: currentRow.button_type,
        status: String(currentRow.status),
        parent_id: currentRow.parent_id,
        sort: currentRow.sort,
        media_url: currentRow.media_url && currentRow.media_url.trim() ? [currentRow.media_url] : [],
        enable_template: currentRow.enable_template,
        template_content: currentRow.template_content,
        sub_btns: currentRow.sub_btns,
      } : {
        name: '',
        button_type: 'store',
        status: '1',
        parent_id: null,
        sort: null,
        media_url: [],
        enable_template: false,
        template_content: null,
        sub_btns: null,
      }
      
      form.reset(defaultValues)
      setDeletedFiles([])
      setUploadedFiles([])
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (data: MenuButtonForm) => menuButtonsService.createMenuButton({
      name: data.name,
      button_type: data.button_type,
      status: Number(data.status),
      parent_id: data.parent_id || undefined,
      sort: data.sort || undefined,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      enable_template: data.enable_template || false,
      template_content: data.template_content || undefined,
      sub_btns: data.sub_btns || undefined,
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['menu-buttons'] })
      toast.success('Menu button created successfully!')
      // Don't cleanup files on successful save - they should remain
      setDeletedFiles([])
      setUploadedFiles([])
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create menu button')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: MenuButtonForm) => menuButtonsService.updateMenuButton(currentRow!.id, {
      name: data.name,
      button_type: data.button_type,
      status: Number(data.status),
      parent_id: data.parent_id || undefined,
      sort: data.sort || undefined,
      media_url: data.media_url && data.media_url.length > 0 ? data.media_url[0] : null,
      enable_template: data.enable_template || false,
      template_content: data.template_content || undefined,
      sub_btns: data.sub_btns || undefined,
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['menu-buttons'] })
      toast.success('Menu button updated successfully!')
      // Clean up only deleted files on successful update
      await cleanupDeletedFiles()
      // Clear uploaded files since they're now saved
      setUploadedFiles([])
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update menu button')
    },
  })

  const onSubmit = (data: MenuButtonForm) => {
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Menu Button</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the menu button by providing necessary info.'
              : 'Add a new menu button by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='menu-buttons-form'
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
                    <Input {...field} placeholder='Enter menu button name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='button_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Type</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select button type'
                    items={buttonTypes}
                  />
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
                      uploadPath="menu-buttons"
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
              name='enable_template'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Enable Template</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='template_content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Content</FormLabel>
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
          </form>
        </Form>
        <SheetFooter className='flex flex-row justify-end gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={createMutation.isPending || updateMutation.isPending}>
              Cancel
            </Button>
          </SheetClose>
          <Button 
            form='menu-buttons-form' 
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