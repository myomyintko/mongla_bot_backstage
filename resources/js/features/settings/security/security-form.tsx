import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Lock, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { profileService } from '@/services/profile-service'
import { TwoFactorSettings } from '@/features/two-factor/components/two-factor-settings'

const passwordFormSchema = z.object({
  current_password: z.string().min(1, 'Please enter your current password.'),
  new_password: z.string().min(8, 'Password must be at least 8 characters.'),
  new_password_confirmation: z.string().min(1, 'Please confirm your new password.'),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: "Passwords don't match",
  path: ["new_password_confirmation"],
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function SecurityForm() {
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  })

  const passwordMutation = useMutation({
    mutationFn: profileService.updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully!')
      passwordForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update password')
    },
  })

  const onPasswordSubmit = (data: PasswordFormValues) => {
    passwordMutation.mutate({
      current_password: data.current_password,
      new_password: data.new_password,
      new_password_confirmation: data.new_password_confirmation,
    })
  }

  return (
    <div className='space-y-8'>
      {/* Password Section */}
      <div className='space-y-6'>
        <div className='flex items-center gap-2'>
          <Lock className='h-5 w-5 text-primary' />
          <div>
            <h3 className='text-lg font-medium'>Change Password</h3>
            <p className='text-sm text-muted-foreground'>
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className='space-y-6'
          >
            <FormField
              control={passwordForm.control}
              name='current_password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input 
                      type='password' 
                      placeholder='Enter your current password' 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name='new_password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type='password' 
                      placeholder='Enter your new password' 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name='new_password_confirmation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type='password' 
                      placeholder='Confirm your new password' 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type='submit' 
              disabled={passwordMutation.isPending}
            >
              {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Form>
      </div>

      <Separator />

      {/* Two-Factor Authentication Section */}
      <div className='space-y-6'>
        <div className='flex items-center gap-2'>
          <Shield className='h-5 w-5 text-primary' />
          <div>
            <h3 className='text-lg font-medium'>Two-Factor Authentication</h3>
            <p className='text-sm text-muted-foreground'>
              Add an extra layer of security to your account with two-factor authentication.
            </p>
          </div>
        </div>

        <TwoFactorSettings />
      </div>
    </div>
  )
}
