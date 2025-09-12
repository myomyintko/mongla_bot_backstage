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
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { roleService } from '@/services/role-service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { type Role } from '../data/schema'

type RolesMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Role
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(255, 'Name must be less than 255 characters'),
  display_name: z.string().max(255, 'Display name must be less than 255 characters').optional().or(z.literal('')),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
  permissions: z.array(z.string()),
})

type RoleForm = z.infer<typeof formSchema>

export function RolesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: RolesMutateDrawerProps) {
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()

  // Fetch available permissions
  const { data: permissionGroups, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleService.getAvailablePermissions(),
    enabled: open,
  })

  const form = useForm<RoleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      display_name: '',
      description: '',
      permissions: [],
    },
  })

  // Reset form when drawer opens or currentRow changes
  useEffect(() => {
    if (open) {
      const defaultValues = currentRow ? {
        name: currentRow.name || '',
        display_name: currentRow.display_name || '',
        description: currentRow.description || '',
        permissions: currentRow.permissions || [],
      } : {
        name: '',
        display_name: '',
        description: '',
        permissions: [],
      }
      
      form.reset(defaultValues)
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (data: RoleForm) => {
      const createData = {
        name: data.name.trim(),
        display_name: data.display_name?.trim() || undefined,
        description: data.description?.trim() || undefined,
        permissions: data.permissions || [],
      };

      return roleService.createRole(createData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role created successfully!')
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create role')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: RoleForm) => {
      const updateData = {
        name: data.name.trim(),
        display_name: data.display_name?.trim() || undefined,
        description: data.description?.trim() || undefined,
        permissions: data.permissions || [],
      };

      return roleService.updateRole(currentRow!.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role updated successfully!')
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role')
    },
  })

  const onSubmit = (data: RoleForm) => {
    if (isUpdate) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Role</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the role by providing necessary info.'
              : 'Add a new role by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='roles-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* Basic Information */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter role name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='display_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter display name' />
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
                    <Textarea {...field} placeholder='Enter role description' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Permissions</h3>
              
              {isLoadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading permissions...</div>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        {permissionGroups?.map((group) => (
                          <div key={group.group} className="space-y-2">
                            <h4 className="font-medium text-sm">{group.group}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                              {group.permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permission.name}
                                    checked={field.value?.includes(permission.name)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || []
                                      if (checked) {
                                        field.onChange([...current, permission.name])
                                      } else {
                                        field.onChange(current.filter((p) => p !== permission.name))
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={permission.name}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {permission.display_name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </form>
        </Form>
        <SheetFooter className='flex flex-row justify-end gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={createMutation.isPending || updateMutation.isPending}>
              Cancel
            </Button>
          </SheetClose>
          <Button 
            form='roles-form' 
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