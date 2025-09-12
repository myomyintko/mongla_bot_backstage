import { useAuthStore } from '@/stores/auth-store'
import { UserAuthForm } from './components/user-auth-form'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AuthLayout } from '../auth-layout'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  useEffect(() => {
    // If user is already authenticated, redirect them away from login page
    if (auth.user && auth.accessToken) {
      const targetPath = redirect || '/'
      navigate({ to: targetPath, replace: true })
    }
  }, [auth.user, auth.accessToken, redirect, navigate])

  // Don't render the login form if user is already authenticated
  if (auth.user && auth.accessToken) {
    return null
  }

  return (
    <AuthLayout>
      <div className='flex flex-col space-y-2 text-start'>
        <h2 className='text-lg font-semibold tracking-tight'>Sign in</h2>
        <p className='text-muted-foreground text-sm'>
          Enter your email and password below <br />
          to log into your account
        </p>
      </div>
      <UserAuthForm redirectTo={redirect} />
    </AuthLayout>
  )
}
