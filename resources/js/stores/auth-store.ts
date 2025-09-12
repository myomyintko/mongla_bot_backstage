import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { authService } from '@/services/auth-service'

const ACCESS_TOKEN = 'access_token'

export interface AuthUser {
  id: number
  name: string
  email: string
  username: string
  avatar: string | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    login: (email: string, password: string, rememberMe?: boolean) => Promise<{ requiresTwoFactor: boolean; requiresPasswordSetup: boolean }>
    verifyTwoFactor: (code: string) => Promise<void>
    setupPassword: (password: string, passwordConfirmation: string) => Promise<void>
    logout: () => Promise<void>
    initialize: () => Promise<void>
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  let isInitializing = false
  
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
      login: async (email: string, password: string, rememberMe: boolean = false) => {
        try {
          const response = await authService.login({ email, password, remember: rememberMe })
          
          // Check if password setup is required
          if (response.requires_password_setup) {
            // Store token for password setup
            set((state) => ({
              ...state,
              auth: {
                ...state.auth,
                accessToken: response.access_token,
              },
            }))
            
            // Store token in localStorage
            setCookie(ACCESS_TOKEN, JSON.stringify(response.access_token))
            localStorage.setItem('access_token', response.access_token)
            
            return { requiresTwoFactor: false, requiresPasswordSetup: true }
          }
          
          // Check if 2FA is required
          if (response.requires_two_factor) {
            return { requiresTwoFactor: true, requiresPasswordSetup: false }
          }
          
          const { user, access_token } = response
          
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              user,
              accessToken: access_token,
            },
          }))
          
          // Store token based on remember me preference
          if (rememberMe) {
            // Store in both cookie and localStorage for persistent login (30 days)
            setCookie(ACCESS_TOKEN, JSON.stringify(access_token), 60 * 60 * 24 * 30) // 30 days
            localStorage.setItem('access_token', access_token)
          } else {
            // Store only in sessionStorage for session-only login (7 days default)
            setCookie(ACCESS_TOKEN, JSON.stringify(access_token)) // Default 7 days
            localStorage.setItem('access_token', access_token)
          }
          
          return { requiresTwoFactor: false, requiresPasswordSetup: false }
        } catch (error) {
          throw error
        }
      },
      verifyTwoFactor: async (code: string) => {
        try {
          const response = await authService.verifyTwoFactor(code)
          const { user, access_token } = response
          
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              user,
              accessToken: access_token,
            },
          }))
          
          // Store token in localStorage
          setCookie(ACCESS_TOKEN, JSON.stringify(access_token))
          localStorage.setItem('access_token', access_token)
        } catch (error) {
          throw error
        }
      },
      setupPassword: async (password: string, passwordConfirmation: string) => {
        try {
          await authService.setupPassword(password, passwordConfirmation)
          
          // Get updated user info
          const userResponse = await authService.getUser()
          const { user } = userResponse
          
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              user,
            },
          }))
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
        // Prevent duplicate initialization calls
        if (isInitializing) {
          return
        }

        const token = get().auth.accessToken
        if (token) {
          isInitializing = true
          try {
            const response = await authService.getUser()
            set((state) => ({
              ...state,
              auth: { ...state.auth, user: response.user },
            }))
          } catch (error) {
            // Token is invalid, reset auth state
            get().auth.reset()
          } finally {
            isInitializing = false
          }
        }
      },
    },
  }
})
