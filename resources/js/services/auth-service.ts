import api from './api'

export interface LoginCredentials {
  email: string
  password: string
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
}

export interface LoginResponse {
  user: User
  access_token: string
  token_type: string
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
}
