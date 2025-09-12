import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Shield, ShieldCheck, ShieldX, Key, Download, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { twoFactorService } from '@/services/two-factor-service'
import { TwoFactorSetupDialog } from './two-factor-setup-dialog'

const disableSchema = z.object({
  code: z.string().min(6, 'Code must be 6 digits').max(6, 'Code must be 6 digits'),
})

type DisableFormData = z.infer<typeof disableSchema>

export function TwoFactorSettings() {
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [setupData, setSetupData] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: status, isLoading } = useQuery({
    queryKey: ['two-factor-status'],
    queryFn: twoFactorService.getStatus,
  })

  const form = useForm<DisableFormData>({
    resolver: zodResolver(disableSchema),
    defaultValues: {
      code: '',
    },
  })

  const generateSecretMutation = useMutation({
    mutationFn: twoFactorService.generateSecret,
    onSuccess: (response) => {
      if (response.success) {
        setSetupData(response.data)
        setShowSetupDialog(true)
      } else {
        toast.error(response.message || 'Unknown error occurred')
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate 2FA setup'
      toast.error(errorMessage)
    },
  })

  const disableMutation = useMutation({
    mutationFn: twoFactorService.disable,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Two-factor authentication disabled successfully!')
        queryClient.invalidateQueries({ queryKey: ['two-factor-status'] })
        form.reset()
      } else {
        toast.error(response.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA')
    },
  })

  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])

  const regenerateCodesMutation = useMutation({
    mutationFn: twoFactorService.regenerateRecoveryCodes,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Recovery codes regenerated successfully!')
        queryClient.invalidateQueries({ queryKey: ['two-factor-status'] })
        setRecoveryCodes(response.data.recovery_codes)
        setShowRecoveryCodes(true)
      } else {
        toast.error(response.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to regenerate recovery codes')
    },
  })

  const onSubmit = (data: DisableFormData) => {
    disableMutation.mutate(data.code)
  }


  const handleDownloadRecoveryCodes = (codes: string[]) => {
    const content = `Two-Factor Authentication Recovery Codes\n\n${codes.join('\n')}\n\nStore these codes in a safe place. Each code can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '2fa-recovery-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className='space-y-6'>
          {/* Status */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {status?.is_enabled ? (
                <>
                  <ShieldCheck className='h-5 w-5 text-primary' />
                  <div>
                    <p className='font-medium'>Two-Factor Authentication</p>
                    <p className='text-sm text-muted-foreground'>Enabled</p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldX className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <p className='font-medium'>Two-Factor Authentication</p>
                    <p className='text-sm text-muted-foreground'>Disabled</p>
                  </div>
                </>
              )}
            </div>
            {status?.enabled_at && (
              <p className='text-xs text-muted-foreground'>
                {new Date(status.enabled_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Actions */}
          {status?.is_enabled ? (
            <div className='space-y-4'>
              {/* Recovery Codes */}
              {status.has_recovery_codes && (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Recovery Codes</p>
                      <p className='text-sm text-muted-foreground'>
                        Access your account if you lose your authenticator device
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => regenerateCodesMutation.mutate()}
                        disabled={regenerateCodesMutation.isPending}
                        className='gap-2'
                      >
                        <Eye className='h-4 w-4' />
                        View
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => regenerateCodesMutation.mutate()}
                        disabled={regenerateCodesMutation.isPending}
                        className='gap-2'
                      >
                        <Key className='h-4 w-4' />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Disable 2FA */}
              <div className='space-y-3 pt-4 border-t'>
                <div>
                  <p className='font-medium text-destructive'>Disable Two-Factor Authentication</p>
                  <p className='text-sm text-muted-foreground'>
                    Enter your verification code to disable 2FA
                  </p>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
                    <FormField
                      control={form.control}
                      name='code'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder='Enter 6-digit code'
                              maxLength={6}
                              className='text-center text-lg font-mono tracking-widest'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type='submit' 
                      variant='destructive'
                      disabled={disableMutation.isPending}
                      className='w-full'
                    >
                      {disableMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground mb-3'>
                  Add an extra layer of security by requiring a verification code from your authenticator app.
                </p>
              </div>
              <Button
                onClick={() => generateSecretMutation.mutate()}
                disabled={generateSecretMutation.isPending}
                className='gap-2 w-full'
              >
                <Shield className='h-4 w-4' />
                {generateSecretMutation.isPending ? 'Setting up...' : 'Enable Two-Factor Authentication'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      {setupData && (
        <TwoFactorSetupDialog
          open={showSetupDialog}
          onOpenChange={setShowSetupDialog}
          setupData={setupData}
        />
      )}

      {/* Recovery Codes Dialog */}
      <Dialog open={showRecoveryCodes} onOpenChange={setShowRecoveryCodes}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-primary' />
              Recovery Codes
            </DialogTitle>
            <DialogDescription>
              Save these recovery codes in a safe place. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>
          
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg'>
              {recoveryCodes.map((code, index) => (
                <div key={index} className='font-mono text-sm text-center p-2 bg-background rounded border'>
                  {code}
                </div>
              ))}
            </div>
            
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleDownloadRecoveryCodes(recoveryCodes)}
                className='gap-2'
              >
                <Download className='h-4 w-4' />
                Download
              </Button>
              <Button
                type='button'
                onClick={() => setShowRecoveryCodes(false)}
                className='flex-1'
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
