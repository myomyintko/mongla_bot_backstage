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
  sub_btns?: Array<{
    id: string
    platform: string
    label: string | null
    url: string | null
  }> | null
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

  // Pause advertisement
  pauseAdvertisement: async (id: number) => {
    const response = await api.post(`/advertisements/${id}/pause`)
    return response.data
  },

  // Resume advertisement
  resumeAdvertisement: async (id: number) => {
    const response = await api.post(`/advertisements/${id}/resume`)
    return response.data
  },

  // Bulk pause all advertisements
  bulkPauseAll: async () => {
    const response = await api.post('/advertisements/bulk-pause-all')
    return response.data
  },

  // Bulk resume all advertisements
  bulkResumeAll: async () => {
    const response = await api.post('/advertisements/bulk-resume-all')
    return response.data
  },

  // Dashboard statistics methods
  getStats: async (): Promise<{
    total_ads: number
    active_ads: number
    total_spend: number
    click_rate: number
  }> => {
    const response = await api.get('/advertisements/stats')
    return response.data
  },

  getTopPerforming: async (): Promise<{
    data: Array<{
      name: string
      views: string
      clicks: string
      ctr: string
    }>
  }> => {
    const response = await api.get('/advertisements/top-performing')
    return response.data
  },

  getStatusBreakdown: async (): Promise<{
    active: number
    paused: number
    completed: number
    draft: number
  }> => {
    const response = await api.get('/advertisements/status-breakdown')
    return response.data
  },

  getRecentActivity: async (): Promise<{
    data: Array<{
      name: string
      action: string
      time: string
    }>
  }> => {
    const response = await api.get('/advertisements/recent-activity')
    return response.data
  },

  getMetrics: async (): Promise<{
    impressions: number
    clicks: number
    cpc: number
  }> => {
    const response = await api.get('/advertisements/metrics')
    return response.data
  },

  getUpcoming: async (): Promise<{
    data: Array<{
      name: string
      date: string
      budget: string
      status: string
    }>
  }> => {
    const response = await api.get('/advertisements/upcoming')
    return response.data
  },
}
