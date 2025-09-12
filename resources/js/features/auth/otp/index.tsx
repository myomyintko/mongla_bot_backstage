import { Link, useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'
import { Shield } from 'lucide-react'

export function Otp() {
  const { redirect } = useSearch({ from: '/(auth)/otp' })

  return (
    <AuthLayout>
      <div className='space-y-6'>
        <div className='text-center space-y-4'>
          <div className='flex justify-center'>
            <div className='rounded-full bg-primary/10 p-3'>
              <Shield className='h-6 w-6 text-primary' />
            </div>
          </div>
          <div className='space-y-2'>
            <h2 className='text-lg font-semibold tracking-tight'>Two-factor Authentication</h2>
            <p className='text-muted-foreground text-sm'>
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
        </div>
        
        <OtpForm redirect={redirect} />
        
        <div className='text-center'>
          <p className='text-sm text-muted-foreground'>
            Having trouble?{' '}
            <Link
              to='/sign-in'
              className='font-medium text-primary hover:text-primary/80 underline underline-offset-4'
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}