import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

const formSchema = z.object({
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
  password_confirmation: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
})

interface SetupPasswordFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirect?: string
}

export function SetupPasswordForm({ className, redirect, ...props }: SetupPasswordFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      password_confirmation: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await auth.setupPassword(data.password, data.password_confirmation)
      
      // Redirect to the stored location or default to dashboard
      const targetPath = redirect || '/'
      navigate({ to: targetPath, replace: true })
      
      toast.success('Password setup completed successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to setup password. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput 
                  placeholder='Enter your new password' 
                  autoComplete='new-password'
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='password_confirmation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput 
                  placeholder='Confirm your new password' 
                  autoComplete='new-password'
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Setting up...
            </>
          ) : (
            <>
              <Lock className='mr-2 h-4 w-4' />
              Setup Password
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
