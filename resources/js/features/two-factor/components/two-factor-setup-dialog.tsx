import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Shield, Download, Copy, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import QRCode from 'qrcode'

const setupSchema = z.object({
  code: z.string().min(6, 'Code must be 6 digits').max(6, 'Code must be 6 digits'),
})

type SetupFormData = z.infer<typeof setupSchema>

interface TwoFactorSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  setupData: {
    secret_key: string
    qr_code_url: string
    manual_entry_key: string
  }
}

export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  setupData,
}: TwoFactorSetupDialogProps) {
  const [step, setStep] = useState<'qr' | 'verify'>('qr')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [qrCodeLoaded, setQrCodeLoaded] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      code: '',
    },
  })

  const enableMutation = useMutation({
    mutationFn: twoFactorService.enable,
    onSuccess: (response) => {
      if (response.success) {
        setRecoveryCodes(response.data.recovery_codes)
        setStep('verify')
        toast.success('Two-factor authentication enabled successfully!')
      } else {
        toast.error(response.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to enable 2FA')
    },
  })

  const onSubmit = (data: SetupFormData) => {
    enableMutation.mutate(data.code)
  }

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(setupData.manual_entry_key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Secret key copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy secret key')
    }
  }

  const handleDownloadRecoveryCodes = () => {
    const content = `Two-Factor Authentication Recovery Codes\n\n${recoveryCodes.join('\n')}\n\nStore these codes in a safe place. Each code can only be used once.`
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

  const handleClose = () => {
    if (step === 'verify') {
      queryClient.invalidateQueries({ queryKey: ['two-factor-status'] })
    }
    setStep('qr')
    setRecoveryCodes([])
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-primary' />
            Setup Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            {step === 'qr' 
              ? 'Scan the QR code with your authenticator app to set up 2FA.'
              : 'Your recovery codes have been generated. Save them in a safe place.'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'qr' ? (
          <div className='space-y-6'>
            {/* QR Code */}
            <div className='flex justify-center'>
              <div className='p-4 bg-white rounded-lg border-2 border-dashed border-border'>
                {!qrCodeLoaded && (
                  <div className='w-48 h-48 flex items-center justify-center'>
                    <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
                  </div>
                )}
                <img 
                  src={setupData.qr_code_url} 
                  alt='2FA QR Code' 
                  className={`w-48 h-48 ${qrCodeLoaded ? 'block' : 'hidden'}`}
                  onLoad={() => setQrCodeLoaded(true)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      // Generate QR code using frontend library as fallback
                      const qrCodeElement = document.createElement('div');
                      qrCodeElement.innerHTML = `
                        <div class="w-48 h-48 flex items-center justify-center">
                          <canvas id="fallback-qr-code" width="192" height="192"></canvas>
                        </div>
                      `;
                      parent.appendChild(qrCodeElement);
                      
                      // Generate QR code using the TOTP URL
                      const canvas = document.getElementById('fallback-qr-code') as HTMLCanvasElement;
                      if (canvas) {
                        QRCode.toCanvas(canvas, setupData.qr_code_url, {
                          width: 192,
                          margin: 2,
                          color: {
                            dark: '#000000',
                            light: '#FFFFFF',
                          },
                        }).catch((error) => {
                          console.error('Error generating fallback QR code:', error);
                          canvas.parentElement!.innerHTML = `
                            <div class="w-48 h-48 flex items-center justify-center text-center p-4">
                              <div>
                                <div class="text-sm text-gray-500 mb-2">QR Code not available</div>
                                <div class="text-xs text-gray-400">Use manual entry key below</div>
                              </div>
                            </div>
                          `;
                        });
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Manual Entry */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Manual Entry Key</Label>
              <div className='flex gap-2'>
                <Input 
                  value={setupData.manual_entry_key}
                  readOnly
                  className='font-mono text-sm'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleCopySecret}
                  className='px-3'
                >
                  {copied ? (
                    <Check className='h-4 w-4 text-green-600' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
              <p className='text-xs text-muted-foreground'>
                If you can't scan the QR code, enter this key manually in your authenticator app.
              </p>
            </div>

            {/* Verification Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
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
                  className='w-full'
                  disabled={enableMutation.isPending}
                >
                  {enableMutation.isPending ? 'Verifying...' : 'Enable 2FA'}
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Recovery Codes */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm font-medium'>Recovery Codes</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleDownloadRecoveryCodes}
                  className='gap-2'
                >
                  <Download className='h-4 w-4' />
                  Download
                </Button>
              </div>
              <div className='grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg'>
                {recoveryCodes.map((code, index) => (
                  <div key={index} className='font-mono text-sm text-center p-2 bg-background rounded border'>
                    {code}
                  </div>
                ))}
              </div>
              <p className='text-xs text-muted-foreground'>
                Store these codes in a safe place. Each code can only be used once to access your account if you lose your authenticator device.
              </p>
            </div>

            <Button onClick={handleClose} className='w-full'>
              Complete Setup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
