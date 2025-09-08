import { Logo } from '@/assets/logo'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import dashboardDark from './assets/dashboard-dark.png'
import dashboardLight from './assets/dashboard-light.png'
import { UserAuthForm } from './components/user-auth-form'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

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
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <Logo className='me-2' />
            <h1 className='text-xl font-medium'>Shadcn Admin</h1>
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>Sign in</h2>
            <p className='text-muted-foreground text-sm'>
              Enter your email and password below <br />
              to log into your account
            </p>
          </div>
          <UserAuthForm redirectTo={redirect} />
        </div>
      </div>

      <div
        className={cn(
          'bg-muted relative h-full overflow-hidden max-lg:hidden',
          '[&>img]:absolute [&>img]:top-[15%] [&>img]:left-20 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none'
        )}
      >
        <img
          src={dashboardLight}
          className='dark:hidden'
          width={1024}
          height={1151}
          alt='Shadcn-Admin'
        />
        <img
          src={dashboardDark}
          className='hidden dark:block'
          width={1024}
          height={1138}
          alt='Shadcn-Admin'
        />
      </div>
    </div>
  )
}
