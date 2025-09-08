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
  sub_btns?: string[] | null
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
}
