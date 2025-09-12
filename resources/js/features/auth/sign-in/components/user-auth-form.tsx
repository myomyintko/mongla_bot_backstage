import { PasswordInput } from '@/components/password-input'
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
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
  rememberMe: z.boolean().optional(),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await auth.login(data.email, data.password, data.rememberMe)
      
      if (result.requiresPasswordSetup) {
        // Navigate to setup password page
        navigate({ 
          to: '/setup-password', 
          search: { 
            redirect: redirectTo || '/'
          }
        })
        return
      }
      
      if (result.requiresTwoFactor) {
        // Navigate to OTP route for 2FA verification
        navigate({ 
          to: '/otp', 
          search: { 
            redirect: redirectTo || '/'
          }
        })
        return
      }
      
      // Redirect to the stored location or default to dashboard
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
      
      toast.success(`Welcome back, ${data.email}!`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder='name@example.com' 
                  type='email'
                  autoComplete='email'
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput 
                  placeholder='Enter your password' 
                  autoComplete='current-password'
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='rememberMe'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className='text-sm font-normal cursor-pointer'>
                Remember me
              </FormLabel>
            </FormItem>
          )}
        />
        
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <LogIn className='mr-2 h-4 w-4' />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
