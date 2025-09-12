'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { type User, userService } from '@/services/user-service'

const formSchema = z
  .object({
    firstName: z.string().min(1, 'First Name is required.'),
    lastName: z.string().min(1, 'Last Name is required.'),
    username: z.string().min(1, 'Username is required.'),
    email: z.email({
      error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
    }),
    password: z.string().transform((pwd) => pwd.trim()),
    role: z.string().min(1, 'Role is required.'),
    status: z.string().min(1, 'Status is required.'),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: 'Password is required.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    {
      message: 'Password must be at least 8 characters long.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /[a-z]/.test(password)
    },
    {
      message: 'Password must contain at least one lowercase letter.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /\d/.test(password)
    },
    {
      message: 'Password must contain at least one number.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    }
  )
type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()

  // Fetch available roles from API
  const { data: availableRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => userService.getAvailableRoles(),
    enabled: open,
  })
  
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      role: '',
      status: '1',
      password: '',
      confirmPassword: '',
      isEdit: false,
    },
  })

  // Reset form when dialog opens or currentRow changes
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        // For edit mode, use the current row data
        const defaultValues = {
          ...currentRow,
          status: String(currentRow.status),
          password: '',
          confirmPassword: '',
          isEdit: true,
        }
        form.reset(defaultValues)
      } else {
        // For create mode, use default values
        const defaultValues = {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          role: '',
          status: '1',
          password: '',
          confirmPassword: '',
          isEdit: false,
        }
        form.reset(defaultValues)
      }
    }
  }, [open, isEdit, currentRow, form])

  // Additional effect to ensure form is updated when currentRow changes
  useEffect(() => {
    if (open && isEdit && currentRow) {
      form.reset({
        ...currentRow,
        status: String(currentRow.status),
        password: '',
        confirmPassword: '',
        isEdit: true,
      })
    }
  }, [currentRow, open, isEdit, form])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        role: '',
        status: '1',
        password: '',
        confirmPassword: '',
        isEdit: false,
      })
    }
  }, [open, form])

  const createMutation = useMutation({
    mutationFn: (data: UserForm) => {
      const createData = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
        status: parseInt(data.status) as 1 | 2 | 4,
        role: data.role,
      }
      return userService.createUser(createData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully!')
      form.reset()
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UserForm) => {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password || undefined,
        status: parseInt(data.status) as 1 | 2 | 4,
        role: data.role,
      }
      return userService.updateUser(currentRow!.id, updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated successfully!')
      form.reset()
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user')
    },
  })

  const onSubmit = (values: UserForm) => {
    if (isEdit) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john_doe'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                    <SelectDropdown
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      placeholder={isLoadingRoles ? 'Loading roles...' : 'Select a role'}
                      className='col-span-4'
                      disabled={isLoadingRoles}
                      isControlled={true}
                      items={availableRoles?.map(({ label, value }) => ({
                        label,
                        value,
                      })) || []}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select status'
                      className='col-span-4'
                      items={[
                        { label: 'Active', value: '1' },
                        { label: 'Inactive', value: '2' },
                        { label: 'Suspended', value: '4' },
                      ]}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button 
            type='submit' 
            form='user-form'
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending 
              ? 'Saving...' 
              : isEdit ? 'Update User' : 'Create User'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
