import api from './api'
import { type Store } from '@/features/stores/data/schema'

export interface StoreFilters {
  status?: number
  recommand?: boolean
  menu_button_id?: number | 'null' | 'all' | 'none'
  search?: string
  per_page?: number
  page?: number
}

export interface StoreCreateData {
  name: string
  description?: string | null
  media_url?: string | null
  menu_urls?: string[] | null
  open_hour?: string | null
  close_hour?: string | null
  status?: number
  address?: string | null 
  recommand?: boolean
  sub_btns?: Array<{
    id: string
    platform: string
    label: string
    url: string
  }> | null
  menu_button_id?: number | null
}

export interface StoreUpdateData extends Partial<StoreCreateData> {}

export interface BulkUpdateData {
  ids: number[]
  updates: Partial<StoreUpdateData>
}

export const storesService = {
  // Get all stores with filters
  getStores: async (filters: StoreFilters = {}): Promise<{
    data: Store[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }> => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })

    const response = await api.get(`/stores?${params.toString()}`)
    return response.data
  },

  // Get a single store
  getStore: async (id: number) => {
    const response = await api.get(`/stores/${id}`)
    return response.data
  },

  // Create a new store
  createStore: async (data: StoreCreateData) => {
    const response = await api.post('/stores', data)
    return response.data
  },

  // Update a store
  updateStore: async (id: number, data: StoreUpdateData) => {
    const response = await api.put(`/stores/${id}`, data)
    return response.data
  },

  // Delete a store
  deleteStore: async (id: number) => {
    const response = await api.delete(`/stores/${id}`)
    return response.data
  },

  // Bulk update stores
  bulkUpdate: async (data: BulkUpdateData) => {
    const response = await api.post('/stores/bulk-update', data)
    return response.data
  },

  // Bulk delete stores
  bulkDelete: async (ids: number[]) => {
    const response = await api.post('/stores/bulk-delete', { ids })
    return response.data
  },

  // Bulk import stores from Excel file
  bulkImport: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/stores/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Dashboard statistics methods
  getStats: async (): Promise<{
    total_stores: number
    active_stores: number
    new_stores_today: number
    revenue: number
  }> => {
    const response = await api.get('/stores/stats')
    return response.data
  },

  getTopPerforming: async (): Promise<{
    data: Array<{
      id: number
      name: string
      sales: number
      views: number
    }>
  }> => {
    const response = await api.get('/stores/top-performing')
    return response.data
  },

  getStatusBreakdown: async (): Promise<{
    active: number
    inactive: number
  }> => {
    const response = await api.get('/stores/status-breakdown')
    return response.data
  },

  getRecentActivity: async (): Promise<{
    data: Array<{
      name: string
      action: string
      time: string
    }>
  }> => {
    const response = await api.get('/stores/recent-activity')
    return response.data
  },
}
