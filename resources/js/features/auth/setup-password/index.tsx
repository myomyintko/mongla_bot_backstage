import { useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { SetupPasswordForm } from './components/setup-password-form'
import { Key } from 'lucide-react'

export function SetupPassword() {
  const { redirect } = useSearch({ from: '/(auth)/setup-password' })

  return (
    <AuthLayout>
      <div className='space-y-6'>
        <div className='text-center space-y-4'>
          <div className='flex justify-center'>
            <div className='rounded-full bg-primary/10 p-3'>
              <Key className='h-6 w-6 text-primary' />
            </div>
          </div>
          <div className='space-y-2'>
            <h2 className='text-lg font-semibold tracking-tight'>Setup Your Password</h2>
            <p className='text-muted-foreground text-sm'>
              Create a secure password to complete your account setup
            </p>
          </div>
        </div>
        
        <SetupPasswordForm redirect={redirect} />
      </div>
    </AuthLayout>
  )
}
