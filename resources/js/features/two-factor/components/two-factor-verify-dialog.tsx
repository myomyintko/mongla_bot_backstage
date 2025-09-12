import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Shield, Key } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { twoFactorService } from '@/services/two-factor-service'

const verifySchema = z.object({
  code: z.string().min(6, 'Code must be 6 digits').max(6, 'Code must be 6 digits'),
})

type VerifyFormData = z.infer<typeof verifySchema>

interface TwoFactorVerifyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TwoFactorVerifyDialog({
  open,
  onOpenChange,
  onSuccess,
}: TwoFactorVerifyDialogProps) {
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  })

  const verifyMutation = useMutation({
    mutationFn: twoFactorService.verify,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Two-factor authentication verified!')
        onSuccess()
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(response.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify 2FA')
    },
  })

  const recoveryCodeMutation = useMutation({
    mutationFn: twoFactorService.verifyRecoveryCode,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Recovery code verified!')
        onSuccess()
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(response.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify recovery code')
    },
  })

  const onSubmit = (data: VerifyFormData) => {
    if (useRecoveryCode) {
      recoveryCodeMutation.mutate(data.code)
    } else {
      verifyMutation.mutate(data.code)
    }
  }

  const handleClose = () => {
    setUseRecoveryCode(false)
    form.reset()
    onOpenChange(false)
  }

  const isLoading = verifyMutation.isPending || recoveryCodeMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-primary' />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            {useRecoveryCode 
              ? 'Enter one of your recovery codes to access your account.'
              : 'Enter the 6-digit code from your authenticator app.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {useRecoveryCode ? 'Recovery Code' : 'Verification Code'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={useRecoveryCode ? 'Enter 8-character code' : 'Enter 6-digit code'}
                      maxLength={useRecoveryCode ? 8 : 6}
                      className='text-center text-lg font-mono tracking-widest'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                className='flex-1 gap-2'
              >
                <Key className='h-4 w-4' />
                {useRecoveryCode ? 'Use Authenticator' : 'Use Recovery Code'}
              </Button>
              <Button 
                type='submit' 
                className='flex-1'
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
