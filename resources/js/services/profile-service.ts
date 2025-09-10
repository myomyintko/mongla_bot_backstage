import api from './api'

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

export interface ProfileUpdateData {
  name: string
}

export interface AvatarUpdateData {
  avatar: string | null
}

export interface PasswordUpdateData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export const profileService = {
  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/profile')
    return response.data
  },

  async updateProfile(data: ProfileUpdateData): Promise<{ message: string; user: User }> {
    const response = await api.put('/profile', data)
    return response.data
  },

  async updateAvatar(data: AvatarUpdateData): Promise<{ message: string; avatar: string | null }> {
    const response = await api.put('/profile/avatar', data)
    return response.data
  },

  async updatePassword(data: PasswordUpdateData): Promise<{ message: string }> {
    const response = await api.put('/profile/password', data)
    return response.data
  },
}
