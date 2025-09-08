import api from './api'
import { type PinMessage } from '@/features/pin-messages/data/schema'

// Pin Messages API service

export interface PinMessageFilters {
  status?: number
  search?: string
  per_page?: number
  page?: number
}

export interface PinMessageCreateData {
  media_url?: string | null
  status?: number
  sort?: number | null
  content?: string | null
  btn_name?: string | null
  btn_link?: string | null
}

export interface PinMessageUpdateData extends Partial<PinMessageCreateData> {}

export interface BulkUpdateData {
  ids: number[]
  updates: Partial<PinMessageUpdateData>
}

export const pinMessagesService = {
  // Get all pin messages with filters
  getPinMessages: async (filters: PinMessageFilters = {}): Promise<{
    data: PinMessage[]
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

    const response = await api.get(`/pin-messages?${params.toString()}`)
    return response.data
  },

  // Get a single pin message
  getPinMessage: async (id: number) => {
    const response = await api.get(`/pin-messages/${id}`)
    return response.data
  },

  // Create a new pin message
  createPinMessage: async (data: PinMessageCreateData) => {
    const response = await api.post('/pin-messages', data)
    return response.data
  },

  // Update a pin message
  updatePinMessage: async (id: number, data: PinMessageUpdateData) => {
    const response = await api.put(`/pin-messages/${id}`, data)
    return response.data
  },

  // Delete a pin message
  deletePinMessage: async (id: number) => {
    const response = await api.delete(`/pin-messages/${id}`)
    return response.data
  },

  // Bulk update pin messages
  bulkUpdate: async (data: BulkUpdateData) => {
    const response = await api.post('/pin-messages/bulk-update', data)
    return response.data
  },

  // Bulk delete pin messages
  bulkDelete: async (ids: number[]) => {
    const response = await api.post('/pin-messages/bulk-delete', { ids })
    return response.data
  },
}
