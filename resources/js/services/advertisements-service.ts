import api from './api'
import { type Advertisement } from '@/features/advertisements/data/schema'

export interface AdvertisementFilters {
  status?: number
  store_id?: number | 'null' | 'all' | 'none'
  search?: string
  per_page?: number
  page?: number
}

export interface AdvertisementCreateData {
  store_id?: number | null
  title: string
  status?: number
  description?: string | null
  media_url?: string | null
  start_date?: string | null
  end_date?: string | null
  frequency_cap_minutes?: number | null
}

export interface AdvertisementUpdateData extends Partial<AdvertisementCreateData> {}

export interface BulkUpdateData {
  ids: number[]
  updates: Partial<AdvertisementUpdateData>
}

export const advertisementsService = {
  // Get all advertisements with filters
  getAdvertisements: async (filters: AdvertisementFilters = {}): Promise<{
    data: Advertisement[]
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

    const response = await api.get(`/advertisements?${params.toString()}`)
    return response.data
  },

  // Get a single advertisement
  getAdvertisement: async (id: number) => {
    const response = await api.get(`/advertisements/${id}`)
    return response.data
  },

  // Create a new advertisement
  createAdvertisement: async (data: AdvertisementCreateData) => {
    const response = await api.post('/advertisements', data)
    return response.data
  },

  // Update an advertisement
  updateAdvertisement: async (id: number, data: AdvertisementUpdateData) => {
    const response = await api.put(`/advertisements/${id}`, data)
    return response.data
  },

  // Delete an advertisement
  deleteAdvertisement: async (id: number) => {
    const response = await api.delete(`/advertisements/${id}`)
    return response.data
  },

  // Bulk update advertisements
  bulkUpdate: async (data: BulkUpdateData) => {
    const response = await api.post('/advertisements/bulk-update', data)
    return response.data
  },

  // Bulk delete advertisements
  bulkDelete: async (ids: number[]) => {
    const response = await api.post('/advertisements/bulk-delete', { ids })
    return response.data
  },
}
