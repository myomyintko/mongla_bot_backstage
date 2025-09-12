import api from './api'

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface User {
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

export interface LoginResponse {
  user: User
  access_token: string
  token_type: string
  requires_two_factor?: boolean
  requires_password_setup?: boolean
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getUser(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/user')
    return response.data
  },

  async verifyTwoFactor(code: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/verify-2fa', { code })
    return response.data
  },

  async setupPassword(password: string, passwordConfirmation: string): Promise<void> {
    await api.post('/auth/setup-password', { 
      password, 
      password_confirmation: passwordConfirmation 
    })
  },
}
