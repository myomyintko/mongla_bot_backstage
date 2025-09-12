import { api } from './api'

export interface User {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  status: 1 | 2 | 4 // 1=active, 2=inactive, 4=suspended
  role: 'superadmin' | 'admin' | 'manager' | 'editor' | 'viewer'
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  firstName: string
  lastName?: string
  username: string
  email: string
  password: string
  status: 1 | 2 | 4 // 1=active, 2=inactive, 4=suspended
  role: string
}

export interface UpdateUserData {
  firstName: string
  lastName?: string
  username: string
  email: string
  password?: string
  status: 1 | 2 | 4 // 1=active, 2=inactive, 4=suspended
  role: string
}

export interface UserFilters {
  page?: number
  per_page?: number
  search?: string
  status?: string[]
  role?: string[]
}

export interface UserListResponse {
  data: User[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface Role {
  value: string
  label: string
}

export const userService = {
  // Get users list with filters
  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.per_page) params.append('per_page', filters.per_page.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status[]', status))
    }
    if (filters.role?.length) {
      filters.role.forEach(role => params.append('role[]', role))
    }

    const response = await api.get(`/users?${params.toString()}`)
    
    // Transform date strings to Date objects
    const transformedData = {
      ...response.data,
      data: response.data.data.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }))
    }
    
    return transformedData
  },

  // Get single user
  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`)
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    }
  },

  // Create new user
  async createUser(data: CreateUserData): Promise<{ message: string; user: User }> {
    const response = await api.post('/users', data)
    return {
      ...response.data,
      user: {
        ...response.data.user,
        createdAt: new Date(response.data.user.createdAt),
        updatedAt: new Date(response.data.user.updatedAt),
      }
    }
  },

  // Update user
  async updateUser(id: string, data: UpdateUserData): Promise<{ message: string; user: User }> {
    const response = await api.put(`/users/${id}`, data)
    return {
      ...response.data,
      user: {
        ...response.data.user,
        createdAt: new Date(response.data.user.createdAt),
        updatedAt: new Date(response.data.user.updatedAt),
      }
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Bulk update users
  async bulkUpdateUsers(userIds: string[], status: string): Promise<{ message: string; updated_count: number }> {
    const response = await api.post('/users/bulk-update', {
      user_ids: userIds,
      status,
    })
    return response.data
  },

  // Bulk delete users
  async bulkDeleteUsers(userIds: string[]): Promise<{ message: string; deleted_count: number }> {
    const response = await api.post('/users/bulk-delete', {
      user_ids: userIds,
    })
    return response.data
  },

  // Get available roles
  async getAvailableRoles(): Promise<Role[]> {
    const response = await api.get('/users/roles/available')
    return response.data
  },

  // Get available statuses
  async getAvailableStatuses(): Promise<Role[]> {
    const response = await api.get('/users/statuses/available')
    return response.data
  },
}
