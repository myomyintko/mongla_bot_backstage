import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const { auth } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await auth.initialize()
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [auth])

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
}
