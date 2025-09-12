import { api } from './api'

export interface Role {
  id: string
  name: string
  display_name: string
  description: string
  permissions_count: number
  permissions: string[]
  created_at: Date
  updated_at: Date
}

export interface CreateRoleData {
  name: string
  display_name?: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleData {
  name: string
  display_name?: string
  description?: string
  permissions?: string[]
}

export interface RoleFilters {
  page?: number
  per_page?: number
  search?: string
}

export interface RoleListResponse {
  data: Role[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface PermissionGroup {
  group: string
  permissions: {
    id: number
    name: string
    display_name: string
  }[]
}

export const roleService = {
  // Get roles list with filters
  async getRoles(filters: RoleFilters = {}): Promise<RoleListResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.per_page) params.append('per_page', filters.per_page.toString())
    if (filters.search) params.append('search', filters.search)

    const response = await api.get(`/roles?${params.toString()}`)
    
    // Transform date strings to Date objects
    const transformedData = {
      ...response.data,
      data: response.data.data.map((role: any) => ({
        ...role,
        created_at: new Date(role.created_at),
        updated_at: new Date(role.updated_at),
      }))
    }
    
    return transformedData
  },

  // Get single role
  async getRole(id: string): Promise<Role> {
    const response = await api.get(`/roles/${id}`)
    return {
      ...response.data,
      created_at: new Date(response.data.created_at),
      updated_at: new Date(response.data.updated_at),
    }
  },

  // Create new role
  async createRole(data: CreateRoleData): Promise<{ message: string; role: Role }> {
    const response = await api.post('/roles', data)
    return {
      ...response.data,
      role: {
        ...response.data.role,
        created_at: new Date(response.data.role.created_at),
        updated_at: new Date(response.data.role.updated_at),
      }
    }
  },

  // Update role
  async updateRole(id: string, data: UpdateRoleData): Promise<{ message: string; role: Role }> {
    const response = await api.put(`/roles/${id}`, data)
    return {
      ...response.data,
      role: {
        ...response.data.role,
        created_at: new Date(response.data.role.created_at),
        updated_at: new Date(response.data.role.updated_at),
      }
    }
  },

  // Delete role
  async deleteRole(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/roles/${id}`)
    return response.data
  },

  // Get available permissions
  async getAvailablePermissions(): Promise<PermissionGroup[]> {
    const response = await api.get('/roles/permissions/available')
    return response.data
  },
}
