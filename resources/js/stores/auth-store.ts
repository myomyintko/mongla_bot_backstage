import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { authService } from '@/services/auth-service'

const ACCESS_TOKEN = 'access_token'

interface AuthUser {
  id: number
  name: string
  email: string
  username: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    initialize: () => Promise<void>
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  
  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          localStorage.setItem('access_token', accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          localStorage.removeItem('access_token')
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          localStorage.removeItem('access_token')
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
      login: async (email: string, password: string) => {
        try {
          const response = await authService.login({ email, password })
          const { user, access_token } = response
          
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              user,
              accessToken: access_token,
            },
          }))
          
          setCookie(ACCESS_TOKEN, JSON.stringify(access_token))
          localStorage.setItem('access_token', access_token)
        } catch (error) {
          throw error
        }
      },
      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          // Continue with logout even if API call fails
        } finally {
          get().auth.reset()
        }
      },
      initialize: async () => {
        const token = get().auth.accessToken
        if (token) {
          try {
            const response = await authService.getUser()
            set((state) => ({
              ...state,
              auth: { ...state.auth, user: response.user },
            }))
          } catch (error) {
            // Token is invalid, reset auth state
            get().auth.reset()
          }
        }
      },
    },
  }
})
