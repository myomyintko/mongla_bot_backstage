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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  otp: z
    .string()
    .min(6, 'Please enter the 6-digit code.')
    .max(6, 'Please enter the 6-digit code.'),
})

interface OtpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirect?: string
}

export function OtpForm({ className, redirect, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  const otp = form.watch('otp')

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await auth.verifyTwoFactor(data.otp)
      
      // Redirect to the stored location or default to dashboard
      const targetPath = redirect || '/'
      navigate({ to: targetPath, replace: true })
      
      toast.success('Two-factor authentication verified!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid verification code. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='otp'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>One-Time Password</FormLabel>
              <FormControl>
                <div className='flex justify-center'>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    containerClassName='justify-center gap-2'
                  >
                    <InputOTPGroup className='gap-2'>
                      <InputOTPSlot index={0} className='w-12 h-12 text-lg' />
                      <InputOTPSlot index={1} className='w-12 h-12 text-lg' />
                      <InputOTPSlot index={2} className='w-12 h-12 text-lg' />
                      <InputOTPSlot index={3} className='w-12 h-12 text-lg' />
                      <InputOTPSlot index={4} className='w-12 h-12 text-lg' />
                      <InputOTPSlot index={5} className='w-12 h-12 text-lg' />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type='submit' 
          className='w-full' 
          disabled={otp.length < 6 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>
      </form>
    </Form>
  )
}